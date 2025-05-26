import {
  applyDecorators,
  Body,
  Controller,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { Public } from './decorator/public.decorator';
import { LocalAuthGuard } from './strategy/local.strategy';
import { JwtPayload } from 'src/common/types/payload.type';
import { CreateUserDto } from 'src/user/dto/create-user.dto';
import { ApiLogin, ApiRegister, ApiRotateToken } from './docs/swagger';

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
  async rotateRefreshToken(@Request() req: { user: JwtPayload }) {
    return {
      accessToken: await this.authService.issueToken(req.user, false),
    };
  }
}
