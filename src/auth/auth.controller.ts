import {
  applyDecorators,
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Req,
  Request,
  Res,
  UseGuards,
} from '@nestjs/common';
import { Request as ExpressRequest, Response } from 'express';
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
  ApiSocialLogin,
} from './docs/swagger';
import { UserInfo } from '@/user/decorator/user-info.decorator';
import { SnSAuthGuard } from './guard/sns.guard';
import { UserService } from '@/user/user.service';
import { SocialUser } from './types/social-user.type';
import { Role } from '@/user/entities/user.entity';

interface RequestWithUser extends ExpressRequest {
  user: SocialUser;
}

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly userService: UserService,
  ) {}

  @Public()
  @Post('register')
  @applyDecorators(...ApiRegister())
  registerLocal(@Body() createUserDto: CreateUserDto) {
    return this.authService.register(createUserDto);
  }

  /*소셜 로그인 사용자 이름 업데이트*/
  @Post('social/update-name')
  async updateSocialUserName(
    @UserInfo() userInfo: UserInfo,
    @Body('name') name: string,
  ) {
    return this.authService.updateSocialUserName(userInfo.sub, name);
  }

  /*로컬 로그인 서비스*/
  @Public()
  @UseGuards(LocalAuthGuard)
  @Post('login')
  @applyDecorators(...ApiLogin())
  async loginLocal(@Request() req: { user: JwtPayload }) {
    return this.authService.login(req.user);
  }

  /*소셜 로그인 서비스*/
  @Public()
  @Get('login/:social')
  @UseGuards(SnSAuthGuard)
  @ApiSocialLogin()
  async redirectToSocialLogin(@Param('social') social: string) {
    // 실제 리디렉션은 passport가 처리
  }

  @Public()
  @Get('login/:social/role/:role')
  async setRoleAndRedirect(
    @Param('social') social: string,
    @Param('role') role: string,
    @Req() req: ExpressRequest,
    @Res() res: Response,
  ) {
    // 세션에 역할 정보 저장
    req.session['oauthRole'] = role;

    // OAuth 로그인 페이지로 리디렉션
    return res.redirect(`/api/auth/login/${social}`);
  }

  @Public()
  @Get('/callback/:social')
  @UseGuards(SnSAuthGuard)
  async handleSocialCallback(
    @Req() req: RequestWithUser,
    @Res() res: Response,
  ) {
    const userFromSocial = req.user; // passport strategy의 validate()에서 return한 값
    const sessionRole = req.session['oauthRole']; // 세션에서 역할 정보 가져오기

    // 역할 결정 (세션에서 역할 정보 확인)
    let role: Role = Role.CUSTOMER; // 기본값
    if (sessionRole === 'mover') {
      role = Role.MOVER;
    }

    // 세션에서 역할 정보 삭제
    delete req.session['oauthRole'];

    const result = await this.authService.handleSocialCallback(
      userFromSocial,
      role,
    );

    return res.redirect(result.redirectUrl);
  }

  @Public()
  @Post('token/access')
  @ApiRotateToken()
  async rotate(
    @Body('refreshToken') refreshToken: string,
  ): Promise<{ accessToken: string }> {
    return this.authService.rotateAccessToken(refreshToken);
  }

  @Post('logout')
  @ApiLogout()
  @HttpCode(HttpStatus.OK)
  async logout(@UserInfo() userInfo: UserInfo) {
    return await this.authService.logout(userInfo.sub);
  }
}
