import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { TelegramMapping, TelegramMappingDocument } from './schemas/telegram-mapping.schema';
import { ReputationService } from '../reputation/reputation.service';

@Injectable()
export class TelegramService {
    private readonly logger = new Logger(TelegramService.name);

    constructor(
        @InjectModel(TelegramMapping.name) private readonly telegramModel: Model<TelegramMappingDocument>,
        private readonly reputationService: ReputationService,
    ) { }

    /**
     * Get aggregated user context for a Telegram ID
     * Returns wallet, reputation, and basic activity summary
     */
    async getUserContext(telegramId: string) {
        const mapping = await this.telegramModel.findOne({ telegramId }).exec();

        if (!mapping) {
            throw new NotFoundException(`No wallet linked for Telegram ID: ${telegramId}`);
        }

        const reputation = await this.reputationService.getReputation(mapping.walletAddress);

        this.logger.log(`Telegram context retrieved for ${telegramId} → ${mapping.walletAddress}`);

        return {
            telegramId,
            walletAddress: mapping.walletAddress,
            username: mapping.username,
            reputation: {
                score: reputation.reputationScore,
                totalMints: reputation.totalMints,
                totalSales: reputation.totalSales,
                totalPurchases: reputation.totalPurchases,
                totalListings: reputation.totalListings,
                totalVolume: reputation.totalVolume,
            },
        };
    }

    /**
     * Link a Telegram ID to a wallet address (used by bot integration)
     */
    async linkWallet(telegramId: string, walletAddress: string, username?: string) {
        const mapping = await this.telegramModel.findOneAndUpdate(
            { telegramId },
            { walletAddress: walletAddress.toLowerCase(), username },
            { upsert: true, new: true },
        ).exec();

        this.logger.log(`Linked Telegram ${telegramId} → ${walletAddress}`);
        return mapping;
    }
}
