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
exports.VaultController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const auth_guard_1 = require("../../common/guards/auth.guard");
const zod_validation_pipe_1 = require("../../common/pipes/zod-validation.pipe");
const vault_service_1 = require("./vault.service");
const save_preset_dto_1 = require("./dto/save-preset.dto");
let VaultController = class VaultController {
    vaultService;
    constructor(vaultService) {
        this.vaultService = vaultService;
    }
    async savePreset(body, request) {
        const preset = await this.vaultService.savePreset(body, request.user.sub);
        return {
            success: true,
            preset,
        };
    }
    async listPresets(query, request) {
        const parsed = save_preset_dto_1.listPresetsQuerySchema.parse(query);
        const result = await this.vaultService.listPresets(request.user.sub, parsed);
        return {
            success: true,
            ...result,
        };
    }
    async getPreset(id) {
        const preset = await this.vaultService.getPreset(id);
        return {
            success: true,
            preset,
        };
    }
    async deletePreset(id, request) {
        await this.vaultService.deletePreset(id, request.user.sub);
        return {
            success: true,
            message: 'Preset deleted',
        };
    }
    async remixPreset(body, request) {
        const result = await this.vaultService.remixPreset(body, request.user.sub);
        return {
            success: true,
            ...result,
        };
    }
    async getAvatarData(id) {
        const data = await this.vaultService.getAvatarData(id);
        return {
            success: true,
            ...data,
        };
    }
};
exports.VaultController = VaultController;
__decorate([
    (0, common_1.Post)('save-preset'),
    (0, common_1.HttpCode)(common_1.HttpStatus.CREATED),
    (0, swagger_1.ApiOperation)({ summary: 'Save preset to vault' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Preset saved' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Invalid request body' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Unauthorized' }),
    __param(0, (0, common_1.Body)(new zod_validation_pipe_1.ZodValidationPipe(save_preset_dto_1.savePresetSchema))),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], VaultController.prototype, "savePreset", null);
__decorate([
    (0, common_1.Get)('presets'),
    (0, swagger_1.ApiOperation)({ summary: 'List user presets' }),
    (0, swagger_1.ApiQuery)({ name: 'page', required: false, type: Number }),
    (0, swagger_1.ApiQuery)({ name: 'limit', required: false, type: Number }),
    (0, swagger_1.ApiQuery)({ name: 'sort', required: false, enum: ['newest', 'oldest', 'rarity'] }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Presets listed' }),
    __param(0, (0, common_1.Query)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], VaultController.prototype, "listPresets", null);
__decorate([
    (0, common_1.Get)('presets/:id'),
    (0, swagger_1.ApiOperation)({ summary: 'Get single preset' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Preset found' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Preset not found' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], VaultController.prototype, "getPreset", null);
__decorate([
    (0, common_1.Delete)('presets/:id'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Delete preset (owner only)' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Preset deleted' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Not the owner' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Preset not found' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], VaultController.prototype, "deletePreset", null);
__decorate([
    (0, common_1.Post)('remix'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Remix existing preset with trait modifications' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Remix generated' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Source preset not found' }),
    __param(0, (0, common_1.Body)(new zod_validation_pipe_1.ZodValidationPipe(save_preset_dto_1.remixPresetSchema))),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], VaultController.prototype, "remixPreset", null);
__decorate([
    (0, common_1.Get)('presets/:id/avatar'),
    (0, swagger_1.ApiOperation)({ summary: 'Get avatar-optimized preset data' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Avatar data returned' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Preset not found' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], VaultController.prototype, "getAvatarData", null);
exports.VaultController = VaultController = __decorate([
    (0, swagger_1.ApiTags)('Vault'),
    (0, common_1.Controller)('vault'),
    (0, common_1.UseGuards)(auth_guard_1.AuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    __metadata("design:paramtypes", [vault_service_1.VaultService])
], VaultController);
//# sourceMappingURL=vault.controller.js.map