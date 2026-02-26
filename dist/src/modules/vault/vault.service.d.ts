import { Model } from 'mongoose';
import { PresetDocument } from './schemas/preset.schema';
import { SavePresetDto, ListPresetsQueryDto, RemixPresetDto } from './dto/save-preset.dto';
import { GeneratorService } from '../generator/generator.service';
export declare class VaultService {
    private readonly presetModel;
    private readonly generatorService;
    private readonly logger;
    constructor(presetModel: Model<PresetDocument>, generatorService: GeneratorService);
    savePreset(dto: SavePresetDto, walletAddress: string): Promise<PresetDocument>;
    listPresets(walletAddress: string, query: ListPresetsQueryDto): Promise<{
        presets: PresetDocument[];
        total: number;
        page: number;
        limit: number;
    }>;
    getPreset(presetId: string): Promise<PresetDocument>;
    deletePreset(presetId: string, walletAddress: string): Promise<void>;
    remixPreset(dto: RemixPresetDto, walletAddress: string): Promise<{
        isRemix: boolean;
        sourcePresetId: string;
        imageUrl: string;
        metadataUrl: string;
        gatewayUrl: string;
        metadata: {
            name: string;
            description: string;
            image: string;
            attributes: {
                value: string;
                trait_type: string;
                rarity_percentage: number;
            }[];
            properties: {
                chainId: number;
                creator: string;
                collection: string;
                engine: string;
                generatedAt: string;
            };
        };
        rarity: {
            score: number;
            rank: string;
            breakdown: Record<string, number>;
        };
    }>;
    getAvatarData(presetId: string): Promise<{
        presetId: import("mongoose").Types.ObjectId;
        name: string;
        imageUrl: string;
        gatewayUrl: string | undefined;
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
        avatarConfig: {
            width: number;
            height: number;
            format: string;
            badgePosition: string;
        };
    }>;
}
