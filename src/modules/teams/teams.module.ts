import { Module } from '@nestjs/common';
import { TeamsService } from './teams.service';
import { TeamsController } from './teams.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TeamEntity } from './entities/team.entity';
import { StaffsModule } from '../staffs/staffs.module';
import { StoresModule } from '../stores/stores.module';
import { TeamCategoriesModule } from '../team-categories/team-categories.module';

@Module({
  imports: [TypeOrmModule.forFeature([TeamEntity]), StaffsModule, StoresModule, TeamCategoriesModule],
  controllers: [TeamsController],
  providers: [TeamsService],
  exports: [TeamsService],
})
export class TeamsModule {}
