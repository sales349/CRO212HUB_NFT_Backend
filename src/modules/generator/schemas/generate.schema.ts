import { z } from 'zod';
import { TRAIT_WEIGHTS, TraitCategory } from '../../../config/trait-weights.config';

function traitEnum(category: TraitCategory) {
    const options = Object.keys(TRAIT_WEIGHTS[category]) as [string, ...string[]];
    return z.enum(options);
}

export const generateRequestSchema = z.object({
    prompt: z.string().min(1, 'Prompt is required').max(500, 'Prompt must be 500 characters or less'),
    traits: z.object({
        background: traitEnum('background'),
        body: traitEnum('body'),
        eyes: traitEnum('eyes'),
        mouth: traitEnum('mouth'),
        accessories: traitEnum('accessories'),
        special: traitEnum('special'),
    }),
    chainId: z.number().int().positive().optional().default(338),
});

export type GenerateRequestDto = z.infer<typeof generateRequestSchema>;

export const generateResponseSchema = z.object({
    imageUrl: z.string(),
    metadataUrl: z.string(),
    gatewayUrl: z.string(),
    metadata: z.object({
        name: z.string(),
        description: z.string(),
        image: z.string(),
        attributes: z.array(
            z.object({
                trait_type: z.string(),
                value: z.string(),
                rarity_percentage: z.number(),
            }),
        ),
        properties: z.object({
            creator: z.string(),
            collection: z.string(),
            chainId: z.number(),
            engine: z.string(),
            generatedAt: z.string(),
        }),
    }),
    rarity: z.object({
        score: z.number(),
        rank: z.string(),
        breakdown: z.record(z.string(), z.number()),
    }),
});

export type GenerateResponseDto = z.infer<typeof generateResponseSchema>;