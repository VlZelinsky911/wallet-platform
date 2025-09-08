import { Injectable, UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';

@Injectable()
export class AuthService {
  constructor(
    private users: UsersService,
    private jwt: JwtService,
  ) {}
  async register(email: string, password: string, name?: string) {
    const exists = await this.users.findByEmail(email);
    if (exists) throw new UnauthorizedException('Email already in use');
    const passwordHash = await bcrypt.hash(password, 10);
    const u = await this.users.createUser(email, passwordHash, name);
    const token = this.jwt.sign({ sub: u._id, roles: u.roles });
    return { accessToken: token, userId: String(u._id), roles: u.roles };
  }
  async login(email: string, password: string) {
    const u = await this.users.findByEmail(email);
    if (!u) throw new UnauthorizedException('Invalid credentials');
    const ok = await bcrypt.compare(password, u.passwordHash);
    if (!ok) throw new UnauthorizedException('Invalid credentials');
    const token = this.jwt.sign({ sub: u._id, roles: u.roles });
    return { accessToken: token, userId: String(u._id), roles: u.roles };
  }
}
