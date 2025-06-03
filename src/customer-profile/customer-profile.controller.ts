import { Controller, Get, Post, Body, Patch } from '@nestjs/common';
import { CustomerProfileService } from './customer-profile.service';
import { CreateCustomerProfileDto } from './dto/create-customer-profile.dto';
import { UpdateCustomerProfileDto } from './dto/update-customer-profile.dto';
import { UserInfo } from '@/user/decorator/user-info.decorator';
import { RBAC } from '@/auth/decorator/rbac.decorator';
import { Role } from '@/user/entities/user.entity';

@Controller('customer')
@RBAC(Role.CUSTOMER)
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

  @Get('me')
  findOne(@UserInfo() userInfo: UserInfo) {
    return this.customerProfileService.findOne(userInfo.sub);
  }

  @Patch('me')
  update(
    @Body() updateCustomerProfileDto: UpdateCustomerProfileDto,
    @UserInfo() userInfo: UserInfo,
  ) {
    return this.customerProfileService.update(
      userInfo.sub,
      updateCustomerProfileDto,
    );
  }
}
