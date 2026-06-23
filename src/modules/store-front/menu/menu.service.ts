import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateMenuDto } from './dto/create-menu.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { MenuEntity } from './entities/menu.entity';
import { IsNull, Not, Repository } from 'typeorm';
import { stringToSlug } from '@/utils/string-to-slug.util';
import { IMetadata } from '@/shared/interfaces/common/metadata.interface';
import { calculatePagination } from '@/utils/pagination-calculator.util';
import { MenuQueryDto } from './dto/query-menu.dto';
import { UpdateMenuDto } from './dto/update-menu.dto';
import { CategoriesService } from '@/modules/catalog/categories/categories.service';

@Injectable()
export class MenuService {
  constructor(
    @InjectRepository(MenuEntity)
    private menuRepository: Repository<MenuEntity>,
    private readonly categoryService: CategoriesService,
  ) {}

  async create(dto: CreateMenuDto) {
    const { name, category: categoryId } = dto;

    //
    const slug = stringToSlug(name);
    const [existMenu, existCategory] = await Promise.all([
      this.menuRepository.exists({ where: { slug } }),
      this.categoryService.exists([categoryId]),
    ]);

    //
    if (existMenu) {
      throw new NotFoundException('A menu with the same name already exists');
    }
    if (!existCategory) {
      throw new NotFoundException('Category not found');
    }

    //
    const menu = this.menuRepository.create({
      ...dto,
      category: { id: categoryId },
      slug,
    });
    return this.menuRepository.save(menu);
  }

  async findAll(query: MenuQueryDto): Promise<IMetadata<MenuEntity>> {
    const { page, limit } = query;
    const { take, skip } = calculatePagination(page, limit);

    const queryBuilder = this.menuRepository
      .createQueryBuilder('menu')

      // Join các quan hệ
      .leftJoinAndSelect('menu.category', 'category')

      // Select các trường cụ thể
      .select([
        'menu.id',
        'menu.name',
        'menu.desc',
        'menu.createdAt',
        'menu.isActive',

        'category.id',
        'category.name',
        'category.slug',
      ])

      // Phân trang và sắp xếp
      .orderBy('menu.createdAt', 'DESC')
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

  async findOptions(query: MenuQueryDto): Promise<IMetadata<MenuEntity>> {
    const { page, limit } = query;

    //
    const { take, skip } = calculatePagination(page, limit);

    const queryBuilder = this.menuRepository
      .createQueryBuilder('menu')

      // Join các quan hệ
      .leftJoinAndSelect('menu.category', 'category')

      // Select các trường cụ thể
      .select(['menu.id', 'menu.name', 'menu.createdAt', 'category.id', 'category.name', 'category.slug'])

      // Phân trang và sắp xếp
      .orderBy('menu.createdAt', 'DESC')
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
    return await this.menuRepository.findOne({ where: { id }, relations: ['category'] });
  }

  async update(id: string, dto: UpdateMenuDto) {
    const { name, category: categoryId } = dto;

    //
    const slug: string | undefined = name ? stringToSlug(name) : undefined;
    const [exist, existCate] = await Promise.all([
      slug ? this.menuRepository.exists({ where: { slug, id: Not(id) } }) : null,
      categoryId ? this.categoryService.exists([categoryId]) : null,
    ]);

    //
    if (slug && exist) throw new NotFoundException('A menu with the same name already exists');
    if (categoryId && !existCate) throw new NotFoundException('Not found category');

    const menu = await this.menuRepository.preload({
      id,
      ...dto,
      slug: slug,
      category: { id: categoryId },
    });
    if (!menu) throw new NotFoundException('Menu not found');
    return await this.menuRepository.save(menu);
  }

  async findForConfig() {
    const menu = await this.menuRepository.find({
      where: { name: Not(IsNull()) },
      order: { createdAt: 'DESC' },
      select: { id: true, name: true },
      take: 10,
    });

    if (!menu || menu.length === 0) {
      throw new NotFoundException('No menu found for config');
    }

    return menu;
  }

  async remove(id: string) {
    const menuExists = await this.menuRepository.findOne({ where: { id } });
    if (!menuExists) {
      throw new NotFoundException('Menu not found');
    }
    return await this.menuRepository.remove(menuExists);
  }
}
