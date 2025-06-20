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

// 400
// [user] 유효성 검사 관련 에러 메시지들
export const nameValidationError = {
  key: 'nameValidationError',
  summary: '이름 유효성 실패',
  value: {
    statusCode: 400,
    message:
      '이름은 2자 이상 20자 이하로 한글, 영어, 숫자와 그 조합만 가능하며, 공백과 특수문자는 사용할 수 없습니다.',
    error: 'Bad Request',
  },
};

export const roleValidationError = {
  key: 'roleValidationError',
  summary: '역할 유효성 실패',
  value: {
    statusCode: 400,
    message: '역할(role) 값은 반드시 MOVER, CUSTOMER 중 하나여야 합니다.',
    error: 'Bad Request',
  },
};

export const emailValidationError = {
  key: 'emailValidationError',
  summary: '이메일 유효성 실패',
  value: {
    statusCode: 400,
    message: '유효한 이메일 주소를 입력해주세요.',
    error: 'Bad Request',
  },
};

export const phoneValidationError = {
  key: 'phoneValidationError',
  summary: '전화번호 유효성 실패',
  value: {
    statusCode: 400,
    message: '휴대폰 번호는 010으로 시작하는 11자리 숫자여야 합니다.',
    error: 'Bad Request',
  },
};

export const passwordValidationError = {
  key: 'passwordValidationError',
  summary: '비밀번호 유효성 실패',
  value: {
    statusCode: 400,
    message:
      '비밀번호는 8자 이상 20자 이하의 영문, 숫자, 특수문자 조합을 공백 없이 입력해야 합니다.',
    error: 'Bad Request',
  },
};

export const newPasswordValidationError = {
  key: 'newPasswordValidationError',
  summary: '새 비밀번호 유효성 실패',
  value: {
    statusCode: 400,
    message:
      '새 비밀번호는 8자 이상 20자 이하의 영문, 숫자, 특수문자 조합을 공백 없이 입력해야 합니다.',
    error: 'Bad Request',
  },
};

export const passwordMismatchError = {
  key: 'passwordMismatchError',
  summary: '비밀번호 불일치',
  value: {
    statusCode: 400,
    message: '기존 비밀번호가 일치하지 않습니다.',
    error: 'Bad Request',
  },
};

export const newPasswordMissingError = {
  key: 'newPasswordMissingError',
  summary: '새 비밀번호 누락',
  value: {
    statusCode: 400,
    message: '새 비밀번호가 누락되었습니다!',
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
    message: 'imageUrl은 문자열이어야 합니다.',
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
    message: '설명은 10자 이상 500자 이하 입니다.',
    error: 'Bad Request',
  },
};

export const serviceTypeValidationError = {
  key: 'serviceTypeValidationError',
  summary: '서비스 타입 유효성 실패',
  value: {
    statusCode: 400,
    message: '서비스 타입은 최소 하나 이상 선택되어야 합니다.',
    error: 'Bad Request',
  },
};

export const serviceRegionValidationError = {
  key: 'serviceRegionValidationError',
  summary: '서비스 지역 유효성 실패',
  value: {
    statusCode: 400,
    message: '서비스 지역은 최소 하나 이상 선택되어야 합니다.',
    error: 'Bad Request',
  },
};

// 커서 기반 페이지네이션 관련 유효성 검사 에러 메시지들
export const cursorValidationError = {
  key: 'cursorValidationError',
  summary: '커서 값 유효성 실패',
  value: {
    statusCode: 400,
    message: '커서는 문자열이어야 합니다.',
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
    message: '페이지 크기는 정수여야 하며 1 이상의 값을 입력해야 합니다.',
    error: 'Bad Request',
  },
};

export const unsupportedSocialLoginError = {
  key: 'unsupportedSocialLoginError',
  summary: '지원하지 않는 소셜 로그인 시도',
  value: {
    statusCode: 400,
    message: '지원하지 않는 소셜 로그인입니다!',
    error: 'Bad Request',
  },
};

export const estimateRequestAlreadyProcessedError = {
  key: 'estimateRequestAlreadyProcessedError',
  summary: '이미 처리된 견적 요청인 경우',
  value: {
    statusCode: 400,
    message: '이미 처리된 견적 요청입니다.',
    error: 'Bad Request',
  },
};

export const estimateOfferAlreadyProcessedError = {
  key: 'estimateOfferAlreadyProcessedError',
  summary: '이미 처리된 견적 제안인 경우',
  value: {
    statusCode: 400,
    message: '이미 처리된 견적 제안입니다.',
    error: 'Bad Request',
  },
};

// 403
export const ForbiddenError = {
  key: 'ForbiddenError',
  summary: '접근 권한 없음',
  value: {
    statusCode: 403,
    message: '접근 권한이 없습니다.',
    error: 'Forbidden',
  },
};

// 404
export const moverNotFoundError = {
  key: 'moverNotFoundError',
  summary: '기사님을 찾을 수 없는 경우',
  value: {
    statusCode: 404,
    message: '기사님을 찾을 수 없습니다.',
    error: 'Not Found',
  },
};

export const customerProfileNotFoundError = {
  key: 'customerProfileNotFoundError',
  summary: '고객님의 프로필을 찾을 수 없는 경우',
  value: {
    statusCode: 404,
    message: '고객님의 프로필을 찾을 수 없습니다, 프로필을 생성해주세요!',
    error: 'Not Found',
  },
};

export const userNotFoundError = {
  key: 'userNotFoundError',
  summary: '사용자를 찾을 수 없는 경우',
  value: {
    statusCode: 404,
    message: '사용자를 찾을 수 없습니다.',
    error: 'Not Found',
  },
};

export const moverProfileNotFoundError = {
  key: 'moverProfileNotFoundError',
  summary: '본인의 [mover] 프로필이 존재하지 않는 경우',
  value: {
    statusCode: 404,
    message: '[mover] 프로필을 찾을 수 없습니다.',
    error: 'Not Found',
  },
};

export const estimateRequestNotFoundError = {
  key: 'estimateRequestNotFoundError',
  summary: '견적 요청을 찾을 수 없는 경우',
  value: {
    statusCode: 404,
    message: '견적 요청을 찾을 수 없습니다.',
    error: 'Not Found',
  },
};

export const estimateOfferNotFoundError = {
  key: 'estimateOfferNotFoundError',
  summary: '견적 제안을 찾을 수 없는 경우',
  value: {
    statusCode: 404,
    message: '해당 견적 제안을 찾을 수 없습니다.',
    error: 'Not Found',
  },
};

// review 관련 유효성 검사 에러 메시지들

// --- Review Validation Errors ---
export const ratingValidationError = {
  key: 'invalidRating',
  summary: '평점 유효성 검사 실패',
  value: {
    statusCode: 400,
    message:
      'rating must be an integer number and not less than 1 and not more than 5',
    error: 'Bad Request',
  },
};

export const contentValidationError = {
  key: 'invalidContent',
  summary: '리뷰 내용 유효성 검사 실패',
  value: {
    statusCode: 400,
    message: 'content must be a string and not be empty',
    error: 'Bad Request',
  },
};

export const pageValidationError = {
  key: 'invalidPage',
  summary: '페이지 번호 유효성 검사 실패',
  value: {
    statusCode: 400,
    message: 'page must be an integer number and not less than 1',
    error: 'Bad Request',
  },
};

export const forbiddenReviewError = {
  key: 'forbiddenReview',
  summary: '리뷰 작성 권한 없음',
  value: {
    statusCode: 403,
    message: '해당 견적 제안은 고객님께서 리뷰를 작성할 수 없습니다.',
    error: 'Forbidden',
  },
};

export const completedOfferNotFoundError = {
  key: 'completedOfferNotFound',
  summary: '완료된 견적 없음',
  value: {
    statusCode: 404,
    message: '해당 견적 제안을 찾을 수 없습니다.',
    error: 'Not Found',
  },
};

export const reviewAlreadyExistsError = {
  key: 'reviewConflict',
  summary: '리뷰 중복 작성',
  value: {
    statusCode: 409,
    message: '이미 리뷰를 작성하셨습니다.',
    error: 'Conflict',
  },
};
