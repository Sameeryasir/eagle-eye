import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  OneToMany,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Users } from './users.entity';
import { Tasks } from './tasks.entity';
import { Images } from './images.entity';

@Entity()
export class Logs {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'text', nullable: true })
  note: string | null;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @ManyToOne(() => Users, (user) => user.logs, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'user_id' })
  user: Users;

  // CHANGED: one Log -> many Tasks
  @OneToMany(() => Tasks, (task) => task.log)
  tasks: Tasks[];

  // unchanged: one Log -> many Images
  @OneToMany(() => Images, (image) => image.log, { cascade: true })
  images: Images[];
}
