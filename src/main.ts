import { NestFactory } from '@nestjs/core';
import { AppModule } from '@app/app.module';
import {ConfigService} from '@nestjs/config';
import { NestExpressApplication } from '@nestjs/platform-express';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import { graphqlUploadExpress } from 'graphql-upload';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    logger: ['error', 'warn', 'debug', 'verbose'], // 'log' // remove log to disable logging
  });
  // app config service
  const configService = app.get(ConfigService);
  const origin = configService.get<string>('FRONTEND_URL');
  // enable CORS
  app.enableCors({
    origin: origin,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    preflightContinue: false,
  });

  // middlewares
  app.use(cookieParser());
  app.use(
    helmet({ 
      contentSecurityPolicy: false, 
      crossOriginEmbedderPolicy: false 
    })
  );

  app.useGlobalPipes(new ValidationPipe());
  const config = new DocumentBuilder()
  .setTitle("Dynasty Urban Style Web App API version 1.0.0")
  .setDescription("This is the backend API interface for the Dynasty Urban Style Web App")
  .setVersion('1.0.0')
  .build();

  // graphql file upload
  app.use(graphqlUploadExpress({
    maxFileSize: 1000000000, // 1GB
    maxFiles: 10  // the maximum number of files per upload
  }));

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  // get the port from the config file
  const port = configService.get<number>('PORT');
  await app.listen(port).then(() => {
    console.log(`Server running on port http://localhost:${port}`);
    console.log(`Swagger running on port http://localhost:${port}/api`);
    console.log(`GraphQl running on port http://localhost:${port}/graphql`);
    console.log("Press CTRL-C to stop server");
  }).catch((err) => {
    console.log("There was an error starting server. ", err);
  });
}

// start the application
bootstrap().then(() => console.log());
