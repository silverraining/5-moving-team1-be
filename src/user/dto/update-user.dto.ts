import { OmitType, PartialType } from '@nestjs/swagger';
import { CreateUserDto } from './create-user.dto';
import { IsOptional, IsString, Length, Matches } from 'class-validator';

export class UpdateUserDto extends PartialType(
  OmitType(CreateUserDto, ['email', 'role', 'provider', 'providerId'] as const),
) {
  @IsOptional()
  @IsString()
  @Length(8, 20, {
    message: '새 비밀번호는 8자 이상 20자 이하로 입력해주세요.',
  })
  @Matches(
    /^(?!.*\s)(?=.*[A-Za-z])(?=.*\d)(?=.*[!@#$%^&*()\-_=+{};:,<.>]).{8,20}$/,
    {
      message:
        '새 비밀번호는 영문, 숫자, 특수문자를 모두 포함해야 하며 공백 없이 입력해야 합니다.',
    },
  )
  newPassword?: string;
}
