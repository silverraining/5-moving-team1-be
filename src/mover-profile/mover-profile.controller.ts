import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Query,
} from '@nestjs/common';
import { MoverProfileService } from './mover-profile.service';
import { CreateMoverProfileDto } from './dto/create-mover-profile.dto';
import { UpdateMoverProfileDto } from './dto/update-mover-profile.dto';
import { RBAC } from 'src/auth/decorator/rbac.decorator';
import { Role } from 'src/user/entities/user.entity';
import { UserInfo } from 'src/user/decorator/user-info.decorator';
import { Public } from 'src/auth/decorator/public.decorator';
import { GetMoverProfilesDto } from './dto/get-mover-profiles.dto';
import {
  ApiCreateMoverProfile,
  ApiGetMoverProfileById,
  ApiGetMoverProfiles,
  ApiGetMyMoverProfile,
  ApiUpdateMyMoverProfile,
} from './docs/swagger';
import { handleError } from '@/common/utils/handle-error.util';

@Controller('mover')
@RBAC(Role.MOVER) // mover만 접근 가능, customer은 접근 불가
export class MoverProfileController {
  constructor(private readonly moverProfileService: MoverProfileService) {}

  @Post()
  @ApiCreateMoverProfile()
  create(
    @Body() createMoverProfileDto: CreateMoverProfileDto,
    @UserInfo() userInfo: UserInfo,
  ) {
    return handleError(
      () =>
        this.moverProfileService.create(userInfo.sub, createMoverProfileDto),
      '기사님의 프로필 생성 중 서버에 오류가 생겨 실패했습니다, 다시 시도해주세요!',
    );
  }

  @Get()
  @Public()
  @ApiGetMoverProfiles()
  findAll(@UserInfo() userInfo: UserInfo, @Query() dto: GetMoverProfilesDto) {
    return handleError(
      () => this.moverProfileService.findAll(userInfo, dto),
      '기사님 프로필 목록 조회 중 서버에 오류가 생겨 실패했습니다, 다시 시도해주세요!',
    );
  }

  @Get('me')
  @ApiGetMyMoverProfile()
  findMe(@UserInfo() userInfo: UserInfo) {
    return handleError(
      () => this.moverProfileService.findMe(userInfo.sub),
      '기사님 프로필 조회 중 서버에 오류가 생겨 실패했습니다, 다시 시도해주세요!',
    );
  }

  @Get(':id')
  @Public()
  @ApiGetMoverProfileById()
  findOne(@UserInfo() userInfo: UserInfo, @Param('id') id: string) {
    return handleError(
      () => this.moverProfileService.findOne(userInfo, id),
      '기사님 프로필 조회 중 서버에 오류가 생겨 실패했습니다, 다시 시도해주세요!',
    );
  }

  @Patch('me')
  @ApiUpdateMyMoverProfile()
  update(
    @UserInfo() userInfo: UserInfo,
    @Body() updateMoverProfileDto: UpdateMoverProfileDto,
  ) {
    return handleError(
      () =>
        this.moverProfileService.update(userInfo.sub, updateMoverProfileDto),
      '기사님의 프로필 수정 중 서버에 오류가 생겨 실패했습니다, 다시 시도해주세요!',
    );
  }
}
