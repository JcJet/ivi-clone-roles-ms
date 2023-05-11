import { NestFactory } from '@nestjs/core';
import { RolesModule } from './roles.module';
import { Transport } from '@nestjs/microservices';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
  const app = await NestFactory.create(RolesModule);
  const configService = app.get(ConfigService);
  app.connectMicroservice({
    transport: Transport.RMQ,
    options: {
      urls: [configService.get('RMQ_URL')],
      queue: 'toRolesMs',
      queueOptions: {
        durable: false,
      },
    },
  });
  await app.startAllMicroservices();
}
bootstrap();
