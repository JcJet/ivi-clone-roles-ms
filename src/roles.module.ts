import { Module } from '@nestjs/common';
import { RolesController } from './roles.controller';
import { RolesService } from './roles.service';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Role } from './roles.entity';
import { UserRoles } from './roles_users.entity';

const databaseHost = process.env.DB_HOST || 'localhost';
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      //envFilePath: '.env',
    }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: databaseHost,
      port: 5432,
      username: 'admin',
      password: 'admin',
      database: 'roles',
      entities: [Role, UserRoles],
      synchronize: true,
    }),
/*    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST,
      port: Number(process.env.POSTGRES_PORT),
      username: process.env.POSTGRES_USER,
      password: process.env.POSTGRES_PASSWORD.toString(),
      database: process.env.POSTGRES_DB,
      entities: [Role, UserRoles],
      synchronize: true,
    }),*/
    TypeOrmModule.forFeature([Role, UserRoles]),
  ],
  controllers: [RolesController],
  providers: [RolesService],
})
export class RolesModule {}
