import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToOne,
  JoinColumn,
  ManyToOne,
  OneToMany,
} from 'typeorm';
import { Otps } from './otps.entity';
import { Roles } from './roles.entity';
import { Companies } from './companies.entity';
import { Projects } from './projects.entity';
import { Tasks } from './tasks.entity';
import { Logs } from './logs.entity';

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

  @Column({ nullable: true })
  title: string; // e.g. Mr, Ms, Dr

  @Column({ type: 'date', nullable: true })
  dob: Date; // Date of Birth

  @Column({ type: 'varchar', length: 15, unique: true, nullable: true }) // phone can be null
  phone: string;

  @OneToOne(() => Otps, (otp) => otp.user)
  otp: Otps;

  @ManyToOne(() => Roles, (role) => role.users)
  @JoinColumn({ name: 'roleId' }) // This will store roleId in Users table
  role: Roles;

  @ManyToOne(() => Users, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'created_by_user_id' })
  createdBy: Users;

  // Company the user belongs to (nullable only for Admin)
  @ManyToOne(() => Companies, { nullable: true, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'company_id' })
  company: Companies;

  @OneToMany(() => Projects, (project) => project.owner)
  ownedProjects: Projects[];

  @OneToMany(() => Tasks, (task) => task.assignedTo)
  tasks: Tasks[];

  @OneToMany(() => Logs, (log) => log.user)
  logs: Logs[];
}
