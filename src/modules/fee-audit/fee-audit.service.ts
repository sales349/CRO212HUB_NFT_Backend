import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { FeeAudit, FeeAuditDocument } from './fee-audit.schema';

export interface LogSaleData {
    listingId: number;
    price: string;
    buyerFee: string;
    sellerFee: string;
    royaltyAmount: string;
    royaltyReceiver: string;
    platformRevenue: string;
    sellerProceeds: string;
    buyer: string;
    seller: string;
    txHash: string;
    blockNumber: number;
    nftContract?: string;
    tokenId?: string;
}

@Injectable()
export class FeeAuditService {
    private readonly logger = new Logger(FeeAuditService.name);

    constructor(
        @InjectModel(FeeAudit.name) private readonly feeAuditModel: Model<FeeAuditDocument>,
    ) { }

    /**
     * Log a sale from the on-chain Sale event.
     * Called by ContractListenerService when it detects a Sale event.
     */
    async logSale(data: LogSaleData): Promise<FeeAuditDocument> {
        this.logger.log(`Logging fee audit for listing #${data.listingId}, tx: ${data.txHash}`);

        // Upsert by txHash to avoid duplicates from re-org or re-processing
        const doc = await this.feeAuditModel.findOneAndUpdate(
            { txHash: data.txHash },
            { $setOnInsert: data },
            { upsert: true, new: true },
        );

        return doc;
    }

    /**
     * Get paginated audit logs for admin inspection.
     */
    async getAuditLog(query: {
        page?: number;
        limit?: number;
        seller?: string;
        buyer?: string;
    }): Promise<{
        audits: FeeAuditDocument[];
        total: number;
        page: number;
        limit: number;
    }> {
        const page = query.page ?? 1;
        const limit = query.limit ?? 20;
        const skip = (page - 1) * limit;

        const filter: Record<string, unknown> = {};
        if (query.seller) filter.seller = query.seller.toLowerCase();
        if (query.buyer) filter.buyer = query.buyer.toLowerCase();

        const [audits, total] = await Promise.all([
            this.feeAuditModel.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).exec(),
            this.feeAuditModel.countDocuments(filter).exec(),
        ]);

        return { audits, total, page, limit };
    }

    /**
     * Get aggregate stats for admin dashboard.
     */
    async getStats(): Promise<{
        totalSales: number;
        totalPlatformRevenue: string;
        totalRoyaltiesPaid: string;
    }> {
        const result = await this.feeAuditModel.aggregate([
            {
                $group: {
                    _id: null,
                    totalSales: { $sum: 1 },
                    // Note: These are string sums — for display only, not precise wei math
                    // In production, use BigInt aggregation or a dedicated accounting system
                },
            },
        ]);

        return {
            totalSales: result[0]?.totalSales ?? 0,
            totalPlatformRevenue: '0', // TODO: BigInt sum from documents
            totalRoyaltiesPaid: '0',
        };
    }
}
