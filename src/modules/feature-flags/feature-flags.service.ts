import { Injectable, Logger, Inject } from '@nestjs/common';
import Redis from 'ioredis';
import { REDIS_CLIENT } from '../../redis/redis.module';
import { DEFAULT_FLAGS } from './dto/feature-flags.dto';

const FLAG_PREFIX = 'flag:';

@Injectable()
export class FeatureFlagsService {
    private readonly logger = new Logger(FeatureFlagsService.name);

    constructor(@Inject(REDIS_CLIENT) private readonly redis: Redis) { }

    /**
     * Get all feature flags — returns defaults merged with Redis overrides
     */
    async getAll(): Promise<Record<string, boolean>> {
        const flags = { ...DEFAULT_FLAGS };

        for (const name of Object.keys(flags)) {
            const cached = await this.redis.get(`${FLAG_PREFIX}${name}`);
            if (cached !== null) {
                flags[name] = cached === 'true';
            }
        }

        return flags;
    }

    /**
     * Get a single flag value
     */
    async getFlag(name: string): Promise<boolean> {
        const cached = await this.redis.get(`${FLAG_PREFIX}${name}`);
        if (cached !== null) {
            return cached === 'true';
        }

        // Fall back to default
        return DEFAULT_FLAGS[name] ?? false;
    }

    /**
     * Toggle a flag — flips current state, returns new value
     */
    async toggle(name: string): Promise<{ name: string; enabled: boolean }> {
        const current = await this.getFlag(name);
        const newValue = !current;

        await this.redis.set(`${FLAG_PREFIX}${name}`, String(newValue));
        this.logger.log(`Feature flag "${name}" toggled: ${current} → ${newValue}`);

        return { name, enabled: newValue };
    }
}
