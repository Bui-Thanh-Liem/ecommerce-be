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

@Injectable()
export class MenuService {
  constructor(
    @InjectRepository(MenuEntity)
    private navbarRepository: Repository<MenuEntity>,
  ) {}

  async create(createMenuDto: CreateMenuDto) {
    const slug = stringToSlug(createMenuDto.name);
    const existingNavbar = await this.navbarRepository.exists({ where: { slug } });
    if (existingNavbar) {
      throw new NotFoundException('A navbar with the same name already exists');
    }

    //
    const navbar = this.navbarRepository.create({
      ...createMenuDto,
      slug,
    });
    return this.navbarRepository.save(navbar);
  }

  async findAll(query: MenuQueryDto): Promise<IMetadata<MenuEntity>> {
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

  async findOptions(query: MenuQueryDto): Promise<IMetadata<MenuEntity>> {
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

  async update(id: string, updateMenuDto: UpdateMenuDto) {
    const { name } = updateMenuDto;

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
      ...updateMenuDto,
      slug,
    });
    if (!navbar) {
      throw new NotFoundException('Navbar not found');
    }
    return await this.navbarRepository.save(navbar);
  }

  async findForConfig() {
    const navbar = await this.navbarRepository.find({
      where: { name: Not(IsNull()) },
      order: { createdAt: 'DESC' },
      select: { id: true, name: true, link: true },
      take: 10,
    });

    if (!navbar || navbar.length === 0) {
      throw new NotFoundException('No navbar found for config');
    }

    return navbar;
  }

  async remove(id: string) {
    const navbarExists = await this.navbarRepository.findOne({ where: { id } });
    if (!navbarExists) {
      throw new NotFoundException('Navbar not found');
    }
    return await this.navbarRepository.remove(navbarExists);
  }
}
