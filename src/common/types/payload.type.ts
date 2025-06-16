import { Role } from 'src/user/entities/user.entity';

export type JwtPayload = {
  sub: string; // userId
  role: Role;
  type: 'access' | 'refresh' | null;
};
