"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var CompositingService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.CompositingService = void 0;
const common_1 = require("@nestjs/common");
const sharp_1 = __importDefault(require("sharp"));
let CompositingService = CompositingService_1 = class CompositingService {
    logger = new common_1.Logger(CompositingService_1.name);
    cachedPlaceholder = null;
    async compositeImage(_traits) {
        if (this.cachedPlaceholder) {
            return this.cachedPlaceholder;
        }
        this.logger.log('Generating placeholder image (awaiting client trait assets)');
        const svg = `<svg width="512" height="512" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#6366f1"/>
          <stop offset="100%" stop-color="#a855f7"/>
        </linearGradient>
      </defs>
      <rect width="512" height="512" fill="url(#bg)"/>
      <text x="256" y="230" font-size="48" fill="white" text-anchor="middle" font-family="Arial, sans-serif" font-weight="bold">CRO212HUB</text>
      <text x="256" y="280" font-size="20" fill="rgba(255,255,255,0.7)" text-anchor="middle" font-family="Arial, sans-serif">Genesis Collection</text>
      <text x="256" y="320" font-size="14" fill="rgba(255,255,255,0.4)" text-anchor="middle" font-family="Arial, sans-serif">Placeholder</text>
    </svg>`;
        const buffer = await (0, sharp_1.default)(Buffer.from(svg)).resize(512, 512).png().toBuffer();
        this.cachedPlaceholder = buffer;
        return buffer;
    }
};
exports.CompositingService = CompositingService;
exports.CompositingService = CompositingService = CompositingService_1 = __decorate([
    (0, common_1.Injectable)()
], CompositingService);
//# sourceMappingURL=compositing.service.js.map