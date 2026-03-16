import { Injectable, Logger, Inject } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import Redis from 'ioredis';
import { Reputation, ReputationDocument } from './schemas/reputation.schema';
import { REDIS_CLIENT } from '../../redis/redis.module';

export type ActivityType = 'mint' | 'sale' | 'purchase' | 'listing';

const CACHE_TTL = 300; // 5 minutes
const CACHE_PREFIX = 'rep:';

@Injectable()
export class ReputationService {
    private readonly logger = new Logger(ReputationService.name);

    constructor(
        @InjectModel(Reputation.name) private readonly reputationModel: Model<ReputationDocument>,
        @Inject(REDIS_CLIENT) private readonly redis: Redis,
    ) { }

    async getReputation(walletAddress: string): Promise<ReputationDocument> {
        const address = walletAddress.toLowerCase();

        // Check Redis cache
        const cached = await this.redis.get(`${CACHE_PREFIX}${address}`);
        if (cached) {
            return JSON.parse(cached);
        }

        // Fetch from DB or create default
        let reputation = await this.reputationModel.findOne({ walletAddress: address }).exec();

        if (!reputation) {
            reputation = new this.reputationModel({
                walletAddress: address,
                totalMints: 0,
                totalSales: 0,
                totalPurchases: 0,
                totalVolume: 0,
                totalListings: 0,
                reputationScore: 0,
            });
            await reputation.save();
            this.logger.log(`Created reputation record for ${address}`);
        }

        // Cache in Redis
        await this.redis.set(`${CACHE_PREFIX}${address}`, JSON.stringify(reputation), 'EX', CACHE_TTL);

        return reputation;
    }

    async updateFromActivity(
        walletAddress: string,
        type: ActivityType,
        volume: number = 0,
    ): Promise<ReputationDocument> {
        const address = walletAddress.toLowerCase();

        const update: Record<string, unknown> = {
            lastActivity: new Date(),
        };

        const inc: Record<string, number> = {};

        switch (type) {
            case 'mint':
                inc.totalMints = 1;
                break;
            case 'sale':
                inc.totalSales = 1;
                inc.totalVolume = volume;
                break;
            case 'purchase':
                inc.totalPurchases = 1;
                inc.totalVolume = volume;
                break;
            case 'listing':
                inc.totalListings = 1;
                break;
        }

        const reputation = await this.reputationModel.findOneAndUpdate(
            { walletAddress: address },
            { $set: update, $inc: inc },
            { new: true, upsert: true },
        ).exec();

        if (!reputation) {
            throw new Error('Failed to update reputation');
        }

        // Recalculate score
        const score = this.calculateScore(reputation);
        reputation.reputationScore = score;
        await reputation.save();

        // Invalidate cache
        await this.redis.del(`${CACHE_PREFIX}${address}`);

        this.logger.log(`Updated reputation for ${address}: ${type} (score: ${score})`);
        return reputation;
    }

    private calculateScore(rep: ReputationDocument): number {
        // Weighted score: mints (10pts), sales (25pts), purchases (15pts), listings (5pts)
        const raw =
            rep.totalMints * 10 +
            rep.totalSales * 25 +
            rep.totalPurchases * 15 +
            rep.totalListings * 5;

        // Logarithmic scaling to prevent whales from dominating
        const scaled = Math.log10(raw + 1) * 20;

        return Math.round(Math.min(100, scaled) * 100) / 100;
    }
}
