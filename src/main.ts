import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { AppModule } from './app.module';
import { initializeTransactionalContext, StorageDriver } from 'typeorm-transactional';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { SwaggerConfig } from './configs/config.interface';
import loggerConfig from './configs/logger.config';
import helmet from 'helmet';

async function bootstrap() {
  initializeTransactionalContext({ storageDriver: StorageDriver.AUTO });
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    logger: loggerConfig,
  });

  app.setGlobalPrefix('api');
  app.enableCors({
    origin: true,
    credentials: true,
  });
  app.use(helmet());
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      validationError: {
        target: false,
        value: false,
      },
      transformOptions: { enableImplicitConversion: true },
      stopAtFirstError: true,
    }),
  );

  const configService = app.get(ConfigService);

  const swaggerConfig = configService.getOrThrow<SwaggerConfig>('swagger');
  const { enabled, title, description, version, path, swaggerOptions } = swaggerConfig;
  if (enabled) {
    const swagger = new DocumentBuilder()
      .setTitle(title)
      .setDescription(description)
      .setVersion(version)
      .build();
    const documentFactory = () => SwaggerModule.createDocument(app, swagger);
    SwaggerModule.setup(path, app, documentFactory, { swaggerOptions });
  }

  const port = configService.getOrThrow<number>('port');
  await app.listen(port);
  console.info(`Server is listening ${port}`);
}

bootstrap();
