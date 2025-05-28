import {
  IsOptional,
  IsString,
  Length,
  Matches,
  MinLength,
} from 'class-validator';
export class UpdateUserInfoDto {
  @IsOptional()
  @IsString()
  @Matches(/^[가-힣a-zA-Z0-9]{2,20}$/, {
    message:
      '이름은 2자 이상 20자 이하로 한글, 영어, 숫자와 그 조합만 가능하며, 공백과 특수문자는 사용할 수 없습니다.',
  })
  name?: string;

  @IsOptional()
  @IsString()
  @Matches(/^010\d{8}$/, {
    message: '휴대폰 번호는 010으로 시작하는 11자리 숫자여야 합니다.',
  })
  phone?: string;

  @IsOptional()
  @IsString()
  @Matches(
    /^(?!.*\s)(?=.*[A-Za-z])(?=.*\d)(?=.*[!@#$%^&*()\-_=+{};:,<.>]).{8,20}$/,
    {
      message:
        '비밀번호는 8자 이상 20자 이하의 영문, 숫자, 특수문자 조합을 공백 없이 입력해야 합니다.',
    },
  )
  password?: string;
}
