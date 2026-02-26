"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateResponseSchema = exports.generateRequestSchema = void 0;
const zod_1 = require("zod");
const trait_weights_config_1 = require("../../../config/trait-weights.config");
function traitEnum(category) {
    const options = Object.keys(trait_weights_config_1.TRAIT_WEIGHTS[category]);
    return zod_1.z.enum(options);
}
exports.generateRequestSchema = zod_1.z.object({
    prompt: zod_1.z.string().min(1, 'Prompt is required').max(500, 'Prompt must be 500 characters or less'),
    traits: zod_1.z.object({
        background: traitEnum('background'),
        body: traitEnum('body'),
        eyes: traitEnum('eyes'),
        mouth: traitEnum('mouth'),
        accessories: traitEnum('accessories'),
        special: traitEnum('special'),
    }),
    chainId: zod_1.z.number().int().positive().optional().default(338),
});
exports.generateResponseSchema = zod_1.z.object({
    imageUrl: zod_1.z.string(),
    metadataUrl: zod_1.z.string(),
    gatewayUrl: zod_1.z.string(),
    metadata: zod_1.z.object({
        name: zod_1.z.string(),
        description: zod_1.z.string(),
        image: zod_1.z.string(),
        attributes: zod_1.z.array(zod_1.z.object({
            trait_type: zod_1.z.string(),
            value: zod_1.z.string(),
            rarity_percentage: zod_1.z.number(),
        })),
        properties: zod_1.z.object({
            creator: zod_1.z.string(),
            collection: zod_1.z.string(),
            chainId: zod_1.z.number(),
            engine: zod_1.z.string(),
            generatedAt: zod_1.z.string(),
        }),
    }),
    rarity: zod_1.z.object({
        score: zod_1.z.number(),
        rank: zod_1.z.string(),
        breakdown: zod_1.z.record(zod_1.z.string(), zod_1.z.number()),
    }),
});
//# sourceMappingURL=generate.schema.js.map