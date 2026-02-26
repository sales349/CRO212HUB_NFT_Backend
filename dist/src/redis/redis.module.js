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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RedisModule = exports.REDIS_CLIENT = void 0;
const common_1 = require("@nestjs/common");
const ioredis_1 = __importDefault(require("ioredis"));
const app_config_1 = require("../config/app.config");
exports.REDIS_CLIENT = 'REDIS_CLIENT';
let RedisModule = class RedisModule {
    constructor() { }
    async onModuleDestroy() {
    }
};
exports.RedisModule = RedisModule;
exports.RedisModule = RedisModule = __decorate([
    (0, common_1.Global)(),
    (0, common_1.Module)({
        providers: [
            {
                provide: exports.REDIS_CLIENT,
                useFactory: () => {
                    const logger = new common_1.Logger('RedisModule');
                    const client = new ioredis_1.default(app_config_1.appConfig.REDIS_URL, {
                        maxRetriesPerRequest: 3,
                        retryStrategy(times) {
                            const delay = Math.min(times * 50, 2000);
                            return delay;
                        },
                    });
                    client.on('connect', () => logger.log('Redis connected'));
                    client.on('error', (err) => logger.error('Redis error', err.message));
                    return client;
                },
            },
        ],
        exports: [exports.REDIS_CLIENT],
    }),
    __metadata("design:paramtypes", [])
], RedisModule);
//# sourceMappingURL=redis.module.js.map