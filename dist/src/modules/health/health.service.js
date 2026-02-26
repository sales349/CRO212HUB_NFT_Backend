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
var HealthService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.HealthService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const ioredis_1 = __importDefault(require("ioredis"));
const redis_module_1 = require("../../redis/redis.module");
let HealthService = HealthService_1 = class HealthService {
    mongoConnection;
    redis;
    logger = new common_1.Logger(HealthService_1.name);
    constructor(mongoConnection, redis) {
        this.mongoConnection = mongoConnection;
        this.redis = redis;
    }
    async checkReadiness() {
        const checks = {};
        try {
            const state = this.mongoConnection.readyState;
            checks.mongodb = state === 1 ? 'connected' : 'disconnected';
        }
        catch {
            checks.mongodb = 'error';
        }
        try {
            await this.redis.ping();
            checks.redis = 'connected';
        }
        catch {
            checks.redis = 'error';
        }
        const allHealthy = Object.values(checks).every((v) => v === 'connected');
        return {
            status: allHealthy ? 'ready' : 'degraded',
            checks,
            timestamp: new Date().toISOString(),
        };
    }
};
exports.HealthService = HealthService;
exports.HealthService = HealthService = HealthService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectConnection)()),
    __param(1, (0, common_1.Inject)(redis_module_1.REDIS_CLIENT)),
    __metadata("design:paramtypes", [mongoose_2.Connection,
        ioredis_1.default])
], HealthService);
//# sourceMappingURL=health.service.js.map