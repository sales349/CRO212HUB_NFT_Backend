import { defineChain } from 'viem';

export const cronosTestnet = defineChain({
    id: 338,
    name: 'Cronos Testnet',
    network: 'cronos-testnet',
    nativeCurrency: {
        name: 'Cronos',
        symbol: 'TCRO',
        decimals: 18,
    },
    rpcUrls: {
        default: {
            http: ['https://evm-t3.cronos.org'],
        },
    },
    blockExplorers: {
        default: {
            name: 'Cronos Testnet Explorer',
            url: 'https://explorer.cronos.org/testnet',
        },
    },
    testnet: true,
});

export const cronosMainnet = defineChain({
    id: 25,
    name: 'Cronos Mainnet',
    network: 'cronos',
    nativeCurrency: {
        name: 'Cronos',
        symbol: 'CRO',
        decimals: 18,
    },
    rpcUrls: {
        default: {
            http: ['https://evm.cronos.org'],
        },
    },
    blockExplorers: {
        default: {
            name: 'Cronos Explorer',
            url: 'https://explorer.cronos.org',
        },
    },
    testnet: false,
});

export const CHAINS = {
    cronos: {
        id: 25,
        name: 'Cronos Mainnet',
        rpcUrl: 'https://evm.cronos.org',
        active: false,
        explorer: 'https://explorer.cronos.org',
        contracts: {
            collection: null as `0x${string}` | null,
            marketplace: null as `0x${string}` | null,
        },
    },
    cronosTestnet: {
        id: 338,
        name: 'Cronos Testnet',
        rpcUrl: 'https://evm-t3.cronos.org',
        active: true,
        explorer: 'https://explorer.cronos.org/testnet',
        contracts: {
            collection: '0x97A26591f2263490BfADd0EeD6651CB50B1b6D20' as `0x${string}`,
            marketplace: null as `0x${string}` | null,
        },
    },
    ethereum: {
        id: 1,
        name: 'Ethereum',
        rpcUrl: '',
        active: false,
        explorer: 'https://etherscan.io',
        contracts: {
            collection: null as `0x${string}` | null,
            marketplace: null as `0x${string}` | null,
        },
    },
} as const;

export type ChainKey = keyof typeof CHAINS;
export type ChainConfig = (typeof CHAINS)[ChainKey];