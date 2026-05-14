import { GithubService } from "../github/github.service";
import { PrismaService } from "../prisma/prisma.service";
import { ConfigService } from '@nestjs/config';
import { Framework } from "../../generated/prisma/enums";
import { EncryptionService } from "../encryption/encryption.service";
export declare class ProjectService {
    private readonly prismaService;
    private readonly githubService;
    private readonly configService;
    private readonly encryptionService;
    private readonly logger;
    private readonly octokitApp;
    constructor(prismaService: PrismaService, githubService: GithubService, configService: ConfigService, encryptionService: EncryptionService);
    create(repoName: string, userId: string, userToken: string, environmentVariables?: Record<string, string>): Promise<{
        user: {
            id: string;
            email: string;
        };
        deployment: {
            url: string;
            id: string;
            name: string | null;
            createdAt: Date;
            updatedAt: Date;
            projectId: string;
            status: import("generated/prisma/enums").DeploymentStatus;
        } | null;
    } & {
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        description: string | null;
        framework: Framework;
        nodeVersion: string;
        buildCommand: string | null;
        installCommand: string | null;
        outputDirectory: string | null;
        devCommand: string | null;
        gitRepositoryName: string | null;
        gitRepositoryOwner: string | null;
        gitRepositoryType: import("generated/prisma/enums").GitProvider | null;
        environmentVariables: string | null;
    }>;
    getProjects(userId: string): Promise<({
        deployment: {
            url: string;
            id: string;
            name: string | null;
            createdAt: Date;
            updatedAt: Date;
            projectId: string;
            status: import("generated/prisma/enums").DeploymentStatus;
        } | null;
    } & {
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        description: string | null;
        framework: Framework;
        nodeVersion: string;
        buildCommand: string | null;
        installCommand: string | null;
        outputDirectory: string | null;
        devCommand: string | null;
        gitRepositoryName: string | null;
        gitRepositoryOwner: string | null;
        gitRepositoryType: import("generated/prisma/enums").GitProvider | null;
        environmentVariables: string | null;
    })[]>;
    getProject(projectId: string): Promise<({
        deployment: {
            url: string;
            id: string;
            name: string | null;
            createdAt: Date;
            updatedAt: Date;
            projectId: string;
            status: import("generated/prisma/enums").DeploymentStatus;
        } | null;
    } & {
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        description: string | null;
        framework: Framework;
        nodeVersion: string;
        buildCommand: string | null;
        installCommand: string | null;
        outputDirectory: string | null;
        devCommand: string | null;
        gitRepositoryName: string | null;
        gitRepositoryOwner: string | null;
        gitRepositoryType: import("generated/prisma/enums").GitProvider | null;
        environmentVariables: string | null;
    }) | null>;
    deleteProject(): Promise<{}>;
    editProject(): Promise<{}>;
    updateDeploymentStatus(projectId: string, liveUrl: string, workerSecret: string): Promise<{
        success: boolean;
        message: string;
        project: {
            deployment: {
                url: string;
                id: string;
                name: string | null;
                createdAt: Date;
                updatedAt: Date;
                projectId: string;
                status: import("generated/prisma/enums").DeploymentStatus;
            } | null;
        } & {
            id: string;
            name: string;
            createdAt: Date;
            updatedAt: Date;
            userId: string;
            description: string | null;
            framework: Framework;
            nodeVersion: string;
            buildCommand: string | null;
            installCommand: string | null;
            outputDirectory: string | null;
            devCommand: string | null;
            gitRepositoryName: string | null;
            gitRepositoryOwner: string | null;
            gitRepositoryType: import("generated/prisma/enums").GitProvider | null;
            environmentVariables: string | null;
        };
    }>;
    private analyzeRepository;
    private detectNodeVersion;
    private detectFramework;
    private getDefaultBuildCommand;
    private getDefaultOutputDir;
}
