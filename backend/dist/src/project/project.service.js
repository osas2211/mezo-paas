"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var ProjectService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProjectService = void 0;
const common_1 = require("@nestjs/common");
const github_service_1 = require("../github/github.service");
const prisma_service_1 = require("../prisma/prisma.service");
const common_2 = require("@nestjs/common");
const semver = __importStar(require("semver"));
const octokit_1 = require("octokit");
const config_1 = require("@nestjs/config");
const enums_1 = require("../../generated/prisma/enums");
const encryption_service_1 = require("../encryption/encryption.service");
const project_gateway_1 = require("./project.gateway");
let ProjectService = ProjectService_1 = class ProjectService {
    prismaService;
    githubService;
    configService;
    encryptionService;
    buildGateway;
    logger = new common_2.Logger(ProjectService_1.name);
    octokitApp;
    constructor(prismaService, githubService, configService, encryptionService, buildGateway) {
        this.prismaService = prismaService;
        this.githubService = githubService;
        this.configService = configService;
        this.encryptionService = encryptionService;
        this.buildGateway = buildGateway;
        const appId = this.configService.get('GITHUB_APP_ID');
        const privateKey = this.configService.get('GITHUB_PRIVATE_KEY')?.replace(/\\n/g, '\n');
        if (!appId || !privateKey) {
            throw new Error('GitHub App credentials are not fully configured in the environment.');
        }
        this.octokitApp = new octokit_1.App({
            appId,
            privateKey,
        });
    }
    async create(repoName, userId, userToken, environmentVariables = {}) {
        const githubRepo = await this.githubService.fetchSingleRepoDatails(userId, repoName);
        const analysis = await this.analyzeRepository(githubRepo.owner.login, githubRepo.name, userToken);
        if (analysis.framework !== "reactjs" && analysis.framework !== "nextjs" && analysis.framework !== "node" && analysis.framework !== "nestjs") {
            throw new common_1.BadRequestException("We currently only support Next.js, React, Node and NestJS projects");
        }
        const encryptedEnvironmentVariables = await this.encryptionService.encrypt(JSON.stringify(environmentVariables));
        const project = await this.prismaService.project.create({
            data: {
                name: repoName,
                userId: userId,
                framework: analysis.framework || "node",
                nodeVersion: analysis.nodeVersion,
                gitRepositoryOwner: githubRepo.owner.login,
                gitRepositoryName: githubRepo.name,
                gitRepositoryType: 'github',
                buildCommand: analysis.defaultBuildCommand,
                outputDirectory: analysis.defaultOutputDirectory,
                installCommand: "npm install",
                devCommand: "npm run dev",
                deployment: {
                    create: {
                        url: "",
                    }
                },
                environmentVariables: encryptedEnvironmentVariables
            },
            include: {
                deployment: true,
                user: {
                    select: {
                        email: true,
                        id: true
                    }
                },
            }
        });
        this.buildGateway.broadcastStatus(project.id, enums_1.DeploymentStatus.PENDING_DEPLOYMENT, Date.now());
        await this.githubService.importRepo(githubRepo.name, githubRepo.default_branch, userToken, githubRepo.owner.login, project.id, encryptedEnvironmentVariables);
        this.buildGateway.broadcastStatus(project.id, enums_1.DeploymentStatus.QUEUED_FOR_BUILDING, Date.now());
        return project;
    }
    async getProjects(userId) {
        return this.prismaService.project.findMany({ where: { userId }, include: { deployment: true } });
    }
    async getProject(projectId) {
        return this.prismaService.project.findUnique({ where: { id: projectId }, include: { deployment: true } });
    }
    async deleteProject() {
        return {};
    }
    async editProject() {
        return {};
    }
    async updateDeploymentStatus(projectId, workerSecret, status, liveUrl) {
        if (workerSecret !== this.configService.get('WORKER_SECRET')) {
            throw new common_1.UnauthorizedException('Invalid Worker Secret');
        }
        const project = await this.prismaService.project.findUnique({
            where: { id: projectId },
            include: { deployment: true }
        });
        if (!project) {
            throw new common_1.BadRequestException('Project not found');
        }
        if (status === enums_1.DeploymentStatus.READY) {
            await this.prismaService.deployment.update({
                where: { projectId },
                data: {
                    url: liveUrl,
                    status: status,
                },
            });
        }
        else {
            await this.prismaService.deployment.update({
                where: { projectId },
                data: {
                    status: status,
                },
            });
        }
        this.buildGateway.broadcastStatus(project.id, status, Date.now());
        return { success: true, message: "Deployment status updated successfully", project };
    }
    async analyzeRepository(owner, repo, token) {
        const octokit = new octokit_1.Octokit({ auth: token });
        let packageJson = null;
        try {
            const { data } = await octokit.rest.repos.getContent({
                owner,
                repo,
                path: 'package.json',
            });
            if ('content' in data) {
                const decoded = Buffer.from(data.content, 'base64').toString('utf-8');
                packageJson = JSON.parse(decoded);
            }
        }
        catch (e) {
            this.logger.error(`Error fetching package.json: ${e.message}`, e.stack);
        }
        let nvmrc = null;
        try {
            const { data } = await octokit.rest.repos.getContent({
                owner,
                repo,
                path: '.nvmrc',
            });
            if ('content' in data) {
                nvmrc = Buffer.from(data.content, 'base64').toString('utf-8').trim();
            }
        }
        catch (e) {
        }
        const nodeVersion = this.detectNodeVersion(packageJson, nvmrc);
        const framework = this.detectFramework(packageJson);
        return {
            nodeVersion,
            framework,
            defaultBuildCommand: this.getDefaultBuildCommand(framework),
            defaultOutputDirectory: this.getDefaultOutputDir(framework)
        };
    }
    detectNodeVersion(packageJson, nvmrc) {
        const defaultVersion = '20.x';
        if (nvmrc) {
            const match = nvmrc.match(/v?(\d+)/);
            if (match)
                return `${match[1]}.x`;
        }
        if (packageJson?.engines?.node) {
            const engineStr = packageJson.engines.node;
            const minVersion = semver.minVersion(engineStr);
            if (minVersion) {
                return `${minVersion.major}.x`;
            }
        }
        return defaultVersion;
    }
    detectFramework(packageJson) {
        if (!packageJson)
            return null;
        const deps = {
            ...(packageJson.dependencies || {}),
            ...(packageJson.devDependencies || {})
        };
        if (deps['next'])
            return 'nextjs';
        if (deps['@nestjs/core'])
            return 'nestjs';
        if (deps['nuxt'])
            return 'nuxtjs';
        if (deps['@sveltejs/kit'])
            return 'sveltekit';
        if (deps['@remix-run/react'])
            return 'remix';
        if (deps['@angular/core'])
            return 'angular';
        if (deps['gatsby'])
            return 'gatsby';
        if (deps['vite'])
            return 'vite';
        if (deps['react-scripts'])
            return 'reactjs';
        return 'node';
    }
    getDefaultBuildCommand(framework) {
        const map = {
            'nextjs': 'npm run build',
            'nestjs': 'npm run build',
            'vite': 'npm run build',
        };
        return framework && map[framework] ? map[framework] : 'npm install && npm run build';
    }
    getDefaultOutputDir(framework) {
        const map = {
            'nextjs': '.next',
            'nestjs': 'dist',
            'vite': 'dist',
            'sveltekit': '.svelte-kit/output',
        };
        return framework && map[framework] ? map[framework] : 'dist';
    }
};
exports.ProjectService = ProjectService;
exports.ProjectService = ProjectService = ProjectService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        github_service_1.GithubService,
        config_1.ConfigService,
        encryption_service_1.EncryptionService,
        project_gateway_1.ProjectGateway])
], ProjectService);
//# sourceMappingURL=project.service.js.map