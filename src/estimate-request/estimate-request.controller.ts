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
  ApiGetRequestListForMover,
} from './docs/swagger';
import { EstimateRequestPaginationDto } from './dto/estimate-request-pagination.dto';
import { EstimateRequestResponseDto } from './dto/estimate-request-response.dto';
import { CreatedAtCursorPaginationDto } from '@/common/dto/created-at-pagination.dto';
import { GenericPaginatedDto } from '@/common/dto/paginated-response.dto';

@ApiBearerAuth()
@Controller('estimate-request')
export class EstimateRequestController {
  constructor(
    private readonly estimateRequestService: EstimateRequestService,
  ) {}
  // 고객의 진행 중인 견적 요청 조회 API
  @Get('active')
  @ApiGetMyActiveEstimateRequest()
  @RBAC(Role.CUSTOMER)
  async getMyActiveEstimateRequest(
    @UserInfo() user: UserInfo,
  ): Promise<EstimateRequestResponseDto[]> {
    return this.estimateRequestService.findActiveEstimateRequests(user.sub);
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
    @Body() body: { moverProfileId: string },
    @UserInfo() user: UserInfo,
  ) {
    return this.estimateRequestService.addTargetMover(
      estimateRequestId,
      body.moverProfileId,
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
