import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Logs } from './logs.entity';

@Entity()
export class Images {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 500, nullable: false })
  imageUrl: string;

  @CreateDateColumn()
  createdAt: Date;

  // Many-to-one relationship with Logs
  @ManyToOne(() => Logs, (log) => log.images, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'log_id' })
  log: Logs;
}
