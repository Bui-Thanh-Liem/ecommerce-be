import { Module } from '@nestjs/common';
import { TeamCategoriesService } from './team-categories.service';
import { TeamCategoriesController } from './team-categories.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TeamCategoryEntity } from './entities/team-category.entity';

@Module({
  imports: [TypeOrmModule.forFeature([TeamCategoryEntity])],
  controllers: [TeamCategoriesController],
  providers: [TeamCategoriesService],
  exports: [TeamCategoriesService],
})
export class TeamCategoriesModule {}
