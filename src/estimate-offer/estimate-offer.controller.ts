import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { EstimateOfferService } from './estimate-offer.service';
import { CreateEstimateOfferDto } from './dto/create-estimate-offer.dto';
import { UpdateEstimateOfferDto } from './dto/update-estimate-offer.dto';
import { UserInfo } from '@/user/decorator/user-info.decorator';
import {
  ApiGetEstimateOfferDetail,
  ApiGetEstimateOffers,
} from './docs/swagger';
import { ApiBearerAuth } from '@nestjs/swagger';

@Controller('estimate-offer')
@ApiBearerAuth()
export class EstimateOfferController {
  constructor(private readonly estimateOfferService: EstimateOfferService) {}
  // 견적 요청 ID로 견적 목록 조회
  @Get(':requestId')
  @ApiGetEstimateOffers()
  async getOffersByEstimateRequestId(
    @Param('requestId') requestId: string,
    @UserInfo() userInfo: UserInfo,
  ) {
    return this.estimateOfferService.findByEstimateRequestId(
      requestId,
      userInfo.sub,
    );
  }
  // 견적 요청 ID와 기사 ID로 견적 제안 상세 조회
  @Get(':requestId/:moverId')
  @ApiGetEstimateOfferDetail()
  async getOfferDetail(
    @Param('requestId') requestId: string,
    @Param('moverId') moverId: string,
    @UserInfo() userInfo: UserInfo,
  ) {
    return this.estimateOfferService.findOneByCompositeKey(
      //findOneByCompositeKey : 복합 키(composite key) {estimateRequestId, moverId} 이용해 특정 엔티티를 조회하는 커스텀 서비스 메서드
      requestId,
      moverId,
      userInfo.sub,
    );
  }

  @Post()
  create(@Body() createEstimateOfferDto: CreateEstimateOfferDto) {
    return this.estimateOfferService.create(createEstimateOfferDto);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateEstimateOfferDto: UpdateEstimateOfferDto,
  ) {
    return this.estimateOfferService.update(+id, updateEstimateOfferDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.estimateOfferService.remove(+id);
  }
}
