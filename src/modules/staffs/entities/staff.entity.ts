import { StoreEntity } from 'src/modules/stores/entities/store.entity';
import { BaseEntity } from 'src/shared/entities/base.entity';
import { IStaff } from 'src/shared/interfaces/models/staff.interface';
import { Column, Entity, ManyToOne } from 'typeorm';

@Entity('staffs')
export class StaffEntity extends BaseEntity implements IStaff {
  @Column({ nullable: true })
  fullName: string;

  @Column({ unique: true })
  phone: string;

  @Column({ unique: true })
  email: string;

  @Column()
  password: string;

  @Column('simple-array')
  roles: string[];

  @ManyToOne(() => StoreEntity, (store) => store.id, { nullable: true }) // superAdmin thì null
  store: StoreEntity | null; //  1 Staff thì thuộc 1 Store, còn Store có thể có nhiều Staff, superAdmin thì null

  @Column({ default: true })
  isActive: boolean;

  @Column({ default: false })
  isAdmin: boolean;

  logInsert() {
    console.log(`Đã chèn thành công Staff có Email: ${this.email}`);
  }

  logUpdate(): void {
    console.log(`Đã cập nhật thành công Staff có Email: ${this.email}`);
  }

  logRemove(): void {
    console.log(`Đã xóa thành công Staff có Email: ${this.email}`);
  }
}
