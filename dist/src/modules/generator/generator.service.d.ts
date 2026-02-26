import { RarityService } from './rarity.service';
import { CompositingService } from './compositing.service';
import { IpfsService } from './ipfs.service';
import { GenerateRequestDto, GenerateResponseDto } from './schemas/generate.schema';
export declare class GeneratorService {
    private readonly rarityService;
    private readonly compositingService;
    private readonly ipfsService;
    private readonly logger;
    constructor(rarityService: RarityService, compositingService: CompositingService, ipfsService: IpfsService);
    generate(dto: GenerateRequestDto, creatorAddress: string): Promise<GenerateResponseDto>;
}
