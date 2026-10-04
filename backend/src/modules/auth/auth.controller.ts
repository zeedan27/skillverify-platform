import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { AuthService } from './auth.service';
import {
  RegisterApplicantDto,
  RegisterEmployerDto,
  LoginDto,
  ForgotPasswordDto,
  ResetPasswordDto,
  ApiResponse,
  AuthTokens,
} from '@skillverify/shared';

@Controller('api/auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register/applicant')
  async registerApplicant(
    @Body() dto: RegisterApplicantDto,
  ): Promise<ApiResponse<{ user: any; tokens: AuthTokens }>> {
    const result = await this.authService.registerApplicant(dto);
    return {
      success: true,
      data: result,
      message: 'Applicant registered successfully',
      timestamp: new Date().toISOString(),
    };
  }

  @Post('register/employer')
  async registerEmployer(
    @Body() dto: RegisterEmployerDto,
  ): Promise<ApiResponse<{ user: any; tokens: AuthTokens }>> {
    const result = await this.authService.registerEmployer(dto);
    return {
      success: true,
      data: result,
      message: 'Employer registered successfully',
      timestamp: new Date().toISOString(),
    };
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() dto: LoginDto): Promise<ApiResponse<{ user: any; tokens: AuthTokens }>> {
    const result = await this.authService.login(dto);
    return {
      success: true,
      data: result,
      message: 'Login successful',
      timestamp: new Date().toISOString(),
    };
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  async refresh(
    @Body('refreshToken') refreshToken: string,
  ): Promise<ApiResponse<AuthTokens>> {
    const tokens = await this.authService.refreshToken(refreshToken);
    return {
      success: true,
      data: tokens,
      timestamp: new Date().toISOString(),
    };
  }

  @Post('forgot-password')
  @HttpCode(HttpStatus.OK)
  async forgotPassword(@Body() dto: ForgotPasswordDto): Promise<ApiResponse<any>> {
    const result = await this.authService.forgotPassword(dto);
    return {
      success: true,
      data: result,
      message: result.message,
      timestamp: new Date().toISOString(),
    };
  }

  @Post('reset-password')
  @HttpCode(HttpStatus.OK)
  async resetPassword(@Body() dto: ResetPasswordDto): Promise<ApiResponse<any>> {
    const result = await this.authService.resetPassword(dto);
    return {
      success: true,
      data: null,
      message: result.message,
      timestamp: new Date().toISOString(),
    };
  }
}
