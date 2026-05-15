"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProjectModule = void 0;
const common_1 = require("@nestjs/common");
const project_service_1 = require("./project.service");
const project_controller_1 = require("./project.controller");
const prisma_service_1 = require("../prisma/prisma.service");
const github_module_1 = require("../github/github.module");
const upload_module_1 = require("../upload/upload.module");
const config_1 = require("@nestjs/config");
const encryption_service_1 = require("../encryption/encryption.service");
const project_gateway_1 = require("./project.gateway");
let ProjectModule = class ProjectModule {
};
exports.ProjectModule = ProjectModule;
exports.ProjectModule = ProjectModule = __decorate([
    (0, common_1.Module)({
        imports: [github_module_1.GithubModule, upload_module_1.UploadModule, config_1.ConfigModule],
        providers: [project_service_1.ProjectService, prisma_service_1.PrismaService, encryption_service_1.EncryptionService, project_gateway_1.ProjectGateway],
        controllers: [project_controller_1.ProjectController]
    })
], ProjectModule);
//# sourceMappingURL=project.module.js.map