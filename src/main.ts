/*
 * ######################################################
 * ################# DOCUMENTATION ######################
 * ######################################################
 *
 * ######################################################
 * ######################################################
 * ############ AUTHOR : MUSAH IBRAHIM ALI        #######
 * ############ EMAIL : MUSAHIBRAHIMALI@GMAIL.COM #######
 * ############ PHONE : +233(0)542864498          #######
 * ######################################################
 * ######################################################
 * */

/*
 * ######################################################
 * ################## ALL IMPORTS #######################
 * ######################################################
 * */
import {NestFactory} from '@nestjs/core';
import {ConfigService} from '@nestjs/config';
import {NestExpressApplication} from '@nestjs/platform-express';
import {ValidationPipe, VersioningType} from '@nestjs/common';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import {DocumentBuilder, SwaggerModule} from "@nestjs/swagger";
import csurf from 'csurf';
import {AppModule} from "./app";


/*
 * ######################################################
 * ############### BOOTSTRAP THE APP ####################
 * ######################################################
 * */
async function bootstrap() {
    const app = await NestFactory.create<NestExpressApplication>(AppModule, {
        logger: ['error', 'warn', 'debug', 'verbose'], // 'log'
    });
    const configService = app.get(ConfigService);
    const originUrl = configService.get<string>('ORIGIN_URL');
    /*
    * #################################
    * ############# API VERSION #######
    * #################################
    * */
    const apiVersion = configService.get<string>('API_VERSION');

    /*
    * ######################################################
    * ##################### MIDDLEWARES ####################
    * ######################################################
    * */
    /* ENABLE CORS */
    app.enableCors({
        credentials: true,
        origin: originUrl,
        methods: 'HEAD, GET,POST,PUT,DELETE,PATCH',
    });
    // cookie parser
    app.use(cookieParser());

    /* APP VERSIONING */
    app.enableVersioning({
    type: VersioningType.URI,
    });

    /* USE HELMET TO ADD A SECURITY LAYER */
    app.use(
      helmet({
        contentSecurityPolicy: false,
        crossOriginEmbedderPolicy: false,
      }),
    );

    /*
    * ########################################################
    * ######## PREVENT XSS ATTACKS AND SQL INJECTION #########
    * ########################################################
    * */
    app.use(
      csurf({
        cookie: {
          sameSite: true,
          secure:true,
        }
      }),
    );

    /*
    * ###########################################################
    * #################### USE GLOBAL PIPES #####################
    * ###########################################################
    * */
    app.useGlobalPipes(new ValidationPipe());
    /*
    * ###########################################################
    * ##################### SWAGGER CONFIG ######################
    * ###########################################################
    * */
    const config = new DocumentBuilder()
      .setTitle(`Dream Builder Web App API version ${apiVersion}`)
      .setDescription("This is the backend API interface for the Dream Builder Web App")
      .setVersion(apiVersion)
      .build();
    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api', app, document);

    /*
    * ###########################################################
    * ############## START THE SERVER FOR THE APP ###############
    * ###########################################################
    * */
    const port = configService.get<number>('PORT');
    await app
      .listen(port)
      .then(() => {
        console.log(`Server running on port http://localhost:${port}`);
        console.log(`Swagger running on port http://localhost:${port}/api`);
        console.log('Press CTRL-C to stop server');
      })
      .catch((err) => {
        console.log('There was an error starting server. ', err);
      });
}


/*
* ###########################################################
* #################### BOOTSTRAP THE APP ####################
* ###########################################################
* */
bootstrap().then(() => console.log());
