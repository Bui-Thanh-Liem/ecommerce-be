import { Transform, TransformFnParams } from 'class-transformer';

export function Trim() {
  return Transform(({ value }: TransformFnParams) => {
    if (typeof value === 'string') {
      return value.trim();
    }
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return value;
  });
}
