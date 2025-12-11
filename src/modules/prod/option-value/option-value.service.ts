import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { CreateOptionValueDto } from './dto/create-option-value.dto';
import { UpdateOptionValueDto } from './dto/update-option-value.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { OptionValue } from './entities/option-value.entity';
import { OptionService } from '../option/option.service';

@Injectable()
export class OptionValueService {
  @InjectRepository(OptionValue)
  private optionValueRepo: Repository<OptionValue>;

  @Inject()
  private readonly optionService: OptionService;

  async create(body: CreateOptionValueDto) {
    const { optionId, value } = body;

    const option = await this.optionService.findOne(optionId);
    if (!option || !optionId) {
      throw new NotFoundException('Option not found');
    }

    return this.optionValueRepo.save({
      value,
      optionId: option,
    });
  }

  async findAll() {
    const [items, total] = await this.optionValueRepo.findAndCount();
    return { items, total };
  }

  findOne(id: string) {
    return `This action returns a #${id} optionValue`;
  }

  update(id: string, body: UpdateOptionValueDto) {
    return `This action updates a #${id} optionValue`;
  }

  remove(id: string) {
    return `This action removes a #${id} optionValue`;
  }
}
