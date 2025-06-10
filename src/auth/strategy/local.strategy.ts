import { BadRequestException, Injectable } from '@nestjs/common';
import { AuthGuard, PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-local';
import { AuthService } from '../auth.service';
import { Request } from 'express';
import { Provider, Role } from '@/user/entities/user.entity';

export class LocalAuthGuard extends AuthGuard('local') {}

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly authService: AuthService) {
    super({
      usernameField: 'email', // 기본값 : username
      passReqToCallback: true, // req를 validate에 전달하기 위해 추가
    });
  }

  /**
   * LocalStrategy
   *
   * validate : email, password
   *
   * return : Request();
   */
  async validate(req: Request, email: string, password: string) {
    // role 유효성 검사
    const role = req.query.state as Role;
    if (!role || !Object.values(Role).includes(role)) {
      throw new BadRequestException('유효하지 않은 역할이 제공되었습니다.');
    }

    // 사용자 조회
    const user = await this.authService.authenticate(
      role,
      Provider.LOCAL,
      email,
      password,
    );

    // 사용자 인증 후 JWT 페이로드 생성
    const payload = {
      sub: user.id,
      role: user.role,
      type: null,
    };

    return payload;
  }
}
