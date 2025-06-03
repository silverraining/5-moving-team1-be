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
  updateMyInfo(@UserInfo() userInfo: UserInfo, @Body() dto: UpdateUserDto) {
    return this.authService.updateMyInfo(userInfo.sub, dto);
  }
}
