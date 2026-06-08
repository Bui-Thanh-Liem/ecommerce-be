import { Injectable, NotFoundException, OnModuleInit } from '@nestjs/common';
import { CreateTeamCategoryDto } from './dto/create-team-category.dto';
import { UpdateTeamCategoryDto } from './dto/update-team-category.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { TeamCategoryEntity } from './entities/team-category.entity';
import { In, Not, Repository } from 'typeorm';
import { teamCategorySeed } from './seeding';
import { TeamCategoryQueryDto } from './dto/query-team-category.dto';
import { calculatePagination } from '@/utils/pagination-calculator.util';
import { IMetadata } from '@/shared/interfaces/common/metadata.interface';

@Injectable()
export class TeamCategoriesService implements OnModuleInit {
  constructor(
    @InjectRepository(TeamCategoryEntity)
    private teamCategoryRepository: Repository<TeamCategoryEntity>,
  ) {}

  async onModuleInit() {
    await this.initialTeamCategories();
  }

  async create(payload: CreateTeamCategoryDto) {
    const { code, name } = payload;

    const existing = await this.teamCategoryRepository.exists({ where: [{ name }, { name, code }] });
    if (existing) {
      throw new NotFoundException('Team category with the same name or code already exists');
    }

    const teamCategory = this.teamCategoryRepository.create(payload);
    return await this.teamCategoryRepository.save(teamCategory);
  }

  async exists(ids: string[]): Promise<boolean> {
    const count = await this.teamCategoryRepository.countBy({ id: In(ids) });
    return count === ids.length;
  }

  async findAll(query: TeamCategoryQueryDto): Promise<IMetadata<TeamCategoryEntity>> {
    const { page, limit } = query;

    //
    const { take, skip } = calculatePagination(page, limit);

    const builder = this.teamCategoryRepository.createQueryBuilder('teamCategory');

    const [data, total] = await builder.take(take).skip(skip).getManyAndCount();
    return {
      data,
      totalData: total,
      page,
      totalPage: Math.ceil(total / limit),
    };
  }

  async findOptions(query: TeamCategoryQueryDto): Promise<IMetadata<TeamCategoryEntity>> {
    const { page, limit } = query;
    const { take, skip } = calculatePagination(page, limit);

    const queryBuilder = this.teamCategoryRepository
      .createQueryBuilder('teamCategory')
      .select(['teamCategory.id', 'teamCategory.name'])
      .skip(skip)
      .take(take)
      .orderBy('teamCategory.createdAt', 'DESC');

    const [data, totalData] = await queryBuilder.getManyAndCount();

    return {
      data,
      totalData,
      page,
      totalPage: Math.ceil(totalData / limit),
    };
  }

  async findOne(id: string) {
    return await this.teamCategoryRepository.findOne({ where: { id }, relations: ['teams'] });
  }

  async update(id: string, payload: UpdateTeamCategoryDto) {
    const { code, name } = payload;

    //
    const existing = await this.teamCategoryRepository.exists({
      where: [
        { name, id: Not(id) },
        { name, code, id: Not(id) },
      ],
    });
    if (existing) {
      throw new NotFoundException('Team category with the same name or code already exists');
    }

    //
    const teamCategory = await this.teamCategoryRepository.preload({ id, ...payload });
    if (!teamCategory) {
      throw new NotFoundException('Team category not found');
    }
    return await this.teamCategoryRepository.save(teamCategory);
  }

  async remove(id: string) {
    console.log('TeamCategoriesService - remove - id:', id);

    const teamCategory = await this.findOne(id);
    if (!teamCategory) {
      throw new Error('Team category not found');
    }
    return await this.teamCategoryRepository.remove(teamCategory);
  }

  async initialTeamCategories() {
    const existing = await this.teamCategoryRepository.count();
    if (existing === 0) {
      await Promise.all(
        teamCategorySeed.map((category) =>
          this.teamCategoryRepository.save(
            this.teamCategoryRepository.create({
              name: category.name,
              type: category.type,
              code: category.code,
            }),
          ),
        ),
      );
    }
  }
}
