import { Base } from 'src/shared/entity/Base.entity';
import { Column, Entity, Index, OneToMany } from 'typeorm';
import { OptionValue } from '../../option-value/entities/option-value.entity';

@Entity()
@Index(['name'], { unique: true })
export class Option extends Base {
  @Column() // ví dụ: "Màu sắc", "Kích thước", "Chất liệu"
  name: string; // "Color", "Size", "Material"

  @OneToMany(() => OptionValue, (ov) => ov.optionId, {
    cascade: ['insert', 'update'],
  })
  optionValueIds: OptionValue[];
}
