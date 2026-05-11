/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unnecessary-type-assertion */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { registerDecorator, ValidationOptions, ValidationArguments } from 'class-validator';

/**
 * Validate that a value does NOT exist inside another array property.
 *
 * @param property - Related property name containing the array
 * @param validationOptions - Optional class-validator options
 *
 * @example
 * class ExampleDto {
 *   blacklist: string[];
 *
 *   @IsNotInArray('blacklist', {
 *     message: 'email already exists in blacklist',
 *   })
 *   email: string;
 * }
 */
export function IsNotInArray(property: string, validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      name: 'isNotInArray',
      target: object.constructor,
      propertyName,
      constraints: [property],
      options: validationOptions,

      validator: {
        /**
         * Validate current value is NOT included in related array property
         */
        validate(value: any, args: ValidationArguments) {
          // Get related property name from constraints
          const relatedPropertyName = args.constraints[0] as any;

          // Get array value from DTO object
          const relatedValue = args.object[relatedPropertyName] as any[];

          // Return true if:
          // - relatedValue is an array
          // - current value does NOT exist in array
          return Array.isArray(relatedValue) && !relatedValue.includes(value);
        },

        /**
         * Default validation error message
         */
        defaultMessage(args: ValidationArguments) {
          return `${args.property} must not be present in ${args.constraints[0]}`;
        },
      },
    });
  };
}
