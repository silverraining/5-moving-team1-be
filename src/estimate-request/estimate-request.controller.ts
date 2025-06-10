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
import {
  ApiCreateEstimateRequest,
  ApiGetMyEstimateHistory,
} from './docs/swagger';

@ApiBearerAuth()
@Controller('estimate-request')
export class EstimateRequestController {
  constructor(
    private readonly estimateRequestService: EstimateRequestService,
  ) {}

  @Post()
  @RBAC(Role.CUSTOMER)
  @ApiCreateEstimateRequest()
  async create(
    @Body() dto: CreateEstimateRequestDto,
    @UserInfo() user: UserInfo,
  ) {
    return this.estimateRequestService.create(dto, user);
  }

  @Get('history')
  @RBAC(Role.CUSTOMER)
  @ApiGetMyEstimateHistory()
  async findAllRequestHistory(@UserInfo() user: UserInfo) {
    return this.estimateRequestService.findAllRequestHistory(user.sub);
  }

  // @Patch(':id')
  // update(
  //   @Param('id') id: string,
  //   @Body() updateEstimateRequestDto: UpdateEstimateRequestDto,
  // ) {
  //   return this.estimateRequestService.update(+id, updateEstimateRequestDto);
  // }

  // @Delete(':id')
  // remove(@Param('id') id: string) {
  //   return this.estimateRequestService.remove(+id);
  // }
}
