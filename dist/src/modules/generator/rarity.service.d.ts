export interface RarityResult {
    score: number;
    rank: string;
    breakdown: Record<string, number>;
}
export declare class RarityService {
    calculateRarity(traits: Record<string, string>): RarityResult;
    private getRank;
}
