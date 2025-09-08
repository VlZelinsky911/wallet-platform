import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-jwt';
import type { Request } from 'express';
import type { JwtPayload } from './types/jwt-payload';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    const jwtSecret: string | undefined = process.env.JWT_SECRET;
    if (!jwtSecret || jwtSecret.trim().length === 0) {
      throw new Error(
        'JWT_SECRET is not set. Please configure environment variable JWT_SECRET.',
      );
    }

    const jwtFromAuthHeader = (req: Request): string | null => {
      const authHeader: string | undefined = req.headers?.authorization;
      if (!authHeader) return null;
      const [scheme, token] = authHeader.split(' ');
      if (!scheme || scheme.toLowerCase() !== 'bearer') return null;
      return token ?? null;
    };

    super({
      jwtFromRequest: jwtFromAuthHeader,
      secretOrKey: jwtSecret,
      ignoreExpiration: false,
    });
  }
  validate(payload: JwtPayload): { userId: string; roles: string[] } {
    return { userId: payload.sub, roles: payload.roles };
  }
}
