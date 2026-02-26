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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const auth_service_1 = require("./auth.service");
const zod_validation_pipe_1 = require("../../common/pipes/zod-validation.pipe");
const zod_1 = require("zod");
const nonceSchema = zod_1.z.object({
    walletAddress: zod_1.z.string().regex(/^0x[a-fA-F0-9]{40}$/, 'Invalid wallet address'),
});
const verifySchema = zod_1.z.object({
    walletAddress: zod_1.z.string().regex(/^0x[a-fA-F0-9]{40}$/, 'Invalid wallet address'),
    signature: zod_1.z.string().min(1),
    nonce: zod_1.z.string().min(1),
});
let AuthController = class AuthController {
    authService;
    constructor(authService) {
        this.authService = authService;
    }
    async nonce(body) {
        const nonce = await this.authService.generateNonce(body.walletAddress);
        return { nonce };
    }
    async verify(body) {
        const token = await this.authService.verifyAndIssueToken(body.walletAddress, body.signature, body.nonce);
        return { token };
    }
};
exports.AuthController = AuthController;
__decorate([
    (0, common_1.Post)('nonce'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Request authentication nonce' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Nonce generated' }),
    __param(0, (0, common_1.Body)(new zod_validation_pipe_1.ZodValidationPipe(nonceSchema))),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "nonce", null);
__decorate([
    (0, common_1.Post)('verify'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Verify signature and receive JWT' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'JWT token issued' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Invalid signature or nonce' }),
    __param(0, (0, common_1.Body)(new zod_validation_pipe_1.ZodValidationPipe(verifySchema))),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "verify", null);
exports.AuthController = AuthController = __decorate([
    (0, swagger_1.ApiTags)('Auth'),
    (0, common_1.Controller)('auth'),
    __metadata("design:paramtypes", [auth_service_1.AuthService])
], AuthController);
//# sourceMappingURL=auth.controller.js.map