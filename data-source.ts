// data-source.ts
import { DataSource } from 'typeorm';

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: 'aws-0-ap-southeast-1.pooler.supabase.com',
  port: 5432,
  username: 'postgres.pancmadrkjqssrpyggob',
  password: 'NuKZG8dxr0l0cycs',
  database: 'postgres',
  ssl: {
    rejectUnauthorized: false,
  },
  entities: ['src/entities/*.entity.ts'],
  migrations: ['src/db/migrations/*.ts'],
  migrationsTableName: 'migrations',
});
