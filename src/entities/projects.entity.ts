import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { Users } from './users.entity'; // adjust the path as needed
import { Companies } from './companies.entity';
import { Tasks } from './tasks.entity';

@Entity()
export class Projects {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'timestamptz', nullable: true }) // stores date+time (UTC)
  startDate: Date;

  @Column({ type: 'timestamptz', nullable: true }) // stores date+time (UTC)
  endDate: Date;

  @ManyToOne(() => Users, { nullable: false, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'created_by_user_id' })
  owner: Users;

  @ManyToOne(() => Companies, { nullable: true, onDelete: 'CASCADE' }) // 👈 company relation
  @JoinColumn({ name: 'company_id' })
  company: Companies;

  @OneToMany(() => Tasks, (task) => task.project)
  tasks: Tasks[];

  @CreateDateColumn()
  createdAt: Date;
}
