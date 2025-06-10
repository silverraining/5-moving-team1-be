import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { UpdateUserDto } from './dto/update-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
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
    } = dto;

    // 비밀번호 변경을 시도했는지 확인
    const isChangePassword =
      originalPassword && newPassword && originalPassword !== newPassword;

    // 변경할 사용자 조회
    const user = await this.userRepository.findOneBy({ id: userId });

    // 사용자 존재 여부 확인
    if (!user) {
      throw new NotFoundException('사용자를 찾을 수 없습니다.');
    }

    // 비밀번호 변경 요청이 있을 때만 기존 비밀번호 검증 및 해싱
    let hashedPassword: string | undefined;

    if (isChangePassword) {
      const isPasswordValid = await bcrypt.compare(
        originalPassword,
        user.password,
      );

      if (!isPasswordValid) {
        throw new BadRequestException('기존 비밀번호가 일치하지 않습니다.');
      }

      const salt = await bcrypt.genSalt();
      hashedPassword = await bcrypt.hash(newPassword, salt);
    }

    // 변경된 필드만 객체에 담기
    const updatedFields: Partial<typeof user> = {};
    if (newName && newName !== user.name) updatedFields.name = newName;
    if (newPhone && newPhone !== user.phone) updatedFields.phone = newPhone;
    if (hashedPassword) updatedFields.password = hashedPassword;

    if (Object.keys(updatedFields).length === 0) {
      return false; // 변경사항 없음
    }

    // 기존 user 객체에 변경사항 덮어쓰기
    Object.assign(user, updatedFields);

    // DB에 변경된 데이터 저장
    await this.userRepository.save(user);

    // 변경된 사용자 정보 반환
    const updatedUser = await this.userRepository.findOneBy({ id: userId });

    if (!updatedUser) {
      throw new InternalServerErrorException(
        '사용자 정보 업데이트에 실패했습니다.',
      );
    }

    // 이 서비스가 auth뿐만 아니라 customer service에서도 사용되므로 성공 메시지 대신 true 반환
    return true; // 변경 성공
  }
}
