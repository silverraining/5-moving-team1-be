import { Controller, Get, Post, Body, Param, Query } from '@nestjs/common';
import { ReviewService } from './review.service';
import { CreateReviewDto } from './dto/create-review.dto';
import { UserInfo } from '@/user/decorator/user-info.decorator';
import { Role } from '@/user/entities/user.entity';
import { RBAC } from '@/auth/decorator/rbac.decorator';
import { PagePaginationDto } from '@/common/dto/page-pagination.dto';
import { CustomerProfileHelper } from '@/customer-profile/customer-profile.helper';
import { MoverProfileHelper } from '@/mover-profile/mover-profile.helper';
import {
  ApiCreateReview,
  ApiFindAllAvailableReviews,
  ApiFindMyReviewsAsCustomer,
  ApiFindReviewsAsMover,
  ApiFindReviewsByMoverId,
} from './docs/swagger';
import { Public } from '@/auth/decorator/public.decorator';

@Controller('review')
export class ReviewController {
  constructor(
    private readonly reviewService: ReviewService,
    private readonly customerProfileHelper: CustomerProfileHelper,
    private readonly moverProfileHelper: MoverProfileHelper,
  ) {}

  @Post(':completedOfferId')
  @RBAC(Role.CUSTOMER)
  @ApiCreateReview()
  create(
    @UserInfo() userInfo: UserInfo,
    @Param('completedOfferId') completedOfferId: string,
    @Body() createReviewDto: CreateReviewDto,
  ) {
    return this.reviewService.create(
      userInfo.sub,
      completedOfferId,
      createReviewDto,
    );
  }

  @Get('available')
  @RBAC(Role.CUSTOMER)
  @ApiFindAllAvailableReviews()
  findAllAvailable(
    @UserInfo() userInfo: UserInfo,
    @Query() dto: PagePaginationDto,
  ) {
    return this.reviewService.findAllAvailable(userInfo.sub, dto);
  }

  @Get('customer/me')
  @RBAC(Role.CUSTOMER)
  @ApiFindMyReviewsAsCustomer()
  async findMyReviewsAsCustomer(
    @UserInfo() userInfo: UserInfo,
    @Query() dto: PagePaginationDto,
  ) {
    const customerId = await this.customerProfileHelper.getCustomerId(
      userInfo.sub,
    );

    return this.reviewService.findByCustomerId(customerId, dto);
  }

  @Get('mover/me')
  @RBAC(Role.MOVER)
  @ApiFindReviewsAsMover()
  async findMyReviewsAsMover(
    @UserInfo() userInfo: UserInfo,
    @Query() dto: PagePaginationDto,
  ) {
    const moverId = await this.moverProfileHelper.getMoverId(userInfo.sub);
    return this.reviewService.findByMoverId(moverId, dto);
  }

  @Get('mover/:id')
  @Public()
  @ApiFindReviewsByMoverId()
  async findByMoverId(
    @Param('id') moverId: string,
    @Query() dto: PagePaginationDto,
  ) {
    return this.reviewService.findByMoverId(moverId, dto);
  }
}
