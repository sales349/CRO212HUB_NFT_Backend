import { HealthService } from './health.service';
export declare class HealthController {
    private readonly healthService;
    constructor(healthService: HealthService);
    liveness(): {
        status: string;
        timestamp: string;
        uptime: number;
    };
    readiness(): Promise<{
        status: string;
        checks: Record<string, string>;
        timestamp: string;
    }>;
}
