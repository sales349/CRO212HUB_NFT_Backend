"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PresetSchema = exports.Preset = void 0;
const mongoose_1 = require("@nestjs/mongoose");
let Preset = class Preset {
    walletAddress;
    name;
    prompt;
    traits;
    rarity;
    imageUrl;
    metadataUrl;
    gatewayUrl;
    isRemix;
    sourcePresetId;
};
exports.Preset = Preset;
__decorate([
    (0, mongoose_1.Prop)({ required: true, index: true, lowercase: true }),
    __metadata("design:type", String)
], Preset.prototype, "walletAddress", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, trim: true }),
    __metadata("design:type", String)
], Preset.prototype, "name", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], Preset.prototype, "prompt", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Object, required: true }),
    __metadata("design:type", Object)
], Preset.prototype, "traits", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Object, required: true }),
    __metadata("design:type", Object)
], Preset.prototype, "rarity", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], Preset.prototype, "imageUrl", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], Preset.prototype, "metadataUrl", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", String)
], Preset.prototype, "gatewayUrl", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: false }),
    __metadata("design:type", Boolean)
], Preset.prototype, "isRemix", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", String)
], Preset.prototype, "sourcePresetId", void 0);
exports.Preset = Preset = __decorate([
    (0, mongoose_1.Schema)({ timestamps: true, collection: 'presets' })
], Preset);
exports.PresetSchema = mongoose_1.SchemaFactory.createForClass(Preset);
exports.PresetSchema.index({ walletAddress: 1, createdAt: -1 });
//# sourceMappingURL=preset.schema.js.map