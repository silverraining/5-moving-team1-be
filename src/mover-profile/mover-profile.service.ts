import { Injectable } from '@nestjs/common';
import { CreateMoverProfileDto } from './dto/create-mover-profile.dto';
import { UpdateMoverProfileDto } from './dto/update-mover-profile.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { MoverProfile } from './entities/mover-profile.entity';
import { Repository } from 'typeorm';
import { UserInfo } from 'src/user/decorator/user-info.decorator';

@Injectable()
export class MoverProfileService {
  constructor(
    @InjectRepository(MoverProfile)
    private readonly moverProfileRepository: Repository<MoverProfile>,
  ) {}

  create(createMoverProfileDto: CreateMoverProfileDto, userInfo: UserInfo) {
    const profile = {
      user: { id: userInfo.sub }, // 관계 설정, 외래 키 자동 매핑
      ...createMoverProfileDto,
    };
    return this.moverProfileRepository.save(profile);
  }

  findAll() {
    return `This action returns all moverProfile`;
  }

  async findOne(id: string) {
    const profile = await this.moverProfileRepository.findOne({
      where: { user: { id } }, // user의 id로 프로필 찾기
    });
    return profile;
  }

  update(id: number, updateMoverProfileDto: UpdateMoverProfileDto) {
    return `This action updates a #${id} moverProfile`;
  }

  remove(id: number) {
    return `This action removes a #${id} moverProfile`;
  }
}
