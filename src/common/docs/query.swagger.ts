import {
  commaDefaultServiceRegion,
  commaDefaultServiceType,
} from '../const/service.const';

export const cursorQuery = {
  name: 'cursor',
  type: String,
  required: false,
  description: '커서 기반 페이지네이션의 시작점',
  example:
    'eyJ2YWx1ZXMiOnsiaWQiOiI0YWRjNmRiOC1hNWJiLTQ5ZjEtOWVmOC1kN2NhYmVjNTAwMWQifSwib3JkZXIiOnsiZmllbGQiOiJjb25maXJtZWRfZXN0aW1hdGVfY291bnQiLCJkaXJlY3Rpb24iOiJERVNDIn19',
};

export const orderQuery = {
  name: 'order',
  type: String,
  required: true,
  description:
    "정렬 기준과 방향 (형식: 'field DIRECTION'). 아래 값 중 하나를 선택하세요:\n" +
    "- 'review_count DESC': 리뷰 높은 순\n" +
    "- 'average_rating DESC': 평점 높은 순\n" +
    "- 'experience DESC': 경력 높은 순\n" +
    "- 'confirmed_estimate_count DESC': 확정 많은 순\n",
  example: 'review_count DESC',
  enum: [
    'review_count DESC',
    'average_rating DESC',
    'experience DESC',
    'confirmed_estimate_count DESC',
  ],
};

export const takeQuery = {
  name: 'take',
  type: Number,
  required: false,
  description: '한 페이지에 반환할 항목 수 (기본값: 5)',
  example: 5,
};

export const serviceTypeQuery = {
  name: 'serviceType',
  type: String,
  required: false,
  description: '쉼표로 구분된 서비스 유형',
  example: commaDefaultServiceType,
};

export const serviceRegionQuery = {
  name: 'serviceRegion',
  type: String,
  required: false,
  description: '쉼표로 구분된 서비스 지역',
  example: commaDefaultServiceRegion,
};
