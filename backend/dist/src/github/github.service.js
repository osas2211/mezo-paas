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
var GithubService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.GithubService = void 0;
const common_1 = require("@nestjs/common");
const rxjs_1 = require("rxjs");
const axios_1 = require("@nestjs/axios");
const prisma_service_1 = require("../prisma/prisma.service");
let GithubService = GithubService_1 = class GithubService {
    httpService;
    prismaService;
    logger = new common_1.Logger(GithubService_1.name);
    constructor(httpService, prismaService) {
        this.httpService = httpService;
        this.prismaService = prismaService;
    }
    async fetchInstallationRepos(installationId, access_Token, search, limit) {
        try {
            const reposResponse = await (0, rxjs_1.firstValueFrom)(this.httpService.get(`https://api.github.com/user/installations/${installationId}/repositories?per_page=${100}`, {
                headers: {
                    Authorization: `token ${access_Token}`,
                    Accept: 'application/vnd.github.v3+json',
                },
            }));
            let repos = reposResponse.data.repositories;
            if (search) {
                const lowerSearch = search.toLowerCase();
                repos = repos.filter(repo => repo.name.toLowerCase().includes(lowerSearch));
            }
            if (limit) {
                repos = repos.slice(0, limit);
            }
            return repos;
        }
        catch (error) {
            this.logger.error('GitHub API Error', error.response?.data || error.message);
            throw new common_1.UnauthorizedException('Could not connect to GitHub');
        }
    }
    async getGithubUser(token) {
        try {
            const reposResponse = await (0, rxjs_1.firstValueFrom)(this.httpService.get(`https://api.github.com/user`, {
                headers: {
                    Authorization: `token ${token}`,
                    Accept: 'application/vnd.github.v3+json',
                },
            }));
            return reposResponse.data;
        }
        catch (error) {
            this.logger.error('GitHub API Error', error.response?.data || error.message);
            throw new common_1.UnauthorizedException('Could not connect to GitHub');
        }
    }
    async uninstallGithubApp(installationId, token, userId) {
        console.log(installationId, token, userId);
        try {
            const response = await (0, rxjs_1.firstValueFrom)(this.httpService.delete(`https://api.github.com/user/installations/${installationId}`, {
                headers: {
                    Authorization: `token ${token}`,
                    Accept: 'application/vnd.github.v3+json',
                },
            }));
            await this.prismaService.user.update({
                where: {
                    id: userId,
                },
                data: {
                    githubAccessToken: null,
                    githubInstallationId: null,
                },
            });
            return response.data;
        }
        catch (error) {
            this.logger.error('GitHub API Error', error.response?.data || error.message);
            throw new common_1.UnauthorizedException('Could not connect to GitHub');
        }
    }
};
exports.GithubService = GithubService;
exports.GithubService = GithubService = GithubService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [axios_1.HttpService,
        prisma_service_1.PrismaService])
], GithubService);
//# sourceMappingURL=github.service.js.map