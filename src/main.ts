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
  await app.init();
  await app.startAllMicroservices().then(() => {
    console.log('Roles MS started.');
    console.log('Application variables:');
    for (const var_name of ['RMQ_URL', 'DB_HOST']) {
      console.log(`${var_name}: ${configService.get(var_name)}`);
    }
  });
}
bootstrap();
