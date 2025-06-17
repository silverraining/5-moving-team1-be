import { Column } from 'typeorm';
import { BaseTable } from './base-table.entity';
import {
  defaultServiceRegion,
  defaultServiceType,
  ServiceRegion,
  ServiceType,
} from '../const/service.const';

export class ServiceTable extends BaseTable {
  @Column({
    type: 'jsonb', // PostgreSQL의 JSONB 타입
    default: defaultServiceType,
  })
  serviceType: ServiceType[];

  @Column({
    type: 'jsonb', // PostgreSQL의 JSONB 타입
    default: defaultServiceRegion,
  })
  serviceRegion: ServiceRegion[];
}
