import {
  Controller,
  Get,
  Post,
  Body,
  Query,
  Patch,
  Param,
} from '@nestjs/common';
import { EstimateRequestService } from './estimate-request.service';
import { CreateEstimateRequestDto } from './dto/create-estimate-request.dto';
import { UserInfo } from '@/user/decorator/user-info.decorator';
import { ApiBearerAuth } from '@nestjs/swagger';
import { RBAC } from '@/auth/decorator/rbac.decorator';
import { Role } from '@/user/entities/user.entity';
import {
  ApiAddTargetMover,
  ApiCreateEstimateRequest,
  ApiGetMyActiveEstimateRequest,
  ApiGetMyEstimateHistory,
} from './docs/swagger';
import { ApiGetRequestListForMover } from './docs/swagger';
import { EstimateRequestPaginationDto } from './dto/estimate-request-pagination.dto';
import { EstimateRequestResponseDto } from './dto/estimate-request-response.dto';
import { GenericPaginatedDto } from '@/common/dto/paginated-response.dto';
import { CreatedAtCursorPaginationDto } from '@/common/created-at-pagination.dto';

@ApiBearerAuth()
@Controller('estimate-request')
export class EstimateRequestController {
  constructor(
    private readonly estimateRequestService: EstimateRequestService,
  ) {}
  //INFO: 개발용 해당 고객의 진행 중인 견적 요청 ID 조회 API
  @Get('active')
  @ApiGetMyActiveEstimateRequest()
  @RBAC(Role.CUSTOMER)
  async getMyActiveEstimateRequest(@UserInfo() user: UserInfo) {
    return this.estimateRequestService.findActiveEstimateRequestIds(user.sub);
  }

  @Post()
  @RBAC(Role.CUSTOMER)
  @ApiCreateEstimateRequest()
  async create(
    @Body() dto: CreateEstimateRequestDto,
    @UserInfo() user: UserInfo,
  ) {
    return this.estimateRequestService.create(dto, user);
  }

  @Get('/history')
  @RBAC(Role.CUSTOMER)
  @ApiGetMyEstimateHistory()
  async getHistory(
    @UserInfo() user: UserInfo,
    @Query() pagination: CreatedAtCursorPaginationDto,
  ): Promise<GenericPaginatedDto<EstimateRequestResponseDto>> {
    return this.estimateRequestService.findAllRequestHistoryWithPagination(
      user.sub,
      pagination,
    );
  }

  @Patch(':requestId/targeted')
  @RBAC(Role.CUSTOMER)
  @ApiAddTargetMover()
  async addTargetedMover(
    @Param('requestId') estimateRequestId: string,
    @Body() body: { moverId: string },
    @UserInfo() user: UserInfo,
  ) {
    return this.estimateRequestService.addTargetMover(
      estimateRequestId,
      body.moverId,
      user.sub,
    );
  }

  //Mover가 견적 요청 목록 조회
  @Get('/')
  @RBAC(Role.MOVER)
  @ApiGetRequestListForMover()
  async getRequestListForMover(
    @UserInfo() user: UserInfo,
    @Query() pagination: EstimateRequestPaginationDto,
  ) {
    return this.estimateRequestService.findRequestListForMover(
      user.sub,
      pagination,
    );
  }

  // @Delete(':id')
  // remove(@Param('id') id: string) {
  //   return this.estimateRequestService.remove(+id);
  // }
}
