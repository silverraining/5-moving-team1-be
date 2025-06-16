import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { CreateCustomerProfileDto } from './dto/create-customer-profile.dto';
import { UpdateCustomerProfileDto } from './dto/update-customer-profile.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { CustomerProfile } from './entities/customer-profile.entity';
import { Repository } from 'typeorm';
import { UserService } from '@/user/user.service';
import { UpdateUserDto } from '@/user/dto/update-user.dto';

@Injectable()
export class CustomerProfileService {
  constructor(
    @InjectRepository(CustomerProfile)
    private readonly customerProfileRepository: Repository<CustomerProfile>,
    private readonly userService: UserService,
  ) {}

  async create(
    userId: string,
    createCustomerProfileDto: CreateCustomerProfileDto,
  ) {
    const profileData = {
      user: { id: userId }, // 관계 설정, 외래 키 자동 매핑
      ...createCustomerProfileDto,
    };

    const newProfile = await this.customerProfileRepository.save(profileData);

    if (!newProfile) {
      throw new InternalServerErrorException(
        '고객님의 프로필 생성에 실패했습니다!',
      );
    }

    return newProfile;
  }

  async findOne(userId: string) {
    const profile = await this.customerProfileRepository.findOne({
      where: { user: { id: userId } },
      relations: ['user'],
    });

    if (!profile) {
      throw new NotFoundException('고객님의 프로필을 찾을 수 없습니다!');
    }

    const { user, ...restProfileData } = profile;
    const { name, email, phone } = user; // 사용자 정보 가져오기

    return {
      name,
      email,
      phone,
      ...restProfileData,
    };
  }

  async update(userId: string, profileDto: UpdateCustomerProfileDto) {
    const { name, phone, password, newPassword, ...updatedProfileData } =
      profileDto;

    // 사용자 정보 업데이트를 위한 객체 생성
    const updatedUserData: UpdateUserDto = {
      name,
      phone,
      password,
      newPassword,
    };

    // 사용자 정보 업데이트
    await this.userService.update(userId, updatedUserData); // 반환값 무시

    // 프로필 정보 조회
    const profile = await this.customerProfileRepository.findOneBy({
      user: { id: userId },
    });

    // 프로필 존재 여부 확인
    if (!profile) {
      throw new NotFoundException('고객님의 프로필을 찾을 수 없습니다!');
    }

    // 프로필 정보 업데이트
    Object.assign(profile, updatedProfileData);
    const updatedProfile = await this.customerProfileRepository.save(profile);

    // 업데이트 실패 시 예외 처리
    if (!updatedProfile) {
      throw new InternalServerErrorException(
        '고객님의 프로필 업데이트에 실패했습니다!',
      );
    }

    return {
      message: '고객님의 프로필이 성공적으로 업데이트되었습니다.',
    };
  }
}
