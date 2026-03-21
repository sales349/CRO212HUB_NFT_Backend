import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { TelegramController } from './telegram.controller';
import { TelegramService } from './telegram.service';
import { TelegramMapping, TelegramMappingSchema } from './schemas/telegram-mapping.schema';
import { ReputationModule } from '../reputation/reputation.module';

@Module({
    imports: [
        MongooseModule.forFeature([{ name: TelegramMapping.name, schema: TelegramMappingSchema }]),
        ReputationModule,
    ],
    controllers: [TelegramController],
    providers: [TelegramService],
    exports: [TelegramService],
})
export class TelegramModule { }
