import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type TelegramMappingDocument = TelegramMapping & Document;

@Schema({ timestamps: true, collection: 'telegram_mappings' })
export class TelegramMapping {
    @Prop({ required: true, unique: true, index: true })
    telegramId!: string;

    @Prop({ required: true, index: true, lowercase: true })
    walletAddress!: string;

    @Prop()
    username?: string;
}

export const TelegramMappingSchema = SchemaFactory.createForClass(TelegramMapping);
