import {
  registerDecorator,
  ValidationOptions,
  ValidationArguments,
} from 'class-validator';

export enum OrderField {
  // string 맵핑 값에 무조건 소문자로 정의 postgreSQL에서 소문자만 인식함
  REVIEW_COUNT = 'review_count', // 리뷰 수
  AVERAGE_RATING = 'average_rating', // 평균 평점
  EXPERIENCE = 'experience', // 경력
  CONFIRMED_ESTIMATE_COUNT = 'confirmed_estimate_count', // 확정 견적 수
  CREATED_AT = 'created_at', // 생성일 DESC 최신순
  MOVE_DATE = 'move_date', // 이사 날짜
}

export enum OrderDirection {
  ASC = 'ASC', // 오름차순
  DESC = 'DESC', // 내림차순
}

export type OrderString = `${OrderField}_${OrderDirection}`;

const validOrders = new Set(
  Object.values(OrderField).flatMap((field) =>
    Object.values(OrderDirection).map((dir) => `${field} ${dir}`),
  ),
);

export function IsValidOrder(validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      name: 'isValidOrder',
      target: object.constructor,
      propertyName,
      options: validationOptions,
      validator: {
        validate(value: any, _: unknown) {
          if (typeof value !== 'string') return false;

          const parts = value.split(' ');
          if (parts.length !== 2) return false;

          return validOrders.has(value);
        },
        defaultMessage(args: ValidationArguments) {
          return `${args.property} 값이 올바르지 않습니다. 유효한 값 중 하나를 입력하세요.`;
        },
      },
    });
  };
}
