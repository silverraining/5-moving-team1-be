import { SetMetadata } from '@nestjs/common';

export const DEV_MODE = 'dev_mode';
export const Dev = () => SetMetadata(DEV_MODE, true);
