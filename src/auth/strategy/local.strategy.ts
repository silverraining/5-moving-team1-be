import { BadRequestException, Injectable } from '@nestjs/common';
import { AuthGuard, PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-local';
import { AuthService } from '../auth.service';
import { Request } from 'express';
import { Provider, Role } from '@/user/entities/user.entity';
import { validateSync, ValidationError } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import { LocalLoginDto } from '../dto/local-login.dto';

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
    const { role } = req.body as { role: Role }; // body에서 role 추출

    // DTO 인스턴스 생성
    const dto = plainToInstance(LocalLoginDto, { email, password, role });

    // dto 검증 수행
    const errors = validateSync(dto);

    // 모든 에러메시지를 배열로 반환
    if (errors.length > 0) {
      const allMessages = this.getAllErrorMessages(errors);
      throw new BadRequestException(allMessages);
    }

    // 사용자 인증
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

  /**
   * 모든 ValidationError 메시지를 가져오는 함수
   * 재귀적으로 모든 에러 메시지를 수집합니다.
   *
   * @param errors
   * @returns
   */

  private getAllErrorMessages(errors: ValidationError[]): string[] {
    let messages: string[] = [];

    for (const err of errors) {
      if (err.constraints) {
        messages.push(...Object.values(err.constraints));
      }

      if (err.children && err.children.length) {
        messages = messages.concat(this.getAllErrorMessages(err.children));
      }
    }
    return messages;
  }
}
