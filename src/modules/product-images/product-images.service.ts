import { Injectable } from '@nestjs/common';

@Injectable()
export class ProductImagesService {
  remove(id: number) {
    return `This action removes a #${id} productImage`;
  }
}
