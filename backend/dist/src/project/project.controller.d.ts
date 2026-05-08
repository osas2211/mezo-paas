import { ProjectService } from './project.service';
import express from 'express';
import { PrismaService } from "../prisma/prisma.service";
export declare class ProjectController {
    private readonly projectService;
    private readonly prismaService;
    constructor(projectService: ProjectService, prismaService: PrismaService);
    create(req: express.Request, repoName: string): Promise<{
        user: {
            id: string;
            email: string;
        };
        deployment: {
            id: string;
            name: string | null;
            createdAt: Date;
            updatedAt: Date;
            status: import("../../generated/prisma/enums").DeploymentStatus;
            url: string;
            projectId: string;
        } | null;
    } & {
        id: string;
        name: string;
        description: string | null;
        framework: import("../../generated/prisma/enums").Framework;
        nodeVersion: string;
        buildCommand: string | null;
        installCommand: string | null;
        outputDirectory: string | null;
        devCommand: string | null;
        gitRepositoryName: string | null;
        gitRepositoryOwner: string | null;
        gitRepositoryType: import("../../generated/prisma/enums").GitProvider | null;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
    }>;
    getProjects(req: express.Request): Promise<{
        id: string;
        name: string;
        description: string | null;
        framework: import("../../generated/prisma/enums").Framework;
        nodeVersion: string;
        buildCommand: string | null;
        installCommand: string | null;
        outputDirectory: string | null;
        devCommand: string | null;
        gitRepositoryName: string | null;
        gitRepositoryOwner: string | null;
        gitRepositoryType: import("../../generated/prisma/enums").GitProvider | null;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
    }[]>;
    getProject(projectId: string): Promise<{
        id: string;
        name: string;
        description: string | null;
        framework: import("../../generated/prisma/enums").Framework;
        nodeVersion: string;
        buildCommand: string | null;
        installCommand: string | null;
        outputDirectory: string | null;
        devCommand: string | null;
        gitRepositoryName: string | null;
        gitRepositoryOwner: string | null;
        gitRepositoryType: import("../../generated/prisma/enums").GitProvider | null;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
    } | null>;
}
