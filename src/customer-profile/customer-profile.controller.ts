import { Controller, Get, Post, Body, Patch } from '@nestjs/common';
import { CustomerProfileService } from './customer-profile.service';
import { CreateCustomerProfileDto } from './dto/create-customer-profile.dto';
import { UpdateCustomerProfileDto } from './dto/update-customer-profile.dto';
import { UserInfo } from '@/user/decorator/user-info.decorator';
import { RBAC } from '@/auth/decorator/rbac.decorator';
import { Role } from '@/user/entities/user.entity';
import {
  ApiCreateCustomerProfile,
  ApiGetMyCustomerProfile,
  ApiUpdateMyCustomerProfile,
} from './docs/swagger';

@Controller('customer')
@RBAC(Role.CUSTOMER)
export class CustomerProfileController {
  constructor(
    private readonly customerProfileService: CustomerProfileService,
  ) {}

  @Post()
  @ApiCreateCustomerProfile()
  create(
    @Body() createCustomerProfileDto: CreateCustomerProfileDto,
    @UserInfo() userInfo: UserInfo,
  ) {
    return this.customerProfileService.create(
      userInfo.sub,
      createCustomerProfileDto,
    );
  }

  @Get('me')
  @ApiGetMyCustomerProfile()
  findOne(@UserInfo() userInfo: UserInfo) {
    return this.customerProfileService.findOne(userInfo.sub);
  }

  @Patch('me')
  @ApiUpdateMyCustomerProfile()
  update(
    @UserInfo() userInfo: UserInfo,
    @Body() updateCustomerProfileDto: UpdateCustomerProfileDto,
  ) {
    return this.customerProfileService.update(
      userInfo.sub,
      updateCustomerProfileDto,
    );
  }
}
