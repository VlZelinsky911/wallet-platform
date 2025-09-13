import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { JwtStrategy } from './jwt.strategy';

@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'supersecret',
      signOptions: {
        expiresIn: process.env.JWT_EXPIRE || '1h',
      },
    }),
  ],
  providers: [JwtStrategy],
  exports: [JwtStrategy, PassportModule],
})
export class AuthModule {}
