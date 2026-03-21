import {
    Controller,
    Get,
    Param,
} from '@nestjs/common';
import {
    ApiTags,
    ApiOperation,
    ApiResponse,
    ApiParam,
} from '@nestjs/swagger';
import { TelegramService } from './telegram.service';

@ApiTags('Telegram')
@Controller('telegram')
export class TelegramController {
    constructor(private readonly telegramService: TelegramService) { }

    @Get('user-context/:telegramId')
    @ApiOperation({ summary: 'Get aggregated user context for a Telegram ID' })
    @ApiParam({ name: 'telegramId', type: String, description: 'Telegram user ID' })
    @ApiResponse({ status: 200, description: 'User context returned' })
    @ApiResponse({ status: 404, description: 'No wallet linked for this Telegram ID' })
    async getUserContext(@Param('telegramId') telegramId: string) {
        const context = await this.telegramService.getUserContext(telegramId);
        return {
            success: true,
            context,
        };
    }
}
