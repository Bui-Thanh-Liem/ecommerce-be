import { Module } from '@nestjs/common';
import { NavbarService } from './navbar.service';
import { NavbarController } from './navbar.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NavbarEntity } from './entities/navbar.entity';

@Module({
  imports: [TypeOrmModule.forFeature([NavbarEntity])],
  controllers: [NavbarController],
  providers: [NavbarService],
})
export class NavbarModule {}
