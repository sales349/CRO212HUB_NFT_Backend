import {
    Controller,
    Post,
    Body,
    UseGuards,
    Req,
    HttpCode,
    HttpStatus,
} from '@nestjs/common';
import {
    ApiTags,
    ApiOperation,
    ApiBearerAuth,
    ApiResponse,
} from '@nestjs/swagger';
import { FastifyRequest } from 'fastify';
import { ZodValidationPipe } from '../../common/pipes/zod-validation.pipe';
import { AuthGuard } from '../../common/guards/auth.guard';
import { GeneratorService } from './generator.service';
import {
    generateRequestSchema,
    GenerateRequestDto,
    GenerateResponseDto,
} from './schemas/generate.schema';

interface AuthenticatedRequest extends FastifyRequest {
    user: { sub: string; iat: number; exp: number };
}

@ApiTags('AI Generation')
@Controller('api/ai/intelligent-layer')
export class GeneratorController {
    constructor(private readonly generatorService: GeneratorService) { }

    @Post('v1/generate')
    @HttpCode(HttpStatus.OK)
    @UseGuards(AuthGuard)
    @ApiBearerAuth()
    @ApiOperation({
        summary: 'Generate NFT',
        description: 'Generate a new NFT with specified traits. Uploads image and metadata to IPFS.',
    })
    @ApiResponse({ status: 200, description: 'NFT generated successfully' })
    @ApiResponse({ status: 400, description: 'Invalid request body or trait values' })
    @ApiResponse({ status: 401, description: 'Missing or invalid JWT token' })
    async generate(
        @Body(new ZodValidationPipe(generateRequestSchema)) body: GenerateRequestDto,
        @Req() request: AuthenticatedRequest,
    ): Promise<GenerateResponseDto> {
        return this.generatorService.generate(body, request.user.sub);
    }
}