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
var GeneratorService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.GeneratorService = void 0;
const common_1 = require("@nestjs/common");
const node_crypto_1 = require("node:crypto");
const rarity_service_1 = require("./rarity.service");
const compositing_service_1 = require("./compositing.service");
const ipfs_service_1 = require("./ipfs.service");
const site_config_1 = require("../../config/site.config");
let GeneratorService = GeneratorService_1 = class GeneratorService {
    rarityService;
    compositingService;
    ipfsService;
    logger = new common_1.Logger(GeneratorService_1.name);
    constructor(rarityService, compositingService, ipfsService) {
        this.rarityService = rarityService;
        this.compositingService = compositingService;
        this.ipfsService = ipfsService;
    }
    async generate(dto, creatorAddress) {
        this.logger.log(`Starting generation for ${creatorAddress}`);
        const rarity = this.rarityService.calculateRarity(dto.traits);
        this.logger.debug(`Rarity calculated: ${rarity.rank} (${rarity.score})`);
        const imageBuffer = await this.compositingService.compositeImage(dto.traits);
        const shortId = (0, node_crypto_1.randomUUID)().slice(0, 8);
        const nftName = `${site_config_1.siteConfig.collectionName} #${shortId}`;
        const metadata = {
            name: nftName,
            description: dto.prompt,
            image: '',
            attributes: Object.entries(dto.traits).map(([traitType, value]) => ({
                trait_type: traitType,
                value: value,
                rarity_percentage: rarity.breakdown[traitType],
            })),
            properties: {
                creator: creatorAddress,
                collection: site_config_1.siteConfig.collectionName,
                chainId: dto.chainId,
                engine: site_config_1.siteConfig.engineVersion,
                generatedAt: new Date().toISOString(),
            },
        };
        const imageUrl = await this.ipfsService.uploadImage(imageBuffer, nftName);
        this.logger.debug(`Image uploaded: ${imageUrl}`);
        metadata.image = imageUrl;
        const metadataUrl = await this.ipfsService.uploadMetadata(metadata, nftName);
        this.logger.debug(`Metadata uploaded: ${metadataUrl}`);
        const response = {
            imageUrl,
            metadataUrl,
            gatewayUrl: this.ipfsService.getGatewayUrl(imageUrl),
            metadata,
            rarity: {
                score: rarity.score,
                rank: rarity.rank,
                breakdown: rarity.breakdown,
            },
        };
        this.logger.log(`Generation complete: ${nftName} - ${rarity.rank}`);
        return response;
    }
};
exports.GeneratorService = GeneratorService;
exports.GeneratorService = GeneratorService = GeneratorService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [rarity_service_1.RarityService,
        compositing_service_1.CompositingService,
        ipfs_service_1.IpfsService])
], GeneratorService);
//# sourceMappingURL=generator.service.js.map