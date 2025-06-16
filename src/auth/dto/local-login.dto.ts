import { Role } from '@/user/entities/user.entity';
import { IsEmail, IsEnum, IsString, Length, Matches } from 'class-validator';

export class LocalLoginDto {
  @IsEmail({}, { message: '유효한 이메일 주소를 입력해주세요.' })
  email: string;

  @IsString()
  @Length(8, 20, { message: '비밀번호는 8자 이상 20자 이하로 입력해주세요.' })
  @Matches(
    /^(?!.*\s)(?=.*[A-Za-z])(?=.*\d)(?=.*[!@#$%^&*()\-_=+{};:,<.>]).{8,20}$/,
    {
      message:
        '비밀번호는 영문, 숫자, 특수문자를 모두 포함해야 하며 공백 없이 입력해야 합니다.',
    },
  )
  password: string;

  @IsEnum(Role, {
    message: '역할(role) 값은 반드시 MOVER, CUSTOMER 중 하나여야 합니다.',
  })
  role: Role;
}
