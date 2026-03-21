import { z } from 'zod';

export const toggleFlagSchema = z.object({
    name: z.string().min(1, 'Flag name is required').max(50, 'Flag name too long'),
});

export type ToggleFlagDto = z.infer<typeof toggleFlagSchema>;

export const DEFAULT_FLAGS: Record<string, boolean> = {
    marketplace_enabled: true,
    remix_enabled: true,
    avatar_builder_enabled: true,
    minting_enabled: true,
    buy_enabled: false, // Week 5 — not ready yet
};
