import {
  IsEmail,
  IsEnum,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';
import { Provider, Role } from '../entities/user.entity';

export class CreateUserDto {
  @IsEnum(Role)
  role: Role;

  @IsString()
  name: string;

  @IsString()
  phone: string;

  @IsEmail()
  email: string;

  @IsOptional()
  @IsString()
  @MinLength(8)
  password?: string;

  @IsEnum(Provider)
  provider: Provider;

  @IsOptional()
  @IsString()
  snsId?: string;
}
