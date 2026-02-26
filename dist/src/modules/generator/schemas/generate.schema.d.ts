import { z } from 'zod';
export declare const generateRequestSchema: z.ZodObject<{
    prompt: z.ZodString;
    traits: z.ZodObject<{
        background: z.ZodEnum<[string, ...string[]]>;
        body: z.ZodEnum<[string, ...string[]]>;
        eyes: z.ZodEnum<[string, ...string[]]>;
        mouth: z.ZodEnum<[string, ...string[]]>;
        accessories: z.ZodEnum<[string, ...string[]]>;
        special: z.ZodEnum<[string, ...string[]]>;
    }, "strip", z.ZodTypeAny, {
        background: string;
        body: string;
        eyes: string;
        mouth: string;
        accessories: string;
        special: string;
    }, {
        background: string;
        body: string;
        eyes: string;
        mouth: string;
        accessories: string;
        special: string;
    }>;
    chainId: z.ZodDefault<z.ZodOptional<z.ZodNumber>>;
}, "strip", z.ZodTypeAny, {
    prompt: string;
    traits: {
        background: string;
        body: string;
        eyes: string;
        mouth: string;
        accessories: string;
        special: string;
    };
    chainId: number;
}, {
    prompt: string;
    traits: {
        background: string;
        body: string;
        eyes: string;
        mouth: string;
        accessories: string;
        special: string;
    };
    chainId?: number | undefined;
}>;
export type GenerateRequestDto = z.infer<typeof generateRequestSchema>;
export declare const generateResponseSchema: z.ZodObject<{
    imageUrl: z.ZodString;
    metadataUrl: z.ZodString;
    gatewayUrl: z.ZodString;
    metadata: z.ZodObject<{
        name: z.ZodString;
        description: z.ZodString;
        image: z.ZodString;
        attributes: z.ZodArray<z.ZodObject<{
            trait_type: z.ZodString;
            value: z.ZodString;
            rarity_percentage: z.ZodNumber;
        }, "strip", z.ZodTypeAny, {
            value: string;
            trait_type: string;
            rarity_percentage: number;
        }, {
            value: string;
            trait_type: string;
            rarity_percentage: number;
        }>, "many">;
        properties: z.ZodObject<{
            creator: z.ZodString;
            collection: z.ZodString;
            chainId: z.ZodNumber;
            engine: z.ZodString;
            generatedAt: z.ZodString;
        }, "strip", z.ZodTypeAny, {
            chainId: number;
            creator: string;
            collection: string;
            engine: string;
            generatedAt: string;
        }, {
            chainId: number;
            creator: string;
            collection: string;
            engine: string;
            generatedAt: string;
        }>;
    }, "strip", z.ZodTypeAny, {
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
    }, {
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
    }>;
    rarity: z.ZodObject<{
        score: z.ZodNumber;
        rank: z.ZodString;
        breakdown: z.ZodRecord<z.ZodString, z.ZodNumber>;
    }, "strip", z.ZodTypeAny, {
        score: number;
        rank: string;
        breakdown: Record<string, number>;
    }, {
        score: number;
        rank: string;
        breakdown: Record<string, number>;
    }>;
}, "strip", z.ZodTypeAny, {
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
}, {
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
export type GenerateResponseDto = z.infer<typeof generateResponseSchema>;
