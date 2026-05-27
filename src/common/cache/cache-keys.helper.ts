import { CACHE_PREFIX } from './cache.constants';

export const CacheKeys = {
  // Product module keys
  productDetail: (id: string) => `${CACHE_PREFIX}products:id:${id}`,
  productList: (queryString: string) => `${CACHE_PREFIX}products:list:${queryString}`,

  // Campaign module keys
  campaignDetail: (id: string) => `${CACHE_PREFIX}campaigns:id:${id}`,

  // Pattern dùng để xóa hàng loạt bằng SCAN/KEYS
  productPattern: () => `${CACHE_PREFIX}products:*`,
};
