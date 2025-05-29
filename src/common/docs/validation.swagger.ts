/**
 * 400번대 에러 메시지들
 * 유효성 검사 실패, 잘못된 요청 등
 * 
 * CODE_400_BAD_REQUEST 함수에서 사용
 * 파라미터의 배열에서 사용
 * 
 * 예시:
 *  ApiResponse(
       CODE_400_BAD_REQUEST([nameValidationError, passwordValidationError]),
    ),
 */

// [user] 유효성 검사 관련 에러 메시지들
export const nameValidationError = {
  key: 'nameValidationError',
  summary: '이름 유효성 실패',
  value: {
    statusCode: 400,
    message: [
      '이름은 2자 이상 20자 이하로 한글, 영어, 숫자와 그 조합만 가능하며, 공백과 특수문자는 사용할 수 없습니다.',
    ],
    error: 'Bad Request',
  },
};

export const passwordValidationError = {
  key: 'passwordValidationError',
  summary: '비밀번호 유효성 실패',
  value: {
    statusCode: 400,
    message: [
      '비밀번호는 8자 이상 20자 이하의 영문, 숫자, 특수문자 조합을 공백 없이 입력해야 합니다.',
    ],
    error: 'Bad Request',
  },
};

// [mover] 프로필 관련 유효성 검사 에러 메시지들
export const nicknameValidationError = {
  key: 'nicknameValidationError',
  summary: '별명 유효성 실패',
  value: {
    statusCode: 400,
    message: [
      '별명은 2자 이상 20자 이하여야 합니다.',
      '별명은 한글, 영문, 숫자만 사용할 수 있으며 공백 및 특수문자는 허용되지 않습니다.',
    ],
    error: 'Bad Request',
  },
};

export const imageUrlValidationError = {
  key: 'imageUrlValidationError',
  summary: '이미지 URL 유효성 실패',
  value: {
    statusCode: 400,
    message: ['imageUrl은 문자열이어야 합니다.'],
    error: 'Bad Request',
  },
};

export const experienceValidationError = {
  key: 'experienceValidationError',
  summary: '경력 유효성 실패',
  value: {
    statusCode: 400,
    message: [
      '경력은 최소 0이상 입력해야 합니다.',
      '경력은 최대 99까지 입력해야 합니다.',
    ],
    error: 'Bad Request',
  },
};

export const introValidationError = {
  key: 'introValidationError',
  summary: '소개 유효성 실패',
  value: {
    statusCode: 400,
    message: [
      '소개는 8자 이상 50자 이하 입니다.',
      '소개에는 줄바꿈을 포함할 수 없습니다.',
    ],
    error: 'Bad Request',
  },
};

export const descriptionValidationError = {
  key: 'descriptionValidationError',
  summary: '설명 유효성 실패',
  value: {
    statusCode: 400,
    message: ['설명은 10자 이상 500자 이하 입니다.'],
    error: 'Bad Request',
  },
};

export const serviceTypeValidationError = {
  key: 'serviceTypeValidationError',
  summary: '서비스 타입 유효성 실패',
  value: {
    statusCode: 400,
    message: ['서비스 타입은 최소 하나 이상 선택되어야 합니다.'],
    error: 'Bad Request',
  },
};

export const serviceRegionValidationError = {
  key: 'serviceRegionValidationError',
  summary: '서비스 지역 유효성 실패',
  value: {
    statusCode: 400,
    message: ['서비스 지역은 최소 하나 이상 선택되어야 합니다.'],
    error: 'Bad Request',
  },
};

// 커서 기반 페이지네이션 관련 유효성 검사 에러 메시지들
export const cursorValidationError = {
  key: 'cursorValidationError',
  summary: '커서 값 유효성 실패',
  value: {
    statusCode: 400,
    message: ['커서는 문자열이어야 합니다.'],
    error: 'Bad Request',
  },
};

export const orderValidationError = {
  key: 'orderValidationError',
  summary: '정렬 기준 유효성 실패',
  value: {
    statusCode: 400,
    message: [
      '정렬 기준 객체가 필요합니다.',
      'field는 올바른 OrderField 값이어야 합니다.',
      'direction은 ASC 또는 DESC여야 합니다.',
    ],
    error: 'Bad Request',
  },
};

export const takeValidationError = {
  key: 'takeValidationError',
  summary: '페이지 크기 유효성 실패',
  value: {
    statusCode: 400,
    message: ['페이지 크기는 정수여야 하며 1 이상의 값을 입력해야 합니다.'],
    error: 'Bad Request',
  },
};
