import {
  registerDecorator,
  ValidationOptions,
  ValidationArguments,
} from 'class-validator';

export function IsCommaSeparatedEnum<T>(
  enumObj: T,
  validationOptions?: ValidationOptions,
) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      name: 'isCommaSeparatedEnum',
      target: object.constructor,
      propertyName,
      options: validationOptions,
      validator: {
        validate(value: any, _: unknown) {
          if (typeof value !== 'string') return false;

          const items = value.split(',').map((v) => v.trim()); // 콤마로 구분된 문자열을 배열로 변환

          // 중복 제거
          const uniqueItems = new Set(items);

          // enum 값 목록
          const enumValues = Object.values(enumObj) as string[]; // 기존 enum 값들을 배열로 변환

          // items 중 하나라도 enumValues에 없으면 false
          return items.every(
            (item) =>
              enumValues.includes(item) && uniqueItems.size === items.length,
          );
        },
        defaultMessage(args: ValidationArguments) {
          return `${args.property} 값이 올바르지 않습니다. 콤마로 구분된 유효한 값들을 입력하세요.`;
        },
      },
    });
  };
}

export function HasAtLeastOneTrue<T extends Record<string, any>>(
  enumObj: T,
  validationOptions?: ValidationOptions,
) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      name: 'hasAtLeastOneTrue',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [enumObj],
      validator: {
        validate(value: any, args: ValidationArguments) {
          // constraints 배열에서 첫 번째 요소(enumObj)를 가져옵니다.
          const [relatedEnum] = args.constraints;

          // --- 1. 모양(Shape) 검증: 객체의 키들이 enum의 키들과 정확히 일치하는지 확인 ---
          const enumKeys = Object.keys(relatedEnum);
          const valueKeys = Object.keys(value);

          // 키의 개수가 다르거나,
          // 객체의 키 중에 enum에 존재하지 않는 키가 하나라도 있다면 실패
          if (
            valueKeys.length !== enumKeys.length ||
            !valueKeys.every((key) => enumKeys.includes(key))
          ) {
            return false;
          }

          // --- 2. 내용(Content) 검증: 값이 boolean이고, 그 중 true가 하나 이상 있는지 확인 ---
          const values = Object.values(value);

          // 모든 값이 boolean 타입이 아니면 실패
          if (!values.every((item) => typeof item === 'boolean')) {
            return false;
          }

          // 값이 모두 boolean 이면서, 그 중 true가 하나도 없으면 실패
          const hasTrue = values.some((item) => item === true);
          return hasTrue;
        },

        // --- 3. 에러 메시지 반환 ---
        defaultMessage(args: ValidationArguments) {
          if (validationOptions?.message) {
            return validationOptions.message as string;
          }

          return `${args.property}의 값이 유효하지 않습니다.`;
        },
      },
    });
  };
}
