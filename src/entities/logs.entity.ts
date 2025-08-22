import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';
import { Users } from './users.entity';
import { Tasks } from './tasks.entity';
import { Images } from './images.entity';

@Entity()
export class Logs {
  @PrimaryGeneratedColumn()
  id: number;

  // REPLACED title/description -> note
  @Column({ type: 'text', nullable: true })
  note: string | null;

  @CreateDateColumn()
  createdAt: Date;

  // Many-to-one relationship with Users
  @ManyToOne(() => Users, (user) => user.logs, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'user_id' })
  user: Users;

  // CHANGE: Logs -> Task is now ManyToOne (a task can have many logs)
  @ManyToOne(() => Tasks, (task) => task.logs, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'task_id' })
  task: Tasks;

  // One-to-many relationship with Images (a log can have many images)
  @OneToMany(() => Images, (image) => image.log, { cascade: true })
  images: Images[];
}
