import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { VaultController } from './vault.controller';
import { VaultService } from './vault.service';
import { Preset, PresetSchema } from './schemas/preset.schema';
import { GeneratorModule } from '../generator/generator.module';

@Module({
    imports: [
        MongooseModule.forFeature([{ name: Preset.name, schema: PresetSchema }]),
        GeneratorModule,
    ],
    controllers: [VaultController],
    providers: [VaultService],
    exports: [VaultService],
})
export class VaultModule { }