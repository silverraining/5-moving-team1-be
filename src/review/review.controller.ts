import { Controller, Get, Post, Body, Param, Query } from '@nestjs/common';
import { ReviewService } from './review.service';
import { CreateReviewDto } from './dto/create-review.dto';
import { UserInfo } from '@/user/decorator/user-info.decorator';
import { handleError } from '@/common/utils/handle-error.util';
import { Role } from '@/user/entities/user.entity';
import { RBAC } from '@/auth/decorator/rbac.decorator';
import { PagePaginationDto } from '@/common/dto/page-pagination.dto';

import { Public } from '@/auth/decorator/public.decorator';
import { CustomerProfileHelper } from '@/customer-profile/customer-profile.helper';

@Controller('review')
export class ReviewController {
  constructor(
    private readonly reviewService: ReviewService,
    private readonly customerProfileHelper: CustomerProfileHelper,
  ) {}

  @Post(':confirmedOfferId')
  @RBAC(Role.CUSTOMER)
  create(
    @UserInfo() userInfo: UserInfo,
    @Param('confirmedOfferId') confirmedOfferId: string,
    @Body() createReviewDto: CreateReviewDto,
  ) {
    return handleError(
      () =>
        this.reviewService.create(
          userInfo.sub,
          confirmedOfferId,
          createReviewDto,
        ),
      '리뷰 작성 중 오류가 발생했습니다. 다시 시도해주세요.',
    );
  }

  @Get('available')
  @RBAC(Role.CUSTOMER)
  findAllAvailable(
    @UserInfo() userInfo: UserInfo,
    @Query() dto: PagePaginationDto,
  ) {
    return handleError(
      () => this.reviewService.findAllAvailable(userInfo.sub, dto),
      '작성 가능한 리뷰 목록 조회 중 오류가 발생했습니다. 다시 시도해주세요.',
    );
  }

  @Get('customer/me')
  @RBAC(Role.CUSTOMER)
  async findByCustomerId(
    @UserInfo() userInfo: UserInfo,
    @Query() dto: PagePaginationDto,
  ) {
    const customerId = await this.customerProfileHelper.getCustomerId(
      userInfo.sub,
    );

    return handleError(
      () => this.reviewService.findByCustomerId(customerId, dto),
      '고객이 작성한 리뷰 목록 조회 중 오류가 발생했습니다. 다시 시도해주세요.',
    );
  }

  @Get('mover/:id')
  @Public()
  findByMoverId(@Param('id') id: string) {
    return this.reviewService.findByMoverId(id);
  }
}
