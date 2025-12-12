import _ from 'lodash';

/**
 * Lấy chỉ những field cần thiết từ object (dùng khi trả response API)
 * @example selectFields(user, ['id', 'name', 'email'])
 */
export const selectFields = <T extends object, K extends keyof T>(
  obj: T,
  fields: readonly K[],
): Pick<T, K> => {
  return _.pick(obj, fields) as Pick<T, K>;
};

/**
 * Loại bỏ các field nhạy cảm/không cần thiết khỏi object (password, token, internal fields...)
 * @example excludeFields(user, ['password', 'refreshToken', '__v'])
 */
export const excludeFields = <T extends object, K extends keyof T>(
  obj: T,
  fieldsToExclude: readonly K[],
): Omit<T, K> => {
  return _.omit(obj, fieldsToExclude) as Omit<T, K>;
};
