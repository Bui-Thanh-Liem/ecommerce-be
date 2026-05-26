import { Injectable } from '@nestjs/common';
import { CreateZaloPayDto } from './dto/create-zalopay.dto';
import { UpdateZaloPayDto } from './dto/update-zalopay.dto';

@Injectable()
export class ZaloPayService {
  create(createZaloPayDto: CreateZaloPayDto) {
    return 'This action adds a new zalo pay';
  }

  findAll() {
    return `This action returns all zalo pay`;
  }

  findOne(id: number) {
    return `This action returns a #${id} zalo pay`;
  }

  update(id: number, updateZaloPayDto: UpdateZaloPayDto) {
    return `This action updates a #${id} zalo pay`;
  }

  remove(id: number) {
    return `This action removes a #${id} zalo pay`;
  }
}
