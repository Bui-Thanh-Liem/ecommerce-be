import { Injectable, Inject, Logger } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import type { Cache } from 'cache-manager';

@Injectable()
export class CacheService {
  private readonly logger = new Logger(CacheService.name);

  constructor(@Inject(CACHE_MANAGER) private readonly cacheManager: Cache) {}

  /**
   * Lấy data từ cache (Bọc try-catch phòng trường hợp sập Redis)
   */
  async get<T>(key: string): Promise<T | null> {
    try {
      const data = await this.cacheManager.get<T>(key);
      return data || null;
    } catch (error) {
      this.logger.warn(`Cache READ failed for key "${key}". Falling back to database.`, error);
      return null;
    }
  }

  /**
   * Set dữ liệu kèm TTL chủ động
   */
  async set(key: string, value: any, ttlMs?: number): Promise<void> {
    try {
      await this.cacheManager.set(key, value, ttlMs);
    } catch (error) {
      this.logger.error(`Cache WRITE failed for key "${key}"`, error);
    }
  }

  /**
   * Phương thức tiện lợi để lấy data từ cache hoặc nếu không có thì gọi fetchFunction để lấy data mới và lưu vào cache
   */
  async getOrSet<T>(key: string, fetchFunction: () => Promise<T>, ttlMs?: number): Promise<T> {
    try {
      // Thử lấy data từ cache trước
      const cachedData = await this.get<T>(key);
      if (cachedData !== null) {
        return cachedData;
      }

      // Nếu không có trong cache, gọi fetchFunction để lấy data mới
      const freshData = await fetchFunction();

      // Lưu data mới vào cache với TTL nếu có
      await this.set(key, freshData, ttlMs);

      return freshData;
    } catch (error) {
      this.logger.error(`Cache GET OR SET failed for key "${key}"`, error);
      // Nếu có lỗi, fallback về fetchFunction để đảm bảo ứng dụng vẫn hoạt động
      return fetchFunction();
    }
  }

  /**
   * Xóa một key cụ thể (dùng khi cập nhật bản ghi đơn lẻ)
   */
  async delete(key: string): Promise<void> {
    try {
      await this.cacheManager.del(key);
    } catch (error) {
      this.logger.error(`Cache DELETE failed for key "${key}"`, error);
    }
  }

  /**
   * Xóa nhiều key cùng lúc (dùng khi cập nhật nhiều bản ghi liên quan)
   */
  async deleteMany(keys: string[]): Promise<void> {
    try {
      await Promise.all(keys.map((key) => this.cacheManager.del(key)));
    } catch (error) {
      this.logger.error(`Cache DELETE MANY failed for keys "${keys.join(', ')}"`, error);
    }
  }

  /**
   * Clear toàn bộ cache (dùng khi cần thiết, ví dụ sau khi deploy)
   */
  async clear(): Promise<void> {
    try {
      await this.cacheManager.clear();
    } catch (error) {
      this.logger.error('Cache CLEAR failed', error);
    }
  }
}
