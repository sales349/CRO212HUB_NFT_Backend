import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import {
    ApiTags,
    ApiOperation,
    ApiResponse,
    ApiBearerAuth,
    ApiQuery,
} from '@nestjs/swagger';
import { AuthGuard } from '@/common/guards/auth.guard';
import { AdminGuard } from '@/common/guards/admin.guard';
import { FeeAuditService } from './fee-audit.service';

@ApiTags('Admin - Fee Audit')
@Controller('admin/fee-audit')
export class FeeAuditController {
    constructor(private readonly feeAuditService: FeeAuditService) { }

    @Get()
    @UseGuards(AuthGuard, AdminGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Get fee audit log (admin only)' })
    @ApiQuery({ name: 'page', required: false, type: Number })
    @ApiQuery({ name: 'limit', required: false, type: Number })
    @ApiQuery({ name: 'seller', required: false, type: String })
    @ApiQuery({ name: 'buyer', required: false, type: String })
    @ApiResponse({ status: 200, description: 'Audit log returned' })
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    @ApiResponse({ status: 403, description: 'Forbidden — admin only' })
    async getAuditLog(@Query() query: Record<string, string>) {
        const page = query.page ? parseInt(query.page, 10) : 1;
        const limit = query.limit ? parseInt(query.limit, 10) : 20;
        const result = await this.feeAuditService.getAuditLog({
            page,
            limit,
            seller: query.seller,
            buyer: query.buyer,
        });

        return {
            success: true,
            ...result,
        };
    }

    @Get('stats')
    @UseGuards(AuthGuard, AdminGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Get fee audit stats (admin only)' })
    @ApiResponse({ status: 200, description: 'Stats returned' })
    async getStats() {
        const stats = await this.feeAuditService.getStats();
        return {
            success: true,
            stats,
        };
    }
}
