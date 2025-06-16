import { BadRequestException, Injectable } from '@nestjs/common';
import { AuthGuard, PassportStrategy } from '@nestjs/passport';
import { AuthService } from '../auth.service';
import { Strategy } from 'passport-naver';
import { ConfigService } from '@nestjs/config';
import { envVariableKeys } from '@/common/const/env.const';
import { Request } from 'express';
import { Provider, Role, User } from '@/user/entities/user.entity';

export class NaverAuthGuard extends AuthGuard('naver') {}

type Profile = {
  id: string; // providerId
  name: string; // 사용자 이름
  email: string; // 이메일 주소
  mobile?: string; // 모바일 번호
  phone?: string; // 일반 전화번호
};

@Injectable()
export class NaverStrategy extends PassportStrategy(Strategy, 'naver') {
  constructor(
    private readonly authService: AuthService,
    private readonly configService: ConfigService,
  ) {
    const clientID = configService.get<string>(envVariableKeys.naverClientId);
    const clientSecret = configService.get<string>(
      envVariableKeys.naverClientSecret,
    );

    super({
      clientID,
      clientSecret,
      callbackURL: `/auth/callback/naver`,
      passReqToCallback: true, // req를 validate에 전달하기 위해 추가
    });
  }

  /**
   * NaverStrategy
   *
   * validate : profile
   *
   * return : Request();
   */
  // callback URI에서 실행되는 함수
  async validate(req: Request, profile: Profile) {
    /**
     * role을 prams가 아닌 state로 전달하는 이유는
     * 소셜 로그인 시, 프론트에서 params로 전달하는 경우
     * 전역 pipe를 타지않고 먼저 strategy가 실행되기 때문에 role 자동으로 유효성 검사를 할 수 없고
     * controller에서 params를 받고 사용하지 않는다는 타입오류를 보기 싫어서
     */

    // role 유효성 검사
    const role = req.query.state as Role;
    if (!role || !Object.values(Role).includes(role)) {
      throw new BadRequestException('유효하지 않은 역할이 제공되었습니다.');
    }

    const { name, email, mobile, id: providerId } = profile; // Naver API에서 제공하는 프로필 정보

    let user: User | null = null; // 사용자 인증을 위한 초기값 설정
    user = await this.authService.authenticate(role, Provider.NAVER, email); // 사용자 조회

    // 사용자가 존재하지 않는 경우, 사용자 생성
    if (!user) {
      const registerData = {
        role,
        name,
        phone: mobile || null, // 모바일 번호가 없을 경우 일반 전화번호 사용
        email,
        provider: Provider.NAVER,
        providerId,
      };

      user = await this.authService.register(registerData); // 사용자 등록
    }

    // 사용자 인증 후 JWT 페이로드 생성
    const payload = {
      sub: user.id,
      role: user.role,
      type: null,
    };

    return payload;
  }
}
