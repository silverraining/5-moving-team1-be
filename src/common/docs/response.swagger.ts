// 200
type CODE_200_TYPE = {
  description?: string;
  schema: object;
};
export const CODE_200_SUCCESS = ({ description, schema }: CODE_200_TYPE) => {
  return {
    status: 200,
    description: description || '조회 성공한 경우',
    schema: schema,
  };
};

// 201
type CODE_201_TYPE = {
  description?: string;
  schema: object;
};
export const CODE_201_CREATED = ({ description }: CODE_201_TYPE) => {
  return {
    status: 201,
    description: description || '생성 성공한 경우',
    // schema: schema,
  };
};

// 400
type ErrorExample = {
  key: string;
  summary: string;
  value: {
    statusCode: number;
    message: string | string[];
    error: string;
  };
};
export const CODE_400_BAD_REQUEST = (errorExamples: ErrorExample[]) => {
  return {
    status: 400,
    description: '입력값 유효성 검사 실패',
    content: {
      'application/json': {
        examples: Object.fromEntries(
          errorExamples.map((example) => [
            example.key,
            {
              summary: example.summary,
              value: example.value,
            },
          ]),
        ),
      },
    },
  };
};

// 401
export const CODE_401_RESPONSES = {
  status: 401,
  description: '토큰 인증 오류',
  content: {
    'application/json': {
      examples: {
        tokenExpired: {
          summary: '토큰 만료',
          value: {
            statusCode: 401,
            message: '토큰이 만료되었습니다',
            errorCode: 'TOKEN_EXPIRED',
          },
        },
        invalidTokenType: {
          summary: '잘못된 토큰 타입',
          value: {
            statusCode: 401,
            message: '잘못된 토큰 타입입니다',
            errorCode: 'INVALID_TOKEN_TYPE',
          },
        },
      },
    },
  },
};

// 403
export const CODE_403_FORBIDDEN = (errorExamples: ErrorExample[]) => {
  return {
    status: 403,
    description: '권한 없음',
    content: {
      'application/json': {
        examples: Object.fromEntries(
          errorExamples.map((example) => [
            example.key,
            {
              summary: example.summary,
              value: example.value,
            },
          ]),
        ),
      },
    },
  };
};

// 404
export const CODE_404_NOT_FOUND = (errorExamples: ErrorExample[]) => {
  return {
    status: 404,
    description: '리소스가 존재하지 않는 경우',
    content: {
      'application/json': {
        examples: Object.fromEntries(
          errorExamples.map((example) => [
            example.key,
            {
              summary: example.summary,
              value: example.value,
            },
          ]),
        ),
      },
    },
  };
};

// 409
export const CODE_409_CONFLICT = (errorExamples: ErrorExample[]) => {
  return {
    status: 409,
    description: '리소스 충돌',
    content: {
      'application/json': {
        examples: Object.fromEntries(
          errorExamples.map((example) => [
            example.key,
            {
              summary: example.summary,
              value: example.value,
            },
          ]),
        ),
      },
    },
  };
};

// 500
type CODE_500_TYPE = {
  description?: string;
  message?: string;
};
export const CODE_500_INTERNAL_SERVER_ERROR = ({
  description,
  message,
}: CODE_500_TYPE) => {
  return {
    status: 500,
    description: description || '서버 내부 오류',
    schema: {
      example: {
        statusCode: 500,
        message: message || '서버 내부 오류가 발생했습니다.',
        error: 'Internal Server Error',
      },
    },
  };
};
