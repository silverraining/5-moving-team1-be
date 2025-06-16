import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { UpdateUserDto } from './dto/update-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Provider, User } from './entities/user.entity';
import * as bcrypt from 'bcrypt';
import * as _ from 'lodash';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly configService: ConfigService,
  ) {}

  /**
   *  사용자의 기본 정보(이름, 전화번호, 비밀번호)수정
   *
   * @param userId - 수정할 사용자 본인의 ID
   * @param dto - update-user DTO (이름, 전화번호, 비밀번호)
   *
   * @returns 수정 완료 메시지 객체
   *
   * @throws  NotFoundException - 사용자를 찾을 수 없는 경우
   */

  async update(userId: string, dto: UpdateUserDto) {
    const {
      password: originalPassword,
      newPassword,
      name: newName,
      phone: newPhone,
    } = dto; // DTO에서 필요한 필드 추출

    // 변경할 사용자 조회
    const user = await this.userRepository.findOneBy({ id: userId });

    // 사용자 존재 여부 확인
    if (!user) {
      throw new NotFoundException('사용자를 찾을 수 없습니다.');
    }

    // 로컬 계정인지 확인
    const isLocalUser = user.provider === Provider.LOCAL;

    // 업데이트할 부분
    const updatedFields: Partial<User> = {};

    // local 계정의 경우 비밀번호 관련 로직 처리
    if (isLocalUser && originalPassword) {
      // 기존 비밀번호가 일치하는지 확인
      const isPasswordValid = await bcrypt.compare(
        originalPassword,
        user.password,
      );

      // 기존 비밀번호가 일치하지 않는 경우
      if (!isPasswordValid) {
        throw new BadRequestException('기존 비밀번호가 일치하지 않습니다.');
      }

      if (!newPassword) {
        throw new BadRequestException('새 비밀번호가 누락되었습니다!');
      }

      // 비밀번호 변경을 시도했는지 확인
      const isChangePassword = originalPassword !== newPassword;

      // 비밀번호가 변경된 경우
      if (isChangePassword) {
        const HASH_ROUNDS = this.configService.get<number>('HASH_ROUNDS');
        updatedFields.password = await bcrypt.hash(newPassword, HASH_ROUNDS);
      }
    }

    // 변경된 필드만 객체에 담기
    if (newName && newName !== user.name) updatedFields.name = newName;
    if (newPhone && newPhone !== user.phone) updatedFields.phone = newPhone;

    // 변경된 필드가 없는 경우
    if (_.isEmpty(updatedFields)) {
      return; // 변경된 내용이 없으므로 응답 없이 종료 (204 No Content)
    }

    const result = await this.userRepository.update(userId, updatedFields);

    if (result.affected === 0) {
      throw new InternalServerErrorException('회원정보 수정에 실패했습니다.');
    }

    return { message: '회원정보가 성공적으로 수정되었습니다.' }; // 성공 메시지 반환 (200 OK)
  }
}
