import { Controller, Get, Post, Body, Patch } from '@nestjs/common';
import { MoverProfileService } from './mover-profile.service';
import { CreateMoverProfileDto } from './dto/create-mover-profile.dto';
import { UpdateMoverProfileDto } from './dto/update-mover-profile.dto';
import { RBAC } from 'src/auth/decorator/rbac.decorator';
import { Role } from 'src/user/entities/user.entity';
import { UserInfo } from 'src/user/decorator/user-info.decorator';
import { Public } from 'src/auth/decorator/public.decorator';
import { GetMoverProfilesDto } from './dto/get-mover-profiles.dto';
import { ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';

@Controller('mover')
@ApiBearerAuth()
@RBAC(Role.MOVER) // mover만 접근 가능, customer은 접근 불가
export class MoverProfileController {
  constructor(private readonly moverProfileService: MoverProfileService) {}

  @Post()
  @ApiOperation({
    description: '[mover] 프로필을 생성하는 API',
  })
  @ApiResponse({
    status: 201,
    description: '성공적으로 [mover] 프로필을 생성했습니다.',
  })
  @ApiResponse({
    status: 400,
    description: '[mover] 프로필 생성에 필요한 데이터를 잘못 요청했습니다.',
  })
  create(
    @Body() createMoverProfileDto: CreateMoverProfileDto,
    @UserInfo() userInfo: UserInfo,
  ) {
    return this.moverProfileService.create(createMoverProfileDto, userInfo);
  }

  /**
   * filter 조건 중 'serviceRegion'의 조건이 많아서
   * Param으로 받을 경우 URI가 길어지는 것을 방지하기 위해 Body로 받음
   * Body값과의 호환성을 위해 Get요청이 아닌 Post요청으로 구현
   * Post 요청으로 바꿈으로서 조회는 GET /mover가 아닌 POST /mover/search로 변경
   */

  @Post('search')
  @Public()
  @ApiOperation({
    description: '[mover]를 페이지네이션 하는 API',
  })
  @ApiResponse({
    status: 200,
    description: '성공적으로 [mover] 프로필을 페이지네이션 했습니다.',
  })
  @ApiResponse({
    status: 400,
    description: '[mover]의 페이지네이션 데이터를 잘못 요청했습니다.',
  })
  findAll(@Body() dto: GetMoverProfilesDto) {
    return this.moverProfileService.findAll(dto);
  }

  @Get('me')
  @ApiOperation({
    description: '[mover] 자신의 프로필을 조회하는 API',
  })
  @ApiResponse({
    status: 200,
    description: '성공적으로 자신의 [mover] 프로필을 조회했습니다.',
  })
  @ApiResponse({
    status: 404,
    description: '자신의 [mover] 프로필을 찾을 수 없습니다.',
  })
  findOne(@UserInfo() userInfo: UserInfo) {
    return this.moverProfileService.findOne(userInfo.sub);
  }

  @Patch('me')
  @ApiOperation({
    description: '[mover] 자신의 프로필을 수정하는 API',
  })
  @ApiResponse({
    status: 200,
    description: '성공적으로 자신의 [mover] 프로필을 수정했습니다.',
  })
  @ApiResponse({
    status: 404,
    description: '자신의 [mover] 프로필을 찾을 수 없습니다.',
  })
  update(
    @UserInfo() userInfo: UserInfo,
    @Body() updateMoverProfileDto: UpdateMoverProfileDto,
  ) {
    return this.moverProfileService.update(userInfo.sub, updateMoverProfileDto);
  }
}
