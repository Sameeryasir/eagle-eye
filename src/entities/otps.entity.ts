// src/entities/otps.entity.ts
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToOne,
  JoinColumn,
  CreateDateColumn,
} from 'typeorm';
import { Users } from './users.entity';

@Entity()
export class Otps {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  code: string;

  @Column({ default: false })
  isUsed: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @OneToOne(() => Users, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' }) 
  user: Users;
} 