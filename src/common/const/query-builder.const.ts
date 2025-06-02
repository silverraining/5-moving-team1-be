import { OrderField } from '../dto/cursor-pagination.dto';

export const MOVER_PROFILE_TABLE = 'mover_profile'; // mover profile 쿼리 빌더 별칭
export const MOVER_PROFILE_VIEW_TABLE = 'mover_profile_view'; // mover profile view 쿼리 빌더 별칭

export const MOVER_PROFILE_LIST_SELECT = [
  `${MOVER_PROFILE_TABLE}.id`,
  `${MOVER_PROFILE_TABLE}.nickname`,
  `${MOVER_PROFILE_TABLE}.imageUrl`,
  `${MOVER_PROFILE_TABLE}.experience`,
  `${MOVER_PROFILE_TABLE}.intro`,
  `${MOVER_PROFILE_TABLE}.serviceType`,
];

export const MOVER_PROFILE_VIEW_SELECT = [
  `${MOVER_PROFILE_VIEW_TABLE}.${OrderField.REVIEW_COUNT}`,
  `${MOVER_PROFILE_VIEW_TABLE}.${OrderField.AVERAGE_RATING}`,
  `${MOVER_PROFILE_VIEW_TABLE}.${OrderField.CONFIRMED_ESTIMATE_COUNT}`,
  `${MOVER_PROFILE_VIEW_TABLE}.like_count`,
];
