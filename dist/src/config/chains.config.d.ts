export declare const cronosTestnet: {
    blockExplorers: {
        readonly default: {
            readonly name: "Cronos Testnet Explorer";
            readonly url: "https://explorer.cronos.org/testnet";
        };
    };
    blockTime?: number | undefined | undefined;
    contracts?: {
        [x: string]: import("viem").ChainContract | {
            [sourceId: number]: import("viem").ChainContract | undefined;
        } | undefined;
        ensRegistry?: import("viem").ChainContract | undefined;
        ensUniversalResolver?: import("viem").ChainContract | undefined;
        multicall3?: import("viem").ChainContract | undefined;
        erc6492Verifier?: import("viem").ChainContract | undefined;
    } | undefined;
    ensTlds?: readonly string[] | undefined;
    id: 338;
    name: "Cronos Testnet";
    nativeCurrency: {
        readonly name: "Cronos";
        readonly symbol: "TCRO";
        readonly decimals: 18;
    };
    experimental_preconfirmationTime?: number | undefined | undefined;
    rpcUrls: {
        readonly default: {
            readonly http: readonly ["https://evm-t3.cronos.org"];
        };
    };
    sourceId?: number | undefined | undefined;
    testnet: true;
    custom?: Record<string, unknown> | undefined;
    extendSchema?: Record<string, unknown> | undefined;
    fees?: import("viem").ChainFees<undefined> | undefined;
    formatters?: undefined;
    prepareTransactionRequest?: ((args: import("viem").PrepareTransactionRequestParameters, options: {
        phase: "beforeFillTransaction" | "beforeFillParameters" | "afterFillParameters";
    }) => Promise<import("viem").PrepareTransactionRequestParameters>) | [fn: ((args: import("viem").PrepareTransactionRequestParameters, options: {
        phase: "beforeFillTransaction" | "beforeFillParameters" | "afterFillParameters";
    }) => Promise<import("viem").PrepareTransactionRequestParameters>) | undefined, options: {
        runAt: readonly ("beforeFillTransaction" | "beforeFillParameters" | "afterFillParameters")[];
    }] | undefined;
    serializers?: import("viem").ChainSerializers<undefined, import("viem").TransactionSerializable> | undefined;
    verifyHash?: ((client: import("viem").Client, parameters: import("viem").VerifyHashActionParameters) => Promise<import("viem").VerifyHashActionReturnType>) | undefined;
    readonly network: "cronos-testnet";
};
export declare const cronosMainnet: {
    blockExplorers: {
        readonly default: {
            readonly name: "Cronos Explorer";
            readonly url: "https://explorer.cronos.org";
        };
    };
    blockTime?: number | undefined | undefined;
    contracts?: {
        [x: string]: import("viem").ChainContract | {
            [sourceId: number]: import("viem").ChainContract | undefined;
        } | undefined;
        ensRegistry?: import("viem").ChainContract | undefined;
        ensUniversalResolver?: import("viem").ChainContract | undefined;
        multicall3?: import("viem").ChainContract | undefined;
        erc6492Verifier?: import("viem").ChainContract | undefined;
    } | undefined;
    ensTlds?: readonly string[] | undefined;
    id: 25;
    name: "Cronos Mainnet";
    nativeCurrency: {
        readonly name: "Cronos";
        readonly symbol: "CRO";
        readonly decimals: 18;
    };
    experimental_preconfirmationTime?: number | undefined | undefined;
    rpcUrls: {
        readonly default: {
            readonly http: readonly ["https://evm.cronos.org"];
        };
    };
    sourceId?: number | undefined | undefined;
    testnet: false;
    custom?: Record<string, unknown> | undefined;
    extendSchema?: Record<string, unknown> | undefined;
    fees?: import("viem").ChainFees<undefined> | undefined;
    formatters?: undefined;
    prepareTransactionRequest?: ((args: import("viem").PrepareTransactionRequestParameters, options: {
        phase: "beforeFillTransaction" | "beforeFillParameters" | "afterFillParameters";
    }) => Promise<import("viem").PrepareTransactionRequestParameters>) | [fn: ((args: import("viem").PrepareTransactionRequestParameters, options: {
        phase: "beforeFillTransaction" | "beforeFillParameters" | "afterFillParameters";
    }) => Promise<import("viem").PrepareTransactionRequestParameters>) | undefined, options: {
        runAt: readonly ("beforeFillTransaction" | "beforeFillParameters" | "afterFillParameters")[];
    }] | undefined;
    serializers?: import("viem").ChainSerializers<undefined, import("viem").TransactionSerializable> | undefined;
    verifyHash?: ((client: import("viem").Client, parameters: import("viem").VerifyHashActionParameters) => Promise<import("viem").VerifyHashActionReturnType>) | undefined;
    readonly network: "cronos";
};
export declare const CHAINS: {
    readonly cronos: {
        readonly id: 25;
        readonly name: "Cronos Mainnet";
        readonly rpcUrl: "https://evm.cronos.org";
        readonly active: false;
        readonly explorer: "https://explorer.cronos.org";
        readonly contracts: {
            readonly collection: `0x${string}` | null;
            readonly marketplace: `0x${string}` | null;
        };
    };
    readonly cronosTestnet: {
        readonly id: 338;
        readonly name: "Cronos Testnet";
        readonly rpcUrl: "https://evm-t3.cronos.org";
        readonly active: true;
        readonly explorer: "https://explorer.cronos.org/testnet";
        readonly contracts: {
            readonly collection: `0x${string}`;
            readonly marketplace: `0x${string}` | null;
        };
    };
    readonly ethereum: {
        readonly id: 1;
        readonly name: "Ethereum";
        readonly rpcUrl: "";
        readonly active: false;
        readonly explorer: "https://etherscan.io";
        readonly contracts: {
            readonly collection: `0x${string}` | null;
            readonly marketplace: `0x${string}` | null;
        };
    };
};
export type ChainKey = keyof typeof CHAINS;
export type ChainConfig = (typeof CHAINS)[ChainKey];
