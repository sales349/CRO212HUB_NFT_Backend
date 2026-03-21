import { Injectable, Logger, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { type Address, type Log, formatEther, parseAbiItem } from 'viem';
import { viemClient } from '@/lib/viem-client';
import { appConfig } from '@/config/app.config';
import { MARKETPLACE_ABI } from './abi/marketplace.abi';
import { LAUNCHPAD_COLLECTION_ABI } from './abi/launchpad-collection.abi';
import { FeeAuditService, type LogSaleData } from '../fee-audit/fee-audit.service';
import { ReputationService } from '../reputation/reputation.service';

@Injectable()
export class ContractListenerService implements OnModuleInit, OnModuleDestroy {
    private readonly logger = new Logger(ContractListenerService.name);
    private unwatchFunctions: (() => void)[] = [];

    constructor(
        private readonly feeAuditService: FeeAuditService,
        private readonly reputationService: ReputationService,
    ) { }

    async onModuleInit() {
        const marketplaceAddr = appConfig.MARKETPLACE_CONTRACT_ADDRESS;
        const nftAddr = appConfig.NFT_CONTRACT_ADDRESS;

        if (!marketplaceAddr || marketplaceAddr === '') {
            this.logger.warn('MARKETPLACE_CONTRACT_ADDRESS not set — skipping marketplace event listeners');
        } else {
            this.watchMarketplaceEvents(marketplaceAddr as Address);
        }

        if (!nftAddr || nftAddr === '') {
            this.logger.warn('NFT_CONTRACT_ADDRESS not set — skipping NFT event listeners');
        } else {
            this.watchNftEvents(nftAddr as Address);
        }
    }

    onModuleDestroy() {
        this.logger.log(`Cleaning up ${this.unwatchFunctions.length} event watchers`);
        for (const unwatch of this.unwatchFunctions) {
            try {
                unwatch();
            } catch (e) {
                this.logger.warn(`Error unwatching: ${e}`);
            }
        }
        this.unwatchFunctions = [];
    }

    // ========= Marketplace Events =========

    private watchMarketplaceEvents(address: Address) {
        this.logger.log(`Starting marketplace event watchers on ${address}`);

        // Watch Sale events
        const unwatchSale = viemClient.watchContractEvent({
            address,
            abi: MARKETPLACE_ABI,
            eventName: 'Sale',
            onLogs: (logs) => {
                for (const log of logs) {
                    this.handleSaleEvent(log).catch((err) =>
                        this.logger.error(`Error handling Sale event: ${err}`),
                    );
                }
            },
            onError: (error) => {
                this.logger.error(`Sale watcher error: ${error.message}`);
            },
        });
        this.unwatchFunctions.push(unwatchSale);

        // Watch Listed events
        const unwatchListed = viemClient.watchContractEvent({
            address,
            abi: MARKETPLACE_ABI,
            eventName: 'Listed',
            onLogs: (logs) => {
                for (const log of logs) {
                    this.handleListedEvent(log);
                }
            },
            onError: (error) => {
                this.logger.error(`Listed watcher error: ${error.message}`);
            },
        });
        this.unwatchFunctions.push(unwatchListed);

        // Watch Cancelled events
        const unwatchCancelled = viemClient.watchContractEvent({
            address,
            abi: MARKETPLACE_ABI,
            eventName: 'Cancelled',
            onLogs: (logs) => {
                for (const log of logs) {
                    this.handleCancelledEvent(log);
                }
            },
            onError: (error) => {
                this.logger.error(`Cancelled watcher error: ${error.message}`);
            },
        });
        this.unwatchFunctions.push(unwatchCancelled);

        this.logger.log('Marketplace event watchers started (Sale, Listed, Cancelled)');
    }

    // ========= NFT Events =========

    private watchNftEvents(address: Address) {
        this.logger.log(`Starting NFT event watchers on ${address}`);

        // Watch PublicMint events
        const unwatchPublicMint = viemClient.watchContractEvent({
            address,
            abi: LAUNCHPAD_COLLECTION_ABI,
            eventName: 'PublicMint',
            onLogs: (logs) => {
                for (const log of logs) {
                    this.handleMintEvent(log, 'PublicMint');
                }
            },
            onError: (error) => {
                this.logger.error(`PublicMint watcher error: ${error.message}`);
            },
        });
        this.unwatchFunctions.push(unwatchPublicMint);

        // Watch WhitelistMint events
        const unwatchWhitelistMint = viemClient.watchContractEvent({
            address,
            abi: LAUNCHPAD_COLLECTION_ABI,
            eventName: 'WhitelistMint',
            onLogs: (logs) => {
                for (const log of logs) {
                    this.handleMintEvent(log, 'WhitelistMint');
                }
            },
            onError: (error) => {
                this.logger.error(`WhitelistMint watcher error: ${error.message}`);
            },
        });
        this.unwatchFunctions.push(unwatchWhitelistMint);

        // Watch Transfer events
        const unwatchTransfer = viemClient.watchContractEvent({
            address,
            abi: LAUNCHPAD_COLLECTION_ABI,
            eventName: 'Transfer',
            onLogs: (logs) => {
                for (const log of logs) {
                    this.handleTransferEvent(log);
                }
            },
            onError: (error) => {
                this.logger.error(`Transfer watcher error: ${error.message}`);
            },
        });
        this.unwatchFunctions.push(unwatchTransfer);

        this.logger.log('NFT event watchers started (PublicMint, WhitelistMint, Transfer)');
    }

    // ========= Event Handlers =========

    private async handleSaleEvent(log: Log & { args?: Record<string, unknown> }) {
        const args = (log as unknown as {
            args: {
                listingId: bigint;
                buyer: Address;
                seller: Address;
                price: bigint;
                buyerFee: bigint;
                sellerFee: bigint;
                royaltyAmount: bigint;
                royaltyReceiver: Address;
            };
        }).args;

        if (!args) {
            this.logger.warn('Sale event log missing args');
            return;
        }

        this.logger.log(
            `Sale event: listing #${args.listingId}, buyer ${args.buyer}, price ${formatEther(args.price)} CRO`,
        );

        // 1. Log fee audit
        const saleData: LogSaleData = {
            listingId: Number(args.listingId),
            price: args.price.toString(),
            buyerFee: args.buyerFee.toString(),
            sellerFee: args.sellerFee.toString(),
            royaltyAmount: args.royaltyAmount.toString(),
            royaltyReceiver: args.royaltyReceiver,
            platformRevenue: (args.buyerFee + args.sellerFee).toString(),
            sellerProceeds: (args.price - args.sellerFee - args.royaltyAmount).toString(),
            buyer: args.buyer.toLowerCase(),
            seller: args.seller.toLowerCase(),
            txHash: log.transactionHash || '',
            blockNumber: Number(log.blockNumber || 0),
        };

        await this.feeAuditService.logSale(saleData);

        // 2. Update buyer reputation
        try {
            await this.reputationService.updateFromActivity(args.buyer.toLowerCase(), 'purchase');
        } catch (e) {
            this.logger.warn(`Failed to update buyer reputation: ${e}`);
        }

        // 3. Update seller reputation
        try {
            await this.reputationService.updateFromActivity(args.seller.toLowerCase(), 'sale');
        } catch (e) {
            this.logger.warn(`Failed to update seller reputation: ${e}`);
        }
    }

    private handleListedEvent(log: Log & { args?: Record<string, unknown> }) {
        const args = (log as unknown as {
            args: {
                listingId: bigint;
                seller: Address;
                nftContract: Address;
                tokenId: bigint;
                price: bigint;
            };
        }).args;

        if (!args) return;

        this.logger.log(
            `Listed event: listing #${args.listingId}, seller ${args.seller}, price ${formatEther(args.price)} CRO`,
        );

        // Update seller reputation (listing activity)
        this.reputationService.updateFromActivity(args.seller.toLowerCase(), 'listing').catch((e) =>
            this.logger.warn(`Failed to update seller listing reputation: ${e}`),
        );
    }

    private handleCancelledEvent(log: Log & { args?: Record<string, unknown> }) {
        const args = (log as unknown as {
            args: { listingId: bigint };
        }).args;

        if (!args) return;

        this.logger.log(`Cancelled event: listing #${args.listingId}`);
    }

    private handleMintEvent(log: Log & { args?: Record<string, unknown> }, type: string) {
        const args = (log as unknown as {
            args: { minter: Address; quantity: bigint; value: bigint };
        }).args;

        if (!args) return;

        this.logger.log(
            `${type} event: minter ${args.minter}, quantity ${args.quantity}, value ${formatEther(args.value)} CRO`,
        );

        // Update minter reputation
        this.reputationService.updateFromActivity(args.minter.toLowerCase(), 'mint').catch((e) =>
            this.logger.warn(`Failed to update minter reputation: ${e}`),
        );
    }

    private handleTransferEvent(log: Log & { args?: Record<string, unknown> }) {
        const args = (log as unknown as {
            args: { from: Address; to: Address; tokenId: bigint };
        }).args;

        if (!args) return;

        // Skip mint transfers (from = 0x0)
        if (args.from === '0x0000000000000000000000000000000000000000') return;

        this.logger.log(
            `Transfer event: token #${args.tokenId} from ${args.from} to ${args.to}`,
        );
    }
}
