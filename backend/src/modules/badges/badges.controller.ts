import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { BadgesService } from './badges.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { TokenPayload, Role, ApiResponse, VerifyBadgeResponse } from '@skillverify/shared';

@Controller('api/badges')
export class BadgesController {
  constructor(private readonly badgesService: BadgesService) {}

  @Get('me')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.APPLICANT, Role.ADMIN)
  async getMyBadges(@CurrentUser() user: TokenPayload): Promise<ApiResponse<any[]>> {
    const badges = await this.badgesService.getMyBadges(user.sub);
    return {
      success: true,
      data: badges,
      timestamp: new Date().toISOString(),
    };
  }

  @Get('verify/:code')
  async verifyBadge(@Param('code') code: string): Promise<ApiResponse<VerifyBadgeResponse>> {
    const verification = await this.badgesService.verifyBadge(code);
    return {
      success: true,
      data: verification,
      message: verification.valid ? 'Cryptographic badge verified successfully' : 'Invalid or expired badge code',
      timestamp: new Date().toISOString(),
    };
  }
}
