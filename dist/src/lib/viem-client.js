"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.viemClient = void 0;
const viem_1 = require("viem");
const app_config_1 = require("../config/app.config");
const chains_config_1 = require("../config/chains.config");
const chain = app_config_1.appConfig.CRONOS_CHAIN_ID === 25 ? chains_config_1.cronosMainnet : chains_config_1.cronosTestnet;
exports.viemClient = (0, viem_1.createPublicClient)({
    chain,
    transport: (0, viem_1.http)(app_config_1.appConfig.CRONOS_RPC_URL),
});
//# sourceMappingURL=viem-client.js.map