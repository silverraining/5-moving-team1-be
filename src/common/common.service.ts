import { BadRequestException, Injectable } from '@nestjs/common';
import { SelectQueryBuilder } from 'typeorm';
import { CursorPaginationDto } from './dto/cursor-pagination.dto';
import * as _ from 'lodash';
import { parseOrderString, parseFilterString } from './utils/parse-string';
import {
  MoverStatsField,
  OrderDirection,
  OrderField,
  OrderString,
} from './validator/order.validator';
import { PagePaginationDto } from './dto/page-pagination.dto';

export enum Service {
  ServiceType = 'serviceType',
  ServiceRegion = 'serviceRegion',
}

export const statsAlias = 'stats';

@Injectable()
export class CommonService {
  constructor() {}

  applyPagePaginationParamsToQb<T>(
    qb: SelectQueryBuilder<T>,
    dto: PagePaginationDto,
  ) {
    const { page, take } = dto;

    if (take && page) {
      const skip = (page - 1) * take;

      qb.take(take);
      qb.skip(skip);
    }
  }

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
        order: OrderString;
      };

      const { values } = cursorObj;
      order = cursorObj.order; // cursorObj에서 order 추출

      const { field, direction } = parseOrderString(order);

      const orderAlias = this.getOrderFieldAlias(qb, field);
      const cursorId = values.id;
      const cursorValue = parseFloat(values[field]);

      const operator = direction === OrderDirection.DESC ? '<' : '>';
      const whereClause = `(${orderAlias} ${operator} :cursorValue OR (${orderAlias} = :cursorValue AND ${qb.alias}.id < :cursorId))`;
      qb.andWhere(whereClause, { cursorValue, cursorId });
    }

    const { field, direction } = parseOrderString(order);

    if (direction !== OrderDirection.ASC && direction !== OrderDirection.DESC) {
      throw new BadRequestException('정렬 방향은 ASC 또는 DESC 여야 합니다.');
    }

    const orderAlias = this.getOrderFieldAlias(qb, field);

    qb.addOrderBy(orderAlias, direction); // 정렬 기준 필드
    qb.addOrderBy(`${qb.alias}.id`, OrderDirection.DESC); // 항상 id도 정렬에 포함

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
    const hasNext = !!nextCursor; // nextCursor가 없으면 더 불러올 데이터 없음

    return { nextCursor, hasNext };
  }

  private generateNextCursor<T>(results: T[], order: OrderString) {
    if (results.length === 0) return null;

    /**
     * cursorObj =
     * {
     *    values: [{
     *      id: 27,
     *      field: value, // 정렬 필드값
     *    }, ...],
     *    order: `${MoverOrderField} ${OrderDirection}`
     * }
     */

    // join은 어차피 계속 될거라서 그냥 배열에 있는 값이랑 OrderField랑 있는지 비교해서 있으면 true로 변경하기

    const lastItem = results.at(-1);
    const { field } = parseOrderString(order);
    const isStatsField = MoverStatsField.includes(field);
    const value = isStatsField ? lastItem[statsAlias][field] : lastItem[field];

    if (!value) {
      throw new BadRequestException(
        `커서 생성 실패: lastItem에서 '${field}' 값을 찾을 수 없습니다.`,
        lastItem,
      );
    }

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
    filterString: string,
    serviceColumnName: Service,
    entityAlias: string,
  ) {
    if (!filterString) return;

    const activeKeys = parseFilterString(filterString);

    if (activeKeys.length === 0) return; // 활성화된 키가 없으면 필터링하지 않음

    // 조건문 배열 생성 (json 컬럼 내부 키가 'true'인지 확인)
    const conditions = activeKeys.map(
      (key) =>
        `(${entityAlias}.${serviceColumnName} ->> '${key}')::boolean = true`,
    );

    // 각 조건을 OR로 연결 (serviceType 중 하나라도 true인 것 필터링)
    qb.andWhere(`(${conditions.join(' OR ')})`);
  }

  private getOrderFieldAlias<T>(
    qb: SelectQueryBuilder<T>,
    field: OrderField,
  ): string {
    const mainAlias = qb.alias; // 'mover'

    // 뷰가 조인되어 있는지 확인 (join 정보에서 mover_profile_view가 있는지)
    const isStatsJoined = qb.expressionMap.joinAttributes.some(
      (join) => join.alias.name === statsAlias,
    );

    switch (field) {
      // MoverProfileView 기준 정렬 필드
      case OrderField.REVIEW_COUNT:
      case OrderField.AVERAGE_RATING:
      case OrderField.CONFIRMED_ESTIMATE_COUNT:
      case OrderField.LIKE_COUNT:
        if (!isStatsJoined) {
          // 이 에러 메시지가 개발자에게 'stats' 별칭으로 join 해야 한다는 것을 알려줍니다.
          throw new BadRequestException(
            `'${field}' 필드로 정렬하려면 MoverProfileView를 '${statsAlias}' 별칭으로 조인해야 합니다.`,
          );
        }
        return `${statsAlias}.${field}`; // ex) 'stats.review_count'

      case OrderField.EXPERIENCE:
      case OrderField.CREATED_AT:
        return `${mainAlias}.${field}`; // 기본 테이블의 created_at 컬럼

      default:
        throw new BadRequestException('올바른 정렬 필드를 선택해주세요.');
    }
  }
}
