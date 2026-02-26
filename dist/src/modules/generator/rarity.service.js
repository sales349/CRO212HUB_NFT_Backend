"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RarityService = void 0;
const common_1 = require("@nestjs/common");
const trait_weights_config_1 = require("../../config/trait-weights.config");
let RarityService = class RarityService {
    calculateRarity(traits) {
        const weights = [];
        const breakdown = {};
        for (const category of trait_weights_config_1.CATEGORIES) {
            const weight = (0, trait_weights_config_1.getTraitWeight)(category, traits[category]);
            weights.push(weight);
            breakdown[category] = Math.round((1 - weight) * 100 * 100) / 100;
        }
        const n = weights.length;
        const sumReciprocals = weights.reduce((sum, w) => sum + 1 / w, 0);
        const harmonicMean = n / sumReciprocals;
        const rawScore = (1 - harmonicMean) * 100;
        const score = Math.round(Math.min(100, Math.max(0, rawScore)) * 100) / 100;
        const rank = this.getRank(score);
        return { score, rank, breakdown };
    }
    getRank(score) {
        if (score >= 90)
            return 'Legendary';
        if (score >= 75)
            return 'Epic';
        if (score >= 50)
            return 'Rare';
        if (score >= 25)
            return 'Uncommon';
        return 'Common';
    }
};
exports.RarityService = RarityService;
exports.RarityService = RarityService = __decorate([
    (0, common_1.Injectable)()
], RarityService);
//# sourceMappingURL=rarity.service.js.map