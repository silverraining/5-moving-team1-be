import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { EstimateRequestService } from './estimate-request.service';
import { CreateEstimateRequestDto } from './dto/create-estimate-request.dto';
import { UpdateEstimateRequestDto } from './dto/update-estimate-request.dto';

@Controller('estimate-request')
export class EstimateRequestController {
  constructor(private readonly estimateRequestService: EstimateRequestService) {}

  @Post()
  create(@Body() createEstimateRequestDto: CreateEstimateRequestDto) {
    return this.estimateRequestService.create(createEstimateRequestDto);
  }

  @Get()
  findAll() {
    return this.estimateRequestService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.estimateRequestService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateEstimateRequestDto: UpdateEstimateRequestDto) {
    return this.estimateRequestService.update(+id, updateEstimateRequestDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.estimateRequestService.remove(+id);
  }
}
