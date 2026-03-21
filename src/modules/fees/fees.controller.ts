import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

// Fee model constants — match specs_extraction.md
const FEE_MODEL = {
    primaryMint: {
        platformFee: 0.02,
        description: '2% deducted from creator proceeds → treasury wallet',
        buyerPays: 'Clean listed price (no add-on)',
    },
    secondarySale: {
        buyerFee: 0.03,
        sellerFee: 0.03,
        totalPlatform: 0.06,
        description: '3% buyer add-on at checkout + 3% seller deduction from proceeds',
    },
    royalties: {
        default: 0.05,
        range: [0, 0.10],
        standard: 'EIP-2981',
        description: 'Creator royalties deducted from seller proceeds → creator wallet',
    },
    treasurySplits: {
        liquidity: 0.02,
        treasuryYield: 0.02,
        hubBuybacks: 0.02,
        description: 'Supports liquidity 2%, treasury/yield vault 2%, $HUB buybacks 2%',
    },
} as const;

@ApiTags('Fees')
@Controller('fees')
export class FeesController {
    @Get('info')
    @ApiOperation({ summary: 'Get current fee rates and splits' })
    @ApiResponse({ status: 200, description: 'Fee model returned' })
    getFeesInfo() {
        return {
            success: true,
            fees: FEE_MODEL,
        };
    }
}
