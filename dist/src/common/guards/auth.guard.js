"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var AuthGuard_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthGuard = void 0;
const common_1 = require("@nestjs/common");
const jose_1 = require("jose");
const app_config_1 = require("../../config/app.config");
let AuthGuard = AuthGuard_1 = class AuthGuard {
    logger = new common_1.Logger(AuthGuard_1.name);
    secret;
    constructor() {
        this.secret = new TextEncoder().encode(app_config_1.appConfig.JWT_SECRET);
    }
    async canActivate(context) {
        const request = context.switchToHttp().getRequest();
        const authHeader = request.headers.authorization;
        if (!authHeader) {
            throw new common_1.UnauthorizedException('Missing authorization header');
        }
        const parts = authHeader.split(' ');
        if (parts.length !== 2 || parts[0] !== 'Bearer') {
            throw new common_1.UnauthorizedException('Invalid authorization format');
        }
        const token = parts[1];
        try {
            const { payload } = await (0, jose_1.jwtVerify)(token, this.secret);
            request.user = payload;
            return true;
        }
        catch (error) {
            this.logger.debug(`JWT verification failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
            throw new common_1.UnauthorizedException('Invalid or expired token');
        }
    }
};
exports.AuthGuard = AuthGuard;
exports.AuthGuard = AuthGuard = AuthGuard_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [])
], AuthGuard);
//# sourceMappingURL=auth.guard.js.map