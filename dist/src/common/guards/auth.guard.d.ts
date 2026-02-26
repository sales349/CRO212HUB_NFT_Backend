import { CanActivate, ExecutionContext } from '@nestjs/common';
export declare class AuthGuard implements CanActivate {
    private readonly logger;
    private readonly secret;
    constructor();
    canActivate(context: ExecutionContext): Promise<boolean>;
}
