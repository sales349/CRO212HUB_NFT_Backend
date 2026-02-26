"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CATEGORIES = exports.TRAIT_WEIGHTS = void 0;
exports.getTraitWeight = getTraitWeight;
exports.getTraitOptions = getTraitOptions;
const common_1 = require("@nestjs/common");
exports.TRAIT_WEIGHTS = {
    background: {
        cosmic: 0.03, nebula: 0.05, sunset: 0.08, ocean: 0.10,
        forest: 0.12, midnight: 0.15, silver: 0.17, plain_white: 0.30,
    },
    body: {
        diamond: 0.02, gold: 0.05, chrome: 0.08, obsidian: 0.10,
        marble: 0.13, wood: 0.15, clay: 0.19, basic: 0.28,
    },
    eyes: {
        laser: 0.03, galaxy: 0.05, fire: 0.07, ice: 0.10,
        emerald: 0.12, ruby: 0.15, amber: 0.13, normal: 0.35,
    },
    mouth: {
        diamond_grill: 0.02, fangs: 0.05, gold_teeth: 0.08, smile: 0.12,
        smirk: 0.15, neutral: 0.18, frown: 0.15, open: 0.25,
    },
    accessories: {
        crown: 0.02, halo: 0.04, horns: 0.06, monocle: 0.09,
        earring: 0.12, headband: 0.15, cap: 0.13, none: 0.39,
    },
    special: {
        lightning_aura: 0.01, rainbow_trail: 0.02, shadow_cloak: 0.03,
        fire_wings: 0.04, ice_shield: 0.05, mystic_runes: 0.04, none: 0.81,
    },
};
exports.CATEGORIES = Object.keys(exports.TRAIT_WEIGHTS);
function getTraitWeight(category, value) {
    const categoryWeights = exports.TRAIT_WEIGHTS[category];
    if (!categoryWeights) {
        throw new common_1.BadRequestException(`Invalid trait category: "${category}". Valid categories: ${exports.CATEGORIES.join(', ')}`);
    }
    const weight = categoryWeights[value];
    if (weight === undefined) {
        const validValues = Object.keys(categoryWeights);
        throw new common_1.BadRequestException(`Invalid value "${value}" for category "${category}". Valid values: ${validValues.join(', ')}`);
    }
    return weight;
}
function getTraitOptions(category) {
    const categoryWeights = exports.TRAIT_WEIGHTS[category];
    if (!categoryWeights) {
        throw new common_1.BadRequestException(`Invalid trait category: "${category}". Valid categories: ${exports.CATEGORIES.join(', ')}`);
    }
    return Object.keys(categoryWeights);
}
//# sourceMappingURL=trait-weights.config.js.map