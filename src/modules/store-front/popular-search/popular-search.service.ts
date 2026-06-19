import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { PopularSearchEntity } from './entities/popular-search.entity';
import { Not, Repository } from 'typeorm';
import { calculatePagination } from '@/utils/pagination-calculator.util';
import { IMetadata } from '@/shared/interfaces/common/metadata.interface';
import { CreatePopularSearchDto } from './dto/create-popular-search.dto';
import { PopularSearchQueryDto } from './dto/query-popular-search.dto';
import { UpdatePopularSearchDto } from './dto/update-popular-search.dto';

@Injectable()
export class PopularSearchService {
  constructor(
    @InjectRepository(PopularSearchEntity)
    private popularSearchRepo: Repository<PopularSearchEntity>,
  ) {}

  async create(dto: CreatePopularSearchDto) {
    const exits = await this.popularSearchRepo.exists({ where: { text: dto.text } });
    if (exits) {
      throw new NotFoundException('A popular search with the same text already exists');
    }

    //
    const popularSearch = this.popularSearchRepo.create(dto);
    return this.popularSearchRepo.save(popularSearch);
  }

  async findAll(queries: PopularSearchQueryDto): Promise<IMetadata<PopularSearchEntity>> {
    const { page, limit } = queries;
    const { take, skip } = calculatePagination(page, limit);

    //
    const queryBuilder = this.popularSearchRepo
      .createQueryBuilder('popularSearch')
      // Select các trường cụ thể
      .select(['popularSearch.id', 'popularSearch.text'])

      // Phân trang và sắp xếp
      .orderBy('popularSearch.createdAt', 'DESC')
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

  async findOptions(query: PopularSearchQueryDto): Promise<IMetadata<PopularSearchEntity>> {
    const { page, limit } = query;

    //
    const { take, skip } = calculatePagination(page, limit);

    const queryBuilder = this.popularSearchRepo
      .createQueryBuilder('popularSearch')
      // Select các trường cụ thể
      .select(['popularSearch.id', 'popularSearch.text'])

      // Phân trang và sắp xếp
      .orderBy('popularSearch.createdAt', 'DESC')
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
    return await this.popularSearchRepo.findOne({ where: { id } });
  }

  async update(id: string, dto: UpdatePopularSearchDto) {
    if (dto.text) {
      const exists = await this.popularSearchRepo.exists({ where: { text: dto.text, id: Not(id) } });
      if (exists) {
        throw new NotFoundException('A popular search with the same text already exists');
      }
    }
    const popularSearch = await this.popularSearchRepo.preload({
      id,
      ...dto,
    });
    if (!popularSearch) {
      throw new NotFoundException('Popular search not found');
    }
    return await this.popularSearchRepo.save(popularSearch);
  }

  async remove(id: string) {
    const popularSearch = await this.popularSearchRepo.findOne({ where: { id } });
    if (!popularSearch) {
      throw new NotFoundException('Popular search not found');
    }
    return await this.popularSearchRepo.remove(popularSearch);
  }
}
