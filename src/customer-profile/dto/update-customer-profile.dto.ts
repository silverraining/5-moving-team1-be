import { IntersectionType, PartialType } from '@nestjs/mapped-types';
import { CreateCustomerProfileDto } from './create-customer-profile.dto';
import { UpdateUserDto } from '@/user/dto/update-user.dto';

export class UpdateCustomerProfileDto extends IntersectionType(
  PartialType(CreateCustomerProfileDto),
  UpdateUserDto,
) {}
