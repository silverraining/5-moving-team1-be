import {
  registerDecorator,
  ValidationOptions,
  ValidationArguments,
} from 'class-validator';

export function HasAtLeastOneTrue(validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      name: 'hasAtLeastOneTrue',
      target: object.constructor,
      propertyName,
      options: validationOptions,
      validator: {
        validate(value: Record<string, boolean>, _: unknown): boolean {
          if (typeof value !== 'object' || value === null) return false;
          return Object.values(value).some((v) => v === true); // 1개 이상 true인지 확인
        },
        defaultMessage(args: ValidationArguments) {
          return `${args.property} 객체에는 최소 하나 이상 선택되어야 합니다.`;
        },
      },
    });
  };
}
