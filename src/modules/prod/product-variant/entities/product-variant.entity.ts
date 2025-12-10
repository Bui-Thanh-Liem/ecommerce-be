import { Base } from 'src/shared/entity/Base.entity';
import {
  Column,
  Entity,
  Index,
  JoinColumn,
  JoinTable,
  ManyToMany,
  ManyToOne,
} from 'typeorm';
import { OptionValue } from '../../option-value/entities/option-value.entity';
import { Product } from '../../products/entities/product.entity';

@Entity()
@Index(['sku'], { unique: true })
@Index(['productId'])
export class ProductVariant extends Base {
  @Column()
  sku: string;

  @Column('decimal', { precision: 10, scale: 2 })
  price: number;

  @Column()
  stock: number;

  @JoinColumn()
  @ManyToOne(() => Product, { onDelete: 'CASCADE' })
  productId: Product;

  @ManyToMany(() => OptionValue, (ov) => ov.productVariantIds, {
    onDelete: 'CASCADE',
  })
  @JoinTable()
  optionValues: OptionValue[];
}
