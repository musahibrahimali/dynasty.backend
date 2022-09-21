import { Injectable } from '@nestjs/common';
import { Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Request } from 'express';
import { jwtConstants } from '@common';
import { AdminsService } from 'src/admin/admins.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
    constructor(private readonly adminsService: AdminsService) {
        super({
            // get access token form request object
            jwtFromRequest: (request: Request) => {
                if (!request || !request.cookies) return null;
                return request.cookies['access_token'];
            },
            ignoreExpiration: false,
            secretOrKey: jwtConstants.secret,
        });
    }

    async validate(payload: any) {
        return await this.adminsService.validateUser(payload);
    }
}