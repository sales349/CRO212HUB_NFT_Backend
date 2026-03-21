import { Module } from '@nestjs/common';
import { FeatureFlagsController } from './feature-flags.controller';
import { FeatureFlagsService } from './feature-flags.service';

@Module({
    // REDIS_CLIENT is @Global from RedisModule — no need to import
    controllers: [FeatureFlagsController],
    providers: [FeatureFlagsService],
    exports: [FeatureFlagsService],
})
export class FeatureFlagsModule { }
