import { Column } from 'typeorm';
import { BaseTable } from './base-table.entity';
import { ServiceRegionMap, ServiceTypeMap } from '../const/service.const';

export class ServiceTable extends BaseTable {
  @Column({ type: 'json' })
  serviceType: ServiceTypeMap;

  @Column({ type: 'json' })
  serviceRegion: ServiceRegionMap;
}
