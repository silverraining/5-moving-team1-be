import { BadRequestException, Injectable } from '@nestjs/common';
import { SelectQueryBuilder } from 'typeorm';
import {
  CursorPaginationDto,
  OrderDirection,
  OrderField,
  OrderItemMap,
} from './dto/cursor-pagination.dto';
import * as _ from 'lodash';
import {
  MOVER_PROFILE_TABLE,
  MOVER_PROFILE_VIEW_TABLE,
} from './const/query-builder.const';

export enum Service {
  ServiceType = 'serviceType',
  ServiceRegion = 'serviceRegion',
}

@Injectable()
export class CommonService {
  constructor() {}

  async applyCursorPaginationParamsToQb<T>(
    qb: SelectQueryBuilder<T>,
    dto: CursorPaginationDto,
  ) {
    const { cursor, take } = dto;
    let { order } = dto; // dto에서 order 추출

    if (cursor) {
      const decodedCursor = Buffer.from(cursor, 'base64').toString('utf-8');
      const cursorObj = JSON.parse(decodedCursor) as {
        values: Record<string, any>;
        order: OrderItemMap;
      };

      const { values } = cursorObj;
      order = cursorObj.order; // cursorObj에서 order 추출

      const { field, direction } = order;
      const orderAlias = this.getOrderFieldAlias(qb, field);
      const cursorId = values.id;
      const cursorValue = values[field];

      const operator = direction === OrderDirection.DESC ? '<' : '>';
      const equals = '=';

      qb.andWhere(
        `(${orderAlias} ${operator} :cursorValue OR (${orderAlias} ${equals} :cursorValue AND ${qb.alias}.id ${operator} :cursorId))`,
        {
          cursorValue,
          cursorId,
        },
      );
    }

    const { field, direction } = order;

    if (direction !== OrderDirection.ASC && direction !== OrderDirection.DESC) {
      throw new BadRequestException('정렬 방향은 ASC 또는 DESC 여야 합니다.');
    }

    const orderAlias = this.getOrderFieldAlias(qb, field);

    qb.addOrderBy(orderAlias, direction); // 정렬 기준 필드
    qb.addOrderBy(`${qb.alias}.id`, direction); // 항상 id도 정렬에 포함

    /**
     * Q) qb.addOrderBy(`${qb.alias}.id`, direction); 이거 왜 해용 ?.?
     * A) 정렬 기준 값이 동일할 때, 중복 제거 및 페이지네이션 정확도를 위한 보조 정렬로서,
     *    id를 추가로 정렬 기준에 포함시킴
     *    예: experience 기준 DESC 정렬 시 경험치가 동일한 mover가 여러 명일 수 있으므로,
     *        mover.id를 추가 정렬 기준으로 설정해 고유한 정렬 순서를 보장함
     */

    qb.take(take);

    const results = await qb.getMany();
    const nextCursor = this.generateNextCursor(results, order);

    return { qb, nextCursor };
  }

  private generateNextCursor<T>(
    results: T[],
    order: OrderItemMap,
  ): string | null {
    if (results.length === 0) return null;

    /**
     * cursorObj =
     * {
     *    values: [{
     *      id: 27,
     *      field: value, // 정렬 필드값
     *    }, ...],
     *    order: {
     *      field: MoverOrderField,
     *      direction: OrderDirection,
     *    }
     * }
     */

    const lastItem = results.at(-1);
    const { field } = order;
    const value = lastItem[field];

    const cursorObj = {
      values: {
        id: lastItem['id'],
        [field]: value,
      },
      order,
    };

    const nextCursor = Buffer.from(JSON.stringify(cursorObj)).toString(
      'base64',
    );

    return nextCursor;
  }

  applyServiceFilterToQb<T>(
    qb: SelectQueryBuilder<T>,
    map: Record<string, boolean>,
    service: Service,
    table: string,
  ) {
    if (!map) return;

    const activeKeys = _(map)
      .pickBy(Boolean) // true 값만 추출
      .keys() // 키만 추출
      .value(); // lodash 체이닝 결과 반환

    if (_.isEmpty(activeKeys)) return; // 활성화된 키가 없으면 필터링하지 않음

    // 조건문 배열 생성 (json 컬럼 내부 키가 'true'인지 확인)
    const conditions = activeKeys.map(
      (key) => `(${table}.${service} ->> '${key}')::boolean = true`,
    );

    // 각 조건을 OR로 연결 (serviceType 중 하나라도 true인 것 필터링)
    qb.andWhere(conditions.join(' OR'));
  }

  private getOrderFieldAlias<T>(
    qb: SelectQueryBuilder<T>,
    field: OrderField,
  ): string {
    // 정렬 필드에 따라 쿼리 빌더에 조인 및 선택 추가
    // 추가적으로 필요한 경우, OrderField enum에 추가 정의 후 아래 switch 문에 추가

    // 뷰가 조인되어 있는지 확인 (join 정보에서 mover_profile_view가 있는지)
    const joinNames = qb.expressionMap.joinAttributes.map(
      (join) => join.alias?.name,
    );
    const isViewJoined = joinNames.includes(MOVER_PROFILE_VIEW_TABLE);

    switch (field) {
      // MoverProfile 기준 정렬 필드
      case OrderField.REVIEW_COUNT:
      case OrderField.AVERAGE_RATING:
      case OrderField.CONFIRMED_ESTIMATE_COUNT:
        if (!isViewJoined) {
          // 뷰가 join 되어있지 않으면 예외 처리
          throw new BadRequestException(
            `${field} 정렬 필드를 사용하려면 뷰(${MOVER_PROFILE_VIEW_TABLE})가 조인되어야 합니다.`,
          );
        }
        return `${MOVER_PROFILE_VIEW_TABLE}.${field}`;

      // experience는 mover스키마에서만 필요
      case OrderField.EXPERIENCE:
        return `${MOVER_PROFILE_TABLE}.${field}`; // 실제 컬럼

      default:
        throw new BadRequestException('올바른 정렬 필드를 선택해주세요.');
    }
  }
}
