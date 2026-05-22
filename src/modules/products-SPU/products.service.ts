import { stringToSlug } from '@/utils/string-to-slug.util';
import { ConflictException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Not, Repository } from 'typeorm';
import { BrandsService } from '../brands/brands.service';
import { CategoriesService } from '../categories/categories.service';
import { ProductCodeService } from '../product-code/product-code.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { ProductEntity } from './entities/product.entity';
import { ProductQueryDto } from './dto/query-product.dto';
import { calculatePagination } from '@/utils/pagination-calculator.util';
import { IMetadata } from '@/shared/interfaces/metadata.interface';
import { CloudinaryService } from '@/cloud-storage/cloudinary/cloudinary.service';
import { ProductImageEntity } from '../product-images/entities/product-image.entity';

@Injectable()
export class ProductsService {
  private readonly logger = new Logger(ProductsService.name);

  constructor(
    @InjectRepository(ProductEntity)
    private productRepo: Repository<ProductEntity>,
    private readonly cateService: CategoriesService,
    private readonly brandService: BrandsService,
    private readonly productCodeService: ProductCodeService,

    private readonly cloudinaryService: CloudinaryService,
  ) {}

  async create(createProductDto: CreateProductDto) {
    const { category: categoryId, brand: brandId, name, productImages, ...rest } = createProductDto;
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
    const spu = this.productCodeService.generateSPUCode(categoryCode, brandCode, slug, nextSeq);

    // 5. Tạo và lưu
    // 6. Lúc này các Subscriber/Hooks như assignProductToImages sẽ chạy
    // để gán các giá trị cần thiết để bảng ProductImage có thể lưu được (như product, sortOrder, isThumbnail,...)
    const product = this.productRepo.create({
      ...rest,
      spu,
      slug,
      name,
      productImages, // Thêm productImages vào đây để cascade lưu
      brand: { id: brandId },
      category: { id: categoryId },
    });

    return await this.productRepo.save(product);
  }

  async findAll(query: ProductQueryDto): Promise<IMetadata<ProductEntity>> {
    const { page, limit } = query;

    //
    const { take, skip } = calculatePagination(page, limit);

    //
    const queryBuilder = this.productRepo
      .createQueryBuilder('product')

      // Join các quan hệ
      .leftJoinAndSelect('product.category', 'category')
      .leftJoinAndSelect('product.brand', 'brand')
      .leftJoinAndSelect('product.productImages', 'productImages')

      // Select các trường cụ thể (tương đương với select của bạn)
      .select([
        'product.id',
        'product.name',
        'product.slug',
        'product.desc',
        'product.basePrice',
        'product.discountPercent',
        'product.status',
        'product.spu',
        'product.specifications',
        'product.createdAt',
        'brand.id',
        'brand.name',
        'brand.slug',
        'brand.code',
        'category.id',
        'category.name',
        'category.slug',
        'category.code',
        'productImages.id',
        'productImages.image',
        'productImages.sortOrder',
        'productImages.isThumbnail',
      ])

      // Phân trang và sắp xếp
      .skip(skip)
      .take(take)
      .orderBy('product.createdAt', 'DESC'); // Nên có orderBy khi phân trang

    const [data, totalData] = await queryBuilder.getManyAndCount();

    // Chuyển đổi URL ảnh nếu có
    const dataWithUrls = data.map((product) => {
      const flattenedImages = product?.productImages?.flat() || [];

      const updatedImages = flattenedImages.map((img) => {
        const publicId = img?.image?.key || '';
        const url = publicId ? this.cloudinaryService.generateUrl(publicId) : '';

        return {
          ...img,
          image: {
            ...img.image,
            url,
          },
        } as ProductImageEntity;
      });

      product.productImages = updatedImages;

      return product;
    });

    return {
      data: dataWithUrls,
      totalData,
      page,
      totalPage: Math.ceil(totalData / limit),
    };
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
    return await this.productRepo.findOne({ where: { id }, relations: ['category', 'brand'] });
  }

  async update(id: string, updateProductDto: UpdateProductDto) {
    const { category: categoryId, brand: brandId, name, ...rest } = updateProductDto;

    // 1. Kiểm tra product tồn tại chưa
    const oldProduct = await this.productRepo.findOne({
      where: { id },
      relations: ['productImages'],
      select: {
        productImages: {
          image: true,
        },
      },
    });
    if (!oldProduct) throw new NotFoundException(`Product with ID ${id} not found`);

    // 2. Nếu có cập nhật tên, cần kiểm tra trùng tên (tức là trùng slug)
    if (name) {
      const slug = stringToSlug(name);
      const existingProduct = await this.productRepo.findOne({ where: { slug, id: Not(id) } });
      if (existingProduct) throw new ConflictException('Product with this name already exists');
    }

    // Lưu lại key của ảnh cũ để nếu có cập nhật ảnh mới thì sẽ xóa ảnh cũ sau
    const oldImageKey = oldProduct.productImages?.flatMap((img) => img.image?.key) || [];

    try {
      // 3. Cập nhật product
      const updatedProduct = this.productRepo.merge(oldProduct, {
        ...rest,
        name: name ? name : undefined,
        slug: name ? stringToSlug(name) : undefined,
        brand: brandId ? { id: brandId } : undefined,
        category: categoryId ? { id: categoryId } : undefined,
        productImages: updateProductDto.productImages ? updateProductDto.productImages : undefined,
      });
      await this.productRepo.save(updatedProduct);

      // 4. Nếu có cập nhật ảnh thì xóa ảnh cũ trên Cloudinary
      if (updateProductDto.productImages && updateProductDto.productImages.length > 0) {
        const newImageKeys = updateProductDto.productImages.map((img) => img.image.key);
        const imagesToDelete = oldImageKey.filter((key) => !newImageKeys.includes(key));

        if (imagesToDelete.length > 0) {
          await this.cloudinaryService.deleteMultipleImages(imagesToDelete);
        }
      }
    } catch (error) {
      this.logger.debug(`Failed to update product with ID ${id}`, error);
      throw new NotFoundException(`Failed to update product with ID ${id}`);
    }
  }

  async remove(id: string) {
    const product = await this.productRepo.findOne({
      where: { id },
      relations: ['productImages'],
      select: { id: true, productImages: { image: true, id: true } },
    });
    if (!product) {
      throw new NotFoundException(`Product with ID ${id} not found`);
    }

    // 1. Xóa trong DB trước - Chạy mất vài mili-giây, giải phóng DB ngay lập tức
    await this.productRepo.remove(product);

    // 2. DB đã sạch sẽ rồi, xóa ảnh
    if (product.productImages) {
      const imageKeys = product.productImages.map((img) => img.image?.key).filter((key): key is string => !!key);
      try {
        await this.cloudinaryService.deleteMultipleImages(imageKeys);
      } catch (error) {
        // Nếu lỗi cloud ở đây, DB đã xóa xong nên hệ thống KHÔNG bị lỗi hiển thị ảnh chết.
        // Chúng ta chỉ bị thừa 1 cái ảnh rác trên Cloudinary.
        // Log lỗi lại để dùng Cron Job quét rác sau,
        // hoặc ném vào Queue để nó tự động xóa lại (Retry).
        console.error(`Failed to delete image from Cloudinary: ${imageKeys.join(', ')}`, error);
      }
    }

    return true;
  }
}
