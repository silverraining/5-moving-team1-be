import { Controller, Get, Post, Body, Patch, Param } from '@nestjs/common';
import { CustomerProfileService } from './customer-profile.service';
import { CreateCustomerProfileDto } from './dto/create-customer-profile.dto';
import { UpdateCustomerProfileDto } from './dto/update-customer-profile.dto';
import { UserInfo } from '@/user/decorator/user-info.decorator';
import { RBAC } from '@/auth/decorator/rbac.decorator';
import { Role } from '@/user/entities/user.entity';

@Controller('customer-profile')
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

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateCustomerProfileDto: UpdateCustomerProfileDto,
  ) {
    return this.customerProfileService.update(+id, updateCustomerProfileDto);
  }
}
