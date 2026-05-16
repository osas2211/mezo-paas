import { GithubService } from "../github/github.service";
import { PrismaService } from "../prisma/prisma.service";
import { ConfigService } from '@nestjs/config';
import { DeploymentStatus, Framework } from "../../generated/prisma/enums";
import { EncryptionService } from "../encryption/encryption.service";
import { ProjectGateway } from './project.gateway';
export declare class ProjectService {
    private readonly prismaService;
    private readonly githubService;
    private readonly configService;
    private readonly encryptionService;
    private readonly buildGateway;
    private readonly logger;
    private readonly octokitApp;
    constructor(prismaService: PrismaService, githubService: GithubService, configService: ConfigService, encryptionService: EncryptionService, buildGateway: ProjectGateway);
    create(repoName: string, userId: string, userToken: string, environmentVariables?: Record<string, string>): Promise<{
        user: {
            id: string;
            email: string;
        };
        deployment: {
            id: string;
            name: string | null;
            createdAt: Date;
            updatedAt: Date;
            status: DeploymentStatus;
            url: string;
            deploymentStartedAt: Date | null;
            deploymentFinishedAt: Date | null;
            projectId: string;
        } | null;
    } & {
        id: string;
        name: string;
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
        createdAt: Date;
        updatedAt: Date;
        environmentVariables: string | null;
        userId: string;
    }>;
    getProjects(userId: string): Promise<({
        deployment: {
            id: string;
            name: string | null;
            createdAt: Date;
            updatedAt: Date;
            status: DeploymentStatus;
            url: string;
            deploymentStartedAt: Date | null;
            deploymentFinishedAt: Date | null;
            projectId: string;
        } | null;
    } & {
        id: string;
        name: string;
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
        createdAt: Date;
        updatedAt: Date;
        environmentVariables: string | null;
        userId: string;
    })[]>;
    getProject(projectId: string): Promise<({
        deployment: {
            id: string;
            name: string | null;
            createdAt: Date;
            updatedAt: Date;
            status: DeploymentStatus;
            url: string;
            deploymentStartedAt: Date | null;
            deploymentFinishedAt: Date | null;
            projectId: string;
        } | null;
    } & {
        id: string;
        name: string;
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
        createdAt: Date;
        updatedAt: Date;
        environmentVariables: string | null;
        userId: string;
    }) | null>;
    deleteProject(): Promise<{}>;
    editProject(): Promise<{}>;
    updateDeploymentStatus(projectId: string, workerSecret: string, status: DeploymentStatus, liveUrl?: string): Promise<{
        success: boolean;
        message: string;
        project: {
            deployment: {
                id: string;
                name: string | null;
                createdAt: Date;
                updatedAt: Date;
                status: DeploymentStatus;
                url: string;
                deploymentStartedAt: Date | null;
                deploymentFinishedAt: Date | null;
                projectId: string;
            } | null;
        } & {
            id: string;
            name: string;
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
            createdAt: Date;
            updatedAt: Date;
            environmentVariables: string | null;
            userId: string;
        };
    }>;
    private analyzeRepository;
    private detectNodeVersion;
    private detectFramework;
    private getDefaultBuildCommand;
    private getDefaultOutputDir;
}
