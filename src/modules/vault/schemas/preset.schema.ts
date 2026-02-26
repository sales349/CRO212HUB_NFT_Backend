import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type PresetDocument = Preset & Document;

@Schema({ timestamps: true, collection: 'presets' })
export class Preset {
    @Prop({ required: true, index: true, lowercase: true })
    walletAddress!: string;

    @Prop({ required: true, trim: true })
    name!: string;

    @Prop({ required: true })
    prompt!: string;

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

    @Prop({ default: false })
    isRemix!: boolean;

    @Prop()
    sourcePresetId?: string;
}

export const PresetSchema = SchemaFactory.createForClass(Preset);

PresetSchema.index({ walletAddress: 1, createdAt: -1 });