import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, Profile } from 'passport-naver';
import { ConfigService } from '@nestjs/config';
import { envVariableKeys } from '@/common/const/env.const';
import { Provider } from '@/user/entities/user.entity';

// 네이버 프로필 타입 정의
interface NaverProfile {
  email: string;
  nickname: string;
  profile_image: string;
  age: number;
  birthday: any;
  id: string;
  mobile?: string; // 휴대전화번호 (대쉬 포함)
}

@Injectable()
export class NaverStrategy extends PassportStrategy(Strategy, 'naver') {
  constructor(configService: ConfigService) {
    const apiBaseUrl = configService.get<string>(envVariableKeys.apiBaseUrl);

    super({
      clientID: configService.get<string>(envVariableKeys.naverClientId),
      clientSecret: configService.get<string>(
        envVariableKeys.naverClientSecret,
      ),
      callbackURL: `${apiBaseUrl}/auth/callback/naver`,
    });
  }

  validate(_AT: unknown, _RT: unknown, profile: Profile) {
    console.log('Naver profile:', profile);
    const naverProfile = profile._json as NaverProfile;
    console.log('naverProfile: ', naverProfile);

    return {
      email: naverProfile.email,
      name: naverProfile.nickname, // 네이버는 'nickname' 필드 사용
      picture: naverProfile.profile_image,
      provider: Provider.NAVER,
      providerId: naverProfile.id,
      phone: naverProfile.mobile || null, // 네이버에서 제공하는 휴대전화번호 (대쉬 포함)
    };
  }
}
