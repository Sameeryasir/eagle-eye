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

  // Many-to-one relationship with Logs (optional for direct uploads)
  @ManyToOne(() => Logs, (log) => log.images, {
    nullable: true, // Changed to true to allow direct uploads
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'log_id' })
  log?: Logs; // Made optional
}
