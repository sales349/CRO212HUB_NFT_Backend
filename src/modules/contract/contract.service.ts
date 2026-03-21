import { Injectable, Logger } from '@nestjs/common';
import { type Address, formatEther } from 'viem';
import { viemClient } from '@/lib/viem-client';
import { appConfig } from '@/config/app.config';
import { LAUNCHPAD_COLLECTION_ABI } from './abi/launchpad-collection.abi';
import { MARKETPLACE_ABI } from './abi/marketplace.abi';

@Injectable()
export class ContractService {
    private readonly logger = new Logger(ContractService.name);

    private get nftAddress(): Address | null {
        const addr = appConfig.NFT_CONTRACT_ADDRESS;
        return addr && addr !== '' ? (addr as Address) : null;
    }

    private get marketplaceAddress(): Address | null {
        const addr = appConfig.MARKETPLACE_CONTRACT_ADDRESS;
        return addr && addr !== '' ? (addr as Address) : null;
    }

    // ========= LaunchpadCollection Reads =========

    async getTotalSupply(): Promise<bigint> {
        if (!this.nftAddress) throw new Error('NFT contract address not configured');
        return viemClient.readContract({
            address: this.nftAddress,
            abi: LAUNCHPAD_COLLECTION_ABI,
            functionName: 'totalSupply',
        });
    }

    async getMintPrice(): Promise<bigint> {
        if (!this.nftAddress) throw new Error('NFT contract address not configured');
        return viemClient.readContract({
            address: this.nftAddress,
            abi: LAUNCHPAD_COLLECTION_ABI,
            functionName: 'mintPrice',
        });
    }

    async getSaleActive(): Promise<boolean> {
        if (!this.nftAddress) throw new Error('NFT contract address not configured');
        return viemClient.readContract({
            address: this.nftAddress,
            abi: LAUNCHPAD_COLLECTION_ABI,
            functionName: 'saleActive',
        });
    }

    async getBalanceOf(owner: Address): Promise<bigint> {
        if (!this.nftAddress) throw new Error('NFT contract address not configured');
        return viemClient.readContract({
            address: this.nftAddress,
            abi: LAUNCHPAD_COLLECTION_ABI,
            functionName: 'balanceOf',
            args: [owner],
        });
    }

    async getOwnerOf(tokenId: bigint): Promise<Address> {
        if (!this.nftAddress) throw new Error('NFT contract address not configured');
        return viemClient.readContract({
            address: this.nftAddress,
            abi: LAUNCHPAD_COLLECTION_ABI,
            functionName: 'ownerOf',
            args: [tokenId],
        });
    }

    async getRoyaltyInfo(tokenId: bigint, salePrice: bigint) {
        if (!this.nftAddress) throw new Error('NFT contract address not configured');
        const [receiver, amount] = await viemClient.readContract({
            address: this.nftAddress,
            abi: LAUNCHPAD_COLLECTION_ABI,
            functionName: 'royaltyInfo',
            args: [tokenId, salePrice],
        });
        return { receiver, amount };
    }

    async getCollectionInfo() {
        if (!this.nftAddress) throw new Error('NFT contract address not configured');
        const [name, symbol, mintPrice, maxSupply, totalSupply, saleActive, paused] = await Promise.all([
            viemClient.readContract({ address: this.nftAddress!, abi: LAUNCHPAD_COLLECTION_ABI, functionName: 'name' }),
            viemClient.readContract({ address: this.nftAddress!, abi: LAUNCHPAD_COLLECTION_ABI, functionName: 'symbol' }),
            viemClient.readContract({ address: this.nftAddress!, abi: LAUNCHPAD_COLLECTION_ABI, functionName: 'mintPrice' }),
            viemClient.readContract({ address: this.nftAddress!, abi: LAUNCHPAD_COLLECTION_ABI, functionName: 'maxSupply' }),
            viemClient.readContract({ address: this.nftAddress!, abi: LAUNCHPAD_COLLECTION_ABI, functionName: 'totalSupply' }),
            viemClient.readContract({ address: this.nftAddress!, abi: LAUNCHPAD_COLLECTION_ABI, functionName: 'saleActive' }),
            viemClient.readContract({ address: this.nftAddress!, abi: LAUNCHPAD_COLLECTION_ABI, functionName: 'paused' }),
        ]);
        return {
            name, symbol, paused, saleActive,
            mintPrice: formatEther(mintPrice),
            mintPriceRaw: mintPrice.toString(),
            maxSupply: maxSupply.toString(),
            totalSupply: totalSupply.toString(),
        };
    }

    // ========= CRO212Marketplace Reads =========

    async getBuyerTotal(listingId: bigint): Promise<bigint> {
        if (!this.marketplaceAddress) throw new Error('Marketplace contract address not configured');
        return viemClient.readContract({
            address: this.marketplaceAddress,
            abi: MARKETPLACE_ABI,
            functionName: 'getBuyerTotal',
            args: [listingId],
        });
    }

    async getSellerProceeds(listingId: bigint) {
        if (!this.marketplaceAddress) throw new Error('Marketplace contract address not configured');
        const [sellerProceeds, sellerFeeAmount, royaltyAmount, royaltyReceiver] = await viemClient.readContract({
            address: this.marketplaceAddress,
            abi: MARKETPLACE_ABI,
            functionName: 'getSellerProceeds',
            args: [listingId],
        });
        return {
            sellerProceeds: formatEther(sellerProceeds),
            sellerProceedsRaw: sellerProceeds.toString(),
            sellerFee: formatEther(sellerFeeAmount),
            sellerFeeRaw: sellerFeeAmount.toString(),
            royaltyAmount: formatEther(royaltyAmount),
            royaltyAmountRaw: royaltyAmount.toString(),
            royaltyReceiver,
        };
    }

    async getOnChainListing(listingId: bigint) {
        if (!this.marketplaceAddress) throw new Error('Marketplace contract address not configured');
        const [seller, nftContract, tokenId, price, status, createdAt, buyerFeeBps, sellerFeeBps] = await viemClient.readContract({
            address: this.marketplaceAddress,
            abi: MARKETPLACE_ABI,
            functionName: 'getListing',
            args: [listingId],
        });
        return {
            seller, nftContract, status,
            tokenId: tokenId.toString(),
            price: formatEther(price),
            priceRaw: price.toString(),
            createdAt: Number(createdAt),
            buyerFeeBps: Number(buyerFeeBps),
            sellerFeeBps: Number(sellerFeeBps),
        };
    }

    async getMarketplaceFeeInfo() {
        if (!this.marketplaceAddress) throw new Error('Marketplace contract address not configured');
        const [buyerFeeBps, sellerFeeBps, maxFeeBps, treasury] = await viemClient.readContract({
            address: this.marketplaceAddress,
            abi: MARKETPLACE_ABI,
            functionName: 'getFeeInfo',
        });
        return {
            buyerFeeBps: Number(buyerFeeBps),
            sellerFeeBps: Number(sellerFeeBps),
            maxFeeBps: Number(maxFeeBps),
            treasury,
        };
    }

    // ========= Gas Estimates =========

    async estimateMintGas(quantity: bigint, value: bigint): Promise<string> {
        if (!this.nftAddress) throw new Error('NFT contract address not configured');
        try {
            const gas = await viemClient.estimateContractGas({
                address: this.nftAddress,
                abi: LAUNCHPAD_COLLECTION_ABI,
                functionName: 'mintPublic',
                args: [quantity],
                value,
            });
            return gas.toString();
        } catch (error) {
            this.logger.warn(`Gas estimation failed for mintPublic: ${error}`);
            return '0';
        }
    }

    async estimateBuyGas(listingId: bigint, value: bigint): Promise<string> {
        if (!this.marketplaceAddress) throw new Error('Marketplace contract address not configured');
        try {
            const gas = await viemClient.estimateContractGas({
                address: this.marketplaceAddress,
                abi: MARKETPLACE_ABI,
                functionName: 'buyNFT',
                args: [listingId],
                value,
            });
            return gas.toString();
        } catch (error) {
            this.logger.warn(`Gas estimation failed for buyNFT: ${error}`);
            return '0';
        }
    }

    // ========= Utility =========

    isNftConfigured(): boolean {
        return this.nftAddress !== null;
    }

    isMarketplaceConfigured(): boolean {
        return this.marketplaceAddress !== null;
    }

    getNftAddress(): string | null {
        return this.nftAddress;
    }

    getMarketplaceAddress(): string | null {
        return this.marketplaceAddress;
    }
}
