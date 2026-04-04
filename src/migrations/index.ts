/**
 * cmd: npx typeorm migration:generate -d dist/db/data-source.js
 * desc: Tạo migration tự động dựa trên sự thay đổi của entity
 */

/**
 * cmd: npx typeorm migration:run -- -d dist/db/data-source.js
 * desc: Chạy migration để cập nhật database theo các thay đổi của entity
 */

/**
 * cmd: npx typeorm migration:create <TênMigration>
 * desc: Tạo một migration mới với tên đã cho (khung sẵn, cần tự viết nội dung)
 */

/**
 * cmd: npx typeorm migration:show -d dist/db/data-source.js
 * desc: Hiển thị danh sách các migration đã chạy và chưa chạy
 */

/**
 * cmd: npx typeorm migration:revert -d dist/db/data-source.js
 * desc: Hoàn tác lần chạy migration gần nhất (rollback)
 */
