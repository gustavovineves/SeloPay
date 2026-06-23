import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { join } from 'path';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  // Serve uploaded files at /uploads/* (outside the /api prefix)
  app.useStaticAssets(join(__dirname, '..', '..', 'uploads'), { prefix: '/uploads' });

  app.setGlobalPrefix('api');

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );

  app.useGlobalFilters(new HttpExceptionFilter());

  const origins = process.env.CORS_ORIGINS?.split(',') ?? [
    'http://localhost:3000',
    'http://localhost:19006',
  ];
  app.enableCors({ origin: origins, credentials: true });

  const config = new DocumentBuilder()
    .setTitle('SeloPay API')
    .setDescription('API do SeloPay — Fintech de acordos digitais simulados')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  SwaggerModule.setup('docs', app, SwaggerModule.createDocument(app, config));

  const port = process.env.PORT ?? 3333;
  await app.listen(port);
  console.log(`\n🚀 SeloPay API → http://localhost:${port}/api`);
  console.log(`📚 Docs         → http://localhost:${port}/docs\n`);
}

bootstrap();
