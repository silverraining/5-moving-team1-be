import { PartialType } from '@nestjs/mapped-types';
import { CreateMoverProfileDto } from './create-mover-profile.dto';

export class UpdateMoverProfileDto extends PartialType(CreateMoverProfileDto) {}
