import { User } from '@/user/entities/user.entity';
import { Notification } from '@/notification/entities/notification.entity';
import { MoverProfile } from '@/mover-profile/entities/mover-profile.entity';
import { MoverProfileView } from '@/mover-profile/view/mover-profile.view';
import { CustomerProfile } from '@/customer-profile/entities/customer-profile.entity';
import { Like } from '@/like/entities/like.entity';
import { EstimateRequest } from '@/estimate-request/entities/estimate-request.entity';
import { EstimateOffer } from '@/estimate-offer/entities/estimate-offer.entity';
import { Review } from '@/review/entities/review.entity';

export const ENTITIES = [
  User,
  Notification,
  MoverProfile,
  MoverProfileView,
  CustomerProfile,
  Like,
  EstimateRequest,
  EstimateOffer,
  Review,
];
