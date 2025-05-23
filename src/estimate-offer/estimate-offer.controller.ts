import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { EstimateOfferService } from './estimate-offer.service';
import { CreateEstimateOfferDto } from './dto/create-estimate-offer.dto';
import { UpdateEstimateOfferDto } from './dto/update-estimate-offer.dto';

@Controller('estimate-offer')
export class EstimateOfferController {
  constructor(private readonly estimateOfferService: EstimateOfferService) {}

  @Post()
  create(@Body() createEstimateOfferDto: CreateEstimateOfferDto) {
    return this.estimateOfferService.create(createEstimateOfferDto);
  }

  @Get()
  findAll() {
    return this.estimateOfferService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.estimateOfferService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateEstimateOfferDto: UpdateEstimateOfferDto) {
    return this.estimateOfferService.update(+id, updateEstimateOfferDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.estimateOfferService.remove(+id);
  }
}
