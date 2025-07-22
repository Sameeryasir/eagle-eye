import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'aws-0-ap-southeast-1.pooler.supabase.com',
      port: 5432,
      username: 'postgres.pancmadrkjqssrpyggob',
      password: 'Secret@1234',
      database: 'postgres',
      ssl: {
        rejectUnauthorized: false,
      },
      entities: [__dirname + '/entities/*.entity{.ts,.js}'],
      migrations: [__dirname + '/db/migrations/*{.ts,.js}'],
      migrationsTableName: 'migrations',
      synchronize: false,
    }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
