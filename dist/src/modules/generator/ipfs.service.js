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
var IpfsService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.IpfsService = void 0;
const common_1 = require("@nestjs/common");
const pinata_1 = require("pinata");
const app_config_1 = require("../../config/app.config");
let IpfsService = IpfsService_1 = class IpfsService {
    logger = new common_1.Logger(IpfsService_1.name);
    pinata;
    gateway;
    constructor() {
        this.pinata = new pinata_1.PinataSDK({
            pinataJwt: app_config_1.appConfig.PINATA_JWT,
            pinataGateway: app_config_1.appConfig.PINATA_GATEWAY,
        });
        this.gateway = app_config_1.appConfig.PINATA_GATEWAY;
    }
    async uploadImage(buffer, name) {
        try {
            const file = new File([buffer], `${name}.png`, { type: 'image/png' });
            const result = await this.pinata.upload.public.file(file).name(`${name}-image`);
            this.logger.log(`Image uploaded to IPFS: ${result.cid}`);
            return `ipfs://${result.cid}`;
        }
        catch (error) {
            this.logger.error('Failed to upload image to IPFS', error instanceof Error ? error.stack : error);
            throw new common_1.InternalServerErrorException('Image upload failed');
        }
    }
    async uploadMetadata(metadata, name) {
        try {
            const result = await this.pinata.upload.public.json(metadata).name(`${name}-metadata`);
            this.logger.log(`Metadata uploaded to IPFS: ${result.cid}`);
            return `ipfs://${result.cid}`;
        }
        catch (error) {
            this.logger.error('Failed to upload metadata to IPFS', error instanceof Error ? error.stack : error);
            throw new common_1.InternalServerErrorException('Metadata upload failed');
        }
    }
    getGatewayUrl(ipfsUri) {
        const cid = ipfsUri.replace('ipfs://', '');
        return `https://${this.gateway}/ipfs/${cid}`;
    }
};
exports.IpfsService = IpfsService;
exports.IpfsService = IpfsService = IpfsService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [])
], IpfsService);
//# sourceMappingURL=ipfs.service.js.map