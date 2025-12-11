import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { CreatePermissionDto } from './dto/create-permission.dto';
import { UpdatePermissionDto } from './dto/update-permission.dto';
import { Permission } from './entities/permission.entity';

@Injectable()
export class PermissionService {
  @InjectRepository(Permission)
  private permissionRepo: Repository<Permission>;

  async create(body: CreatePermissionDto) {
    console.log('CreatePermissionDto :::', body);

    const dataCreate = this.permissionRepo.create(body);
    return await this.permissionRepo.save(dataCreate);
  }

  findAll() {
    return `This action returns all permission`;
  }

  findByIds(ids: string[]) {
    return this.permissionRepo.find({ where: { id: In(ids) } });
  }

  findOne(id: number) {
    return `This action returns a #${id} permission`;
  }

  update(id: number, body: UpdatePermissionDto) {
    return `This action updates a #${id} permission`;
  }

  remove(id: number) {
    return `This action removes a #${id} permission`;
  }
}
