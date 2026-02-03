import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Profile, Strategy } from 'passport-facebook';

@Injectable()
export class FacebookStrategy extends PassportStrategy(Strategy, 'facebook') {
    constructor(config: ConfigService) {
        super({
            clientID: config.getOrThrow<string>('FACEBOOK_APP_ID'),
            clientSecret: config.getOrThrow<string>('FACEBOOK_APP_SECRET'),
            callbackURL: config.getOrThrow<string>('FACEBOOK_CALLBACK_URL'),
            scope: ['email', 'public_profile'],
            profileFields: ['id', 'emails', 'name', 'photos'],
        });
    }

    async validate(
        accessToken: string,
        refreshToken: string,
        profile: Profile,
        done: (err: any, user: any, info?: any) => void,
    ): Promise<any> {
        const { name, emails, id, photos } = profile;
        const user = {
            email: emails && emails[0] ? emails[0].value : null,
            firstName: name?.givenName,
            lastName: name?.familyName,
            picture: photos && photos[0] ? photos[0].value : null,
            facebookId: id,
            accessToken,
        };
        done(null, user);
    }
}
