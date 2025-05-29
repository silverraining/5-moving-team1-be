import {
  applyDecorators,
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Patch,
  Post,
  Request,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { Public } from './decorator/public.decorator';
import { LocalAuthGuard } from './strategy/local.strategy';
import { JwtPayload } from 'src/common/types/payload.type';
import { CreateUserDto } from 'src/user/dto/create-user.dto';
import {
  ApiLogin,
  ApiRegister,
  ApiRotateToken,
  ApiUpdateMe,
} from './docs/swagger';
import { UserInfo } from '@/user/decorator/user-info.decorator';
import { UpdateUserDto } from '@/user/dto/update-user.dto';

function RegisterSwagger() {
  return applyDecorators(...ApiRegister());
}
function LoginSwagger() {
  return applyDecorators(...ApiLogin());
}
function RotateTokenSwagger() {
  return applyDecorators(ApiRotateToken());
}

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('register')
  @RegisterSwagger()
  registerLocal(@Body() createUserDto: CreateUserDto) {
    return this.authService.register(createUserDto);
  }

  @Public()
  @UseGuards(LocalAuthGuard)
  @Post('login/local')
  @LoginSwagger()
  async loginLocal(@Request() req: { user: JwtPayload }) {
    const refreshToken = await this.authService.issueToken(req.user, true);
    const accessToken = await this.authService.issueToken(req.user, false);

    // DB에 refreshToken 저장
    await this.authService.saveRefreshToken(req.user.sub, refreshToken);

    return { refreshToken, accessToken };
  }

  // API 테스트는 되는데, 스웨거에서 403 권한없음이 나와서 확인해보니
  // accessToken이 없거나 만료되었을 때 호출하므로 인증이 필요 없는 엔드포인트 -> @Public() 데코레이터 추가
  @Public()
  @Post('token/access')
  @RotateTokenSwagger()
  async rotateRefreshToken(@Body('refreshToken') refreshToken: string) {
    if (!refreshToken) {
      throw new UnauthorizedException('리프레시 토큰이 필요합니다.');
    }

    // 1) 리프레시 토큰 검증
    const user = await this.authService.verifyRefreshToken(refreshToken);
    if (!user) {
      throw new UnauthorizedException('리프레시 토큰이 유효하지 않습니다.');
    }

    const newPayload: JwtPayload = {
      sub: user.id,
      role: user.role,
      type: null,
    };

    // 2) 새로운 액세스 토큰 발급
    const accessToken = await this.authService.issueToken(newPayload, false);

    return { accessToken };
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  async logout(@UserInfo() userInfo: UserInfo) {
    await this.authService.logout(userInfo.sub);
  }

  //User 기본정보 수정 API
  @Patch('me')
  @ApiUpdateMe()
  updateMyInfo(@UserInfo() userInfo: UserInfo, @Body() dto: UpdateUserDto) {
    return this.authService.updateMyInfo(userInfo.sub, dto);
  }
}
