// Contract Reader — viem readContract helpers for LaunchpadCollection
// ABI derived from CRO212HUB_NFT_Contracts/src/LaunchpadCollection.sol
// Week 4: Basic reads. Week 5: writeContract calls.

import { type Address } from 'viem';
import { viemClient } from './viem-client';

// Read-only ABI extracted from LaunchpadCollection.sol (ERC721Enumerable + ERC721Royalty)
export const LAUNCHPAD_READ_ABI = [
    // --- ERC721 core ---
    { type: 'function', name: 'name', inputs: [], outputs: [{ name: '', type: 'string' }], stateMutability: 'view' },
    { type: 'function', name: 'symbol', inputs: [], outputs: [{ name: '', type: 'string' }], stateMutability: 'view' },
    { type: 'function', name: 'tokenURI', inputs: [{ name: 'tokenId', type: 'uint256' }], outputs: [{ name: '', type: 'string' }], stateMutability: 'view' },
    { type: 'function', name: 'balanceOf', inputs: [{ name: 'owner', type: 'address' }], outputs: [{ name: '', type: 'uint256' }], stateMutability: 'view' },
    { type: 'function', name: 'ownerOf', inputs: [{ name: 'tokenId', type: 'uint256' }], outputs: [{ name: '', type: 'address' }], stateMutability: 'view' },
    { type: 'function', name: 'getApproved', inputs: [{ name: 'tokenId', type: 'uint256' }], outputs: [{ name: '', type: 'address' }], stateMutability: 'view' },
    { type: 'function', name: 'isApprovedForAll', inputs: [{ name: 'owner', type: 'address' }, { name: 'operator', type: 'address' }], outputs: [{ name: '', type: 'bool' }], stateMutability: 'view' },
    // --- ERC721Enumerable ---
    { type: 'function', name: 'totalSupply', inputs: [], outputs: [{ name: '', type: 'uint256' }], stateMutability: 'view' },
    { type: 'function', name: 'tokenByIndex', inputs: [{ name: 'index', type: 'uint256' }], outputs: [{ name: '', type: 'uint256' }], stateMutability: 'view' },
    { type: 'function', name: 'tokenOfOwnerByIndex', inputs: [{ name: 'owner', type: 'address' }, { name: 'index', type: 'uint256' }], outputs: [{ name: '', type: 'uint256' }], stateMutability: 'view' },
    // --- Ownable ---
    { type: 'function', name: 'owner', inputs: [], outputs: [{ name: '', type: 'address' }], stateMutability: 'view' },
    // --- ERC2981 (Royalty) ---
    { type: 'function', name: 'royaltyInfo', inputs: [{ name: 'tokenId', type: 'uint256' }, { name: 'salePrice', type: 'uint256' }], outputs: [{ name: 'receiver', type: 'address' }, { name: 'royaltyAmount', type: 'uint256' }], stateMutability: 'view' },
    { type: 'function', name: 'supportsInterface', inputs: [{ name: 'interfaceId', type: 'bytes4' }], outputs: [{ name: '', type: 'bool' }], stateMutability: 'view' },
    // --- LaunchpadCollection custom ---
    { type: 'function', name: 'maxSupply', inputs: [], outputs: [{ name: '', type: 'uint256' }], stateMutability: 'view' },
    { type: 'function', name: 'mintPrice', inputs: [], outputs: [{ name: '', type: 'uint256' }], stateMutability: 'view' },
    { type: 'function', name: 'maxPerWallet', inputs: [], outputs: [{ name: '', type: 'uint256' }], stateMutability: 'view' },
    { type: 'function', name: 'saleActive', inputs: [], outputs: [{ name: '', type: 'bool' }], stateMutability: 'view' },
    { type: 'function', name: 'whitelistSaleActive', inputs: [], outputs: [{ name: '', type: 'bool' }], stateMutability: 'view' },
    { type: 'function', name: 'whitelistMerkleRoot', inputs: [], outputs: [{ name: '', type: 'bytes32' }], stateMutability: 'view' },
    { type: 'function', name: 'mintsByWallet', inputs: [{ name: '', type: 'address' }], outputs: [{ name: '', type: 'uint256' }], stateMutability: 'view' },
    { type: 'function', name: 'treasuryWallet', inputs: [], outputs: [{ name: '', type: 'address' }], stateMutability: 'view' },
    { type: 'function', name: 'platformWallet', inputs: [], outputs: [{ name: '', type: 'address' }], stateMutability: 'view' },
    { type: 'function', name: 'communityWallet', inputs: [], outputs: [{ name: '', type: 'address' }], stateMutability: 'view' },
    { type: 'function', name: 'treasuryBasisPoints', inputs: [], outputs: [{ name: '', type: 'uint16' }], stateMutability: 'view' },
    { type: 'function', name: 'platformBasisPoints', inputs: [], outputs: [{ name: '', type: 'uint16' }], stateMutability: 'view' },
    { type: 'function', name: 'communityBasisPoints', inputs: [], outputs: [{ name: '', type: 'uint16' }], stateMutability: 'view' },
    { type: 'function', name: 'MAX_BASIS_POINTS', inputs: [], outputs: [{ name: '', type: 'uint16' }], stateMutability: 'view' },
    { type: 'function', name: 'DEFAULT_ROYALTY_BPS', inputs: [], outputs: [{ name: '', type: 'uint96' }], stateMutability: 'view' },
    { type: 'function', name: 'defaultRoyaltyReceiver', inputs: [], outputs: [{ name: '', type: 'address' }], stateMutability: 'view' },
    // --- Pausable ---
    { type: 'function', name: 'paused', inputs: [], outputs: [{ name: '', type: 'bool' }], stateMutability: 'view' },
] as const;

/**
 * Get the contract owner address
 */
export async function getContractOwner(contractAddress: Address): Promise<string> {
    return viemClient.readContract({
        address: contractAddress,
        abi: LAUNCHPAD_READ_ABI,
        functionName: 'owner',
    });
}

/**
 * Get total supply of minted tokens
 */
export async function getTotalSupply(contractAddress: Address): Promise<bigint> {
    return viemClient.readContract({
        address: contractAddress,
        abi: LAUNCHPAD_READ_ABI,
        functionName: 'totalSupply',
    });
}

/**
 * Get the owner of a specific token ID
 */
export async function getTokenOwner(contractAddress: Address, tokenId: bigint): Promise<string> {
    return viemClient.readContract({
        address: contractAddress,
        abi: LAUNCHPAD_READ_ABI,
        functionName: 'ownerOf',
        args: [tokenId],
    });
}

/**
 * Get basic collection info
 */
export async function getCollectionInfo(contractAddress: Address) {
    const [name, symbol, mintPrice, maxSupply, totalSupply, saleActive, paused] = await Promise.all([
        viemClient.readContract({ address: contractAddress, abi: LAUNCHPAD_READ_ABI, functionName: 'name' }),
        viemClient.readContract({ address: contractAddress, abi: LAUNCHPAD_READ_ABI, functionName: 'symbol' }),
        viemClient.readContract({ address: contractAddress, abi: LAUNCHPAD_READ_ABI, functionName: 'mintPrice' }),
        viemClient.readContract({ address: contractAddress, abi: LAUNCHPAD_READ_ABI, functionName: 'maxSupply' }),
        viemClient.readContract({ address: contractAddress, abi: LAUNCHPAD_READ_ABI, functionName: 'totalSupply' }),
        viemClient.readContract({ address: contractAddress, abi: LAUNCHPAD_READ_ABI, functionName: 'saleActive' }),
        viemClient.readContract({ address: contractAddress, abi: LAUNCHPAD_READ_ABI, functionName: 'paused' }),
    ]);

    return { name, symbol, mintPrice, maxSupply, totalSupply, saleActive, paused };
}

/**
 * Get royalty info for a token at a specific sale price
 */
export async function getRoyaltyInfo(contractAddress: Address, tokenId: bigint, salePrice: bigint) {
    const [receiver, royaltyAmount] = await viemClient.readContract({
        address: contractAddress,
        abi: LAUNCHPAD_READ_ABI,
        functionName: 'royaltyInfo',
        args: [tokenId, salePrice],
    });
    return { receiver, royaltyAmount };
}

/**
 * Get how many tokens a wallet has minted
 */
export async function getMintsByWallet(contractAddress: Address, wallet: Address): Promise<bigint> {
    return viemClient.readContract({
        address: contractAddress,
        abi: LAUNCHPAD_READ_ABI,
        functionName: 'mintsByWallet',
        args: [wallet],
    });
}
