import { Module } from '@nestjs/common';
import { ContractService } from './contract.service';
import { ContractListenerService } from './contract-listener.service';
import { FeeAuditModule } from '../fee-audit/fee-audit.module';
import { ReputationModule } from '../reputation/reputation.module';

@Module({
    imports: [FeeAuditModule, ReputationModule],
    providers: [ContractService, ContractListenerService],
    exports: [ContractService],
})
export class ContractModule { }
