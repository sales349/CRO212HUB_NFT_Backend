import {
    Controller,
    Post,
    Get,
    Delete,
    Body,
    Param,
    Query,
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
    ApiQuery,
} from '@nestjs/swagger';
import { FastifyRequest } from 'fastify';
import { AuthGuard } from '../../common/guards/auth.guard';
import { ZodValidationPipe } from '../../common/pipes/zod-validation.pipe';
import { VaultService } from './vault.service';
import {
    savePresetSchema,
    SavePresetDto,
    remixPresetSchema,
    RemixPresetDto,
    listPresetsQuerySchema,
} from './dto/save-preset.dto';

interface AuthenticatedRequest extends FastifyRequest {
    user: { sub: string; iat: number; exp: number };
}

@ApiTags('Vault')
@Controller('vault')
@UseGuards(AuthGuard)
@ApiBearerAuth()
export class VaultController {
    constructor(private readonly vaultService: VaultService) { }

    @Post('save-preset')
    @HttpCode(HttpStatus.CREATED)
    @ApiOperation({ summary: 'Save preset to vault' })
    @ApiResponse({ status: 201, description: 'Preset saved' })
    @ApiResponse({ status: 400, description: 'Invalid request body' })
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    async savePreset(
        @Body(new ZodValidationPipe(savePresetSchema)) body: SavePresetDto,
        @Req() request: AuthenticatedRequest,
    ) {
        const preset = await this.vaultService.savePreset(body, request.user.sub);
        return {
            success: true,
            preset,
        };
    }

    @Get('presets')
    @ApiOperation({ summary: 'List user presets' })
    @ApiQuery({ name: 'page', required: false, type: Number })
    @ApiQuery({ name: 'limit', required: false, type: Number })
    @ApiQuery({ name: 'sort', required: false, enum: ['newest', 'oldest', 'rarity'] })
    @ApiResponse({ status: 200, description: 'Presets listed' })
    async listPresets(
        @Query() query: Record<string, string>,
        @Req() request: AuthenticatedRequest,
    ) {
        const parsed = listPresetsQuerySchema.parse(query);
        const result = await this.vaultService.listPresets(request.user.sub, parsed);
        return {
            success: true,
            ...result,
        };
    }

    @Get('presets/:id')
    @ApiOperation({ summary: 'Get single preset' })
    @ApiResponse({ status: 200, description: 'Preset found' })
    @ApiResponse({ status: 404, description: 'Preset not found' })
    async getPreset(@Param('id') id: string) {
        const preset = await this.vaultService.getPreset(id);
        return {
            success: true,
            preset,
        };
    }

    @Delete('presets/:id')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Delete preset (owner only)' })
    @ApiResponse({ status: 200, description: 'Preset deleted' })
    @ApiResponse({ status: 403, description: 'Not the owner' })
    @ApiResponse({ status: 404, description: 'Preset not found' })
    async deletePreset(
        @Param('id') id: string,
        @Req() request: AuthenticatedRequest,
    ) {
        await this.vaultService.deletePreset(id, request.user.sub);
        return {
            success: true,
            message: 'Preset deleted',
        };
    }

    @Post('remix')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Remix existing preset with trait modifications' })
    @ApiResponse({ status: 200, description: 'Remix generated' })
    @ApiResponse({ status: 404, description: 'Source preset not found' })
    async remixPreset(
        @Body(new ZodValidationPipe(remixPresetSchema)) body: RemixPresetDto,
        @Req() request: AuthenticatedRequest,
    ) {
        const result = await this.vaultService.remixPreset(body, request.user.sub);
        return {
            success: true,
            ...result,
        };
    }

    @Get('presets/:id/avatar')
    @ApiOperation({ summary: 'Get avatar-optimized preset data' })
    @ApiResponse({ status: 200, description: 'Avatar data returned' })
    @ApiResponse({ status: 404, description: 'Preset not found' })
    async getAvatarData(@Param('id') id: string) {
        const data = await this.vaultService.getAvatarData(id);
        return {
            success: true,
            ...data,
        };
    }
}