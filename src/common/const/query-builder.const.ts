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
  `${MOVER_TABLE}.experience`,
  `${MOVER_TABLE}.serviceType`,
];
