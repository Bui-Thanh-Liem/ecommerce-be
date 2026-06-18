/* eslint-disable @typescript-eslint/no-unsafe-return */
import { Injectable, PipeTransform } from '@nestjs/common';

@Injectable()
export class RemoveUndefinedPipe implements PipeTransform {
  transform(value: any) {
    // Chỉ xử lý nếu dữ liệu đầu vào là một Object (Body request)
    if (value && typeof value === 'object' && !Array.isArray(value)) {
      return this.removeUndefinedFields(value);
    }
    return value;
  }

  private removeUndefinedFields<T = any>(obj: T): T {
    if (!obj || typeof obj !== 'object') return obj;

    Object.keys(obj).forEach((key) => {
      if (obj[key] === undefined) {
        delete obj[key];
      } else if (typeof obj[key] === 'object' && obj[key] !== null) {
        this.removeUndefinedFields(obj[key]);
      }
    });

    return obj;
  }
}
