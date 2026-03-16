import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type ListingDocument = Listing & Document;

export type ListingStatus = 'active' | 'sold' | 'cancelled';

@Schema({ timestamps: true, collection: 'listings' })
export class Listing {
    @Prop({ required: true, index: true })
    tokenId!: string;

    @Prop({ required: true, index: true, lowercase: true })
    seller!: string;

    @Prop({ required: true, min: 0 })
    price!: number;

    @Prop({ default: 'CRO' })
    currency!: string;

    @Prop({ type: String, required: true, enum: ['active', 'sold', 'cancelled'], default: 'active', index: true })
    status!: ListingStatus;

    @Prop({ required: true, default: false })
    isSecondary!: boolean;

    @Prop({ required: true, trim: true })
    name!: string;

    @Prop({ default: '' })
    description!: string;

    @Prop({ type: Object, required: true })
    traits!: {
        background: string;
        body: string;
        eyes: string;
        mouth: string;
        accessories: string;
        special: string;
    };

    @Prop({ type: Object, required: true })
    rarity!: {
        score: number;
        rank: string;
        breakdown: Record<string, number>;
    };

    @Prop({ required: true })
    imageUrl!: string;

    @Prop({ required: true })
    metadataUrl!: string;

    @Prop()
    gatewayUrl?: string;

    @Prop({ required: true })
    collectionAddress!: string;

    @Prop({ required: true, default: 338 })
    chainId!: number;

    @Prop({ lowercase: true })
    buyerAddress?: string;

    @Prop()
    soldAt?: Date;

    @Prop()
    cancelledAt?: Date;

    @Prop({ default: 0 })
    viewCount!: number;
}

export const ListingSchema = SchemaFactory.createForClass(Listing);

// Compound indexes for common queries
ListingSchema.index({ status: 1, createdAt: -1 });
ListingSchema.index({ status: 1, price: 1 });
ListingSchema.index({ status: 1, 'rarity.score': -1 });
ListingSchema.index({ seller: 1, status: 1 });
ListingSchema.index({ collectionAddress: 1, status: 1 });
