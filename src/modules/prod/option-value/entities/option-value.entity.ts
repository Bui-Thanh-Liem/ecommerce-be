import { Base } from 'src/shared/entity/Base.entity';
import { Column, Entity, JoinColumn, ManyToMany, ManyToOne } from 'typeorm';
import { Option } from '../../option/entities/option.entity';
import { ProductVariant } from '../../product-variant/entities/product-variant.entity';

@Entity()
export class OptionValue extends Base {
  @Column() // ví dụ: "Đỏ", "Xanh", "XL", "Cotton"
  value: string; // "Red", "Blue", "XL", ...

  @ManyToMany(() => ProductVariant, (pv) => pv.optionValueIds, {
    onDelete: 'CASCADE',
  })
  productVariantIds: ProductVariant[];

  @ManyToOne(() => Option, { onDelete: 'CASCADE', eager: true })
  @JoinColumn()
  optionId: Option;
}
