import { TeamEntity } from '@/modules/teams/entities/team.entity';
import { BaseEntity } from '@/shared/entities/base.entity';
import { TeamCategoryCode } from '@/shared/enums/team-category-code.enum';
import { TeamType } from '@/shared/enums/team-type.enum';
import { ITeamCategory } from '@/shared/interfaces/models/team-category.interface';
import { Column, Entity, Index, ManyToMany } from 'typeorm';

@Entity('team_categories')
@Index(['name', 'code'], { unique: true })
export class TeamCategoryEntity extends BaseEntity implements ITeamCategory {
  @Column({ unique: true, type: 'varchar', length: 100 })
  name: string;

  @Column({ type: 'enum', enum: TeamType })
  type: TeamType;

  @Column({ type: 'enum', enum: TeamCategoryCode })
  code: TeamCategoryCode;

  @ManyToMany(() => TeamEntity, (team) => team.category)
  teams: TeamEntity[];

  logInsert(): void {
    this.logger.debug(`Đã chèn thành công team category có tên: ${this.name}`);
  }
  logUpdate(): void {
    this.logger.debug(`Đã cập nhật thành công team category có tên: ${this.name}`);
  }
  logRemove(): void {
    this.logger.debug(`Đã xóa thành công team category có tên: ${this.name}`);
  }
}
