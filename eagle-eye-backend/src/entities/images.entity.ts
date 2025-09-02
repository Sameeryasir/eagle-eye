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

  @Column({ type: 'varchar', length: 255, nullable: false })
  fileName: string; // ✅ original file name

  @Column({ type: 'decimal', precision: 4, scale: 2, nullable: false })
  size: number;
  // ✅ file size in MB (e.g., 2.45 MB)

  @Column({ type: 'varchar', length: 500, nullable: false })
  imageUrl: string;

  @CreateDateColumn()
  createdAt: Date;

  // Many-to-one relationship with Logs (required)
  @ManyToOne(() => Logs, (log) => log.images, {
    nullable: false, // Required logs
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'log_id' })
  log: Logs;
}
