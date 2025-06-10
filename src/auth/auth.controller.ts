import {
  applyDecorators,
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Patch,
  Post,
  Request,
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
  ApiSocialLogin,
  ApiUpdateMe,
} from './docs/swagger';
import { UserInfo } from '@/user/decorator/user-info.decorator';
import { UpdateUserDto } from '@/user/dto/update-user.dto';
import { SnSAuthGuard } from './guard/sns.guard';
import { UserService } from '@/user/user.service';

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
    const isSuccess = this.authService.register(createUserDto);
    return {
      statusCode: isSuccess
        ? HttpStatus.CREATED
        : HttpStatus.INTERNAL_SERVER_ERROR,
      message: isSuccess
        ? '회원가입에 성공했습니다!'
        : '회원가입에 실패했습니다!',
    };
  }

  /*로컬 로그인 서비스*/
  @Public()
  @UseGuards(LocalAuthGuard)
  @Post('login/local')
  @applyDecorators(...ApiLogin())
  async loginLocal(@Request() req: { user: JwtPayload }) {
    return this.authService.login(req.user);
  }

  /*소셜 로그인 서비스*/
  @Public()
  @UseGuards(SnSAuthGuard)
  @Get('login/:social')
  @ApiSocialLogin()
  socialLogin() {
    return;
  }

  @Public()
  @UseGuards(SnSAuthGuard)
  @Get('/callback/:social')
  socialCallback(@Request() req: { user: JwtPayload }) {
    return this.authService.login(req.user);
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

  //User 기본정보 수정 API
  @Patch('me')
  @ApiUpdateMe()
  async updateMyInfo(
    @UserInfo() userInfo: UserInfo,
    @Body() dto: UpdateUserDto,
  ) {
    const isUserUpdated = await this.userService.update(userInfo.sub, dto);
    return {
      message: isUserUpdated
        ? '사용자 정보가 성공적으로 업데이트되었습니다.'
        : '변경된 정보가 없어 업데이트가 필요하지 않습니다.',
    };
  }
}
