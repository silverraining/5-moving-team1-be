import { Controller, Post, Body } from '@nestjs/common';
import { S3Service } from './s3.service';
import { PresignedUrlDto } from './dto/presigned-url.dto';

@Controller('s3')
export class S3Controller {
  constructor(private readonly s3Service: S3Service) {}

  @Post('presigned-url')
  async getPresignedUrl(
    @Body() dto: PresignedUrlDto,
  ): Promise<{ presignedUrl: string; fileUrl: string }> {
    const { presignedUrl, fileUrl } = await this.s3Service.createPresignedUrl(
      dto.fileName,
      dto.contentType,
    );

    return { presignedUrl, fileUrl };
  }
}
