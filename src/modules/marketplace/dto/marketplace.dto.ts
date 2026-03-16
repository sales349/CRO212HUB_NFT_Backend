import { z } from 'zod';

// --- Create Listing ---
export const createListingSchema = z.object({
    tokenId: z.string().min(1, 'Token ID is required'),
    price: z.number().positive('Price must be positive'),
    currency: z.string().optional().default('CRO'),
    isSecondary: z.boolean().optional().default(false),
    name: z.string().min(1, 'Name is required').max(200),
    description: z.string().max(1000).optional().default(''),
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
    collectionAddress: z.string().min(1, 'Collection address is required'),
    chainId: z.number().optional().default(338),
});

export type CreateListingDto = z.infer<typeof createListingSchema>;

// --- List Listings Query ---
export const listListingsQuerySchema = z.object({
    page: z.coerce.number().int().positive().optional().default(1),
    limit: z.coerce.number().int().min(1).max(100).optional().default(20),
    sort: z.enum(['newest', 'oldest', 'price_asc', 'price_desc', 'rarity']).optional().default('newest'),
    status: z.enum(['active', 'sold', 'cancelled', 'all']).optional().default('active'),
    minPrice: z.coerce.number().min(0).optional(),
    maxPrice: z.coerce.number().min(0).optional(),
    rarityRank: z.enum(['Legendary', 'Epic', 'Rare', 'Uncommon', 'Common']).optional(),
    seller: z.string().optional(),
    collectionAddress: z.string().optional(),
    search: z.string().max(100).optional(),
});

export type ListListingsQueryDto = z.infer<typeof listListingsQuerySchema>;
