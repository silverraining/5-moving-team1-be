import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Patch,
  UseInterceptors,
  Query,
} from '@nestjs/common';
import { EstimateOfferService } from './estimate-offer.service';
import { CreateEstimateOfferDto } from './dto/create-estimate-offer.dto';
import { UpdateEstimateOfferDto } from './dto/update-estimate-offer.dto';
import {
  EstimateOfferResponseDto,
  GetEstimateOfferDetailByMoverResponseDto,
  GetEstimateOffersByMoverResponseDto,
} from './dto/estimate-offer-response.dto';
import { UserInfo } from '@/user/decorator/user-info.decorator';
import {
  ApiGetEstimateOfferDetailByCustomer,
  ApiGetPendingEstimateOffers,
  ApiCreateEstimateOffer,
  ApiRejectEstimateOffer,
  ApiGetMoverEstimateOffers,
  ApiGetRejectedEstimateOffers,
  ApiConfirmEstimateOffer,
  ApiGetEstimateOfferDetailByMover,
} from './docs/swagger';
import { ApiBearerAuth } from '@nestjs/swagger';
import { RBAC } from '@/auth/decorator/rbac.decorator';
import { Role } from '@/user/entities/user.entity';
import { TransactionInterceptor } from '@/common/interceptor/transaction.interceptor';
import { QueryRunner } from '@/common/decorator/query-runner.decorator';
import type { QueryRunner as QR } from 'typeorm';
import { GenericPaginatedDto } from '@/common/dto/paginated-response.dto';
import { CreatedAtCursorPaginationDto } from '../common/dto/created-at-pagination.dto';

@Controller('estimate-offer')
@ApiBearerAuth()
export class EstimateOfferController {
  constructor(private readonly estimateOfferService: EstimateOfferService) {}

  // 고객이 받은 견적 목록 조회 (견적 요청 ID로 조회)
  @Get(':requestId/pending')
  @RBAC(Role.CUSTOMER)
  @ApiGetPendingEstimateOffers()
  async getOffersByEstimateRequestId(
    @Param('requestId') requestId: string,
    @UserInfo() userInfo: UserInfo,
    @Query() query: CreatedAtCursorPaginationDto,
  ): Promise<GenericPaginatedDto<EstimateOfferResponseDto>> {
    return this.estimateOfferService.getPendingOffersByRequestId(
      requestId,
      userInfo.sub,
      query,
    );
  }

  // 고객이 받은 견적 제안 상세 조회 (견적 요청 ID와 기사 ID로 조회)
  @Get(':requestId/:moverProfileId/pending')
  @RBAC(Role.CUSTOMER)
  @ApiGetEstimateOfferDetailByCustomer()
  async getOfferDetail(
    @Param('requestId') requestId: string,
    @Param('moverProfileId') moverId: string,
    @UserInfo() userInfo: UserInfo,
  ) {
    return this.estimateOfferService.findOneByCompositeKey(
      //findOneByCompositeKey : 복합 키(composite key) {estimateRequestId, moverId} 이용해 특정 엔티티를 조회하는 커스텀 서비스 메서드
      requestId,
      moverId,
      userInfo.sub,
    );
  }

  // 기사가 견적 제안 생성
  @Post(':requestId')
  @RBAC(Role.MOVER)
  @ApiCreateEstimateOffer()
  async createEstimateOffer(
    @Param('requestId') requestId: string,
    @Body() createEstimateOfferDto: CreateEstimateOfferDto,
    @UserInfo() userInfo: UserInfo,
  ) {
    const offer = await this.estimateOfferService.create(
      requestId,
      createEstimateOfferDto,
      userInfo.sub,
    );

    return {
      message: '견적 제안이 성공적으로 생성되었습니다.',
      id: offer.id,
    };
  }

  // 기사가 견적 요청 반려
  // TODO: 견적 요청 반려는 사실 update 가 아니라 create의 또 다른 형태이다.
  // 따라서 추후 함수명, dto 이름 변경 필요
  @Post(':requestId/rejected')
  @RBAC(Role.MOVER)
  @ApiRejectEstimateOffer()
  async updateOfferStatus(
    @Param('requestId') requestId: string,
    @Body() updateEstimateOfferDto: UpdateEstimateOfferDto,
    @UserInfo() userInfo: UserInfo,
  ) {
    await this.estimateOfferService.reject(
      requestId,
      updateEstimateOfferDto,
      userInfo.sub,
    );

    return {
      message: '견적 요청이 성공적으로 반려되었습니다.',
    };
  }

  // 기사가 보낸 견적 목록 조회
  @Get('offers')
  @RBAC(Role.MOVER)
  @ApiGetMoverEstimateOffers()
  async getMoverEstimateOffers(
    @UserInfo() userInfo: UserInfo,
  ): Promise<GetEstimateOffersByMoverResponseDto[]> {
    return this.estimateOfferService.getMoverEstimateOffers(userInfo.sub);
  }

  // 기사가 반려한 견적 목록 조회
  @Get('rejected-offers')
  @RBAC(Role.MOVER)
  @ApiGetRejectedEstimateOffers()
  async getRejectedEstimateOffers(
    @UserInfo() userInfo: UserInfo,
  ): Promise<GetEstimateOffersByMoverResponseDto[]> {
    return this.estimateOfferService.getRejectedEstimateOffers(userInfo.sub);
  }

  // 고객이 받은 제안 견적 확정 (제안 견적 ID로 조회)
  @Patch(':offerId/confirmed')
  @RBAC(Role.CUSTOMER)
  @UseInterceptors(TransactionInterceptor)
  @ApiConfirmEstimateOffer()
  async confirmOffer(
    @Param('offerId') offerId: string,
    @UserInfo() userInfo: UserInfo,
    @QueryRunner() queryRunner: QR,
  ) {
    return this.estimateOfferService.confirm(
      offerId,
      userInfo.sub,
      queryRunner,
    );
  }

  // 기사가 보낸 견적 상세 조회
  @Get(':offerId')
  @RBAC(Role.MOVER)
  @ApiGetEstimateOfferDetailByMover()
  async getEstimateOfferDetailByMover(
    @Param('offerId') offerId: string,
    @UserInfo() userInfo: UserInfo,
  ): Promise<GetEstimateOfferDetailByMoverResponseDto> {
    return this.estimateOfferService.getEstimateOfferDetailByMover(
      offerId,
      userInfo.sub,
    );
  }
}
