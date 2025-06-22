import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Provider, Role, User } from 'src/user/entities/user.entity';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { envVariableKeys } from 'src/common/const/env.const';
import { JwtPayload } from 'src/common/types/payload.type';
import { CreateUserDto } from 'src/user/dto/create-user.dto';
import {
  invalidRefreshTokenException,
  noRefreshTokenException,
  tokenVerificationFailedException,
} from 'src/common/const/exception.const';
import {
  EstimateRequest,
  RequestStatus,
} from 'src/estimate-request/entities/estimate-request.entity';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(EstimateRequest)
    private readonly estimateRequestRepository: Repository<EstimateRequest>,
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
   * @param createUserDto - 유저 정보 (역할, 이메일, 비밀번호, 이름 등)
   * @returns 생성된 사용자 엔티티
   * @throws BadRequestException - 비밀번호 누락 또는 중복 이메일
   */
  async register(createUserDto: CreateUserDto) {
    const { email, password, provider, ...userData } = createUserDto;

    const user = await this.userRepository.findOne({
      where: { email, provider },
    });

    if (user) {
      throw new BadRequestException('이미 가입한 이메일 입니다!');
    }

    const HASH_ROUNDS = this.configService.get<number>('HASH_ROUNDS') ?? 10;
    const hashedPassword = password
      ? await bcrypt.hash(password, HASH_ROUNDS)
      : null;

    await this.userRepository.save({
      email,
      password: hashedPassword,
      provider,
      ...userData,
    });

    const newUser = await this.userRepository.findOneBy({ email, provider });
    const { password: _, ...newUserData } = newUser; // password 제외한 사용자 정보

    if (!newUser) {
      throw new InternalServerErrorException('회원가입에 실패했습니다.');
    }

    return newUserData;
  }

  /**
   * 로그인 처리 및 토큰 발급
   *
   * @param payload - JWT payload (로그인된 사용자 정보)
   * @returns accessToken, refreshToken
   */
  async login(payload: JwtPayload) {
    // 사용자 조회
    const user = await this.userRepository.findOne({
      where: { id: payload.sub },
      relations: ['customerProfile', 'moverProfile'],
    });

    const { email, name, phone, role, provider } = user; // relations 제외한 사용자 정보

    // 프로필 이미지 URL만 가져오기
    const profile = user.moverProfile ||
      user.customerProfile || { imageUrl: null }; // MoverProfile 또는 CustomerProfile이 없을 경우 빈 객체로 초기화
    const imageUrl = profile.imageUrl;

    // Pending 중인 estimate request ID 조회 (고객인 경우에만)
    let pendingEstimateRequestId: string | null = null;

    if (role === Role.CUSTOMER && user.customerProfile) {
      // 고객인 경우: 자신의 pending 견적 요청 조회 (하나만)
      const pendingRequest = await this.estimateRequestRepository.findOne({
        where: {
          customer: { id: user.customerProfile.id },
          status: RequestStatus.PENDING,
        },
        select: ['id'],
      });
      pendingEstimateRequestId = pendingRequest?.id || null;
    }

    try {
      // 토큰 발급
      const refreshToken = await this.issueToken(payload, true);
      const accessToken = await this.issueToken(payload, false);

      // 리프레쉬 토큰 저장
      await this.saveRefreshToken(payload.sub, refreshToken);

      // 로그인 성공 시 토큰과 사용자 정보 반환
      return {
        refreshToken,
        accessToken,
        user: {
          id: user.id,
          email,
          name,
          phone,
          role,
          imageUrl,
          provider,
          pendingEstimateRequestId,
        },
      };
    } catch (error) {
      throw new InternalServerErrorException(
        `로그인 처리 중 오류가 발생했습니다: ${error.message}`,
      );
    }
  }

  /**
   * 로그인 시 사용자 인증 처리
   * @param role - 요청된 사용자 역할 (Role.MOVER 또는 Role.CUSTOMER)
   * @param provider - 소셜 로그인 제공자 (Provider.LOCAL, Provider.GOOGLE 등)
   * @param email - 사용자 이메일
   * @param password - 사용자 비밀번호
   * @returns 사용자 엔티티
   * @throws BadRequestException - 유저가 없거나 비밀번호 불일치
   */
  async authenticate(
    role: Role,
    provider: Provider,
    email: string,
    password?: string,
  ) {
    // 사용자 조회
    const user = await this.userRepository.findOne({
      where: { email, provider },
    });

    if (!user) {
      throw new BadRequestException('잘못된 로그인 정보 입니다!');
    }

    // 역할 검증
    const isMover = user.role === Role.MOVER;
    if (user.role !== role) {
      const roleLabel = isMover ? '기사님' : '고객님';
      throw new BadRequestException(`${email}은 ${roleLabel} 계정입니다!`);
    }

    // 소셜 로그인
    if (!password) {
      return user; // 비밀번호 확인 없이 반환
    }

    // 로컬 로그인: 소셜 로그인으로 가입된 경우 예외 처리
    if (!user.password) {
      throw new BadRequestException(
        `${user.provider}로 가입된 계정입니다. 소셜 로그인을 이용해주세요.`,
      );
    }

    // 로컬 로그인: 비밀번호 확인
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
    } catch (_error) {
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
      throw new NotFoundException('사용자를 찾을 수 없습니다.');
    }

    const isSocialLogin = user.provider !== Provider.LOCAL;
    if (isSocialLogin) {
      await this.userRepository.update(user.id, { providerId: null }); // provider id null로 설정하여 무효화
    }

    await this.userRepository.update(user.id, { refreshToken: null }); // 리프레시 토큰을 null로 설정하여 무효화

    return {
      message: '로그아웃 되었습니다.',
      action: 'removeTokens', // 프론트에서 토큰 삭제 필요
    };
  }

  /**
   * 소셜 로그인 사용자 회원가입 또는 로그인 처리
   * @param socialUser - 소셜 로그인에서 받은 사용자 정보
   * @param role - 사용자 역할 (CUSTOMER 또는 MOVER)
   * @returns 로그인 결과 (토큰 및 사용자 정보)
   */
  async loginOrSignup(
    socialUser: {
      email: string;
      name: string;
      picture?: string;
      provider: string;
    },
    role?: Role,
  ) {
    // 기존 사용자 조회
    let user = await this.userRepository.findOne({
      where: {
        email: socialUser.email,
        provider: socialUser.provider as Provider,
      },
      relations: ['customerProfile', 'moverProfile'],
    });

    // 새 사용자인 경우 회원가입 처리
    if (!user) {
      // 소셜에서 받은 이름이 있으면 사용, 없으면 이메일의 @ 앞부분을 이름으로 사용
      const displayName = socialUser.name || socialUser.email.split('@')[0];

      const newUser = await this.userRepository.save({
        email: socialUser.email,
        name: displayName,
        provider: socialUser.provider as Provider,
        role: role || Role.CUSTOMER, // 전달받은 역할 사용, 없으면 기본값 CUSTOMER
        providerId: socialUser.email, // Google의 경우 email을 providerId로 사용
      });

      // 새로 생성된 사용자 조회
      user = await this.userRepository.findOne({
        where: { id: newUser.id },
        relations: ['customerProfile', 'moverProfile'],
      });
    }

    // JWT payload 생성
    const payload: JwtPayload = {
      sub: user.id,
      role: user.role,
      type: null,
    };

    // 로그인 처리 (토큰 발급)
    return await this.login(payload);
  }

  /**
   * 소셜 로그인 사용자 이름 업데이트
   * @param userId - 사용자 ID
   * @param name - 새로운 이름
   * @returns 업데이트된 사용자 정보
   */
  async updateSocialUserName(userId: string, name: string) {
    const user = await this.userRepository.findOne({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('사용자를 찾을 수 없습니다.');
    }

    // 소셜 로그인 사용자인지 확인
    if (user.provider === Provider.LOCAL) {
      throw new BadRequestException(
        '로컬 로그인 사용자는 이 API를 사용할 수 없습니다.',
      );
    }

    // 이름 업데이트
    await this.userRepository.update(userId, { name });

    const updatedUser = await this.userRepository.findOne({
      where: { id: userId },
      relations: ['customerProfile', 'moverProfile'],
    });

    return {
      message: '이름이 성공적으로 업데이트되었습니다.',
      user: {
        id: updatedUser.id,
        email: updatedUser.email,
        name: updatedUser.name,
        role: updatedUser.role,
        provider: updatedUser.provider,
      },
    };
  }

  /**
   * 소셜 로그인 콜백 처리 및 리디렉션 URL 생성
   * @param socialUser - 소셜 로그인에서 받은 사용자 정보
   * @param role - 사용자 역할
   * @returns 리디렉션 URL과 사용자 정보
   */
  async handleSocialCallback(
    socialUser: {
      email: string;
      name: string;
      picture?: string;
      provider: string;
    },
    role: Role,
  ) {
    const loginResult = await this.loginOrSignup(socialUser, role);

    // 사용자 정보 객체 생성
    const userInfoObj = {
      id: loginResult.user.id,
      name: loginResult.user.name,
      email: loginResult.user.email,
      phone: loginResult.user.phone,
      role: loginResult.user.role,
      provider: loginResult.user.provider,
      imageUrl: loginResult.user.imageUrl,
      pendingEstimateRequestId: loginResult.user.pendingEstimateRequestId,
    };

    const userInfo = encodeURIComponent(JSON.stringify(userInfoObj));

    // 프론트엔드 리디렉션 URL 생성 (CORS Origin = 프론트엔드 URL 환경변수)
    const corsOrigin = this.configService.get<string>(
      envVariableKeys.corsOrigin,
    );
    const frontendRedirectUrl = `${corsOrigin}/oauth?token=${loginResult.accessToken}&refreshToken=${loginResult.refreshToken}&userInfo=${userInfo}`;

    return {
      redirectUrl: frontendRedirectUrl,
      userInfo: userInfoObj,
    };
  }
}
