import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateProductNavbarDto } from './dto/create-product-navbar.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { ProductNavbarEntity } from './entities/product-navbar.entity';
import { Not, Repository } from 'typeorm';
import { stringToSlug } from '@/utils/string-to-slug.util';
import { IMetadata } from '@/shared/interfaces/common/metadata.interface';
import { calculatePagination } from '@/utils/pagination-calculator.util';
import { ProductNavbarQueryDto } from './dto/query-product-navbar.dto';
import { UpdateProductNavbarDto } from './dto/update-product-navbar.dto';

@Injectable()
export class ProductNavbarService {
  constructor(
    @InjectRepository(ProductNavbarEntity)
    private navbarRepository: Repository<ProductNavbarEntity>,
  ) {}

  async create(createProductNavbarDto: CreateProductNavbarDto) {
    const slug = stringToSlug(createProductNavbarDto.name);
    const existingNavbar = await this.navbarRepository.exists({ where: { slug } });
    if (existingNavbar) {
      throw new NotFoundException('A navbar with the same name already exists');
    }

    //
    const navbar = this.navbarRepository.create({
      ...createProductNavbarDto,
      slug,
    });
    return this.navbarRepository.save(navbar);
  }

  async findAll(query: ProductNavbarQueryDto): Promise<IMetadata<ProductNavbarEntity>> {
    const { page, limit } = query;

    //
    const { take, skip } = calculatePagination(page, limit);

    const queryBuilder = this.navbarRepository
      .createQueryBuilder('navbar')
      // Join các quan hệ
      // Select các trường cụ thể
      .select(['navbar.id', 'navbar.name', 'navbar.slug', 'navbar.desc', 'navbar.link', 'navbar.isActive'])

      // Phân trang và sắp xếp
      .skip(skip)
      .take(take)
      .orderBy('navbar.createdAt', 'DESC'); // Nên có orderBy khi phân trang

    const [data, totalData] = await queryBuilder.getManyAndCount();

    return {
      data,
      totalData,
      page,
      totalPage: Math.ceil(totalData / limit),
    };
  }

  async findOptions(query: ProductNavbarQueryDto): Promise<IMetadata<ProductNavbarEntity>> {
    const { page, limit } = query;

    //
    const { take, skip } = calculatePagination(page, limit);

    const queryBuilder = this.navbarRepository
      .createQueryBuilder('navbar')
      // Join các quan hệ
      // Select các trường cụ thể
      .select(['navbar.id', 'navbar.name', 'navbar.link'])

      // Phân trang và sắp xếp
      .orderBy('navbar.createdAt', 'DESC') // Nên có orderBy khi phân trang
      .skip(skip)
      .take(take);

    const [data, totalData] = await queryBuilder.getManyAndCount();

    return {
      data,
      totalData,
      page,
      totalPage: Math.ceil(totalData / limit),
    };
  }

  async findOne(id: string) {
    return await this.navbarRepository.findOne({ where: { id } });
  }

  async update(id: string, updateProductNavbarDto: UpdateProductNavbarDto) {
    const { name } = updateProductNavbarDto;
    console.log('updateProductNavbarDto :::', updateProductNavbarDto);

    let slug: string | undefined = undefined;
    if (name) {
      slug = stringToSlug(name);
      const navbarExists = await this.navbarRepository.exists({ where: { slug, id: Not(id) } });
      if (navbarExists) {
        throw new NotFoundException('A navbar with the same name already exists');
      }
    }
    const navbar = await this.navbarRepository.preload({
      id,
      ...updateProductNavbarDto,
      slug,
    });
    if (!navbar) {
      throw new NotFoundException('Navbar not found');
    }
    return await this.navbarRepository.save(navbar);
  }

  async remove(id: string) {
    const navbarExists = await this.navbarRepository.findOne({ where: { id } });
    if (!navbarExists) {
      throw new NotFoundException('Navbar not found');
    }
    return await this.navbarRepository.remove(navbarExists);
  }
}
