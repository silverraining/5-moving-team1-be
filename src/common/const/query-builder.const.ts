export const MOVER_TABLE = 'mover_profile'; // mover profile 쿼리 빌더 별칭
export const MOVER_VIEW_TABLE = 'mover_profile_view'; // mover view name

// 별칭 사용하여 select문 정의
export const MOVER_LIST_SELECT = [
  `${MOVER_TABLE}.id`,
  `${MOVER_TABLE}.nickname`,
  `${MOVER_TABLE}.imageUrl`,
  `${MOVER_TABLE}.experience`,
  `${MOVER_TABLE}.serviceType`,
  `${MOVER_TABLE}.intro`,
];
export const MOVER_LIST_STATS_SELECT = [
  `stats.review_count`,
  `stats.average_rating`,
  `stats.confirmed_estimate_count`,
  `stats.like_count`,
];

export const MOVER_PROFILE_SELECT = [
  `${MOVER_TABLE}.id`,
  `${MOVER_TABLE}.nickname`,
  `${MOVER_TABLE}.imageUrl`,
  `${MOVER_TABLE}.experience`,
  `${MOVER_TABLE}.intro`,
  `${MOVER_TABLE}.description`,
  `${MOVER_TABLE}.serviceType`,
  `${MOVER_TABLE}.serviceRegion`,
];

export const LIKED_MOVER_LIST_SELECT = [
  `${MOVER_TABLE}.id`,
  `${MOVER_TABLE}.nickname`,
  `${MOVER_TABLE}.imageUrl`,
  `${MOVER_TABLE}.intro`,
  `${MOVER_TABLE}.experience`,
  `${MOVER_TABLE}.serviceType`,
];

export const REVIEWABLE_MOVER_SELECT = [
  'offer.id AS reviewableOfferId',
  'request.moveType AS moveType',
  'request.moveDate AS moveDate',
  'offer.price AS offerPrice',
  'offer.isTargeted AS isTargeted',
  'mover.nickname AS moverNickname',
  'mover.imageUrl AS moverImageUrl',
];
export const CUSTOMER_REVIEW_SELECT = [
  'review.rating AS rating', // 리뷰 평점
  'review.comment AS comment', // 리뷰 내용
  'review.createdAt AS created_at', // 리뷰 작성일
  'offer.isTargeted AS is_targeted', // 확정된 제안의 지정견적 여부
  'offer.price AS offer_price', // 견적 제안 가격
  'request.moveType AS move_type', // 이사 종류
  'request.moveDate AS move_date', // 이사 날짜
  'mover.nickname AS mover_nickname', // 이사 업체 기사 닉네임
  'mover.imageUrl AS mover_image_url', // 이사 업체 기사 이미지 URL
];
export const MOVER_REVIEW_SELECT = [
  'review.rating AS rating', // 리뷰 평점
  'review.comment AS comment', // 리뷰 내용
  'review.createdAt AS created_at', // 리뷰 작성일
  'user.name AS user_name', // 리뷰 작성한 고객의 이름
];
