/* eslint-disable max-len */
import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { BrandEntity } from '../catalog/brands/entities/brand.entity';
import { BrandQueryDto } from '../catalog/brands/dto/query-brand.dto';
import { calculatePagination } from '@/utils/pagination-calculator.util';
import { CategoryEntity } from '../catalog/categories/entities/category.entity';
import { CloudinaryService } from '@/common/cloudinary/cloudinary.service';
import { IMetadata } from '@/shared/interfaces/common/metadata.interface';
import { CategoryQueryDto } from '../catalog/categories/dto/query-category.dto';
import { IFilterAttribute } from '@/shared/dtos/res/filter-attribute.dto';

@Injectable()
export class FiltersService {
  constructor(
    private readonly cloudinaryService: CloudinaryService,
    private dataSource: DataSource,
  ) {}

  async findChildrenCategoryBySlug(slug: string, query: CategoryQueryDto): Promise<IMetadata<CategoryEntity>> {
    const { page, limit } = query;
    const { take, skip } = calculatePagination(page, limit);

    // 1. Query lấy danh sách data (có phân trang)
    const dataRaw = await this.dataSource.query<CategoryEntity[]>(
      `
        SELECT 
            c.id AS "id", 
            c.name AS "name", 
            c.slug AS "slug", 
            c.code AS "code", 
            c.created_at AS "createdAt"
        FROM categories c
        INNER JOIN categories parent ON c."parent" = parent.id
        WHERE parent.slug = $1
        ORDER BY c.created_at DESC
        LIMIT $2 OFFSET $3;
      `,
      [slug, take, skip],
    );

    // 2. Query đếm tổng số dòng (không có LIMIT/OFFSET) để làm phân trang
    const countRaw = await this.dataSource.query<{ count: string }[]>(
      `
        SELECT COUNT(c.id) AS "count"
        FROM categories c
        INNER JOIN categories parent ON c."parent" = parent.id
        WHERE parent.slug = $1;
      `,
      [slug],
    );

    // 3. Lấy giá trị tổng số lượng (Postgres COUNT() luôn trả về kiểu string nên cần parseInt)
    const totalData = countRaw[0] ? parseInt(countRaw[0].count, 10) : 0;

    // 4. Khớp dữ liệu về đúng kiểu Entity mong muốn và trả về cấu trúc phân trang
    return {
      data: dataRaw,
      totalData,
      page,
      totalPage: Math.ceil(totalData / limit),
    };
  }

  async findBrandsByCategorySlug(categorySlug: string, query: BrandQueryDto): Promise<IMetadata<BrandEntity>> {
    const { page, limit } = query;
    const { take, skip } = calculatePagination(page, limit);

    // 1. Thực thi câu lệnh SQL thuần với CTE
    const rawResults = await this.dataSource.query<(BrandEntity & { total_count: string })[]>(
      `
        WITH target_categories AS (
            -- Lấy danh sách ID của danh mục thỏa mãn (chính nó hoặc danh mục con)
            SELECT c.id 
            FROM categories c
            LEFT JOIN categories p ON c."parent" = p.id
            WHERE c.slug = $1 OR p.slug = $1
        ),
        filtered_brands AS (
            -- Lọc danh sách Brand duy nhất dựa trên SPU (Product) thuộc danh mục trên
            SELECT 
                b.id, 
                b.name, 
                b.slug, 
                b.image
            FROM brands b
            INNER JOIN products product ON product."brandId" = b.id
            LEFT JOIN categories category ON product."categoryId" = category.id
            -- Giả định bảng quan hệ nhiều-nhiều cho secondaryCategories sinh bởi TypeORM
            -- Bạn hãy kiểm tra lại tên bảng pivot này trong DB (thường là secondaryCategories)
            LEFT JOIN product_secondary_categories p_sec ON p_sec."product_id" = product.id
            WHERE category.id IN (SELECT id FROM target_categories)
              OR p_sec."category_id" IN (SELECT id FROM target_categories)
            GROUP BY b.id
        )
        -- Trả về kết quả phân trang kèm tổng số lượng dòng (Window Function)
        SELECT 
            id, 
            name, 
            slug, 
            image,
            COUNT(*) OVER() as total_count
        FROM filtered_brands
        ORDER BY name ASC
        LIMIT $2 OFFSET $3;
      `,
      [categorySlug, take, skip],
    );

    // 2. Tính toán tổng số lượng bản ghi phục vụ phân trang
    const totalData = rawResults.length > 0 ? parseInt(rawResults[0].total_count, 10) : 0;

    // 3. Map data kết quả và xử lý Cloudinary URL giống logic cũ của bạn
    const brands = rawResults.map((row) => ({
      id: row.id,
      name: row.name,
      slug: row.slug,
      image: row.image,
    })) as BrandEntity[];

    // 4. Sử dụng CloudinaryService để generate URL cho từng brand nếu có image
    const dataWithUrls = await Promise.all(
      brands.map(async (brand) => {
        if (brand.image) {
          brand.image = await this.cloudinaryService.generateImage(brand.image);
        }
        return brand;
      }),
    );

    return {
      data: dataWithUrls,
      totalData,
      page,
      totalPage: Math.ceil(totalData / limit),
    };
  }

  async findAttributesByCategorySlug(categorySlug: string) {
    const rawResults = await this.dataSource.query<IFilterAttribute[]>(
      `
        SELECT 
            attr.key AS "key",
            attr.label AS "label",
            jsonb_agg(
                DISTINCT jsonb_build_object(
                    'value', attr.value,
                    'desc', COALESCE(attr."desc", '')
                )
            ) AS "options"
        FROM product_variants pv
        INNER JOIN products p ON pv."productId" = p.id

        -- 1. Join với danh mục chính (Mối quan hệ Many-to-One mặc định)
        INNER JOIN categories c ON p."categoryId" = c.id
        LEFT JOIN categories parent ON c."parent" = parent.id

        -- 2. SỬA TẠI ĐÂY: Join thông qua bảng trung gian Many-to-Many của TypeORM
        LEFT JOIN product_secondary_categories psc ON p.id = psc.product_id
        LEFT JOIN categories sc ON psc.category_id = sc.id

        -- Bóc tách dữ liệu JSONB
        CROSS JOIN LATERAL jsonb_to_recordset(pv.sales_attributes) AS attr(key text, label text, value text, "desc" text)

        -- Điều kiện lọc slug (Đã đổi INNER JOIN thành LEFT JOIN ở danh mục phụ để nếu sản phẩm không có danh mục phụ thì vẫn lấy được danh mục chính)
        WHERE c.slug = $1 OR parent.slug = $1 OR sc.slug = $1
        GROUP BY attr.key, attr.label
        ORDER BY attr.key;
        `,
      [categorySlug],
    );

    return rawResults;
  }
}
