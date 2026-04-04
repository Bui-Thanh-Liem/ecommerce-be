import {
  AfterInsert,
  AfterRemove,
  AfterUpdate,
  CreateDateColumn,
  DeleteDateColumn,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
  VersionColumn,
} from 'typeorm';
import { IBase } from '../interfaces/base.interface';

export abstract class BaseEntity implements IBase {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @DeleteDateColumn({ type: 'timestamp' })
  deletedAt: Date | null;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt: Date;

  @VersionColumn()
  version: number;

  @AfterInsert()
  handlerAfterInsert() {
    this.logInsert();
  }

  @AfterUpdate()
  handlerAfterUpdate() {
    this.logUpdate();
  }

  @AfterRemove()
  handlerAfterRemove() {
    this.logRemove();
  }

  abstract logInsert(): void;
  abstract logUpdate(): void;
  abstract logRemove(): void;
}
