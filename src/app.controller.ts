import { Controller, Get } from '@nestjs/common';
import { ApiExcludeEndpoint } from '@nestjs/swagger';
import { Public } from './auth/decorator/public.decorator';

@Controller()
export class AppController {
  @Get()
  @Public()
  @ApiExcludeEndpoint()
  healthCheck() {
    return {
      status: 'ok',
      message: 'Moving API Server is running',
      appName: 'Moving API',
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'development',
      version: process.env.npm_package_version || '1.0.0',
      buildTime: process.env.BUILD_TIME || 'unknown',
      commitHash: process.env.COMMIT_HASH || 'unknown',
      deployTime: process.env.DEPLOY_TIME || new Date().toISOString(),
      nodeVersion: process.version,
    };
  }
}
