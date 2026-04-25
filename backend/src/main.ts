import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { env_config } from './lib/config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors();
  app.setGlobalPrefix('api/v1', { exclude: ['/'] });
  await app.listen(env_config.port || 3001);
}
bootstrap();
