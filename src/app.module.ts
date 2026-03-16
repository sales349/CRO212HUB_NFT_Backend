import { Module } from '@nestjs/common';
import { DatabaseModule } from './database/database.module';
import { RedisModule } from './redis/redis.module';
import { HealthModule } from './modules/health/health.module';
import { AuthModule } from './modules/auth/auth.module';
import { GeneratorModule } from './modules/generator/generator.module';
import { VaultModule } from './modules/vault/vault.module';
import { MarketplaceModule } from './modules/marketplace/marketplace.module';


@Module({
    imports: [
        DatabaseModule,
        RedisModule,
        HealthModule,
        AuthModule,
        GeneratorModule,
        VaultModule,
        MarketplaceModule,
    ],
})
export class AppModule { }