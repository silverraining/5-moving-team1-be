// import {
//   BadRequestException,
//   CanActivate,
//   ExecutionContext,
//   Injectable,
//   Type,
// } from '@nestjs/common';
// import { AuthGuard } from '@nestjs/passport';
// import { NaverAuthGuard } from '../strategy/naver.strategy';

// @Injectable()
// export class SnSAuthGuard implements CanActivate {
//   canActivate(context: ExecutionContext) {
//     const request = context.switchToHttp().getRequest();
//     const { social } = request.params;

//     const GuardClass = this.getAuthGuardBySocial(social); // 소셜 로그인에 맞는 가드를 가져오고
//     const guard = new GuardClass(); // 선택한 가드(naver 등) 인스턴스를 만들고

//     return guard.canActivate(context); // 그 가드의 canActivate()를 직접 실행
//   }

//   private getAuthGuardBySocial(social: string): Type<CanActivate> {
//     switch (social) {
//       case 'google':
//         return AuthGuard('google');
//       case 'kakao':
//         return AuthGuard('kakao');
//       // case 'naver':
//       //   return NaverAuthGuard;
//       default:
//         throw new BadRequestException(
//           `지원하지 않는 소셜 로그인입니다! : ${social}`,
//         );
//     }
//   }
// }

import {
  BadRequestException,
  CanActivate,
  ExecutionContext,
  Injectable,
  Type,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class SnSAuthGuard implements CanActivate {
  canActivate(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest();
    const { social } = request.params;

    const GuardClass = this.getAuthGuardBySocial(social);
    const guard = new GuardClass();

    return guard.canActivate(context);
  }

  private getAuthGuardBySocial(social: string): Type<CanActivate> {
    switch (social) {
      case 'google':
        return AuthGuard('google');
      case 'kakao':
        return AuthGuard('kakao');
      default:
        throw new BadRequestException(
          `지원하지 않는 소셜 로그인입니다! : ${social}`,
        );
    }
  }
}
