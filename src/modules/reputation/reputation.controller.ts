import {
    Controller,
    Get,
    Query,
    BadRequestException,
} from '@nestjs/common';
import {
    ApiTags,
    ApiOperation,
    ApiResponse,
    ApiQuery,
} from '@nestjs/swagger';
import { ReputationService } from './reputation.service';
import { getReputationQuerySchema } from './dto/reputation.dto';

@ApiTags('Reputation')
@Controller('wallet')
export class ReputationController {
    constructor(private readonly reputationService: ReputationService) { }

    @Get('reputation')
    @ApiOperation({ summary: 'Get wallet reputation score and activity' })
    @ApiQuery({ name: 'address', required: true, type: String, description: '0x-prefixed wallet address' })
    @ApiResponse({ status: 200, description: 'Reputation data returned' })
    @ApiResponse({ status: 400, description: 'Invalid address format' })
    async getReputation(@Query() query: Record<string, string>) {
        const result = getReputationQuerySchema.safeParse(query);
        if (!result.success) {
            throw new BadRequestException(result.error.issues.map(i => i.message).join(', '));
        }

        const reputation = await this.reputationService.getReputation(result.data.address);
        return {
            success: true,
            reputation: {
                walletAddress: reputation.walletAddress,
                reputationScore: reputation.reputationScore,
                totalMints: reputation.totalMints,
                totalSales: reputation.totalSales,
                totalPurchases: reputation.totalPurchases,
                totalListings: reputation.totalListings,
                totalVolume: reputation.totalVolume,
                lastActivity: reputation.lastActivity,
            },
        };
    }
}
