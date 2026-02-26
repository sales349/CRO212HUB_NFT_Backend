import { FastifyRequest } from 'fastify';
import { GeneratorService } from './generator.service';
import { GenerateRequestDto, GenerateResponseDto } from './schemas/generate.schema';
interface AuthenticatedRequest extends FastifyRequest {
    user: {
        sub: string;
        iat: number;
        exp: number;
    };
}
export declare class GeneratorController {
    private readonly generatorService;
    constructor(generatorService: GeneratorService);
    generate(body: GenerateRequestDto, request: AuthenticatedRequest): Promise<GenerateResponseDto>;
}
export {};
