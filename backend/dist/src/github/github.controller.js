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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.GithubController = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const github_service_1 = require("./github.service");
const express_1 = __importDefault(require("express"));
const auth_guard_1 = require("../auth/auth.guard");
const prisma_service_1 = require("../prisma/prisma.service");
const rxjs_1 = require("rxjs");
const axios_1 = require("@nestjs/axios");
let GithubController = class GithubController {
    configService;
    githubService;
    prismaService;
    httpService;
    constructor(configService, githubService, prismaService, httpService) {
        this.configService = configService;
        this.githubService = githubService;
        this.prismaService = prismaService;
        this.httpService = httpService;
    }
    install(req) {
        const appName = this.configService.get('GITHUB_APP_NAME');
        const userId = req["user"]?.userId;
        const statePayload = JSON.stringify({ userId });
        const state = Buffer.from(statePayload).toString('base64');
        return { url: `https://github.com/apps/${appName}/installations/new?state=${state}` };
    }
    async callback(code, installationId, res, state) {
        const clientId = this.configService.get('GITHUB_CLIENT_ID');
        const clientSecret = this.configService.get('GITHUB_CLIENT_SECRET');
        const frontendUrl = this.configService.get('FRONTEND_URL');
        try {
            const tokenResponse = await (0, rxjs_1.firstValueFrom)(this.httpService.post('https://github.com/login/oauth/access_token', {
                client_id: clientId,
                client_secret: clientSecret,
                code: code,
            }, { headers: { accept: 'application/json' } }));
            const generated_accessToken = tokenResponse.data.access_token;
            const decodedState = JSON.parse(Buffer.from(state, 'base64').toString('utf-8'));
            const userId = decodedState.userId;
            await this.prismaService.user.update({
                where: {
                    id: userId,
                },
                data: {
                    githubAccessToken: generated_accessToken,
                    githubInstallationId: installationId,
                },
            });
            return res.redirect(`${frontendUrl}/dashboard?status=success`);
        }
        catch (error) {
            return res.redirect(`${frontendUrl}/dashboard?status=error`);
        }
    }
    async getRepos(req, search, limit) {
        const user = await this.prismaService.user.findUnique({ where: { id: req["user"]?.userId }, select: { githubAccessToken: true, githubInstallationId: true } });
        const installationId = user?.githubInstallationId;
        const access_token = user?.githubAccessToken;
        if (!installationId || !access_token) {
            throw new common_1.UnauthorizedException('You are not authorized to perform this action');
        }
        return this.githubService.fetchInstallationRepos(installationId, access_token, search, limit ? parseInt(limit, 10) : undefined);
    }
    async getGithubUser(req) {
        const user = await this.prismaService.user.findUnique({ where: { id: req["user"]?.userId }, select: { githubAccessToken: true } });
        const access_token = user?.githubAccessToken;
        if (!access_token) {
            throw new common_1.UnauthorizedException('You are not authorized to perform this action');
        }
        return this.githubService.getGithubUser(access_token);
    }
    async uninstallGithubApp(req) {
        const user = await this.prismaService.user.findUnique({ where: { id: req["user"]?.userId }, select: { githubAccessToken: true, githubInstallationId: true } });
        const installationId = user?.githubInstallationId;
        const access_token = user?.githubAccessToken;
        if (!installationId || !access_token) {
            throw new common_1.UnauthorizedException('You are not authorized to perform this action');
        }
        return this.githubService.uninstallGithubApp(installationId, access_token, req["user"]?.userId);
    }
};
exports.GithubController = GithubController;
__decorate([
    (0, common_1.UseGuards)(auth_guard_1.AuthGuard),
    (0, common_1.Get)('install'),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], GithubController.prototype, "install", null);
__decorate([
    (0, common_1.Get)('callback'),
    __param(0, (0, common_1.Query)('code')),
    __param(1, (0, common_1.Query)('installation_id')),
    __param(2, (0, common_1.Res)()),
    __param(3, (0, common_1.Query)('state')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object, String]),
    __metadata("design:returntype", Promise)
], GithubController.prototype, "callback", null);
__decorate([
    (0, common_1.UseGuards)(auth_guard_1.AuthGuard),
    (0, common_1.Get)('repos'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Query)('search')),
    __param(2, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String]),
    __metadata("design:returntype", Promise)
], GithubController.prototype, "getRepos", null);
__decorate([
    (0, common_1.UseGuards)(auth_guard_1.AuthGuard),
    (0, common_1.Get)('user'),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], GithubController.prototype, "getGithubUser", null);
__decorate([
    (0, common_1.UseGuards)(auth_guard_1.AuthGuard),
    (0, common_1.Delete)('uninstall'),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], GithubController.prototype, "uninstallGithubApp", null);
exports.GithubController = GithubController = __decorate([
    (0, common_1.Controller)('github'),
    __metadata("design:paramtypes", [config_1.ConfigService,
        github_service_1.GithubService,
        prisma_service_1.PrismaService,
        axios_1.HttpService])
], GithubController);
//# sourceMappingURL=github.controller.js.map