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
          if (!value || typeof value !== 'object') {
            return false;
          }

          const [relatedEnum] = args.constraints;
          const enumKeys = Object.values(relatedEnum);
          const valueKeys = Object.keys(value);

          if (
            valueKeys.length !== enumKeys.length ||
            !valueKeys.every((key) => enumKeys.includes(key))
          ) {
            return false;
          }

          const values = Object.values(value);

          if (!values.every((item) => typeof item === 'boolean')) {
            return false;
          }

          const hasTrue = values.some((item) => item === true);
          return hasTrue;
        },

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
