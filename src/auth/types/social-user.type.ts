import { Provider } from '@/user/entities/user.entity';

export interface SocialUser {
  email: string;
  name: string;
  picture?: string;
  provider: Provider;
}
