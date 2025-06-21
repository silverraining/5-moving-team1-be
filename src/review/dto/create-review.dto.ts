import { IsInt, IsString, Max, Min } from 'class-validator';

export class CreateReviewDto {
  @IsInt()
  @Min(1)
  @Max(5)
  rating: number; // 별점 (1~5)

  @IsString()
  comment: string; // 리뷰 내용
}
