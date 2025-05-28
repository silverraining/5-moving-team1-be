import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/user/entities/user.entity';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { envVariableKeys } from 'src/common/const/env.const';
import { JwtPayload } from 'src/common/types/payload.type';
import { CreateUserDto } from 'src/user/dto/create-user.dto';

@Injectable()
export class AuthService {
  async saveRefreshToken(userId: string, refreshToken: string): Promise<void> {
    const user = await this.userRepository.findOneBy({ id: userId });

    if (!user) {
      throw new UnauthorizedException('유저를 찾을 수 없습니다.');
    }

    user.refreshToken = refreshToken;
    await this.userRepository.save(user);
  }
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly configService: ConfigService,
    private readonly jwtService: JwtService,
  ) {}

  /**
   * 회원가입
   * @param createUserDto - 유저 정보 (이메일, 비밀번호, 이름 등)
   * @returns 생성된 사용자 엔티티
   * @throws BadRequestException - 비밀번호 누락 또는 중복 이메일
   */
  async register(createUserDto: CreateUserDto) {
    const { email, password, ...userData } = createUserDto;

    if (!password) {
      throw new BadRequestException('잘못된 회원가입 요청입니다!');
    }

    const user = await this.userRepository.findOneBy({ email });

    if (user) {
      throw new BadRequestException('이미 가입한 이메일 입니다!');
    }

    const HASH_ROUNDS = this.configService.get<number>('HASH_ROUNDS') ?? 10;
    const hashedPassword = await bcrypt.hash(password, HASH_ROUNDS);

    await this.userRepository.save({
      email,
      password: hashedPassword,
      ...userData,
    });

    const newUser = await this.userRepository.findOneBy({ email });

    return newUser;
  }

  /**
   * 로컬 로그인 시 사용자 인증 처리
   * @param email - 사용자 이메일
   * @param password - 사용자 비밀번호
   * @returns 사용자 엔티티
   * @throws BadRequestException - 유저가 없거나 비밀번호 불일치
   */
  async authenticate(email: string, password: string) {
    const user = await this.userRepository.findOneBy({ email });

    if (!user || !user.password) {
      throw new BadRequestException('잘못된 로그인 정보 입니다!');
    }

    const passOK = await bcrypt.compare(password, user.password);

    if (!passOK) {
      throw new BadRequestException('잘못된 로그인 정보 입니다!');
    }

    return user;
  }

  /**
   * JWT 토큰 발급 (access 또는 refresh)
   * @param payload - JWT에 담을 사용자 정보
   * @param isRefreshToken - refreshToken 여부
   * @returns 서명된 JWT 문자열
   */
  async issueToken(payload: JwtPayload, isRefreshToken: boolean) {
    const accessTokenSecret = this.configService.get<string>(
      envVariableKeys.accessToken,
    );
    const refreshTokenSecret = this.configService.get<string>(
      envVariableKeys.refreshToken,
    );

    const newPayload = {
      sub: payload.sub,
      role: payload.role,
      type: isRefreshToken ? 'refresh' : 'access',
    };

    const tokenOptions = {
      secret: isRefreshToken ? refreshTokenSecret : accessTokenSecret,
      expiresIn: isRefreshToken ? '24h' : 300,
    };

    return await this.jwtService.signAsync(newPayload, tokenOptions);
  }

  /**
   * refreshToken 유효성 검증 및 사용자 조회
   * @param token - 클라이언트가 전송한 refreshToken
   * @returns 사용자 정보 (유효한 경우)
   * @throws UnauthorizedException - 토큰 검증 실패 또는 무효화된 토큰
   */
  async verifyRefreshToken(token: string): Promise<User | null> {
    const refreshTokenSecret = this.configService.get<string>(
      envVariableKeys.refreshToken,
    );
    let payload: JwtPayload;

    try {
      payload = this.jwtService.verify(token, {
        secret: refreshTokenSecret,
      });
    } catch (e) {
      throw new UnauthorizedException('리프레시 토큰이 유효하지 않습니다.');
    }

    const user = await this.userRepository.findOneBy({ id: payload.sub });

    if (!user || user.refreshToken !== token) {
      throw new UnauthorizedException('리프레시 토큰이 유효하지 않습니다.');
    }

    return user;
  }

  /**
   * 사용자 로그아웃 처리 (refreshToken 무효화)
   * @param userId - 로그아웃할 사용자 ID
   * @returns void
   * @throws UnauthorizedException - 유저를 찾을 수 없는 경우
   */
  async logout(userId: string): Promise<void> {
    const user = await this.userRepository.findOneBy({ id: userId });

    if (!user) {
      throw new UnauthorizedException('유저를 찾을 수 없습니다.');
    }

    user.refreshToken = null;
    await this.userRepository.save(user);
  }
}
