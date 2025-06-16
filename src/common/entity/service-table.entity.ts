import { Column } from 'typeorm';
import { BaseTable } from './base-table.entity';
import {
  defaultServiceRegion,
  defaultServiceType,
} from '../const/service.const';

export class ServiceTable extends BaseTable {
  @Column({ default: defaultServiceType })
  serviceType: string;

  @Column({ default: defaultServiceRegion })
  serviceRegion: string;
}
