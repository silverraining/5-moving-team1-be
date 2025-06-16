import {
  CODE_200_SUCCESS,
  CODE_400_BAD_REQUEST,
  CODE_401_RESPONSES,
  CODE_404_NOT_FOUND,
  CODE_500_INTERNAL_SERVER_ERROR,
} from '@/common/docs/response.swagger';
import {
  nameValidationError,
  newPasswordMissingError,
  newPasswordValidationError,
  passwordMismatchError,
  passwordValidationError,
  phoneValidationError,
  userNotFoundError,
} from '@/common/docs/validation.swagger';
import { applyDecorators } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiResponse,
} from '@nestjs/swagger';
import { UpdateUserDto } from '../dto/update-user.dto';
import { MessageSchema } from '@/common/docs/schema.swagger';

export function ApiUpdateMe() {
  return applyDecorators(
    ApiBearerAuth(),
    ApiOperation({
      summary: '내 정보 수정',
      description: `
- 인증된 사용자가 본인의 이름, 전화번호, 비밀번호를 수정합니다.
- 모든 항목은 선택적(optional)이며, 수정할 값만 전달하면 됩니다.
- 유효성 검증 조건은 다음과 같습니다:
  - 이름: 2자 이상 20자 이하, 한글/영어/숫자 조합만 가능 (공백·특수문자 불가)
  - 전화번호: 010으로 시작하는 11자리 숫자
  - 비밀번호, 새 비밀번호: 8~20자, 영문 + 숫자 + 특수문자 조합 (공백 불가)
      `,
    }),
    ApiBody({
      description: '수정할 필드 (이름, 비밀번호, 전화번호 중 선택적)',
      type: UpdateUserDto,
      examples: {
        nameOnly: {
          summary: '이름만 수정',
          value: {
            name: '무빙이',
          },
        },
        namePhoneExample: {
          summary: '이름과 전화번호 수정',
          value: {
            name: '무빙이',
            phone: '01012345678',
          },
        },
        passwordExample: {
          summary: '비밀번호만 수정',
          value: {
            password: 'password123!',
            newPassword: 'NewPassword123!',
          },
        },
        fullExample: {
          summary: '이름, 전화번호, 비밀번호 모두 수정',
          value: {
            name: '무빙이',
            phone: '01088888888',
            password: 'password123!',
            newPassword: 'NewPassword123!',
          },
        },
      },
    }),
    ApiResponse(
      CODE_200_SUCCESS({
        description: '회원정보 수정 성공',
        schema: MessageSchema('회원정보가 성공적으로 수정되었습니다.'),
      }),
    ),
    ApiResponse(
      CODE_400_BAD_REQUEST([
        nameValidationError,
        phoneValidationError,
        passwordValidationError,
        newPasswordValidationError,
        passwordMismatchError,
        newPasswordMissingError,
      ]),
    ),
    ApiResponse(CODE_401_RESPONSES),
    ApiResponse(CODE_404_NOT_FOUND([userNotFoundError])),
    ApiResponse({
      status: 204,
      description: '변경된 내용 없는 경우',
    }),
    ApiResponse(
      CODE_500_INTERNAL_SERVER_ERROR({
        description: '회원정보 수정에 실패한 경우',
        message: '회원정보 수정에 실패했습니다.',
      }),
    ),
  );
}
