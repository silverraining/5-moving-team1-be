import { ServiceRegion, ServiceType } from '@/common/const/service.const';
import { TEST_CONSTANTS } from '../config/test.constants';

export const randomBoolean = () => Math.random() < 0.5;

// 랜덤 숫자 생성 함수 (min과 max 사이의 정수)
export const getRandomNumber = (min: number, max: number) =>
  Math.floor(Math.random() * (max - min + 1)) + min;

// 배열에서 랜덤 요소 선택
export const getRandomElement = <T>(array: readonly T[]): T =>
  array[Math.floor(Math.random() * array.length)];

// 이메일 생성을 위한 간단한 영문 이름 배열
const SIMPLE_NAMES = ['user', 'customer', 'test', 'mover', 'moving'] as const;

// 간단한 이메일 생성 함수
export const generateTestEmail = (role: 'customer' | 'mover' = 'customer') => {
  const name = getRandomElement(SIMPLE_NAMES);
  const number = getRandomNumber(1, 9999).toString().padStart(4, '0');
  return `${role}.${name}${number}@${TEST_CONSTANTS.TEST_EMAIL_DOMAIN}`;
};

// 한국식 이름을 이용한 이메일 생성 함수
export const generateEmailFromName = (koreanName: string) => {
  const number = getRandomNumber(1, 999).toString().padStart(3, '0');
  // 한글 이름을 영문자로 변환 (초성 추출)
  const nameForEmail = koreanName.replace(/[^ㄱ-ㅎ가-힣]/g, '').substring(0, 3);
  return `${nameForEmail}${number}@${TEST_CONSTANTS.TEST_EMAIL_DOMAIN}`;
};

// 한국식 이름 생성 함수
export const generateKoreanName = () => {
  const surname = getRandomElement(TEST_CONSTANTS.NAME_COMPONENTS.SURNAMES);
  const givenName = getRandomElement(
    TEST_CONSTANTS.NAME_COMPONENTS.GIVEN_NAMES,
  );
  return `${surname}${givenName}`;
};

// 랜덤 이름 생성 함수
export const generateRandomName = (prefix: string = '') => {
  if (!prefix) {
    // 고객의 경우 한국식 이름 사용
    return generateKoreanName();
  }
  // 기사의 경우 기존 형식 사용
  const adjective = getRandomElement(TEST_CONSTANTS.NAME_COMPONENTS.ADJECTIVES);
  const number = getRandomNumber(1, 999).toString().padStart(3, '0');
  return `${prefix}_${adjective}${number}`;
};

export const createRandomServiceType = () => ({
  SMALL: randomBoolean(),
  HOME: randomBoolean(),
  OFFICE: randomBoolean(),
});

export const createRandomServiceRegion = () => ({
  [ServiceRegion.SEOUL]: randomBoolean(),
  [ServiceRegion.GYEONGGI]: randomBoolean(),
  [ServiceRegion.INCHEON]: randomBoolean(),
  [ServiceRegion.GANGWON]: randomBoolean(),
  [ServiceRegion.CHUNGBUK]: randomBoolean(),
  [ServiceRegion.CHUNGNAM]: randomBoolean(),
  [ServiceRegion.SEJONG]: randomBoolean(),
  [ServiceRegion.DAEJEON]: randomBoolean(),
  [ServiceRegion.JEONBUK]: randomBoolean(),
  [ServiceRegion.JEONNAM]: randomBoolean(),
  [ServiceRegion.GWANGJU]: randomBoolean(),
  [ServiceRegion.GYEONGBUK]: randomBoolean(),
  [ServiceRegion.GYEONGNAM]: randomBoolean(),
  [ServiceRegion.DAEGU]: randomBoolean(),
  [ServiceRegion.ULSAN]: randomBoolean(),
  [ServiceRegion.BUSAN]: randomBoolean(),
  [ServiceRegion.JEJU]: randomBoolean(),
});

export const addressData = [
  {
    sido: '서울',
    sidoEnglish: 'Seoul',
    sigungu: '강남구',
    roadAddress: '서울특별시 강남구 테헤란로 123',
    fullAddress: '서울특별시 강남구 역삼동 123-45',
  },
  {
    sido: '부산',
    sidoEnglish: 'Busan',
    sigungu: '해운대구',
    roadAddress: '부산광역시 해운대구 센텀중앙로 456',
    fullAddress: '부산광역시 해운대구 우동 456-78',
  },
  {
    sido: '대구',
    sidoEnglish: 'Daegu',
    sigungu: '수성구',
    roadAddress: '대구광역시 수성구 동대구로 789',
    fullAddress: '대구광역시 수성구 범어동 789-12',
  },
  {
    sido: '인천',
    sidoEnglish: 'Incheon',
    sigungu: '연수구',
    roadAddress: '인천광역시 연수구 송도과학로 101',
    fullAddress: '인천광역시 연수구 송도동 101-11',
  },
  {
    sido: '광주',
    sidoEnglish: 'Gwangju',
    sigungu: '북구',
    roadAddress: '광주광역시 북구 무등로 321',
    fullAddress: '광주광역시 북구 중흥동 321-33',
  },
  {
    sido: '대전',
    sidoEnglish: 'Daejeon',
    sigungu: '서구',
    roadAddress: '대전광역시 서구 둔산로 202',
    fullAddress: '대전광역시 서구 둔산동 202-22',
  },
  {
    sido: '울산',
    sidoEnglish: 'Ulsan',
    sigungu: '남구',
    roadAddress: '울산광역시 남구 삼산로 404',
    fullAddress: '울산광역시 남구 삼산동 404-44',
  },
  {
    sido: '세종',
    sidoEnglish: 'Sejong-si',
    sigungu: '세종시',
    roadAddress: '세종특별자치시 한누리대로 1234',
    fullAddress: '세종특별자치시 보람동 1234-56',
  },
  {
    sido: '경기도',
    sidoEnglish: 'Gyeonggi-do',
    sigungu: '성남시 분당구',
    roadAddress: '경기도 성남시 분당구 판교로 88',
    fullAddress: '경기도 성남시 분당구 삼평동 88-12',
  },
  {
    sido: '강원도',
    sidoEnglish: 'Gangwon-do',
    sigungu: '춘천시',
    roadAddress: '강원도 춘천시 중앙로 55',
    fullAddress: '강원도 춘천시 석사동 55-10',
  },
  {
    sido: '충청북도',
    sidoEnglish: 'Chungcheongbuk-do',
    sigungu: '청주시',
    roadAddress: '충청북도 청주시 상당로 66',
    fullAddress: '충청북도 청주시 상당구 북문로2가 66-77',
  },
  {
    sido: '충청남도',
    sidoEnglish: 'Chungcheongnam-do',
    sigungu: '천안시',
    roadAddress: '충청남도 천안시 서북구 불당대로 77',
    fullAddress: '충청남도 천안시 불당동 77-88',
  },
  {
    sido: '전라북도',
    sidoEnglish: 'Jeonbuk-do',
    sigungu: '전주시',
    roadAddress: '전라북도 전주시 완산구 전주천동로 22',
    fullAddress: '전라북도 전주시 효자동 22-33',
  },
  {
    sido: '전라남도',
    sidoEnglish: 'Jeollanam-do',
    sigungu: '여수시',
    roadAddress: '전라남도 여수시 이순신로 99',
    fullAddress: '전라남도 여수시 학동 99-11',
  },
  {
    sido: '경상북도',
    sidoEnglish: 'Gyeongsangbuk-do',
    sigungu: '포항시',
    roadAddress: '경상북도 포항시 북구 중앙로 303',
    fullAddress: '경상북도 포항시 죽도동 303-13',
  },
  {
    sido: '경상남도',
    sidoEnglish: 'Gyeongsangnam-do',
    sigungu: '창원시',
    roadAddress: '경상남도 창원시 의창구 창원대로 555',
    fullAddress: '경상남도 창원시 중동 555-66',
  },
  {
    sido: '제주도',
    sidoEnglish: 'Jeju-do',
    sigungu: '제주시',
    roadAddress: '제주특별자치도 제주시 중앙로 888',
    fullAddress: '제주특별자치도 제주시 이도이동 888-99',
  },
  {
    sido: '경기도',
    sidoEnglish: 'Gyeonggi-do',
    sigungu: '고양시 일산동구',
    roadAddress: '경기도 고양시 일산동구 정발산로 77',
    fullAddress: '경기도 고양시 장항동 77-55',
  },
  {
    sido: '전라남도',
    sidoEnglish: 'Jeollanam-do',
    sigungu: '순천시',
    roadAddress: '전라남도 순천시 중앙로 45',
    fullAddress: '전라남도 순천시 장천동 45-21',
  },
  {
    sido: '충청북도',
    sidoEnglish: 'Chungcheongbuk-do',
    sigungu: '제천시',
    roadAddress: '충청북도 제천시 의림대로 112',
    fullAddress: '충청북도 제천시 의림동 112-90',
  },
  {
    sido: '서울',
    sidoEnglish: 'Seoul',
    sigungu: '영등포구',
    roadAddress: '서울특별시 영등포구 여의대로 555',
    fullAddress: '서울특별시 영등포구 여의도동 555-66',
  },
  {
    sido: '광주',
    sidoEnglish: 'Gwangju',
    sigungu: '남구',
    roadAddress: '광주광역시 남구 양림로 666',
    fullAddress: '광주광역시 남구 양림동 666-77',
  },
  {
    sido: '울산',
    sidoEnglish: 'Ulsan',
    sigungu: '북구',
    roadAddress: '울산광역시 북구 산업로 777',
    fullAddress: '울산광역시 북구 산업동 777-88',
  },
  {
    sido: '제주',
    sidoEnglish: 'Jeju-do',
    sigungu: '서귀포시',
    roadAddress: '제주특별자치도 서귀포시 일대로 888',
    fullAddress: '제주특별자치도 서귀포시 일대동 888-99',
  },
];

export const getRandomAddress = () =>
  addressData[Math.floor(Math.random() * addressData.length)];

// 리뷰 관련 상수
const REVIEW_RATINGS = [3, 3.5, 4, 4.5, 5] as const;
const REVIEW_COMMENTS = [
  '이사 서비스가 매우 만족스러웠습니다.',
  '기사님이 매우 친절하셨고 꼼꼼하게 작업해주셨어요.',
  '시간 약속을 잘 지켜주셨고 전문적으로 작업해주셨습니다.',
  '포장도 꼼꼼하게 해주시고 이사 후 정리까지 깔끔하게 해주셨어요.',
  '안전하게 이사를 마무리해주셔서 감사합니다.',
  '전문적인 서비스에 매우 만족합니다.',
  '가격도 합리적이고 서비스도 좋았어요.',
  '이사 경험 중 최고였습니다.',
  '이삿짐이 이렇게 빨리 움직일 줄은 몰랐어요! 슈퍼맨 같은 기사님 👍',
  '우리집 물건들이 요술처럼 새집으로 순식간에 이동했네요 ✨',
  '이사 스트레스가 사라졌어요. 역시 전문가는 다르네요!',
  '기사님 손길에 우리집 물건들이 춤추듯 이동했어요 💃',
  '이사 요정이 다녀간 것 같아요! 깔끔하고 완벽한 마무리 ⭐',
  '우리집 짐을 다루는 기사님 손놀림이 마술사 같았어요 🎩',
  '이사가 이렇게 즐거울 수 있다니! 완전 새로운 경험이었어요',
  '이사 전쟁에서 완벽한 승리를 거뒀습니다 🏆 기사님 덕분이에요!',
  '포장부터 운송까지 한 편의 무용 공연을 본 것 같네요 🎭',
  '이사의 신(神)이 우리 집에 다녀가셨습니다 🙏',
] as const;

// 랜덤 리뷰 데이터 생성 함수
export const generateReviewData = () => ({
  rating: getRandomElement(REVIEW_RATINGS),
  comment: getRandomElement(REVIEW_COMMENTS),
});

// 랜덤 이사 종류 생성 함수
export const generateRandomMoveType = (): ServiceType => {
  const moveTypes = Object.values(ServiceType);
  return getRandomElement(moveTypes);
};
