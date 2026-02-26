import { z } from 'zod';

export const savePresetSchema = z.object({
    name: z.string().min(1, 'Name is required').max(100, 'Name must be 100 characters or less'),
    prompt: z.string().min(1).max(500),
    traits: z.object({
        background: z.string().min(1),
        body: z.string().min(1),
        eyes: z.string().min(1),
        mouth: z.string().min(1),
        accessories: z.string().min(1),
        special: z.string().min(1),
    }),
    rarity: z.object({
        score: z.number().min(0).max(100),
        rank: z.string().min(1),
        breakdown: z.record(z.string(), z.number()),
    }),
    imageUrl: z.string().min(1),
    metadataUrl: z.string().min(1),
    gatewayUrl: z.string().optional(),
});

export type SavePresetDto = z.infer<typeof savePresetSchema>;

export const remixPresetSchema = z.object({
    sourcePresetId: z.string().min(1, 'Source preset ID is required'),
    newTraits: z.object({
        background: z.string().optional(),
        body: z.string().optional(),
        eyes: z.string().optional(),
        mouth: z.string().optional(),
        accessories: z.string().optional(),
        special: z.string().optional(),
    }).refine(
        (traits) => Object.values(traits).some((v) => v !== undefined),
        { message: 'At least one trait must be changed' },
    ),
    newPrompt: z.string().min(1).max(500).optional(),
    saveToVault: z.boolean().optional().default(true),
});

export type RemixPresetDto = z.infer<typeof remixPresetSchema>;

export const listPresetsQuerySchema = z.object({
    page: z.coerce.number().int().positive().optional().default(1),
    limit: z.coerce.number().int().min(1).max(100).optional().default(20),
    sort: z.enum(['newest', 'oldest', 'rarity']).optional().default('newest'),
});

export type ListPresetsQueryDto = z.infer<typeof listPresetsQuerySchema>;