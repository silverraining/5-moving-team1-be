import {
  IsEmail,
  IsEnum,
  IsOptional,
  IsString,
  Length,
  Matches,
} from 'class-validator';
import { Role } from '../entities/user.entity';

export class CreateUserDto {
  @IsEnum(Role)
  role: Role;

  @IsString()
  @Length(2, 20, { message: '이름은 2자 이상 20자 이하이어야 합니다.' })
  @Matches(/^[가-힣a-zA-Z]/, {
    message:
      '이름은 한글 또는 영어만 가능하며, 공백과 특수문자는 사용할 수 없습니다.',
  })
  name: string;

  @IsString()
  @Matches(/^010\d{8}$/, {
    message: '휴대폰 번호는 010으로 시작하는 11자리 숫자여야 합니다.',
  })
  phone: string;

  @IsEmail({}, { message: '유효한 이메일 주소를 입력해주세요.' })
  email: string;

  @IsOptional()
  @IsString()
  @Length(8, 20, { message: '비밀번호는 8자 이상 20자 이하로 입력해주세요.' })
  @Matches(
    /^(?!.*\s)(?=.*[A-Za-z])(?=.*\d)(?=.*[!@#$%^&*()\-_=+{};:,<.>]).{8,20}$/,
    {
      message:
        '비밀번호는 영문, 숫자, 특수문자를 모두 포함해야 하며 공백 없이 입력해야 합니다.',
    },
  )
  password?: string;
}
