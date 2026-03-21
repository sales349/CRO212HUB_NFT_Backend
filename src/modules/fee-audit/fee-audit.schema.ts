import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type FeeAuditDocument = HydratedDocument<FeeAudit>;

@Schema({ timestamps: true, collection: 'fee_audits' })
export class FeeAudit {
    @Prop({ required: true, index: true })
    listingId!: number;

    @Prop({ required: true })
    price!: string; // wei string

    @Prop({ required: true })
    buyerFee!: string; // wei string

    @Prop({ required: true })
    sellerFee!: string; // wei string

    @Prop({ required: true })
    royaltyAmount!: string; // wei string

    @Prop({ required: true })
    royaltyReceiver!: string; // address

    @Prop({ required: true })
    platformRevenue!: string; // buyerFee + sellerFee (wei string)

    @Prop({ required: true })
    sellerProceeds!: string; // price - sellerFee - royalty (wei string)

    @Prop({ required: true, index: true })
    buyer!: string; // address

    @Prop({ required: true, index: true })
    seller!: string; // address

    @Prop({ required: true, unique: true })
    txHash!: string;

    @Prop({ required: true })
    blockNumber!: number;

    @Prop()
    nftContract?: string; // address

    @Prop()
    tokenId?: string;
}

export const FeeAuditSchema = SchemaFactory.createForClass(FeeAudit);

// Compound index for admin queries
FeeAuditSchema.index({ createdAt: -1 });
FeeAuditSchema.index({ seller: 1, createdAt: -1 });
FeeAuditSchema.index({ buyer: 1, createdAt: -1 });
