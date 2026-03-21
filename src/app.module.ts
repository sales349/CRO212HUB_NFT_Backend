import { Module } from '@nestjs/common';
import { DatabaseModule } from './database/database.module';
import { RedisModule } from './redis/redis.module';
import { HealthModule } from './modules/health/health.module';
import { AuthModule } from './modules/auth/auth.module';
import { GeneratorModule } from './modules/generator/generator.module';
import { VaultModule } from './modules/vault/vault.module';
import { MarketplaceModule } from './modules/marketplace/marketplace.module';
import { ReputationModule } from './modules/reputation/reputation.module';
import { FeesModule } from './modules/fees/fees.module';
import { TelegramModule } from './modules/telegram/telegram.module';
import { FeatureFlagsModule } from './modules/feature-flags/feature-flags.module';
import { FeeAuditModule } from './modules/fee-audit/fee-audit.module';
import { ContractModule } from './modules/contract/contract.module';

@Module({
    imports: [
        DatabaseModule,
        RedisModule,
        HealthModule,
        AuthModule,
        GeneratorModule,
        VaultModule,
        MarketplaceModule,
        ReputationModule,
        FeesModule,
        TelegramModule,
        FeatureFlagsModule,
        FeeAuditModule,
        ContractModule,
    ],
})
export class AppModule { }