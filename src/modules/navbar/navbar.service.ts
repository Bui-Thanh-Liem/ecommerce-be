import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateNavbarDto } from './dto/create-navbar.dto';
import { UpdateNavbarDto } from './dto/update-navbar.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { NavbarEntity } from './entities/navbar.entity';
import { Not, Repository } from 'typeorm';
import { stringToSlug } from '@/utils/string-to-slug.util';

@Injectable()
export class NavbarService {
  constructor(
    @InjectRepository(NavbarEntity)
    private navbarRepository: Repository<NavbarEntity>,
  ) {}

  async create(createNavbarDto: CreateNavbarDto) {
    const slug = stringToSlug(createNavbarDto.name);
    const existingNavbar = await this.navbarRepository.findOne({ where: { slug } });
    if (existingNavbar) {
      throw new NotFoundException('A navbar with the same name already exists');
    }

    //
    const navbar = this.navbarRepository.create({
      ...createNavbarDto,
      slug,
    });
    return this.navbarRepository.save(navbar);
  }

  async findAll() {
    return this.navbarRepository.find();
  }

  async findOne(id: string) {
    return await this.navbarRepository.findOne({ where: { id } });
  }

  async update(id: string, updateNavbarDto: UpdateNavbarDto) {
    const { name } = updateNavbarDto;

    if (name) {
      const slug = stringToSlug(name);
      const navbarExists = await this.navbarRepository.exists({ where: { slug, id: Not(id) } });
      if (navbarExists) {
        throw new NotFoundException('A navbar with the same name already exists');
      }
    }
    const navbar = await this.navbarRepository.preload({ id, ...updateNavbarDto });
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
