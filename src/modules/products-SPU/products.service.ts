import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { ProductEntity } from './entities/product.entity';
import { In, Not, Repository } from 'typeorm';
import { CategoriesService } from '../categories/categories.service';
import { BrandsService } from '../brands/brands.service';
import { stringToSlug } from '@/utils/string-to-slug.util';
import { ProductCodeService } from '../product-code/product-code.service';

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(ProductEntity)
    private productRepo: Repository<ProductEntity>,
    private readonly cateService: CategoriesService,
    private readonly brandService: BrandsService,
    private readonly productCodeService: ProductCodeService,
  ) {}

  async create(createProductDto: CreateProductDto) {
    const { category: categoryId, brand: brandId, name, ...rest } = createProductDto;
    const slug = stringToSlug(name);

    // 1. Kiểm tra trùng slug (Unique constraint check)
    const existingProduct = await this.productRepo.findOne({ where: { slug } });
    if (existingProduct) {
      throw new ConflictException('Product with this name already exists');
    }

    // 2. Lấy Code đồng thời (Tối ưu performance)
    const [categoryCode, brandCode] = await Promise.all([
      this.cateService.findCodeById(categoryId),
      this.brandService.findCodeById(brandId),
    ]);

    if (!categoryCode) throw new NotFoundException('Category code not found');
    if (!brandCode) throw new NotFoundException('Brand code not found');

    // 3. Lấy Sequence từ Postgres
    const queryResult = await this.productRepo.query<{ val: string }[]>("SELECT nextval('product_spu_seq') as val");
    const nextSeq = Number(queryResult[0].val);

    // 4. Sinh mã SPU
    const spu = this.productCodeService.generateSPUCode(categoryCode, brandCode, nextSeq);

    // 5. Tạo và lưu
    const product = this.productRepo.create({
      ...rest,
      name,
      slug,
      spu,
      category: { id: categoryId },
      brand: { id: brandId },
    });

    return await this.productRepo.save(product);
  }

  async findAll() {
    return await this.productRepo.find();
  }

  async exists(ids: string[]) {
    const count = await this.productRepo.countBy({ id: In(ids) });
    return count === ids.length;
  }

  async findSPUById(id: string) {
    const product = await this.productRepo.findOne({ where: { id }, select: ['spu'] });
    return product?.spu;
  }

  async findOne(id: string) {
    return await this.productRepo.findOne({ where: { id } });
  }

  async update(id: string, updateProductDto: UpdateProductDto) {
    const { category: categoryId, brand: brandId, name, ...rest } = updateProductDto;

    // 1. Preload: Tìm product cũ và merge với data mới
    const product = await this.productRepo.preload({
      id,
      ...rest,
      name,
      // Nếu có name mới thì tạo slug mới, không thì giữ nguyên
      ...(name && { slug: stringToSlug(name) }),
      // Xử lý quan hệ ID
      ...(categoryId && { category: { id: categoryId } }),
      ...(brandId && { brand: { id: brandId } }),
    });

    if (!product) {
      throw new NotFoundException(`Product with ID ${id} not found`);
    }

    // 2. Kiểm tra trùng Slug mới (nếu tên thay đổi)
    if (name) {
      const existingProduct = await this.productRepo.findOne({
        where: { slug: product.slug, id: Not(id) },
      });
      if (existingProduct) throw new ConflictException('New product name results in a duplicate slug');
    }

    // 3. Lưu lại (Lúc này các Subscriber/Hooks như logUpdate của bạn mới chạy)
    return await this.productRepo.save(product);
  }

  async remove(id: string) {
    return await this.productRepo.delete(id);
  }
}
