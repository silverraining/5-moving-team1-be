import { Injectable } from '@nestjs/common';
import { AuthGuard, PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-local';
import { AuthService } from '../auth.service';

export class LocalAuthGuard extends AuthGuard('local') {}

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly authService: AuthService) {
    super({
      usernameField: 'email', // 기본값 : username
    });
  }

  /**
   * LocalStrategy
   *
   * validate : email, password
   *
   * return : Request();
   */
  async validate(email: string, password: string) {
    const user = await this.authService.authenticate(email, password);
    const payload = {
      sub: user.id,
      role: user.role,
      type: null,
    };
    return payload;
  }
}
