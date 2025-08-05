import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToOne,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { Users } from './users.entity';
import { Projects } from './projects.entity';

@Entity()
export class Companies {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;


  @Column({ nullable: true })
  address: string;

  @Column({ nullable: true })
  city: string;

  @Column({ nullable: true })
  state: string; // e.g. NY, TX, CA

  @Column({ default: 'USA' })
  country: string;

  @OneToOne(() => Users, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'owner_user_id' })
  owner: Users;

  @OneToMany (()=> Projects,(project)=>project.company)
  projects:Projects[]
}
