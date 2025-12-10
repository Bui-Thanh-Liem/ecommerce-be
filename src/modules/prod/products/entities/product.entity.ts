import { User } from 'src/modules/users/entities/user.entity';
import { Base } from 'src/shared/entity/Base.entity';
import { generateSlug } from 'src/utils/slug';
import {
  BeforeInsert,
  BeforeUpdate,
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
} from 'typeorm';
import { ProductVariant } from '../../product-variant/entities/product-variant.entity';

@Entity()
@Index(['slug'], { unique: true })
export class Product extends Base {
  @Column()
  name: string;

  @Column()
  slug: string;

  @Column()
  description: string;

  @JoinColumn()
  @ManyToOne(() => User, (u) => u.products)
  userId: User;

  @OneToMany(() => ProductVariant, (pv) => pv.productId, {
    cascade: ['insert', 'update'],
  })
  productVariantIds: ProductVariant[]; // One product has many variants (sku)

  @BeforeInsert()
  @BeforeUpdate()
  generateSlug() {
    if (this.name) {
      this.slug = generateSlug(this.name);
    }
  }
}
