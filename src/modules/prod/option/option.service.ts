import { Injectable } from '@nestjs/common';
import { CreateOptionDto } from './dto/create-option.dto';
import { UpdateOptionDto } from './dto/update-option.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Option } from './entities/option.entity';

@Injectable()
export class OptionService {
  @InjectRepository(Option)
  private optionRepo: Repository<Option>;

  async create(body: CreateOptionDto) {
    return await this.optionRepo.save(body);
  }

  async findAll() {
    return await this.optionRepo.find();
  }

  async findOne(id: string) {
    return await this.optionRepo.findOne({ where: { id } });
  }

  update(id: string, body: UpdateOptionDto) {
    return `This action updates a #${id} option`;
  }

  remove(id: string) {
    return `This action removes a #${id} option`;
  }
}
