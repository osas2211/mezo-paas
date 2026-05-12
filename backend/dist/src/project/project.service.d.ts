import { GithubService } from "../github/github.service";
import { PrismaService } from "../prisma/prisma.service";
import { ConfigService } from '@nestjs/config';
import { Framework } from "../../generated/prisma/enums";
export declare class ProjectService {
    private readonly prismaService;
    private readonly githubService;
    private readonly configService;
    private readonly logger;
    private readonly octokitApp;
    constructor(prismaService: PrismaService, githubService: GithubService, configService: ConfigService);
    create(repoName: string, userId: string, userToken: string): Promise<{
        deployment: {
            name: string | null;
            status: import("generated/prisma/enums").DeploymentStatus;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            url: string;
            projectId: string;
        } | null;
        user: {
            id: string;
            email: string;
        };
    } & {
        name: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
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
        userId: string;
    }>;
    getProjects(userId: string): Promise<({
        deployment: {
            name: string | null;
            status: import("generated/prisma/enums").DeploymentStatus;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            url: string;
            projectId: string;
        } | null;
    } & {
        name: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
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
        userId: string;
    })[]>;
    getProject(projectId: string): Promise<({
        deployment: {
            name: string | null;
            status: import("generated/prisma/enums").DeploymentStatus;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            url: string;
            projectId: string;
        } | null;
    } & {
        name: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
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
        userId: string;
    }) | null>;
    deleteProject(): Promise<{}>;
    editProject(): Promise<{}>;
    private analyzeRepository;
    private detectNodeVersion;
    private detectFramework;
    private getDefaultBuildCommand;
    private getDefaultOutputDir;
}
