import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-facebook';

interface FacebookProfile {
  id: string;
  name: {
    givenName: string;
    familyName: string;
  };
  emails?: { value: string }[];
}

@Injectable()
export class FacebookStrategy extends PassportStrategy(Strategy, 'facebook') {
  constructor(private readonly configService: ConfigService) {
    super({
      clientID: configService.get('FACEBOOK_CLIENT_ID') || '',
      clientSecret: configService.get('FACEBOOK_CLIENT_SECRET') || '',
      callbackURL: configService.get('FACEBOOK_CALLBACK_URL') || '',
      profileFields: ['id', 'displayName', 'emails'],
    });
  }

  validate(
    accessToken: string,
    refreshToken: string,
    profile: FacebookProfile,
  ): unknown {
    return {
      email: profile.emails?.[0]?.value,
      name: `${profile.name.givenName} ${profile.name.familyName}`,
    };
  }
}
