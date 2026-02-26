import { z } from 'zod';
export declare const savePresetSchema: z.ZodObject<{
    name: z.ZodString;
    prompt: z.ZodString;
    traits: z.ZodObject<{
        background: z.ZodString;
        body: z.ZodString;
        eyes: z.ZodString;
        mouth: z.ZodString;
        accessories: z.ZodString;
        special: z.ZodString;
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
    imageUrl: z.ZodString;
    metadataUrl: z.ZodString;
    gatewayUrl: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    name: string;
    prompt: string;
    traits: {
        background: string;
        body: string;
        eyes: string;
        mouth: string;
        accessories: string;
        special: string;
    };
    imageUrl: string;
    metadataUrl: string;
    rarity: {
        score: number;
        rank: string;
        breakdown: Record<string, number>;
    };
    gatewayUrl?: string | undefined;
}, {
    name: string;
    prompt: string;
    traits: {
        background: string;
        body: string;
        eyes: string;
        mouth: string;
        accessories: string;
        special: string;
    };
    imageUrl: string;
    metadataUrl: string;
    rarity: {
        score: number;
        rank: string;
        breakdown: Record<string, number>;
    };
    gatewayUrl?: string | undefined;
}>;
export type SavePresetDto = z.infer<typeof savePresetSchema>;
export declare const remixPresetSchema: z.ZodObject<{
    sourcePresetId: z.ZodString;
    newTraits: z.ZodEffects<z.ZodObject<{
        background: z.ZodOptional<z.ZodString>;
        body: z.ZodOptional<z.ZodString>;
        eyes: z.ZodOptional<z.ZodString>;
        mouth: z.ZodOptional<z.ZodString>;
        accessories: z.ZodOptional<z.ZodString>;
        special: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        background?: string | undefined;
        body?: string | undefined;
        eyes?: string | undefined;
        mouth?: string | undefined;
        accessories?: string | undefined;
        special?: string | undefined;
    }, {
        background?: string | undefined;
        body?: string | undefined;
        eyes?: string | undefined;
        mouth?: string | undefined;
        accessories?: string | undefined;
        special?: string | undefined;
    }>, {
        background?: string | undefined;
        body?: string | undefined;
        eyes?: string | undefined;
        mouth?: string | undefined;
        accessories?: string | undefined;
        special?: string | undefined;
    }, {
        background?: string | undefined;
        body?: string | undefined;
        eyes?: string | undefined;
        mouth?: string | undefined;
        accessories?: string | undefined;
        special?: string | undefined;
    }>;
    newPrompt: z.ZodOptional<z.ZodString>;
    saveToVault: z.ZodDefault<z.ZodOptional<z.ZodBoolean>>;
}, "strip", z.ZodTypeAny, {
    sourcePresetId: string;
    newTraits: {
        background?: string | undefined;
        body?: string | undefined;
        eyes?: string | undefined;
        mouth?: string | undefined;
        accessories?: string | undefined;
        special?: string | undefined;
    };
    saveToVault: boolean;
    newPrompt?: string | undefined;
}, {
    sourcePresetId: string;
    newTraits: {
        background?: string | undefined;
        body?: string | undefined;
        eyes?: string | undefined;
        mouth?: string | undefined;
        accessories?: string | undefined;
        special?: string | undefined;
    };
    newPrompt?: string | undefined;
    saveToVault?: boolean | undefined;
}>;
export type RemixPresetDto = z.infer<typeof remixPresetSchema>;
export declare const listPresetsQuerySchema: z.ZodObject<{
    page: z.ZodDefault<z.ZodOptional<z.ZodNumber>>;
    limit: z.ZodDefault<z.ZodOptional<z.ZodNumber>>;
    sort: z.ZodDefault<z.ZodOptional<z.ZodEnum<["newest", "oldest", "rarity"]>>>;
}, "strip", z.ZodTypeAny, {
    sort: "rarity" | "newest" | "oldest";
    page: number;
    limit: number;
}, {
    sort?: "rarity" | "newest" | "oldest" | undefined;
    page?: number | undefined;
    limit?: number | undefined;
}>;
export type ListPresetsQueryDto = z.infer<typeof listPresetsQuerySchema>;
