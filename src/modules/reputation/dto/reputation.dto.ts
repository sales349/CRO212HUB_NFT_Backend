import { z } from 'zod';

export const getReputationQuerySchema = z.object({
    address: z
        .string()
        .min(1, 'Address is required')
        .regex(/^0x[a-fA-F0-9]{40}$/, 'Invalid Ethereum address format'),
});

export type GetReputationQueryDto = z.infer<typeof getReputationQuerySchema>;
