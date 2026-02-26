export declare const TRAIT_WEIGHTS: {
    readonly background: {
        readonly cosmic: 0.03;
        readonly nebula: 0.05;
        readonly sunset: 0.08;
        readonly ocean: 0.1;
        readonly forest: 0.12;
        readonly midnight: 0.15;
        readonly silver: 0.17;
        readonly plain_white: 0.3;
    };
    readonly body: {
        readonly diamond: 0.02;
        readonly gold: 0.05;
        readonly chrome: 0.08;
        readonly obsidian: 0.1;
        readonly marble: 0.13;
        readonly wood: 0.15;
        readonly clay: 0.19;
        readonly basic: 0.28;
    };
    readonly eyes: {
        readonly laser: 0.03;
        readonly galaxy: 0.05;
        readonly fire: 0.07;
        readonly ice: 0.1;
        readonly emerald: 0.12;
        readonly ruby: 0.15;
        readonly amber: 0.13;
        readonly normal: 0.35;
    };
    readonly mouth: {
        readonly diamond_grill: 0.02;
        readonly fangs: 0.05;
        readonly gold_teeth: 0.08;
        readonly smile: 0.12;
        readonly smirk: 0.15;
        readonly neutral: 0.18;
        readonly frown: 0.15;
        readonly open: 0.25;
    };
    readonly accessories: {
        readonly crown: 0.02;
        readonly halo: 0.04;
        readonly horns: 0.06;
        readonly monocle: 0.09;
        readonly earring: 0.12;
        readonly headband: 0.15;
        readonly cap: 0.13;
        readonly none: 0.39;
    };
    readonly special: {
        readonly lightning_aura: 0.01;
        readonly rainbow_trail: 0.02;
        readonly shadow_cloak: 0.03;
        readonly fire_wings: 0.04;
        readonly ice_shield: 0.05;
        readonly mystic_runes: 0.04;
        readonly none: 0.81;
    };
};
export type TraitCategory = keyof typeof TRAIT_WEIGHTS;
export type TraitValue<C extends TraitCategory> = keyof (typeof TRAIT_WEIGHTS)[C];
export declare const CATEGORIES: TraitCategory[];
export declare function getTraitWeight(category: string, value: string): number;
export declare function getTraitOptions(category: string): string[];
