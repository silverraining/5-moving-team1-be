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
  ApiLogout,
  ApiRegister,
  ApiRotateToken,
  ApiUpdateMe,
} from './docs/swagger';
import { UserInfo } from '@/user/decorator/user-info.decorator';
import { UpdateUserDto } from '@/user/dto/update-user.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('register')
  @applyDecorators(...ApiRegister())
  registerLocal(@Body() createUserDto: CreateUserDto) {
    return this.authService.register(createUserDto);
  }

  @Public()
  @UseGuards(LocalAuthGuard)
  @Post('login/local')
  @applyDecorators(...ApiLogin())
  async loginLocal(@Request() req: { user: JwtPayload }) {
    const refreshToken = await this.authService.issueToken(req.user, true);
    const accessToken = await this.authService.issueToken(req.user, false);

    // DB에 refreshToken 저장
    await this.authService.saveRefreshToken(req.user.sub, refreshToken);

    return { refreshToken, accessToken };
  }

  @Public()
  @Post('token/access')
  @ApiRotateToken()
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
  @ApiLogout()
  @HttpCode(HttpStatus.OK)
  async logout(@UserInfo() userInfo: UserInfo) {
    await this.authService.logout(userInfo.sub);
    return { message: '로그아웃 되었습니다.' };
  }

  //User 기본정보 수정 API
  @Patch('me')
  @ApiUpdateMe()
  updateMyInfo(@UserInfo() userInfo: UserInfo, @Body() dto: UpdateUserDto) {
    return this.authService.updateMyInfo(userInfo.sub, dto);
  }
}
