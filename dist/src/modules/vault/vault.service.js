"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var VaultService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.VaultService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const preset_schema_1 = require("./schemas/preset.schema");
const generator_service_1 = require("../generator/generator.service");
const generate_schema_1 = require("../generator/schemas/generate.schema");
let VaultService = VaultService_1 = class VaultService {
    presetModel;
    generatorService;
    logger = new common_1.Logger(VaultService_1.name);
    constructor(presetModel, generatorService) {
        this.presetModel = presetModel;
        this.generatorService = generatorService;
    }
    async savePreset(dto, walletAddress) {
        this.logger.log(`Saving preset "${dto.name}" for ${walletAddress}`);
        const preset = new this.presetModel({
            ...dto,
            walletAddress: walletAddress.toLowerCase(),
        });
        const saved = await preset.save();
        this.logger.log(`Preset saved: ${saved._id}`);
        return saved;
    }
    async listPresets(walletAddress, query) {
        const { page, limit, sort } = query;
        const skip = (page - 1) * limit;
        const filter = { walletAddress: walletAddress.toLowerCase() };
        let sortOption;
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
    async getPreset(presetId) {
        const preset = await this.presetModel.findById(presetId).exec();
        if (!preset) {
            throw new common_1.NotFoundException('Preset not found');
        }
        return preset;
    }
    async deletePreset(presetId, walletAddress) {
        const preset = await this.presetModel.findById(presetId).exec();
        if (!preset) {
            throw new common_1.NotFoundException('Preset not found');
        }
        if (preset.walletAddress !== walletAddress.toLowerCase()) {
            throw new common_1.ForbiddenException('You can only delete your own presets');
        }
        await this.presetModel.findByIdAndDelete(presetId).exec();
        this.logger.log(`Preset deleted: ${presetId}`);
    }
    async remixPreset(dto, walletAddress) {
        const sourcePreset = await this.presetModel.findById(dto.sourcePresetId).exec();
        if (!sourcePreset) {
            throw new common_1.NotFoundException('Source preset not found');
        }
        const mergedTraits = {
            background: dto.newTraits.background ?? sourcePreset.traits.background,
            body: dto.newTraits.body ?? sourcePreset.traits.body,
            eyes: dto.newTraits.eyes ?? sourcePreset.traits.eyes,
            mouth: dto.newTraits.mouth ?? sourcePreset.traits.mouth,
            accessories: dto.newTraits.accessories ?? sourcePreset.traits.accessories,
            special: dto.newTraits.special ?? sourcePreset.traits.special,
        };
        const prompt = dto.newPrompt ?? sourcePreset.prompt;
        const generateInput = generate_schema_1.generateRequestSchema.parse({
            prompt,
            traits: mergedTraits,
        });
        const result = await this.generatorService.generate(generateInput, walletAddress);
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
    async getAvatarData(presetId) {
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
};
exports.VaultService = VaultService;
exports.VaultService = VaultService = VaultService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(preset_schema_1.Preset.name)),
    __metadata("design:paramtypes", [mongoose_2.Model,
        generator_service_1.GeneratorService])
], VaultService);
//# sourceMappingURL=vault.service.js.map