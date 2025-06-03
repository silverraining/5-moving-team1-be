import { Controller, Get, Post, Body, Param, Delete } from '@nestjs/common';
import { LikeService } from './like.service';
import { UserInfo } from '@/user/decorator/user-info.decorator';
import { RBAC } from '@/auth/decorator/rbac.decorator';
import { Role } from '@/user/entities/user.entity';

@Controller('like')
@RBAC(Role.CUSTOMER) // 좋아요는 고객만 가능
export class LikeController {
  constructor(private readonly likeService: LikeService) {}

  @Post(':moverId')
  async create(
    @UserInfo() userInfo: UserInfo,
    @Param('moverId') moverId: string,
  ) {
    return this.likeService.create(userInfo.sub, moverId);
  }

  @Get()
  findAll(@UserInfo() userInfo: UserInfo) {
    return this.likeService.findAll(userInfo.sub);
  }

  @Delete(':moverId')
  remove(@UserInfo() userInfo: UserInfo, @Param('moverId') moverId: string) {
    return this.likeService.remove(userInfo.sub, moverId);
  }
}
