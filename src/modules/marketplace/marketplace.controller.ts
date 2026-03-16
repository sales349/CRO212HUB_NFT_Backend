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
import { formatEther } from 'viem';
import { AuthGuard } from '../../common/guards/auth.guard';
import { ZodValidationPipe } from '../../common/pipes/zod-validation.pipe';
import { MarketplaceService } from './marketplace.service';
import { ContractService } from '../contract/contract.service';
import {
    createListingSchema,
    CreateListingDto,
    listListingsQuerySchema,
} from './dto/marketplace.dto';
import { buyPreCheckSchema } from '../contract/dto/buy.dto';

interface AuthenticatedRequest extends FastifyRequest {
    user: { sub: string; iat: number; exp: number };
}

@ApiTags('Marketplace')
@Controller('market')
export class MarketplaceController {
    constructor(
        private readonly marketplaceService: MarketplaceService,
        private readonly contractService: ContractService,
    ) { }

    @Post('list')
    @HttpCode(HttpStatus.CREATED)
    @UseGuards(AuthGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Create a marketplace listing' })
    @ApiResponse({ status: 201, description: 'Listing created' })
    @ApiResponse({ status: 400, description: 'Invalid request body' })
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    async createListing(
        @Body(new ZodValidationPipe(createListingSchema)) body: CreateListingDto,
        @Req() request: AuthenticatedRequest,
    ) {
        const listing = await this.marketplaceService.createListing(body, request.user.sub);
        return {
            success: true,
            listing,
        };
    }

    @Get('listings')
    @ApiOperation({ summary: 'List marketplace listings with filters' })
    @ApiQuery({ name: 'page', required: false, type: Number })
    @ApiQuery({ name: 'limit', required: false, type: Number })
    @ApiQuery({ name: 'sort', required: false, enum: ['newest', 'oldest', 'price_asc', 'price_desc', 'rarity'] })
    @ApiQuery({ name: 'status', required: false, enum: ['active', 'sold', 'cancelled', 'all'] })
    @ApiQuery({ name: 'minPrice', required: false, type: Number })
    @ApiQuery({ name: 'maxPrice', required: false, type: Number })
    @ApiQuery({ name: 'rarityRank', required: false, enum: ['Legendary', 'Epic', 'Rare', 'Uncommon', 'Common'] })
    @ApiQuery({ name: 'seller', required: false, type: String })
    @ApiQuery({ name: 'search', required: false, type: String })
    @ApiResponse({ status: 200, description: 'Listings returned' })
    async getListings(@Query() query: Record<string, string>) {
        const parsed = listListingsQuerySchema.parse(query);
        const result = await this.marketplaceService.getListings(parsed);
        return {
            success: true,
            ...result,
        };
    }

    @Get('listings/:id')
    @ApiOperation({ summary: 'Get a single listing' })
    @ApiResponse({ status: 200, description: 'Listing found' })
    @ApiResponse({ status: 404, description: 'Listing not found' })
    async getListing(@Param('id') id: string) {
        const listing = await this.marketplaceService.getListing(id);
        return {
            success: true,
            listing,
        };
    }

    @Delete('listings/:id')
    @HttpCode(HttpStatus.OK)
    @UseGuards(AuthGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Cancel a listing (owner only)' })
    @ApiResponse({ status: 200, description: 'Listing cancelled' })
    @ApiResponse({ status: 403, description: 'Not the owner or listing not active' })
    @ApiResponse({ status: 404, description: 'Listing not found' })
    async cancelListing(
        @Param('id') id: string,
        @Req() request: AuthenticatedRequest,
    ) {
        await this.marketplaceService.cancelListing(id, request.user.sub);
        return {
            success: true,
            message: 'Listing cancelled',
        };
    }

    @Get('stats')
    @ApiOperation({ summary: 'Get marketplace statistics' })
    @ApiResponse({ status: 200, description: 'Market stats returned' })
    async getStats() {
        const stats = await this.marketplaceService.getMarketStats();
        return {
            success: true,
            stats,
        };
    }

    /**
     * POST /market/buy — Pre-check & fee preview.
     * Does NOT execute the buy transaction. The frontend calls writeContract(buyNFT) directly.
     * This endpoint reads on-chain data and returns fee breakdown for the Buy Modal UI.
     */
    @Post('buy')
    @HttpCode(HttpStatus.OK)
    @UseGuards(AuthGuard)
    @ApiBearerAuth()
    @ApiOperation({
        summary: 'Pre-check & fee preview for buying an NFT',
        description: 'Reads getBuyerTotal and getSellerProceeds from CRO212Marketplace contract. Does NOT execute the buy — frontend calls writeContract(buyNFT) directly.',
    })
    @ApiResponse({ status: 200, description: 'Fee breakdown returned' })
    @ApiResponse({ status: 400, description: 'Invalid listing ID or contract not configured' })
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    async buyPreCheck(
        @Body(new ZodValidationPipe(buyPreCheckSchema)) body: { listingId: number },
    ) {
        if (!this.contractService.isMarketplaceConfigured()) {
            return {
                success: false,
                error: 'Marketplace contract not configured. Set MARKETPLACE_CONTRACT_ADDRESS in .env',
            };
        }

        const listingId = BigInt(body.listingId);

        // Read on-chain data
        const [buyerTotal, sellerProceedsData, onChainListing] = await Promise.all([
            this.contractService.getBuyerTotal(listingId),
            this.contractService.getSellerProceeds(listingId),
            this.contractService.getOnChainListing(listingId),
        ]);

        // Gas estimate (best effort)
        let gasEstimate = '0';
        try {
            gasEstimate = await this.contractService.estimateBuyGas(listingId, buyerTotal);
        } catch {
            // Gas estimation may fail if listing is not active or other issues
        }

        return {
            success: true,
            feeBreakdown: {
                listingId: body.listingId,
                price: onChainListing.price,
                priceRaw: onChainListing.priceRaw,
                buyerTotal: formatEther(buyerTotal),
                buyerTotalRaw: buyerTotal.toString(),
                buyerFee: formatEther(buyerTotal - BigInt(onChainListing.priceRaw)),
                sellerProceeds: sellerProceedsData.sellerProceeds,
                sellerFee: sellerProceedsData.sellerFee,
                royaltyAmount: sellerProceedsData.royaltyAmount,
                royaltyReceiver: sellerProceedsData.royaltyReceiver,
                gasEstimate,
                seller: onChainListing.seller,
                status: onChainListing.status,
            },
        };
    }
}

