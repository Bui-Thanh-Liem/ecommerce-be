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
import { Logger } from '@nestjs/common';

export abstract class BaseEntity implements IBase {
  protected readonly logger = new Logger(this.constructor.name);

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
