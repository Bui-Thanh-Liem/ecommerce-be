import { Injectable } from '@nestjs/common';
import { CreateVnPayDto } from './dto/create-vnpay.dto';
import { UpdateVnPayDto } from './dto/update-vnpay.dto';

@Injectable()
export class VnPayService {
  create(createVnPayDto: CreateVnPayDto) {
    return 'This action adds a new vnpay';
  }

  findAll() {
    return `This action returns all vnpay`;
  }

  findOne(id: number) {
    return `This action returns a #${id} vnpay`;
  }

  update(id: number, updateVnPayDto: UpdateVnPayDto) {
    return `This action updates a #${id} vnpay`;
  }

  remove(id: number) {
    return `This action removes a #${id} vnpay`;
  }
}
