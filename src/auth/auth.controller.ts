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
import { ConfigService } from '@nestjs/config';
import { envVariableKeys } from '@/common/const/env.const';

interface RequestWithUser extends ExpressRequest {
  user: SocialUser;
}

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly userService: UserService,
    private readonly configService: ConfigService,
  ) {}

  @Public()
  @Post('register')
  @applyDecorators(...ApiRegister())
  async registerLocal(
    @Body() createUserDto: CreateUserDto,
    @Res() res: Response,
    @Req() req: ExpressRequest,
  ) {
    const result = await this.authService.register(createUserDto);

    // 1. locale 추출 (쿼리, 헤더, 쿠키 등에서)
    const supportedLocales = ['ko', 'en', 'zh'];
    let locale =
      req.query.locale ||
      req.headers['x-locale'] ||
      req.cookies?.i18next ||
      'ko';

    if (Array.isArray(locale)) locale = locale[0];
    if (!supportedLocales.includes(locale)) locale = 'ko';

    if (!result.success) {
      const encodedMessage = encodeURIComponent(result.message);
      const corsOrigin = this.configService.get<string>(
        envVariableKeys.corsOrigin,
      );

      // role에 따라 경로 결정
      let signupPath = '/auth/user/signup';
      if (createUserDto.role === 'MOVER') {
        signupPath = '/auth/mover/signup';
      }

      const redirectUrl = `${corsOrigin}/${locale}${signupPath}?error=${encodedMessage}&errorType=${result.errorType}`;
      res.redirect(redirectUrl);
      return;
    }

    res.status(201).json({
      user: result.user,
      tokens: result.tokens,
    });
    return;
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
  redirectToSocialLogin(@Param('social') _social: string) {
    // 실제 리디렉션은 passport가 처리
  }

  @Public()
  @Get('login/:social/role/:role')
  setRoleAndRedirect(
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
    const userFromSocial = req.user;
    const sessionRole = req.session['oauthRole'];
    const isMover = sessionRole === 'mover';
    const role = isMover ? Role.MOVER : Role.CUSTOMER;
    delete req.session['oauthRole'];

    const result = await this.authService.handleSocialCallback(
      userFromSocial,
      role,
    );

    // locale 추출
    const supportedLocales = ['ko', 'en', 'zh'];
    let locale =
      req.query.locale ||
      req.headers['x-locale'] ||
      req.cookies?.i18next ||
      'ko';
    if (Array.isArray(locale)) locale = locale[0];
    if (!supportedLocales.includes(locale)) locale = 'ko';

    // 서비스에서 받은 URL 파싱
    const url = new URL(result.redirectUrl);
    const corsOrigin = url.origin;
    const pathWithQuery = url.pathname + url.search;

    // role에 따라 로그인 경로 결정
    let loginPath = '/auth/user/login';
    const userRole = result?.userInfo?.role || result?.error?.provider || role;
    if (userRole === 'MOVER') {
      loginPath = '/auth/mover/login';
    }

    // 에러 리다이렉트라면 경로 교체
    let redirectUrl;
    if (pathWithQuery.startsWith('/login')) {
      redirectUrl = `${corsOrigin}/${locale}${loginPath}${url.search}`;
    } else {
      redirectUrl = `${corsOrigin}/${locale}${pathWithQuery}`;
    }

    return res.redirect(redirectUrl);
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
