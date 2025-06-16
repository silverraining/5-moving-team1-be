import {
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { CreateUserDto } from 'src/user/dto/create-user.dto';
import { applyDecorators } from '@nestjs/common';
import {
  CODE_201_CREATED,
  CODE_400_BAD_REQUEST,
  CODE_500_INTERNAL_SERVER_ERROR,
} from '@/common/docs/response.swagger';
import {
  emailValidationError,
  passwordValidationError,
  roleValidationError,
} from '@/common/docs/validation.swagger';
import { MessageSchema, userDataSchema } from '@/common/docs/schema.swagger';
import { localRegisterExample } from '@/common/docs/body.swagger';
import { unsupportedSocialLoginError } from '@/common/docs/validation.swagger';

export const ApiRegister = () => [
  ApiOperation({
    summary: '회원가입',
    description: `
    - 이름은 한글 또는 영어만 가능 (2~20자, 특수문자 및 공백 불가)
    - 휴대폰 번호는 010으로 시작하는 11자리 숫자
    - 비밀번호는 영문, 숫자, 특수문자를 포함한 8~20자 (공백 없음, 선택사항)
    - 이메일은 유효한 이메일 형식
    - 역할은 'CUSTOMER' 또는 'MOVER' 중 하나
    `,
  }),
  ApiBody({
    type: CreateUserDto,
    description: '회원가입에 필요한 사용자 정보',
    examples: {
      basic: localRegisterExample,
    },
  }),
  ApiResponse(
    CODE_201_CREATED({
      description: '회원가입 성공',
      schema: MessageSchema('회원가입에 성공했습니다!'),
    }),
  ),
  ApiResponse({
    status: 400,
    description: '유효성 검사 실패 또는 중복된 이메일로 인한 회원가입 실패',
    content: {
      'application/json': {
        examples: {
          validationError: {
            summary: '입력값 유효성 오류',
            value: {
              statusCode: 400,
              message: [
                '이름은 한글 또는 영어만 가능하며, 공백과 특수문자는 사용할 수 없습니다.',
                '휴대폰 번호는 010으로 시작하는 11자리 숫자여야 합니다.',
              ],
              error: 'Bad Request',
            },
          },
          duplicateEmail: {
            summary: '중복된 이메일 오류',
            value: {
              statusCode: 400,
              message: '이미 가입한 이메일 입니다!',
              error: 'Bad Request',
            },
          },
        },
      },
    },
  }),
  ApiResponse(
    CODE_500_INTERNAL_SERVER_ERROR({
      description: '서버 오류로 인한 회원가입 실패',
      message: '회원가입에 실패했습니다!',
    }),
  ),
];

export const ApiLogin = () => [
  ApiOperation({
    summary: '로컬 로그인 (아이디/비밀번호)',
    description: `
    - Local strategy를 통해 로그인을 수행하고, 액세스/리프레시 토큰을 발급합니다.
    - 로그인 시 이메일과 비밀번호를 입력받습니다.
    - 역할(role)은 'CUSTOMER' 또는 'MOVER' 중 하나로 지정해야 합니다.
    - role은 로그인을 시도하는 사용자의 역할이다. 예를 들어 기사님 페이지에서 로그인 시도를 할 경우 role은 'MOVER'이다.
    `,
  }),
  ApiBody({
    description: '로그인에 필요한 사용자 정보',
    schema: {
      type: 'object',
      properties: {
        email: { type: 'string', example: 'hong@example.com' },
        password: { type: 'string', example: 'P@ssw0rd!' },
        role: {
          type: 'enum',
          enum: ['CUSTOMER', 'MOVER'],
          example: 'CUSTOMER',
        },
      },
      required: ['email', 'password', 'role'],
    },
    examples: {
      basic: {
        summary: '기본 예시',
        value: {
          email: 'customer@moving.com',
          password: 'moving123!',
          role: 'CUSTOMER',
        },
      },
    },
  }),
  ApiResponse(
    CODE_201_CREATED({
      description: '로그인 성공 및 토큰 발급',
      schema: userDataSchema,
    }),
  ),
  ApiResponse(
    CODE_400_BAD_REQUEST([
      emailValidationError,
      passwordValidationError,
      roleValidationError,
    ]),
  ),
];

export const ApiSocialLogin = () =>
  applyDecorators(
    ApiOperation({
      summary: '소셜 로그인',
      description: `
- 소셜 로그인 전략을 사용하여 사용자를 인증합니다.
- 사용자는 소셜 로그인 후, 서버에서 발급한 액세스 토큰과 리프레시 토큰을 받습니다.
    `,
    }),
    ApiResponse(
      CODE_201_CREATED({
        description: '로그인 성공 및 토큰 발급',
        schema: userDataSchema,
      }),
    ),
    ApiResponse(CODE_400_BAD_REQUEST([unsupportedSocialLoginError])),
  );

export const ApiRotateToken = () =>
  applyDecorators(
    ApiOperation({
      summary: '액세스 토큰 재발급',
      description: '리프레시 토큰이 유효할 경우 새 액세스 토큰을 발급합니다.',
    }),
    ApiBody({
      schema: {
        type: 'object',
        properties: {
          refreshToken: {
            type: 'string',
            example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI4...',
          },
        },
        required: ['refreshToken'],
      },
      examples: {
        basic: {
          summary: '기본 예시',
          value: {
            refreshToken:
              'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI4M...',
          },
        },
      },
    }),
    ApiResponse({
      status: 200,
      description: '새 액세스 토큰 발급',
      schema: {
        example: {
          accessToken: 'new-access-token',
        },
      },
    }),
    ApiResponse({
      status: 401,
      description: '리프레시 토큰이 유효하지 않습니다.',
      schema: {
        example: {
          message: '리프레시 토큰이 유효하지 않습니다.',
          error: 'Unauthorized',
          statusCode: 401,
        },
      },
    }),
  );
export const ApiLogout = () =>
  applyDecorators(
    ApiBearerAuth(),
    ApiOperation({
      summary: '로그아웃',
      description:
        '서버에 저장된 리프레시 토큰을 삭제하여 로그아웃 처리합니다.',
    }),
    ApiResponse({
      status: 200,
      description: '로그아웃 성공',
      schema: {
        example: {
          message: '로그아웃 되었습니다.',
        },
      },
    }),
    ApiResponse({
      status: 401,
      description: '엑세스 토큰이 없거나 유효하지 않은 경우',
      schema: {
        example: {
          statusCode: 401,
          message: '액세스 토큰이 필요합니다.',
          error: 'Unauthorized',
        },
      },
    }),
  );
