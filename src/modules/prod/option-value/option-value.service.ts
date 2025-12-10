import { Injectable } from '@nestjs/common';
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
  private readonly optionService: OptionService;

  async create(createOptionValueDto: CreateOptionValueDto) {
    const { optionIds } = createOptionValueDto;

    let options: any[] = [];
    if (optionIds && optionIds.length) {
      options = await Promise.all(
        optionIds.map((id) => this.optionService.findOne(id)),
      );
    }
    return this.optionValueRepo.save({
      ...createOptionValueDto,
      optionIds: options,
    });
  }

  findAll() {
    return `This action returns all optionValue`;
  }

  findOne(id: number) {
    return `This action returns a #${id} optionValue`;
  }

  update(id: number, updateOptionValueDto: UpdateOptionValueDto) {
    return `This action updates a #${id} optionValue`;
  }

  remove(id: number) {
    return `This action removes a #${id} optionValue`;
  }
}
