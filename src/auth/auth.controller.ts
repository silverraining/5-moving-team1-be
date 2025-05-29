import {
  applyDecorators,
  Body,
  Controller,
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
import { ApiLogin, ApiRegister, ApiRotateToken } from './docs/swagger';
import { ApiBearerAuth } from '@nestjs/swagger';

function RegisterSwagger() {
  return applyDecorators(...ApiRegister());
}
function LoginSwagger() {
  return applyDecorators(...ApiLogin());
}
function RotateTokenSwagger() {
  return applyDecorators(...ApiRotateToken());
}

@Controller('auth')
@ApiBearerAuth()
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
    return {
      refreshToken: await this.authService.issueToken(req.user, true),
      accessToken: await this.authService.issueToken(req.user, false),
    };
  }

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
}
