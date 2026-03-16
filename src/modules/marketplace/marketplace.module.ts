import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { MarketplaceController } from './marketplace.controller';
import { MarketplaceService } from './marketplace.service';
import { Listing, ListingSchema } from './schemas/listing.schema';
import { ContractModule } from '../contract/contract.module';

@Module({
    imports: [
        MongooseModule.forFeature([{ name: Listing.name, schema: ListingSchema }]),
        ContractModule,
    ],
    controllers: [MarketplaceController],
    providers: [MarketplaceService],
    exports: [MarketplaceService],
})
export class MarketplaceModule { }
