import { Injectable } from '@nestjs/common';
import { CreateZalopayDto } from './dto/create-zalopay.dto';
import { UpdateZalopayDto } from './dto/update-zalopay.dto';

@Injectable()
export class ZalopayService {
  create(createZalopayDto: CreateZalopayDto) {
    return 'This action adds a new zalopay';
  }

  findAll() {
    return `This action returns all zalopay`;
  }

  findOne(id: number) {
    return `This action returns a #${id} zalopay`;
  }

  update(id: number, updateZalopayDto: UpdateZalopayDto) {
    return `This action updates a #${id} zalopay`;
  }

  remove(id: number) {
    return `This action removes a #${id} zalopay`;
  }
}
