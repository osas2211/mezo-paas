import { NestFactory } from '@nestjs/core'
import { AppModule } from './app.module'
import { env_config } from './lib/config'

async function bootstrap() {
  const app = await NestFactory.create(AppModule)
  app.enableCors({
    origin: ['http://localhost:3000', 'https://mezo-paas-frontend.vercel.app', 'https://github.com', 'http://localhost:8000'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
  app.setGlobalPrefix('api/v1', { exclude: ['/'] })
  await app.listen(env_config.port || 3001)
}
bootstrap()
