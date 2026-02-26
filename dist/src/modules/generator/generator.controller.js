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
exports.GeneratorController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const zod_validation_pipe_1 = require("../../common/pipes/zod-validation.pipe");
const auth_guard_1 = require("../../common/guards/auth.guard");
const generator_service_1 = require("./generator.service");
const generate_schema_1 = require("./schemas/generate.schema");
let GeneratorController = class GeneratorController {
    generatorService;
    constructor(generatorService) {
        this.generatorService = generatorService;
    }
    async generate(body, request) {
        return this.generatorService.generate(body, request.user.sub);
    }
};
exports.GeneratorController = GeneratorController;
__decorate([
    (0, common_1.Post)('v1/generate'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, common_1.UseGuards)(auth_guard_1.AuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({
        summary: 'Generate NFT',
        description: 'Generate a new NFT with specified traits. Uploads image and metadata to IPFS.',
    }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'NFT generated successfully' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Invalid request body or trait values' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Missing or invalid JWT token' }),
    __param(0, (0, common_1.Body)(new zod_validation_pipe_1.ZodValidationPipe(generate_schema_1.generateRequestSchema))),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], GeneratorController.prototype, "generate", null);
exports.GeneratorController = GeneratorController = __decorate([
    (0, swagger_1.ApiTags)('AI Generation'),
    (0, common_1.Controller)('api/ai/intelligent-layer'),
    __metadata("design:paramtypes", [generator_service_1.GeneratorService])
], GeneratorController);
//# sourceMappingURL=generator.controller.js.map