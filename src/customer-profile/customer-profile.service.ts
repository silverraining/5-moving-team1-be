import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { CreateCustomerProfileDto } from './dto/create-customer-profile.dto';
import { UpdateCustomerProfileDto } from './dto/update-customer-profile.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { CustomerProfile } from './entities/customer-profile.entity';
import { Repository } from 'typeorm';

@Injectable()
export class CustomerProfileService {
  constructor(
    @InjectRepository(CustomerProfile)
    private readonly customerProfileRepository: Repository<CustomerProfile>,
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
      throw new InternalServerErrorException('프로필 생성에 실패했습니다!');
    }

    return newProfile;
  }

  findAll() {
    return `This action returns all customerProfile`;
  }

  findOne(id: number) {
    return `This action returns a #${id} customerProfile`;
  }

  update(id: number, updateCustomerProfileDto: UpdateCustomerProfileDto) {
    return `This action updates a #${id} customerProfile`;
  }

  remove(id: number) {
    return `This action removes a #${id} customerProfile`;
  }
}
