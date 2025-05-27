import { ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';
import { CreateUserDto } from 'src/user/dto/create-user.dto';
import { applyDecorators } from '@nestjs/common';
export const ApiRegister = () => [
  ApiOperation({
    summary: '회원가입',
    description: `
- 이름은 한글 또는 영어만 가능 (2~20자, 특수문자 및 공백 불가)
- 휴대폰 번호는 010으로 시작하는 11자리 숫자
- 비밀번호는 영문, 숫자, 특수문자를 포함한 8~20자 (공백 없음, 선택사항)
- 이메일은 유효한 이메일 형식
    `,
  }),
  ApiBody({
    type: CreateUserDto,
    description: '회원가입에 필요한 사용자 정보',
    examples: {
      basic: {
        summary: '기본 예시',
        value: {
          role: 'CUSTOMER',
          name: '홍길동',
          phone: '01012345678',
          email: 'hong@example.com',
          password: 'P@ssw0rd!',
        },
      },
    },
  }),
  ApiResponse({
    status: 201,
    description: '회원가입 성공',
    schema: {
      example: {
        id: 1,
        email: 'hong@example.com',
      },
    },
  }),
  ApiResponse({
    status: 400,
    description: '유효성 검사 실패',
    schema: {
      example: {
        statusCode: 400,
        message: [
          '이름은 한글 또는 영어만 가능하며, 공백과 특수문자는 사용할 수 없습니다.',
          '비밀번호는 영문, 숫자, 특수문자를 모두 포함해야 하며 공백 없이 입력해야 합니다.',
        ],
        error: 'Bad Request',
      },
    },
  }),
];

export const ApiLogin = () => [
  ApiOperation({
    summary: '로컬 로그인 (아이디/비밀번호)',
    description:
      'Local strategy를 통해 로그인을 수행하고, 액세스/리프레시 토큰을 발급합니다.',
  }),
  ApiBody({
    description: '로그인에 필요한 사용자 정보',
    schema: {
      type: 'object',
      properties: {
        email: { type: 'string', example: 'hong@example.com' },
        password: { type: 'string', example: 'P@ssw0rd!' },
      },
      required: ['email', 'password'],
    },
    examples: {
      basic: {
        summary: '기본 예시',
        value: {
          email: 'hong@example.com',
          password: 'P@ssw0rd!',
        },
      },
    },
  }),
  ApiResponse({
    status: 200,
    description: '로그인 성공 및 토큰 발급',
  }),
];

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
            example:
              'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI4Mzg0NjUxOS1kNjMxLTQzM2UtYTZmYi0wNzA1ZmIzZTZkM2QiLCJyb2xlIjoiQ1VTVE9NRVIiLCJ0eXBlIjoiYWNjZXNzIiwiaWF0IjoxNzQ4MjMyMjUyLCJleHAiOjE3NDgyMzI1NTJ9.bqVmVH8_eh4fDP8TPCV0tazgTmkZUZEcnjXqLgMOI0Q',
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
      status: 201,
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
