import { registerDecorator, ValidationOptions, ValidationArguments } from 'class-validator';

export function IsNotInArray(property: string, validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      name: 'isNotInArray',
      target: object.constructor,
      propertyName: propertyName,
      constraints: [property],
      options: validationOptions,
      validator: {
        validate(value: any, args: ValidationArguments) {
          const [relatedPropertyName] = args.constraints;
          const relatedValue = (args.object as any)[relatedPropertyName];
          return Array.isArray(relatedValue) && !relatedValue.includes(value);
        },
        defaultMessage(args: ValidationArguments) {
          return `${args.property} must not be present in ${args.constraints[0]}`;
        },
      },
    });
  };
}
