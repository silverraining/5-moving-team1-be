import { Type } from 'class-transformer';
import {
  ArrayNotEmpty,
  IsArray,
  IsOptional,
  IsString,
  ValidateIf,
} from 'class-validator';

export class UpdateNotificationDto {
  @ValidateIf((o) => o.ids === undefined) // ids가 없을 때만 id를 검증
  @IsString()
  @IsOptional()
  id?: string;

  @ValidateIf((o) => o.id === undefined) // id가 없을 때만 ids를 검증
  @IsArray()
  @ArrayNotEmpty()
  @IsString({ each: true })
  @IsOptional()
  @Type(() => String)
  ids?: string[];
}
