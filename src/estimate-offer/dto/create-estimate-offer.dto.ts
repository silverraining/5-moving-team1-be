import { IsNotEmpty, IsNumber, IsString, MinLength } from 'class-validator';

export class CreateEstimateOfferDto {
  @IsNotEmpty()
  @IsNumber()
  price: number;

  @IsNotEmpty()
  @IsString()
  @MinLength(10, { message: '댓글은 최소 10자 이상이어야 합니다.' })
  comment: string;
}
