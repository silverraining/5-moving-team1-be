import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateEstimateRequestDto } from './dto/create-estimate-request.dto';
import { UpdateEstimateRequestDto } from './dto/update-estimate-request.dto';
import { InjectRepository } from '@nestjs/typeorm';
import {
  EstimateRequest,
  RequestStatus,
} from './entities/estimate-request.entity';
import { CustomerProfile } from '@/customer-profile/entities/customer-profile.entity';
import { In, Repository } from 'typeorm';
import { UserInfo } from '@/user/decorator/user-info.decorator';
import { plainToInstance } from 'class-transformer';
import { EstimateRequestResponseDto } from './dto/estimate-request-response.dto';
import { CreateEstimateRequestResponseDto } from './dto/create-estimate-request.response.dto';
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
    // 2. 현재 고객이 진행 중인 견적 요청이 있는지 확인
    const activeRequest = await this.estimateRequestRepository.findOne({
      where: {
        customer: { id: customer.id },
        status: In([RequestStatus.PENDING, RequestStatus.CONFIRMED]),
      },
    });

    if (activeRequest) {
      throw new BadRequestException('진행 중인 견적 요청이 이미 존재합니다.');
    }

    // 3. EstimateRequest 인스턴스 생성
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

    //   return plainToInstance(EstimateRequestResponseDto, withRelations, {
    //     excludeExtraneousValues: true,
    //   });
    // }
    return plainToInstance(
      CreateEstimateRequestResponseDto,
      {
        id: saved.id,
        message: '견적 요청 생성 성공',
      },
      { excludeExtraneousValues: true },
    );
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
