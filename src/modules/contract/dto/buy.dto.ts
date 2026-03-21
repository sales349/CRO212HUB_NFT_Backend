import { z } from 'zod';
import { ApiProperty } from '@nestjs/swagger';

// Zod schema for buy pre-check request
export const buyPreCheckSchema = z.object({
    listingId: z.coerce.number().int().min(0, 'Listing ID must be a non-negative integer'),
});

export type BuyPreCheckDto = z.infer<typeof buyPreCheckSchema>;

// Swagger DTO for documentation
export class BuyPreCheckSwaggerDto {
    @ApiProperty({ description: 'On-chain listing ID', example: 1 })
    listingId!: number;
}
