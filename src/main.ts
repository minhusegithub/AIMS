import { NestFactory, Reflector } from '@nestjs/core';
import { AppModule } from './app.module';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import { ConfigService } from '@nestjs/config';
import { ValidationPipe, VersioningType } from '@nestjs/common';
import { TransformInterceptor } from './core/tranform.interceptor';
import cookieParser from 'cookie-parser';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  const configService = app.get(ConfigService);

  // const reflector = app.get(Reflector);
  

  app.useStaticAssets(join(__dirname, '..', 'public'));  
  app.setBaseViewsDir(join(__dirname, '..', 'views'));
  app.setViewEngine('ejs');

  app.useGlobalPipes(new ValidationPipe());
  // app.useGlobalInterceptors(new TransformInterceptor(reflector));
  
  //config cookies 
  app.use(cookieParser());


  //config cors
  app.enableCors({
    origin: true, // Allow all origins in development
    credentials: true, // Allow credentials (cookies)
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  });

  //config versioning
  
  app.enableVersioning({
    type: VersioningType.URI,
    defaultVersion: ['1', '2'],  
  });

  await app.listen(configService.get<string>('PORT'));
}
bootstrap();
