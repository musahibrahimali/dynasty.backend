
import { PassportStrategy } from '@nestjs/passport';
import { Profile, Strategy } from "passport-facebook";
import { config } from 'dotenv';
import { Injectable } from '@nestjs/common';
import {UserService} from "@user/user.service";

config();

@Injectable()
export class FacebookStrategy  extends PassportStrategy(Strategy, 'facebook') {

    constructor(private usersService: UserService) {
        super({
            clientID: process.env.FACEBOOK_APP_ID,
            clientSecret: process.env.FACEBOOK_APP_SECRET,
            callbackURL: process.env.FACEBOOK_CALLBACK_URL,
            scope: "email",
            profileFields: ["emails", "name"],
        });
    }

    async validate (accessToken: string, refreshToken: string, profile: Profile, done: any): Promise<any> {
        const { name, emails, photos, id } = profile;
        const user = {
            socialId: id,
            username: emails[0].value,
            email: emails[0].value,
            firstName: name.givenName,
            lastName: name.familyName,
            picture: photos[0].value,
        }
        // check if user already exists in our db, if not create a new user
        const _user = await this.usersService.validateSocialUser(id, user);
        done(null, _user);
    }
}