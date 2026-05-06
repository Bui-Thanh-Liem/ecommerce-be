import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { CreateTeamDto } from './dto/create-team.dto';
import { UpdateTeamDto } from './dto/update-team.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { TeamEntity } from './entities/team.entity';
import { Repository } from 'typeorm';
import { StaffsService } from '../staffs/staffs.service';
import { StoresService } from '../stores/stores.service';
import { TeamQueryDto } from './dto/query-team.dto';
import { calculatePagination } from '@/utils/pagination-calculator.util';

@Injectable()
export class TeamsService {
  private readonly logger = new Logger(TeamsService.name);

  constructor(
    @InjectRepository(TeamEntity)
    private teamRepository: Repository<TeamEntity>,

    private readonly staffsService: StaffsService,
    private readonly storesService: StoresService,
  ) {}

  async create(createTeamDto: CreateTeamDto) {
    const { leader: leaderId, members: membersIds, store: storeId, ...rest } = createTeamDto;

    //
    const teamWithSameName = await this.teamRepository.exists({ where: { name: rest.name } });
    if (teamWithSameName) {
      throw new NotFoundException('Team with the same name already exists');
    }

    // Validate that the leader exists
    const leader = await this.staffsService.exists([leaderId]);
    if (!leader) {
      throw new NotFoundException('Leader not found');
    }

    // Validate that all members exist
    const members = await this.staffsService.exists(membersIds);
    if (!members) {
      throw new NotFoundException('One or more members not found');
    }

    // Validate that the store exists
    if (storeId) {
      const store = await this.storesService.exists([storeId]);
      if (!store) {
        throw new NotFoundException('Store not found');
      }
    }

    const team = this.teamRepository.create({
      ...rest,
      leader: { id: leaderId },
      store: storeId ? { id: storeId } : null,
      members: membersIds.map((id) => ({ id })),
    });
    return await this.teamRepository.save(team);
  }

  async findAll(query: TeamQueryDto) {
    const { page, limit, filters } = query;
    console.log('filters?.store :::', filters);

    //
    const { take, skip } = calculatePagination(page, limit);

    //
    const queryBuilder = this.teamRepository
      .createQueryBuilder('team')
      .leftJoinAndSelect('team.leader', 'leader')
      .leftJoinAndSelect('team.members', 'members')
      .leftJoinAndSelect('team.store', 'store');

    // Apply filters if provided
    if (filters?.store) {
      queryBuilder.andWhere('team.store = :store', { store: filters.store as string });
    } else {
      queryBuilder.andWhere('team.store IS NULL');
    }

    //
    const [data, total] = await queryBuilder.take(take).skip(skip).getManyAndCount();
    return data;
  }

  async findOne(id: string) {
    return await this.teamRepository.findOne({ where: { id }, relations: ['leader', 'members', 'store'] });
  }

  async update(id: string, updateTeamDto: UpdateTeamDto) {
    const { leader: leaderId, members: membersIds, store: storeId, ...rest } = updateTeamDto;

    // Validate that the leader exists
    if (leaderId) {
      const leader = await this.staffsService.exists([leaderId]);
      if (!leader) {
        throw new NotFoundException('Leader not found');
      }
    }

    // Validate that all members exist
    if (membersIds) {
      const members = await this.staffsService.exists(membersIds);
      if (!members) {
        throw new NotFoundException('One or more members not found');
      }
    }

    // Validate that the store exists
    if (storeId) {
      const store = await this.storesService.exists([storeId]);
      if (!store) {
        throw new NotFoundException('Store not found');
      }
    }

    const team = await this.teamRepository.preload({
      id,
      ...rest,
      store: storeId ? { id: storeId } : undefined,
      leader: leaderId ? { id: leaderId } : undefined,
      members: membersIds ? membersIds.map((id) => ({ id })) : undefined,
    });
    if (!team) {
      throw new NotFoundException('Team not found');
    }
    return await this.teamRepository.save(team);
  }

  async remove(id: string) {
    const team = await this.findOne(id);
    if (!team) {
      throw new NotFoundException('Team not found');
    }
    return await this.teamRepository.remove(team);
  }
}
