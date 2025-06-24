import { PassportStrategy } from '@nestjs/passport';
import { Profile, Strategy, VerifyCallback } from 'passport-google-oauth20';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Provider } from '@/user/entities/user.entity';
import { envVariableKeys } from '@/common/const/env.const';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor(configService: ConfigService) {
    const apiBaseUrl = configService.get<string>(envVariableKeys.apiBaseUrl);

    super({
      clientID: configService.get('GOOGLE_CLIENT_ID'),
      clientSecret: configService.get('GOOGLE_CLIENT_SECRET'),
      callbackURL: `${apiBaseUrl}/auth/callback/google`,
      scope: ['email', 'profile'],
      state: false, //role 가져오기 위한 state.
      // false: Google OAuth에서 자동 state 생성을 비활성화하고 직접 state를 관리하도록
    });
  }

  async validate(
    accessToken: string,
    refreshToken: string,
    profile: Profile,
    done: VerifyCallback,
  ) {
    return {
      email: profile.emails[0].value,
      name: profile.displayName,
      picture: profile.photos?.[0]?.value,
      provider: Provider.GOOGLE,
      providerId: profile.id,
      phone: null, // 구글에서는 phone 정보를 기본적으로 제공하지 않음
    };
  }
}
