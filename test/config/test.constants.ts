import { TEST_CONFIG } from './test.config';

// 랜덤 이름 생성을 위한 배열들
const ADJECTIVES = [
  '친절한',
  '성실한',
  '믿음직한',
  '신속한',
  '정직한',
  '꼼꼼한',
  '열정적인',
  '전문적인',
  '경험많은',
  '안전한',
] as const;

const NOUNS = [
  '이사왕',
  '포장달인',
  '이사전문가',
  '운송마스터',
  '이사매니저',
  '포장전문가',
  '이사달인',
  '운송전문가',
  '이사프로',
  '포장프로',
] as const;

// 한국 성씨 배열
const SURNAMES = [
  '김',
  '이',
  '박',
  '최',
  '정',
  '윤',
  '민',
  '강',
  '조',
  '윤',
  '장',
  '임',
  '한',
  '오',
  '서',
  '신',
  '권',
  '황',
  '안',
  '송',
  '류',
  '홍',
] as const;

// 이름 구성요소 배열
const GIVEN_NAMES = [
  '조순',
  '하윤',
  '세정',
  '지영',
  '민호',
  '은비',
  '민준',
  '서준',
  '도윤',
  '지호',
  '지훈',
  '준서',
  '준우',
  '현우',
  '도현',
  '지현',
  '민서',
  '서연',
  '서윤',
  '지윤',
  '서현',
  '민지',
  '수빈',
  '예은',
  '예린',
  '수현',
] as const;

export const TEST_CONSTANTS = {
  // 테스트용 기본 비밀번호
  defaultPassword: TEST_CONFIG.defaultPassword,

  // 테스트용 기본 전화번호 prefix (뒤에 랜덤 숫자가 붙음)
  PHONE_PREFIX: '0108888',

  // 랜덤 이름 생성용 배열
  NAME_COMPONENTS: {
    ADJECTIVES,
    NOUNS,
    SURNAMES,
    GIVEN_NAMES,
  },

  // 테스트 계정 생성 시 기본값
  DEFAULT_VALUES: {
    customerName: '테스트고객',
    moverNamePrefix: '테스트기사',
    moverNicknamePrefix: '테스트기사',
    moverIntro: '안녕하세요! 고객님의 소중한 이사를 도와드리겠습니다.',
    moverDescription:
      '신속하고 안전한 이사를 약속드립니다. 포장부터 운송, 정리까지 완벽하게 도와드립니다.',
  },

  // 테스트용 이메일 도메인
  TEST_EMAIL_DOMAIN: 'moving.com',
} as const;
