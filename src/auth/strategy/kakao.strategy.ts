import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ConfigService } from '@nestjs/config';
import { Strategy, Profile } from 'passport-kakao';
import { Provider } from '@/user/entities/user.entity';
import { envVariableKeys } from '@/common/const/env.const';

@Injectable()
export class KakaoStrategy extends PassportStrategy(Strategy, 'kakao') {
  constructor(configService: ConfigService) {
    const apiBaseUrl = configService.get<string>(envVariableKeys.apiBaseUrl);

    super({
      clientID: configService.get('KAKAO_CLIENT_ID'),
      clientSecret: configService.get('KAKAO_CLIENT_SECRET'),
      callbackURL: `${apiBaseUrl}/auth/callback/kakao`,
    });
  }

  async validate(
    accessToken: string,
    refreshToken: string,
    profile: Profile,
    done: Function,
  ) {
    const kakaoAccount = profile._json.kakao_account;

    const user = {
      email: kakaoAccount.email,
      name: kakaoAccount.profile.nickname,
      picture: kakaoAccount.profile.profile_image_url,
      provider: Provider.KAKAO,
    };

    return user;
  }
}
