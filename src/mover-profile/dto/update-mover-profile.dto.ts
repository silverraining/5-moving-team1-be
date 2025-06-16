import { PartialType } from '@nestjs/swagger';
import { CreateMoverProfileDto } from './create-mover-profile.dto';

export class UpdateMoverProfileDto extends PartialType(CreateMoverProfileDto) {}
