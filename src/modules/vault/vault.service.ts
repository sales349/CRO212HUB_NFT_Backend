import {
    Injectable,
    Logger,
    NotFoundException,
    ForbiddenException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Preset, PresetDocument } from './schemas/preset.schema';
import { SavePresetDto, ListPresetsQueryDto, RemixPresetDto } from './dto/save-preset.dto';
import { GeneratorService } from '../generator/generator.service';
import { generateRequestSchema } from '../generator/schemas/generate.schema';

@Injectable()
export class VaultService {
    private readonly logger = new Logger(VaultService.name);

    constructor(
        @InjectModel(Preset.name) private readonly presetModel: Model<PresetDocument>,
        private readonly generatorService: GeneratorService,
    ) { }

    async savePreset(dto: SavePresetDto, walletAddress: string): Promise<PresetDocument> {
        this.logger.log(`Saving preset "${dto.name}" for ${walletAddress}`);

        const preset = new this.presetModel({
            ...dto,
            walletAddress: walletAddress.toLowerCase(),
        });

        const saved = await preset.save();
        this.logger.log(`Preset saved: ${saved._id}`);
        return saved;
    }

    async listPresets(
        walletAddress: string,
        query: ListPresetsQueryDto,
    ): Promise<{ presets: PresetDocument[]; total: number; page: number; limit: number }> {
        const { page, limit, sort } = query;
        const skip = (page - 1) * limit;

        const filter = { walletAddress: walletAddress.toLowerCase() };

        let sortOption: Record<string, 1 | -1>;
        switch (sort) {
            case 'oldest':
                sortOption = { createdAt: 1 };
                break;
            case 'rarity':
                sortOption = { 'rarity.score': -1 };
                break;
            case 'newest':
            default:
                sortOption = { createdAt: -1 };
                break;
        }

        const [presets, total] = await Promise.all([
            this.presetModel.find(filter).sort(sortOption).skip(skip).limit(limit).exec(),
            this.presetModel.countDocuments(filter).exec(),
        ]);

        return { presets, total, page, limit };
    }

    async getPreset(presetId: string): Promise<PresetDocument> {
        const preset = await this.presetModel.findById(presetId).exec();
        if (!preset) {
            throw new NotFoundException('Preset not found');
        }
        return preset;
    }

    async deletePreset(presetId: string, walletAddress: string): Promise<void> {
        const preset = await this.presetModel.findById(presetId).exec();

        if (!preset) {
            throw new NotFoundException('Preset not found');
        }

        if (preset.walletAddress !== walletAddress.toLowerCase()) {
            throw new ForbiddenException('You can only delete your own presets');
        }

        await this.presetModel.findByIdAndDelete(presetId).exec();
        this.logger.log(`Preset deleted: ${presetId}`);
    }

    async remixPreset(dto: RemixPresetDto, walletAddress: string) {
        const sourcePreset = await this.presetModel.findById(dto.sourcePresetId).exec();

        if (!sourcePreset) {
            throw new NotFoundException('Source preset not found');
        }

        // Merge traits: source + overrides
        const mergedTraits = {
            background: dto.newTraits.background ?? sourcePreset.traits.background,
            body: dto.newTraits.body ?? sourcePreset.traits.body,
            eyes: dto.newTraits.eyes ?? sourcePreset.traits.eyes,
            mouth: dto.newTraits.mouth ?? sourcePreset.traits.mouth,
            accessories: dto.newTraits.accessories ?? sourcePreset.traits.accessories,
            special: dto.newTraits.special ?? sourcePreset.traits.special,
        };

        const prompt = dto.newPrompt ?? sourcePreset.prompt;

        // Validate merged traits against generator schema
        const generateInput = generateRequestSchema.parse({
            prompt,
            traits: mergedTraits,
        });

        // Generate new NFT with merged traits
        const result = await this.generatorService.generate(generateInput, walletAddress);

        // Optionally save to vault
        if (dto.saveToVault) {
            const remixPreset = new this.presetModel({
                walletAddress: walletAddress.toLowerCase(),
                name: `Remix of ${sourcePreset.name}`,
                prompt,
                traits: mergedTraits,
                rarity: result.rarity,
                imageUrl: result.imageUrl,
                metadataUrl: result.metadataUrl,
                gatewayUrl: result.gatewayUrl,
                isRemix: true,
                sourcePresetId: dto.sourcePresetId,
            });
            await remixPreset.save();
            this.logger.log(`Remix saved: ${remixPreset._id}`);
        }

        return {
            ...result,
            isRemix: true,
            sourcePresetId: dto.sourcePresetId,
        };
    }

    async getAvatarData(presetId: string) {
        const preset = await this.getPreset(presetId);

        return {
            presetId: preset._id,
            name: preset.name,
            imageUrl: preset.imageUrl,
            gatewayUrl: preset.gatewayUrl,
            traits: preset.traits,
            rarity: preset.rarity,
            avatarConfig: {
                width: 512,
                height: 512,
                format: 'png',
                badgePosition: 'bottom-right',
            },
        };
    }
}