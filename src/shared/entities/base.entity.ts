import { Logger } from '@nestjs/common';
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
import { IBase } from '../interfaces/common/base.interface';

export abstract class BaseEntity implements IBase {
  protected readonly logger = new Logger(this.constructor.name);

  @PrimaryGeneratedColumn('uuid')
  id: string;

  @DeleteDateColumn({ type: 'timestamp' })
  deletedAt: Date | null;

  @CreateDateColumn({ type: 'timestamp', name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp', name: 'updated_at' })
  updatedAt: Date;

  @VersionColumn()
  version: number;

  @AfterInsert()
  handlerAfterInsert(): void {
    this.logInsert();
  }

  @AfterUpdate()
  handlerAfterUpdate(): void {
    this.logUpdate();
  }

  @AfterRemove()
  handlerAfterRemove(): void {
    this.logRemove();
  }

  abstract logInsert(): void;
  abstract logUpdate(): void;
  abstract logRemove(): void;
}
