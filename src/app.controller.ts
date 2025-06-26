import { Controller, Get } from '@nestjs/common';
import { Public } from './auth/decorator/public.decorator';

@Controller()
export class AppController {
  @Get()
  @Public()
  healthCheck() {
    return {
      status: 'ok',
      message: 'Moving API Server is running',
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'development',
      version: process.env.npm_package_version || '1.0.0',
      buildTime: process.env.BUILD_TIME || 'unknown',
      commitHash: process.env.COMMIT_HASH || 'unknown',
      deployTime: process.env.DEPLOY_TIME || new Date().toISOString(),
    };
  }

  @Get('version')
  @Public()
  getVersion() {
    return {
      appName: 'Moving API',
      version: process.env.npm_package_version || '1.0.0',
      buildTime: process.env.BUILD_TIME || 'unknown',
      commitHash: process.env.COMMIT_HASH || 'unknown',
      deployTime: process.env.DEPLOY_TIME || new Date().toISOString(),
      environment: process.env.NODE_ENV || 'development',
      nodeVersion: process.version,
      timestamp: new Date().toISOString(),
    };
  }
}
