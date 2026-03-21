import {
    Controller,
    Get,
    Post,
    Body,
    UseGuards,
    HttpCode,
    HttpStatus,
} from '@nestjs/common';
import {
    ApiTags,
    ApiOperation,
    ApiBearerAuth,
    ApiResponse,
} from '@nestjs/swagger';
import { AuthGuard } from '../../common/guards/auth.guard';
import { AdminGuard } from '../../common/guards/admin.guard';
import { ZodValidationPipe } from '../../common/pipes/zod-validation.pipe';
import { FeatureFlagsService } from './feature-flags.service';
import { toggleFlagSchema, ToggleFlagDto } from './dto/feature-flags.dto';

@ApiTags('Feature Flags')
@Controller('feature-flags')
export class FeatureFlagsController {
    constructor(private readonly featureFlagsService: FeatureFlagsService) { }

    @Get()
    @ApiOperation({ summary: 'Get all feature flag states' })
    @ApiResponse({ status: 200, description: 'All flags returned' })
    async getAll() {
        const flags = await this.featureFlagsService.getAll();
        return {
            success: true,
            flags,
        };
    }

    @Post('toggle')
    @HttpCode(HttpStatus.OK)
    @UseGuards(AuthGuard, AdminGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Toggle a feature flag (admin only)' })
    @ApiResponse({ status: 200, description: 'Flag toggled' })
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    @ApiResponse({ status: 403, description: 'Admin access required' })
    async toggle(
        @Body(new ZodValidationPipe(toggleFlagSchema)) body: ToggleFlagDto,
    ) {
        const result = await this.featureFlagsService.toggle(body.name);
        return {
            success: true,
            flag: result,
        };
    }
}
