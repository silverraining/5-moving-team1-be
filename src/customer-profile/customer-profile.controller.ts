import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { CustomerProfileService } from './customer-profile.service';
import { CreateCustomerProfileDto } from './dto/create-customer-profile.dto';
import { UpdateCustomerProfileDto } from './dto/update-customer-profile.dto';
import { UserInfo } from '@/user/decorator/user-info.decorator';

@Controller('customer-profile')
export class CustomerProfileController {
  constructor(
    private readonly customerProfileService: CustomerProfileService,
  ) {}

  @Post()
  create(
    @Body() createCustomerProfileDto: CreateCustomerProfileDto,
    @UserInfo() userInfo: UserInfo,
  ) {
    return this.customerProfileService.create(
      userInfo.sub,
      createCustomerProfileDto,
    );
  }

  @Get()
  findAll() {
    return this.customerProfileService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.customerProfileService.findOne(+id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateCustomerProfileDto: UpdateCustomerProfileDto,
  ) {
    return this.customerProfileService.update(+id, updateCustomerProfileDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.customerProfileService.remove(+id);
  }
}
