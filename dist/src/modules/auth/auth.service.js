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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var AuthService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const jose_1 = require("jose");
const node_crypto_1 = require("node:crypto");
const ioredis_1 = __importDefault(require("ioredis"));
const redis_module_1 = require("../../redis/redis.module");
const app_config_1 = require("../../config/app.config");
let AuthService = AuthService_1 = class AuthService {
    redis;
    logger = new common_1.Logger(AuthService_1.name);
    secret;
    constructor(redis) {
        this.redis = redis;
        this.secret = new TextEncoder().encode(app_config_1.appConfig.JWT_SECRET);
    }
    async generateNonce(walletAddress) {
        const nonce = (0, node_crypto_1.randomBytes)(32).toString('hex');
        const key = `nonce:${walletAddress.toLowerCase()}`;
        await this.redis.set(key, nonce, 'EX', 300);
        this.logger.debug(`Nonce generated for ${walletAddress}`);
        return nonce;
    }
    async verifyAndIssueToken(walletAddress, _signature, nonce) {
        const key = `nonce:${walletAddress.toLowerCase()}`;
        const storedNonce = await this.redis.get(key);
        if (!storedNonce || storedNonce !== nonce) {
            throw new common_1.UnauthorizedException('Invalid or expired nonce');
        }
        await this.redis.del(key);
        const token = await new jose_1.SignJWT({ sub: walletAddress.toLowerCase() })
            .setProtectedHeader({ alg: 'HS256' })
            .setIssuedAt()
            .setExpirationTime('24h')
            .sign(this.secret);
        this.logger.log(`JWT issued for ${walletAddress}`);
        return token;
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = AuthService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)(redis_module_1.REDIS_CLIENT)),
    __metadata("design:paramtypes", [ioredis_1.default])
], AuthService);
//# sourceMappingURL=auth.service.js.map