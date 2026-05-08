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
        user: {
            id: string;
            email: string;
        };
        deployment: {
            id: string;
            name: string | null;
            createdAt: Date;
            updatedAt: Date;
            status: import("generated/prisma/enums").DeploymentStatus;
            url: string;
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
        userId: string;
    }>;
    getProjects(userId: string): Promise<{
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
        userId: string;
    }[]>;
    getProject(projectId: string): Promise<{
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
        userId: string;
    } | null>;
    deleteProject(): Promise<{}>;
    editProject(): Promise<{}>;
    private analyzeRepository;
    private detectNodeVersion;
    private detectFramework;
    private getDefaultBuildCommand;
    private getDefaultOutputDir;
}
