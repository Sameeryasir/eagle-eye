import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { Users } from './users.entity';

@Entity('')
export class expoTokens {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  userId: number; // Foreign key to User

  @Column('text')
  expoPushToken: string;

  @Column({
    type: 'enum',
    enum: ['ios', 'android', 'web'],
    default: 'ios'
  })
  platform: 'ios' | 'android' | 'web';

  @Column({ default: 'mobile' })
  deviceType: string;

  @Column({ default: true })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Many-to-One relationship with User
  @ManyToOne(() => Users)
  @JoinColumn({ name: 'userId' })
  user: Users;
}