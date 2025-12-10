import { Base } from 'src/shared/entity/Base.entity';
import { Column, Entity, Index } from 'typeorm';

@Entity()
@Index(['name'], { unique: true })
export class Option extends Base {
  @Column()
  name: string;
}
