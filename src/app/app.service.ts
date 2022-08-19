import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AppService {
  constructor(private configService:ConfigService) {}
  getHello(): {name: string, message: string} {
    const port = this.configService.get<number>('PORT');
    return {
      name: 'Dyansty Urban Style API',
      message: `The api is running and live now. to access the core functionalities, please visit the api documentation by navigating to http://localhost:${port}/api`,
    };
  }
}
