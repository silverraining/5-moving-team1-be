import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Request,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { EstimateRequestService } from './estimate-request.service';
import { CreateEstimateRequestDto } from './dto/create-estimate-request.dto';
import { AuthGuard } from '@/auth/guard/auth.guard';
import { UpdateEstimateRequestDto } from './dto/update-estimate-request.dto';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { UserInfo } from '@/user/decorator/user-info.decorator';

@ApiTags('EstimateRequest')
@ApiBearerAuth()
@UseGuards(AuthGuard)
@Controller('estimate-request')
export class EstimateRequestController {
  constructor(
    private readonly estimateRequestService: EstimateRequestService,
  ) {}

  @Post()
  async create(
    @Body() dto: CreateEstimateRequestDto,
    @UserInfo() user: UserInfo, // 커스텀 데코레이터로 사용자 정보 받는다고 가정
  ) {
    return this.estimateRequestService.create(dto, user);
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
  update(
    @Param('id') id: string,
    @Body() updateEstimateRequestDto: UpdateEstimateRequestDto,
  ) {
    return this.estimateRequestService.update(+id, updateEstimateRequestDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.estimateRequestService.remove(+id);
  }
}
