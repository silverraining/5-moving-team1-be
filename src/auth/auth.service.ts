import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Provider, User } from 'src/user/entities/user.entity';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { envVariableKeys } from 'src/common/const/env.const';
import { JwtPayload } from 'src/common/types/payload.type';
import { CreateUserDto } from 'src/user/dto/create-user.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly configService: ConfigService,
    private readonly jwtService: JwtService,
  ) {}

  async register(createUserDto: CreateUserDto) {
    const { role, name, phone, email, password } = createUserDto;

    if (!password) {
      throw new BadRequestException('잘못된 회원가입 요청입니다!');
    }

    const user = await this.userRepository.findOne({
      where: { email },
    });

    if (user) {
      throw new BadRequestException('이미 가입한 이메일 입니다!');
    }

    const HASH_ROUNDS = this.configService.get<number>('HASH_ROUNDS') ?? 10;
    const hashedPassword = await bcrypt.hash(password, HASH_ROUNDS);

    await this.userRepository.save({
      email,
      password: hashedPassword,
      role,
      name,
      phone,
      provider: Provider.LOCAL,
    });

    const newUser = await this.userRepository.findOne({
      where: { email },
    });

    return newUser;
  }

  async authenticate(email: string, password: string) {
    const user = await this.userRepository.findOne({
      where: { email },
    });

    if (!user) {
      throw new BadRequestException('잘못된 로그인 정보 입니다!');
    }

    if (!user.password) {
      // 비밀번호가 없는 경우 (SNS 로그인 유저 등)
      throw new BadRequestException('잘못된 로그인 정보 입니다!');
    }

    const passOK = await bcrypt.compare(password, user.password);

    if (!passOK) {
      throw new BadRequestException('잘못된 로그인 정보 입니다!');
    }

    return user;
  }

  async issueToken(payload: JwtPayload, isRefreshToken: boolean) {
    const accessTokenSecret = this.configService.get<string>(
      envVariableKeys.accessToken,
    );
    const refreshTokenSecret = this.configService.get<string>(
      envVariableKeys.refreshToken,
    );

    return await this.jwtService.signAsync(
      {
        sub: payload.sub, // user id
        role: payload.role,
        type: isRefreshToken ? 'refresh' : 'access',
      },
      {
        secret: isRefreshToken ? refreshTokenSecret : accessTokenSecret,
        expiresIn: isRefreshToken ? '24h' : 300,
      },
    );
  }
}
