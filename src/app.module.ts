// app.module.ts
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config'; // 👈 ADD THIS
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { Users } from './entities/users.entity';
import { Roles } from './entities/roles.entity';
import { UserModule } from './user/user.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }), // 👈 ADD THIS
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST,
      port: parseInt(process.env.DB_PORT || '5432', 10),
      username: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
      entities: [__dirname + '/entities/*.entity{.ts,.js}'],
      migrations: [__dirname + '/db/migrations/*{.ts,.js}'],
      migrationsTableName: 'migrations',
      synchronize: false,
    }),
    AuthModule,
    UserModule,

  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
