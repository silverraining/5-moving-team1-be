import { Injectable, NotFoundException } from '@nestjs/common';
import { CustomerProfile } from './entities/customer-profile.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class CustomerProfileHelper {
  constructor(
    @InjectRepository(CustomerProfile)
    private readonly customerProfileRepository: Repository<CustomerProfile>,
  ) {}

  public async getCustomerId(userId: string) {
    const customer = await this.customerProfileRepository.findOne({
      where: { user: { id: userId } },
      select: ['id'],
    });

    if (!customer) {
      throw new NotFoundException(
        '고객님의 프로필을 찾을 수 없습니다, 프로필을 생성해주세요!',
      );
    }

    return customer.id;
  }

  public async getLikedMoverIds(customerId: string) {
    const customer = await this.customerProfileRepository.findOne({
      where: { id: customerId },
      relations: ['likedMovers', 'likedMovers.mover'],
    });

    if (!customer) {
      throw new NotFoundException('고객님의 프로필을 찾을 수 없습니다!');
    }

    const likedMovers = customer.likedMovers;

    return likedMovers
      .map((like) => like.mover.id)
      .filter((id): id is string => typeof id === 'string');
  }
}
