import { Document } from 'mongoose';
export type PresetDocument = Preset & Document;
export declare class Preset {
    walletAddress: string;
    name: string;
    prompt: string;
    traits: {
        background: string;
        body: string;
        eyes: string;
        mouth: string;
        accessories: string;
        special: string;
    };
    rarity: {
        score: number;
        rank: string;
        breakdown: Record<string, number>;
    };
    imageUrl: string;
    metadataUrl: string;
    gatewayUrl?: string;
    isRemix: boolean;
    sourcePresetId?: string;
}
export declare const PresetSchema: import("mongoose").Schema<Preset, import("mongoose").Model<Preset, any, any, any, Document<unknown, any, Preset, any, {}> & Preset & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v: number;
}, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, Preset, Document<unknown, {}, import("mongoose").FlatRecord<Preset>, {}, import("mongoose").DefaultSchemaOptions> & import("mongoose").FlatRecord<Preset> & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v: number;
}>;
