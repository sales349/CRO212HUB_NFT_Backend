import { Module } from '@nestjs/common';
import { ContractService } from './contract.service';
import { ContractListenerService } from './contract-listener.service';
import { FeeAuditModule } from '../fee-audit/fee-audit.module';
import { ReputationModule } from '../reputation/reputation.module';
import { MongooseModule } from '@nestjs/mongoose';
import { Listing, ListingSchema } from '../marketplace/schemas/listing.schema';

@Module({
    imports: [
        FeeAuditModule, 
        ReputationModule,
        MongooseModule.forFeature([{ name: Listing.name, schema: ListingSchema }])
    ],
    providers: [ContractService, ContractListenerService],
    exports: [ContractService],
})
export class ContractModule { }
