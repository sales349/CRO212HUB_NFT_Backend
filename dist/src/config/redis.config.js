"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.redisConfig = void 0;
const app_config_1 = require("./app.config");
exports.redisConfig = {
    url: app_config_1.appConfig.REDIS_URL,
    maxRetriesPerRequest: 3,
    retryStrategy(times) {
        const delay = Math.min(times * 50, 2000);
        return delay;
    },
};
//# sourceMappingURL=redis.config.js.map