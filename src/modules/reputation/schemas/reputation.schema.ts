import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type ReputationDocument = Reputation & Document;

@Schema({ timestamps: true, collection: 'reputations' })
export class Reputation {
    @Prop({ required: true, unique: true, index: true, lowercase: true })
    walletAddress!: string;

    @Prop({ default: 0 })
    totalMints!: number;

    @Prop({ default: 0 })
    totalSales!: number;

    @Prop({ default: 0 })
    totalPurchases!: number;

    @Prop({ default: 0 })
    totalVolume!: number;

    @Prop({ default: 0 })
    totalListings!: number;

    @Prop({ default: 0 })
    reputationScore!: number;

    @Prop()
    lastActivity?: Date;
}

export const ReputationSchema = SchemaFactory.createForClass(Reputation);
