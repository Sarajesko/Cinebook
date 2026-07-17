import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { resolveJwtSecret } from './jwt-secret';

export type JwtPayload = {
  sub: string;
  handle: string;
};

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(config: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: resolveJwtSecret(config.get<string>('JWT_SECRET')),
    });
  }

  validate(payload: JwtPayload) {
    return { userId: payload.sub, handle: payload.handle };
  }
}
