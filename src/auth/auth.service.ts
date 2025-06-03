import {
  BadRequestException,
  Injectable,
  NotFoundException,
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
import { UpdateUserDto } from '@/user/dto/update-user.dto';
import {
  invalidRefreshTokenException,
  noRefreshTokenException,
  tokenVerificationFailedException,
} from 'src/common/const/exception.const';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly configService: ConfigService,
    private readonly jwtService: JwtService,
  ) {}
  /**
   * 사용자 ID 기준으로 refreshToken을 저장
   *
   * @param userId - 사용자 ID
   * @param refreshToken - 저장할 리프레시 토큰
   * @throws UnauthorizedException - 사용자를 찾을 수 없는 경우
   */
  async saveRefreshToken(userId: string, refreshToken: string): Promise<void> {
    const user = await this.userRepository.findOneBy({ id: userId });

    if (!user) {
      throw new UnauthorizedException('유저를 찾을 수 없습니다.');
    }

    await this.userRepository.update(userId, { refreshToken });
  }

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

    const newUser = await this.userRepository.save({
      email,
      password: hashedPassword,
      ...userData,
    });

    return newUser;
  }
  /**
   * 로그인 처리 및 토큰 발급
   *
   * @param user - JWT payload (로그인된 사용자 정보)
   * @returns accessToken, refreshToken
   */
  async login(user: JwtPayload) {
    const refreshToken = await this.issueToken(user, true);
    const accessToken = await this.issueToken(user, false);
    await this.saveRefreshToken(user.sub, refreshToken);

    return { refreshToken, accessToken };
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
    //환경에 따라 토큰 만료 시간을 다르게 적용
    const env = this.configService.get<string>(envVariableKeys.env);
    let accessExpiresIn: string;
    let refreshExpiresIn: string;

    if (env === 'prod') {
      accessExpiresIn = this.configService.get<string>(
        envVariableKeys.accessTokenExpirationProd,
      );
      refreshExpiresIn = this.configService.get<string>(
        envVariableKeys.refreshTokenExpirationProd,
      );
    } else {
      accessExpiresIn = this.configService.get<string>(
        envVariableKeys.accessTokenExpirationDev,
      );
      refreshExpiresIn = this.configService.get<string>(
        envVariableKeys.refreshTokenExpirationDev,
      );
    }
    const newPayload = {
      sub: payload.sub,
      role: payload.role,
      type: isRefreshToken ? 'refresh' : 'access',
    };

    const tokenOptions = {
      secret: isRefreshToken ? refreshTokenSecret : accessTokenSecret,
      expiresIn: isRefreshToken ? refreshExpiresIn : accessExpiresIn,
    };

    return await this.jwtService.signAsync(newPayload, tokenOptions);
  }

  /**
   * refreshToken 유효성 검증 및 사용자 조회
   * @param token - 클라이언트가 전송한 refreshToken
   * @returns 사용자 정보 (유효한 경우)
   * @throws UnauthorizedException - 토큰 검증 실패 또는 무효화된 토큰
   */
  async verifyRefreshToken(refreshToken: string): Promise<User> {
    const secret = this.configService.get<string>(envVariableKeys.refreshToken);

    try {
      const payload = this.jwtService.verify<JwtPayload>(refreshToken, {
        secret,
      });

      const user = await this.userRepository.findOneBy({ id: payload.sub });

      if (!user) throw invalidRefreshTokenException;

      if (user.refreshToken !== refreshToken) {
        await this.userRepository.update(user.id, { refreshToken: null });
        throw invalidRefreshTokenException;
      }

      return user;
    } catch (err) {
      throw tokenVerificationFailedException;
    }
  }
  /**
   * 리프레시 토큰을 사용해 accessToken 재발급
   *
   * @param refreshToken - 클라이언트가 보낸 refreshToken
   * @returns 새 accessToken
   * @throws UnauthorizedException - 토큰 없음 또는 검증 실패
   */
  async rotateAccessToken(
    refreshToken: string,
  ): Promise<{ accessToken: string }> {
    if (!refreshToken) {
      throw noRefreshTokenException;
    }

    const user = await this.verifyRefreshToken(refreshToken); // 여기서 에러 throw

    const payload: JwtPayload = {
      sub: user.id,
      role: user.role,
      type: null,
    };

    const accessToken = await this.issueToken(payload, false);

    return { accessToken };
  }

  /**
   * 사용자 로그아웃 처리 (refreshToken 무효화)
   * @param userId - 로그아웃할 사용자 ID
   * @returns 로그아웃 메시지
   * @throws NotFoundException - 사용자를 찾을 수 없는 경우
   */
  async logout(userId: string) {
    const user = await this.userRepository.findOneBy({ id: userId });

    if (!user) {
      throw new NotFoundException('유저를 찾을 수 없습니다.');
    }

    await this.userRepository.update(user.id, { refreshToken: null });

    return {
      message: '로그아웃 되었습니다.',
      action: 'removeTokens', // 프론트에서 토큰 삭제 필요
    };
  }

  /**
   *  사용자의 기본 정보(이름, 전화번호, 비밀번호)수정
   *
   * @param userId - 수정할 사용자 본인의 ID
   * @param dto - update-user DTO (이름, 전화번호, 비밀번호)
   *
   * @returns 수정 완료 메시지 객체
   *
   * @throws  NotFoundException - 사용자를 찾을 수 없는 경우
   */

  async updateMyInfo(userId: string, dto: UpdateUserDto) {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('사용자를 찾을 수 없습니다.');
    }

    if (dto.password) {
      const salt = await bcrypt.genSalt();
      user.password = await bcrypt.hash(dto.password, salt);
    }

    if (dto.name) user.name = dto.name;
    if (dto.phone) user.phone = dto.phone;

    await this.userRepository.save(user);
    return { message: '회원정보가 성공적으로 수정되었습니다.' };
  }
}
