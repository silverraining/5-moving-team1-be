import { Controller, Get, Post, Body, Param, Delete } from '@nestjs/common';
import { LikeService } from './like.service';
import { UserInfo } from '@/user/decorator/user-info.decorator';
import { RBAC } from '@/auth/decorator/rbac.decorator';
import { Role } from '@/user/entities/user.entity';
import {
  ApiCreateLike,
  ApiDeleteLike,
  ApiGetLikedMovers,
} from './docs/swagger';

@Controller('like')
@RBAC(Role.CUSTOMER) // 좋아요는 고객만 가능
export class LikeController {
  constructor(private readonly likeService: LikeService) {}

  @Post(':moverId')
  @ApiCreateLike()
  async create(
    @UserInfo() userInfo: UserInfo,
    @Param('moverId') moverId: string,
  ) {
    return this.likeService.create(userInfo.sub, moverId);
  }

  @Get()
  @ApiGetLikedMovers()
  findAll(@UserInfo() userInfo: UserInfo) {
    return this.likeService.findAll(userInfo.sub);
  }

  @Delete(':moverId')
  @ApiDeleteLike()
  remove(@UserInfo() userInfo: UserInfo, @Param('moverId') moverId: string) {
    return this.likeService.remove(userInfo.sub, moverId);
  }
}
