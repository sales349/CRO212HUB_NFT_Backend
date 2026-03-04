import { Injectable } from '@nestjs/common';
import { CATEGORIES, getTraitWeight } from '../../config/trait-weights.config';

export interface RarityResult {
    score: number;
    rank: string;
    breakdown: Record<string, number>;
}

@Injectable()
export class RarityService {
    calculateRarity(traits: Record<string, string>): RarityResult {
        const weights: number[] = [];
        const breakdown: Record<string, number> = {};

        for (const category of CATEGORIES) {
            const weight = getTraitWeight(category, traits[category]);
            weights.push(weight);
            breakdown[category] = Math.round((1 - weight) * 100 * 100) / 100;
        }

        // Weighted harmonic mean
        const n = weights.length;
        const sumReciprocals = weights.reduce((sum, w) => sum + 1 / w, 0);
        const harmonicMean = n / sumReciprocals;

        const rawScore = (1 - harmonicMean) * 100;
        const score = Math.round(Math.min(100, Math.max(0, rawScore)) * 100) / 100;
        const rank = this.getRank(score);

        return { score, rank, breakdown };
    }

    private getRank(score: number): string {
        if (score >= 90) return 'Legendary';
        if (score >= 75) return 'Epic';
        if (score >= 50) return 'Rare';
        if (score >= 25) return 'Uncommon';
        return 'Common';
    }
}