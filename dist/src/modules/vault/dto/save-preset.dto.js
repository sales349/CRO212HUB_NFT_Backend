"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.listPresetsQuerySchema = exports.remixPresetSchema = exports.savePresetSchema = void 0;
const zod_1 = require("zod");
exports.savePresetSchema = zod_1.z.object({
    name: zod_1.z.string().min(1, 'Name is required').max(100, 'Name must be 100 characters or less'),
    prompt: zod_1.z.string().min(1).max(500),
    traits: zod_1.z.object({
        background: zod_1.z.string().min(1),
        body: zod_1.z.string().min(1),
        eyes: zod_1.z.string().min(1),
        mouth: zod_1.z.string().min(1),
        accessories: zod_1.z.string().min(1),
        special: zod_1.z.string().min(1),
    }),
    rarity: zod_1.z.object({
        score: zod_1.z.number().min(0).max(100),
        rank: zod_1.z.string().min(1),
        breakdown: zod_1.z.record(zod_1.z.string(), zod_1.z.number()),
    }),
    imageUrl: zod_1.z.string().min(1),
    metadataUrl: zod_1.z.string().min(1),
    gatewayUrl: zod_1.z.string().optional(),
});
exports.remixPresetSchema = zod_1.z.object({
    sourcePresetId: zod_1.z.string().min(1, 'Source preset ID is required'),
    newTraits: zod_1.z.object({
        background: zod_1.z.string().optional(),
        body: zod_1.z.string().optional(),
        eyes: zod_1.z.string().optional(),
        mouth: zod_1.z.string().optional(),
        accessories: zod_1.z.string().optional(),
        special: zod_1.z.string().optional(),
    }).refine((traits) => Object.values(traits).some((v) => v !== undefined), { message: 'At least one trait must be changed' }),
    newPrompt: zod_1.z.string().min(1).max(500).optional(),
    saveToVault: zod_1.z.boolean().optional().default(true),
});
exports.listPresetsQuerySchema = zod_1.z.object({
    page: zod_1.z.coerce.number().int().positive().optional().default(1),
    limit: zod_1.z.coerce.number().int().min(1).max(100).optional().default(20),
    sort: zod_1.z.enum(['newest', 'oldest', 'rarity']).optional().default('newest'),
});
//# sourceMappingURL=save-preset.dto.js.map