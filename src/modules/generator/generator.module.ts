import { Module } from '@nestjs/common';
import { GeneratorController } from './generator.controller';
import { GeneratorService } from './generator.service';
import { RarityService } from './rarity.service';
import { CompositingService } from './compositing.service';
import { IpfsService } from './ipfs.service';

@Module({
    controllers: [GeneratorController],
    providers: [
        GeneratorService,
        RarityService,
        CompositingService,
        IpfsService,
    ],
    exports: [GeneratorService],
})
export class GeneratorModule { }