import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { QuizGeneratorService } from './quiz-generator.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import {
  TokenPayload,
  Role,
  GenerateQuizAiDto,
  GeneratedQuizResponse,
  ApiResponse,
} from '@skillverify/shared';

@Controller('api/ai')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AiController {
  constructor(private readonly quizGeneratorService: QuizGeneratorService) {}

  @Post('generate-quiz')
  @Roles(Role.EMPLOYER, Role.ADMIN)
  async generateQuiz(
    @CurrentUser() user: TokenPayload,
    @Body() dto: GenerateQuizAiDto,
  ): Promise<ApiResponse<GeneratedQuizResponse>> {
    const response = await this.quizGeneratorService.generateQuestions(user, dto);
    return {
      success: true,
      data: response,
      message: `Successfully generated ${response.questions.length} questions via ${response.source}`,
      timestamp: new Date().toISOString(),
    };
  }
}
