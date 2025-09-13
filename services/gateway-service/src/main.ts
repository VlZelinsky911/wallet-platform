import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // Enable CORS for development
  app.enableCors({
    origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000'],
    credentials: true,
  });
  
  await app.listen(process.env.PORT ?? 4000);
  console.log(`🚀 Gateway service is running on: http://localhost:${process.env.PORT ?? 4000}/graphql`);
}

void bootstrap();
