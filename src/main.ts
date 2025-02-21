import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import helmet from 'helmet';
import { displayName, version } from '../package.json';
import { AppModule } from './app.module';
import { logger, microserviceConfig } from './common';
import { setupConfig } from './common/config';
import {
  GeneralExceptionFilter,
  NotFoundExceptionFilter,
} from './common/exception-filters';

async function bootstrap() {
  const error = await setupConfig();
  if (error) return logger.log(error);

  const app = await NestFactory.create(AppModule, { logger });

  app.connectMicroservice(microserviceConfig);
  await app.startAllMicroservices();

  app.useGlobalFilters(
    new GeneralExceptionFilter(),
    new NotFoundExceptionFilter(),
  );

  app.enableCors({ credentials: true });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  );

  const doc = new DocumentBuilder()
    .addBearerAuth(
      { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' },
      'jwt',
    )
    .setTitle(`${displayName} API Reference`)
    .setVersion(version)
    .build();

  SwaggerModule.setup(
    '/api-documentation',
    app,
    SwaggerModule.createDocument(app, doc),
  );

  app.use(helmet());

  const port = 5354;

  await app.listen(port);

  logger.log(`${displayName} is running on http://localhost:${port}`);
  logger.log(`Documentation on http://localhost:${port}/api-documentation`);
}
bootstrap();
