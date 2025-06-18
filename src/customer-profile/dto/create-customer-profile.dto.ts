import { CreateServiceDto } from '@/common/dto/create-service.dto';
import { IsOptional, IsString } from 'class-validator';

export class CreateCustomerProfileDto extends CreateServiceDto {
  @IsString()
  @IsOptional()
  imageUrl?: string;
}
