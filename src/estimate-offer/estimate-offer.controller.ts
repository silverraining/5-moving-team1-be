import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
} from '@nestjs/common';
import { EstimateOfferService } from './estimate-offer.service';
import { CreateEstimateOfferDto } from './dto/create-estimate-offer.dto';
import { UpdateEstimateOfferDto } from './dto/update-estimate-offer.dto';
import { UserInfo } from '@/user/decorator/user-info.decorator';
import { ApiGetEstimateOffers } from './docs/swagger';
import { ApiBearerAuth } from '@nestjs/swagger';
@Controller('estimate-offer')
export class EstimateOfferController {
  constructor(private readonly estimateOfferService: EstimateOfferService) {}

  @Get()
  @ApiBearerAuth()
  @ApiGetEstimateOffers()
  async getOffersByEstimateRequestId(
    @Query('id') estimateRequestId: string,
    @UserInfo() userInfo: UserInfo, // 현재 로그인한 유저 정보
  ) {
    return this.estimateOfferService.findByEstimateRequestId(
      estimateRequestId,
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
