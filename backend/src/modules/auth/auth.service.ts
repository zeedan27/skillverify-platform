import { Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { UsersService } from '../users/users.service';
import {
  RegisterApplicantDto,
  RegisterEmployerDto,
  LoginDto,
  ForgotPasswordDto,
  ResetPasswordDto,
  Role,
  TokenPayload,
  AuthTokens,
  UserStatus,
} from '@skillverify/shared';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  async registerApplicant(dto: RegisterApplicantDto): Promise<{ user: any; tokens: AuthTokens }> {
    const user = await this.usersService.create({
      email: dto.email,
      password: dto.password,
      role: Role.APPLICANT,
      fullName: dto.fullName,
      phone: dto.phone,
    });

    const tokens = await this.generateTokens(user._id.toString(), user.email, user.role);
    const { passwordHash, ...safeUser } = user.toObject();
    return { user: safeUser, tokens };
  }

  async registerEmployer(dto: RegisterEmployerDto): Promise<{ user: any; tokens: AuthTokens }> {
    const user = await this.usersService.create({
      email: dto.email,
      password: dto.password,
      role: Role.EMPLOYER,
      companyName: dto.companyName,
      companyWebsite: dto.companyWebsite,
      contactPerson: dto.contactPerson,
      phone: dto.phone,
    });

    const tokens = await this.generateTokens(user._id.toString(), user.email, user.role);
    const { passwordHash, ...safeUser } = user.toObject();
    return { user: safeUser, tokens };
  }

  async login(dto: LoginDto): Promise<{ user: any; tokens: AuthTokens }> {
    const email = (dto.email || '').trim().toLowerCase();
    const user = await this.usersService.findByEmail(email);
    if (!user) {
      throw new UnauthorizedException('Invalid email or password');
    }

    if (user.status === UserStatus.SUSPENDED) {
      throw new UnauthorizedException('Account suspended. Please contact platform administrator.');
    }

    if (user.status === UserStatus.DELETED) {
      throw new UnauthorizedException('This account has been deleted.');
    }

    const isMatch = await bcrypt.compare(dto.password, user.passwordHash);
    if (!isMatch) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const tokens = await this.generateTokens(user._id.toString(), user.email, user.role);
    const { passwordHash, ...safeUser } = user.toObject();
    return { user: safeUser, tokens };
  }

  async refreshToken(refreshToken: string): Promise<AuthTokens> {
    try {
      const refreshSecret =
        this.configService.get<string>('JWT_REFRESH_SECRET') ||
        'skillverify_jwt_refresh_secret_key_2026_cse4181';
      const payload = this.jwtService.verify<TokenPayload>(refreshToken, {
        secret: refreshSecret,
      });

      const user = await this.usersService.findById(payload.sub);
      if (!user || user.status === UserStatus.SUSPENDED) {
        throw new UnauthorizedException('Invalid refresh session');
      }

      return this.generateTokens(user._id.toString(), user.email, user.role);
    } catch {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }
  }

  async forgotPassword(dto: ForgotPasswordDto): Promise<{ message: string; resetToken?: string }> {
    const email = (dto.email || '').trim().toLowerCase();
    const user = await this.usersService.findByEmail(email);
    if (!user) {
      return {
        message: 'If an account exists with that email, a password reset token has been generated.',
      };
    }

    const jwtSecret =
      this.configService.get<string>('JWT_SECRET') ||
      'skillverify_jwt_super_secret_key_2026_cse4181';

    const resetToken = this.jwtService.sign(
      { sub: user._id.toString(), email: user.email, type: 'pwd_reset' },
      { secret: jwtSecret, expiresIn: '15m' },
    );

    return {
      message: 'Password reset token generated. Valid for 15 minutes.',
      resetToken,
    };
  }

  async resetPassword(dto: ResetPasswordDto): Promise<{ message: string }> {
    try {
      const jwtSecret =
        this.configService.get<string>('JWT_SECRET') ||
        'skillverify_jwt_super_secret_key_2026_cse4181';

      const payload = this.jwtService.verify(dto.token, { secret: jwtSecret });
      if (payload.type !== 'pwd_reset' || !payload.sub) {
        throw new BadRequestException('Invalid reset token');
      }

      await this.usersService.resetPassword(payload.sub, dto.newPassword);
      return { message: 'Password has been successfully reset. You may now log in.' };
    } catch (err: any) {
      if (err instanceof BadRequestException) throw err;
      throw new BadRequestException('Reset token has expired or is invalid. Please request a new one.');
    }
  }

  private async generateTokens(userId: string, email: string, role: Role): Promise<AuthTokens> {
    const payload: TokenPayload = { sub: userId, email, role };

    const jwtSecret =
      this.configService.get<string>('JWT_SECRET') ||
      'skillverify_jwt_super_secret_key_2026_cse4181';
    const refreshSecret =
      this.configService.get<string>('JWT_REFRESH_SECRET') ||
      'skillverify_jwt_refresh_secret_key_2026_cse4181';

    const accessToken = this.jwtService.sign(payload, {
      secret: jwtSecret,
      expiresIn: this.configService.get<string>('JWT_EXPIRES_IN') || '15m',
    });

    const refreshToken = this.jwtService.sign(payload, {
      secret: refreshSecret,
      expiresIn: this.configService.get<string>('JWT_REFRESH_EXPIRES_IN') || '7d',
    });

    return { accessToken, refreshToken };
  }
}
