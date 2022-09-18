import { Injectable } from '@nestjs/common';
import { Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Request } from 'express';
import {UserService} from "../user.service";
import {jwtConstants} from "../../common";

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
    constructor(private readonly usersService: UserService) {
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
        return await this.usersService.validateUser(payload);
    }
}