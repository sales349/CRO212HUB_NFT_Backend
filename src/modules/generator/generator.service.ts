import { Injectable, Logger } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { RarityService } from './rarity.service';
import { CompositingService } from './compositing.service';
import { IpfsService } from './ipfs.service';
import { GenerateRequestDto, GenerateResponseDto } from './schemas/generate.schema';
import { siteConfig } from '../../config/site.config';

@Injectable()
export class GeneratorService {
    private readonly logger = new Logger(GeneratorService.name);

    constructor(
        private readonly rarityService: RarityService,
        private readonly compositingService: CompositingService,
        private readonly ipfsService: IpfsService,
    ) { }

    async generate(dto: GenerateRequestDto, creatorAddress: string): Promise<GenerateResponseDto> {
        this.logger.log(`Starting generation for ${creatorAddress}`);

        const rarity = this.rarityService.calculateRarity(dto.traits);
        this.logger.debug(`Rarity calculated: ${rarity.rank} (${rarity.score})`);

        const imageBuffer = await this.compositingService.compositeImage(dto.traits);

        const shortId = randomUUID().slice(0, 8);
        const nftName = `${siteConfig.collectionName} #${shortId}`;

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
                collection: siteConfig.collectionName,
                chainId: dto.chainId,
                engine: siteConfig.engineVersion,
                generatedAt: new Date().toISOString(),
            },
        };

        const imageUrl = await this.ipfsService.uploadImage(imageBuffer, nftName);
        this.logger.debug(`Image uploaded: ${imageUrl}`);

        metadata.image = imageUrl;

        const metadataUrl = await this.ipfsService.uploadMetadata(metadata as unknown as Record<string, unknown>, nftName);
        this.logger.debug(`Metadata uploaded: ${metadataUrl}`);

        const response: GenerateResponseDto = {
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
}