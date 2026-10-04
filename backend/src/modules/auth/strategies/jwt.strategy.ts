import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { TokenPayload } from '@skillverify/shared';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_SECRET') || 'skillverify_jwt_super_secret_key_2026_cse4181',
    });
  }

  async validate(payload: TokenPayload): Promise<TokenPayload> {
    if (!payload || !payload.sub) {
      throw new UnauthorizedException('Invalid token payload');
    }
    return payload;
  }
}
