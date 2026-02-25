import { Module } from '@nestjs/common';
import { DatabaseModule } from './database/database.module';
import { RedisModule } from './redis/redis.module';
import { HealthModule } from './modules/health/health.module';
import { AuthModule } from './modules/auth/auth.module';
import { GeneratorModule } from './modules/generator/generator.module';

@Module({
    imports: [
        DatabaseModule,
        RedisModule,
        HealthModule,
        AuthModule,
        GeneratorModule,
    ],
})
export class AppModule { }