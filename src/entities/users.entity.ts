// src/entities/users.entity.ts
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToOne,
  JoinColumn,
  ManyToOne,
} from 'typeorm';
import { Otps } from './otps.entity';
import { Roles } from './roles.entity';

@Entity()
export class Users {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true, nullable: true }) // email can be null
  email: string;

  @Column({ nullable: true }) // first name can be null
  first_name: string;

  @Column({ nullable: true }) // last name can be null
  last_name: string;

  @Column({ type: 'varchar', length: 11, unique: true, nullable: true }) // phone can be null
  phone: string;

  @OneToOne(() => Otps, (otp) => otp.user)
  otp: Otps;

  @ManyToOne(() => Roles, (role) => role.users)
  @JoinColumn({ name: 'roleId' }) // This will store roleId in Users table
  role: Roles;


}
