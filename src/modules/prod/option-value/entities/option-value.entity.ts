import { Base } from 'src/shared/entity/Base.entity';
import { Column, Entity, JoinTable, ManyToMany } from 'typeorm';
import { Option } from '../../option/entities/option.entity';
import { ProductVariant } from '../../product-variant/entities/product-variant.entity';

@Entity()
export class OptionValue extends Base {
  @Column()
  value: string;

  @ManyToMany(() => ProductVariant, (pv) => pv.optionValues, {
    onDelete: 'CASCADE',
  })
  productVariantIds: ProductVariant[];

  @ManyToMany(() => Option)
  @JoinTable()
  optionIds: Option[];
}
