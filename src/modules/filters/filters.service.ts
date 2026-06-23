import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ProductVariantEntity } from '../catalog/product-variants-SKU/entities/product-variant.entity';
import { Repository } from 'typeorm';
import { BrandEntity } from '../catalog/brands/entities/brand.entity';
import { BrandQueryDto } from '../catalog/brands/dto/query-brand.dto';
import { calculatePagination } from '@/utils/pagination-calculator.util';
import { CategoryEntity } from '../catalog/categories/entities/category.entity';
import { CloudinaryService } from '@/common/cloudinary/cloudinary.service';
import { IMetadata } from '@/shared/interfaces/common/metadata.interface';
import { CategoryQueryDto } from '../catalog/categories/dto/query-category.dto';

@Injectable()
export class FiltersService {
  constructor(
    @InjectRepository(ProductVariantEntity)
    private productVariantRepo: Repository<ProductVariantEntity>,

    @InjectRepository(BrandEntity)
    private brandRepo: Repository<BrandEntity>,

    @InjectRepository(CategoryEntity)
    private categoryRepo: Repository<CategoryEntity>,

    private readonly cloudinaryService: CloudinaryService,
  ) {}

  async findBrandsByCategorySlug(categorySlug: string, query: BrandQueryDto): Promise<IMetadata<BrandEntity>> {
    const { page, limit } = query;
    const { take, skip } = calculatePagination(page, limit);

    const queryBuilder = this.brandRepo
      .createQueryBuilder('b')
      // 1. Join ngược từ Brand qua Product
      .innerJoin('b.products', 'product')
      // 2. Join từ Product sang Category chính và phụ (theo thiết kế Cách 2 của bạn)
      .leftJoin('product.category', 'category')
      .leftJoin('product.secondaryCategories', 'secCategory')

      // 3. Dùng Subquery để lọc đúng các danh mục con/cha của slug hiện tại
      .where((qb) => {
        const subQuery = qb
          .subQuery()
          .select('c.id')
          .from(CategoryEntity, 'c')
          .leftJoin('c.parent', 'p')
          .where('c.slug = :categorySlug OR p.slug = :categorySlug', { categorySlug })
          .getQuery();

        return `(category.id IN ${subQuery} OR secCategory.id IN ${subQuery})`;
      })

      .take(take)
      .skip(skip)

      // 4. Chỉ lấy các cột của Brand và Group lại để không bị trùng lặp
      .select(['b.id', 'b.name', 'b.slug', 'b.image'])
      .groupBy('b.id')
      .orderBy('b.name', 'ASC');

    const [brands, totalData] = await queryBuilder.getManyAndCount();

    const dataWithUrls = await Promise.all(
      brands.map(async (brand) => {
        if (brand.image && brand.image.key) {
          brand.image.url = await this.cloudinaryService.generateUrl(brand.image.key);
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

  async findChildrenCategoryBySlug(slug: string, query: CategoryQueryDto): Promise<IMetadata<CategoryEntity>> {
    const { page, limit } = query;
    const { take, skip } = calculatePagination(page, limit);

    const queryBuilder = this.categoryRepo
      .createQueryBuilder('category')
      .leftJoin('category.parent', 'parent')
      .where('parent.slug = :slug', { slug })

      //
      .select(['category.id', 'category.name', 'category.slug', 'category.code', 'category.createdAt']);

    //
    queryBuilder.orderBy('category.createdAt', 'DESC').skip(skip).take(take);

    //
    const [data, totalData] = await queryBuilder.getManyAndCount();

    //
    return {
      data,
      totalData,
      page,
      totalPage: Math.ceil(totalData / limit),
    };
  }
}
