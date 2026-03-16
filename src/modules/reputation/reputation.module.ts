import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ReputationController } from './reputation.controller';
import { ReputationService } from './reputation.service';
import { Reputation, ReputationSchema } from './schemas/reputation.schema';

@Module({
    imports: [
        MongooseModule.forFeature([{ name: Reputation.name, schema: ReputationSchema }]),
        // REDIS_CLIENT is @Global from RedisModule — no need to import
    ],
    controllers: [ReputationController],
    providers: [ReputationService],
    exports: [ReputationService],
})
export class ReputationModule { }
