import { Controller, Get, Param } from '@nestjs/common';
import { PublicService } from './public.service';
import { ApiResponse, PublicPortfolio, VerifyBadgeResponse } from '@skillverify/shared';

@Controller('api/public')
export class PublicController {
  constructor(private readonly publicService: PublicService) {}

  @Get('portfolio/:slug')
  async getPublicPortfolio(@Param('slug') slug: string): Promise<ApiResponse<PublicPortfolio>> {
    const portfolio = await this.publicService.getPublicPortfolio(slug);
    return {
      success: true,
      data: portfolio,
      timestamp: new Date().toISOString(),
    };
  }

  @Get('badge/:code')
  async verifyBadge(@Param('code') code: string): Promise<ApiResponse<VerifyBadgeResponse>> {
    const result = await this.publicService.verifyBadge(code);
    return {
      success: true,
      data: result,
      message: result.valid ? 'Verified skill badge authentic' : 'Invalid or expired badge',
      timestamp: new Date().toISOString(),
    };
  }
}
