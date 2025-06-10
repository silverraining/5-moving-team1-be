import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { EstimateRequestService } from './estimate-request.service';
import { CreateEstimateRequestDto } from './dto/create-estimate-request.dto';

import { UpdateEstimateRequestDto } from './dto/update-estimate-request.dto';

import { UserInfo } from '@/user/decorator/user-info.decorator';
import { ApiBearerAuth } from '@nestjs/swagger';
import { RBAC } from '@/auth/decorator/rbac.decorator';
import { Role } from '@/user/entities/user.entity';
import { ApiCreateEstimateRequest } from './docs/swagger';

@ApiBearerAuth()
@Controller('estimate-request')
@RBAC(Role.CUSTOMER)
export class EstimateRequestController {
  constructor(
    private readonly estimateRequestService: EstimateRequestService,
  ) {}

  @Post()
  @ApiCreateEstimateRequest()
  async create(
    @Body() dto: CreateEstimateRequestDto,
    @UserInfo() user: UserInfo, // UserInfo 데코레이터를 통해 현재 로그인한 유저 정보 가져오기
  ) {
    return this.estimateRequestService.create(dto, user);
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
