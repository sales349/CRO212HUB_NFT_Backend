"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.siteConfig = void 0;
exports.siteConfig = {
    name: 'CRO212HUB',
    collectionName: 'CRO212HUB Genesis',
    description: 'Premium AI-Powered NFT Platform on Cronos',
    defaultChainId: 338,
    engineVersion: 'Generator V1',
    treasuryWallet: process.env.TREASURY_WALLET || '0x0000000000000000000000000000000000000000',
    fees: {
        primaryBps: 200,
        secondaryBuyerBps: 300,
        secondarySellerBps: 300,
        defaultRoyaltyBps: 500,
    },
};
//# sourceMappingURL=site.config.js.map