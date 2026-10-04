import { Controller, Get, Param, UseGuards, Res } from '@nestjs/common';
import { Response } from 'express';
import { CVService } from './cv.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Role, TokenPayload, ApiResponse, CVResponse } from '@skillverify/shared';

@Controller('api/cv')
@UseGuards(JwtAuthGuard, RolesGuard)
export class CVController {
  constructor(private readonly cvService: CVService) {}

  @Get('preview')
  @Roles(Role.APPLICANT, Role.ADMIN)
  async getMyCVPreview(@CurrentUser() user: TokenPayload): Promise<ApiResponse<any>> {
    const data = await this.cvService.buildCVData(user.sub);
    return {
      success: true,
      data,
      timestamp: new Date().toISOString(),
    };
  }

  @Get('download')
  @Roles(Role.APPLICANT, Role.ADMIN)
  async downloadMyCV(
    @CurrentUser() user: TokenPayload,
    @Res() res: Response,
  ): Promise<void> {
    const { buffer, fileName } = await this.cvService.renderPdf(user.sub);
    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="${fileName}"`,
      'Content-Length': buffer.length,
    });
    res.end(buffer);
  }

  @Get('generate')
  @Roles(Role.APPLICANT, Role.ADMIN)
  async generateMyCV(@CurrentUser() user: TokenPayload): Promise<ApiResponse<CVResponse>> {
    const cv = await this.cvService.generateCV(user.sub);
    return {
      success: true,
      data: cv,
      message: 'CV successfully generated from profile data',
      timestamp: new Date().toISOString(),
    };
  }

  @Get('candidate/:applicantId')
  @Roles(Role.EMPLOYER, Role.ADMIN)
  async getCandidateCV(
    @Param('applicantId') applicantId: string,
    @CurrentUser() user: TokenPayload,
  ): Promise<ApiResponse<CVResponse>> {
    // RULE-013: Employer can only view CV for candidates who passed their jobs
    await this.cvService.verifyCandidateAccess(user, applicantId);
    const cv = await this.cvService.generateCV(applicantId);
    return {
      success: true,
      data: cv,
      timestamp: new Date().toISOString(),
    };
  }

  @Get('candidate/:applicantId/download')
  @Roles(Role.EMPLOYER, Role.ADMIN)
  async downloadCandidateCV(
    @Param('applicantId') applicantId: string,
    @CurrentUser() user: TokenPayload,
    @Res() res: Response,
  ): Promise<void> {
    // RULE-013: Employer can only download CV for candidates who passed their jobs
    await this.cvService.verifyCandidateAccess(user, applicantId);
    const { buffer, fileName } = await this.cvService.renderPdf(applicantId);
    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="${fileName}"`,
      'Content-Length': buffer.length,
    });
    res.end(buffer);
  }
}
