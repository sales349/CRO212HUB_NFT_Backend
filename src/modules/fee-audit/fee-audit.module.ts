import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { FeeAudit, FeeAuditSchema } from './fee-audit.schema';
import { FeeAuditService } from './fee-audit.service';
import { FeeAuditController } from './fee-audit.controller';

@Module({
    imports: [
        MongooseModule.forFeature([{ name: FeeAudit.name, schema: FeeAuditSchema }]),
    ],
    controllers: [FeeAuditController],
    providers: [FeeAuditService],
    exports: [FeeAuditService],
})
export class FeeAuditModule { }
