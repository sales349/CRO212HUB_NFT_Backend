import { createPublicClient, http } from 'viem';
import { appConfig } from '../config/app.config';
import { cronosTestnet, cronosMainnet } from '../config/chains.config';

const chain = appConfig.CRONOS_CHAIN_ID === 25 ? cronosMainnet : cronosTestnet;

export const viemClient = createPublicClient({
    chain,
    transport: http(appConfig.CRONOS_RPC_URL),
});