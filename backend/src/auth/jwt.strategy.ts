import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { UserResponseDto } from 'src/user/dto/user-response.dto';
import { blacklistedTokens } from './blacklist';
import type { Request } from 'express';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: 'mySecretKey',
      passReqToCallback: true,
    });
  }

  validate(req: Request, payload: UserResponseDto) {
    const authHeader = req.headers.authorization;

    if (typeof authHeader === 'string') {
      const token = authHeader.split(' ')[1];

      //  BLOCKLIST CHECK
      if (token && blacklistedTokens.has(token)) {
        throw new UnauthorizedException('Token expired');
      }
    }

    return { userId: payload._id, email: payload.email };
  }
}
