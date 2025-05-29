import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateEstimateRequestDto } from './dto/create-estimate-request.dto';
import { UpdateEstimateRequestDto } from './dto/update-estimate-request.dto';
import { InjectRepository } from '@nestjs/typeorm';
import {
  EstimateRequest,
  RequestStatus,
} from './entities/estimate-request.entity';
import { CustomerProfile } from '@/customer-profile/entities/customer-profile.entity';
import { Repository } from 'typeorm';
import { UserInfo } from '@/user/decorator/user-info.decorator';
import { plainToInstance } from 'class-transformer';
import { EstimateRequestResponseDto } from './dto/estimate-request-response.dto';
@Injectable()
export class EstimateRequestService {
  constructor(
    @InjectRepository(EstimateRequest)
    private readonly estimateRequestRepository: Repository<EstimateRequest>,
    @InjectRepository(CustomerProfile)
    private readonly customerProfileRepository: Repository<CustomerProfile>,
  ) {}

  async create(dto: CreateEstimateRequestDto, user: UserInfo) {
    // 1. 로그인한 유저의 CustomerProfile 가져오기
    const customer = await this.customerProfileRepository.findOne({
      where: { user: { id: user.sub } },
      relations: ['user'],
    });

    if (!customer) {
      throw new NotFoundException('고객 프로필을 찾을 수 없습니다.');
    }
    //TODO: 현재 유저가 진행 중인 견적 요청이 있는지 확인하는 로직 추가 필요
    //이미 PENDING, CONFIRMED, CANCELED 상태의 견적 요청을 가지고 있다면, 새로운 요청 생성 불가
    //COMPLETED 또는 EXPIRED 상태인 경우에만 새로운 요청 생성 가능

    // 2. EstimateRequest 인스턴스 생성
    const estimate = this.estimateRequestRepository.create({
      moveType: dto.moveType,
      moveDate: new Date(dto.moveDate),
      fromAddress: dto.fromAddress,
      toAddress: dto.toAddress,
      customer,
    });

    // 3. 저장
    const saved = await this.estimateRequestRepository.save(estimate);
    const withRelations = await this.estimateRequestRepository.findOne({
      where: { id: saved.id },
      relations: ['customer', 'customer.user'],
    });

    return plainToInstance(EstimateRequestResponseDto, withRelations, {
      excludeExtraneousValues: true,
    });
  }

  async findOneById(id: string) {
    const result = await this.estimateRequestRepository.findOne({
      where: { id },
      relations: ['customer', 'customer.user'],
    });

    if (!result) throw new NotFoundException('견적 요청을 찾을 수 없습니다.');

    return plainToInstance(EstimateRequestResponseDto, result, {
      excludeExtraneousValues: true,
    });
  }

  findAll() {
    return `This action returns all estimateRequest`;
  }

  findOne(id: number) {
    return `This action returns a #${id} estimateRequest`;
  }

  update(id: number, updateEstimateRequestDto: UpdateEstimateRequestDto) {
    return `This action updates a #${id} estimateRequest`;
  }

  remove(id: number) {
    return `This action removes a #${id} estimateRequest`;
  }
}
