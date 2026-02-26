import { FastifyRequest } from 'fastify';
import { VaultService } from './vault.service';
import { SavePresetDto, RemixPresetDto } from './dto/save-preset.dto';
interface AuthenticatedRequest extends FastifyRequest {
    user: {
        sub: string;
        iat: number;
        exp: number;
    };
}
export declare class VaultController {
    private readonly vaultService;
    constructor(vaultService: VaultService);
    savePreset(body: SavePresetDto, request: AuthenticatedRequest): Promise<{
        success: boolean;
        preset: import("./schemas/preset.schema").PresetDocument;
    }>;
    listPresets(query: Record<string, string>, request: AuthenticatedRequest): Promise<{
        presets: import("./schemas/preset.schema").PresetDocument[];
        total: number;
        page: number;
        limit: number;
        success: boolean;
    }>;
    getPreset(id: string): Promise<{
        success: boolean;
        preset: import("./schemas/preset.schema").PresetDocument;
    }>;
    deletePreset(id: string, request: AuthenticatedRequest): Promise<{
        success: boolean;
        message: string;
    }>;
    remixPreset(body: RemixPresetDto, request: AuthenticatedRequest): Promise<{
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
        success: boolean;
    }>;
    getAvatarData(id: string): Promise<{
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
        success: boolean;
    }>;
}
export {};
