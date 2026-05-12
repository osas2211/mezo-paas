import { ProjectService } from './project.service';
import express from 'express';
import { PrismaService } from "../prisma/prisma.service";
export declare class ProjectController {
    private readonly projectService;
    private readonly prismaService;
    constructor(projectService: ProjectService, prismaService: PrismaService);
    create(req: express.Request, repoName: string): Promise<{
        deployment: {
            name: string | null;
            status: import("../../generated/prisma/enums").DeploymentStatus;
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
        framework: import("../../generated/prisma/enums").Framework;
        nodeVersion: string;
        buildCommand: string | null;
        installCommand: string | null;
        outputDirectory: string | null;
        devCommand: string | null;
        gitRepositoryName: string | null;
        gitRepositoryOwner: string | null;
        gitRepositoryType: import("../../generated/prisma/enums").GitProvider | null;
        userId: string;
    }>;
    getProjects(req: express.Request): Promise<({
        deployment: {
            name: string | null;
            status: import("../../generated/prisma/enums").DeploymentStatus;
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
        framework: import("../../generated/prisma/enums").Framework;
        nodeVersion: string;
        buildCommand: string | null;
        installCommand: string | null;
        outputDirectory: string | null;
        devCommand: string | null;
        gitRepositoryName: string | null;
        gitRepositoryOwner: string | null;
        gitRepositoryType: import("../../generated/prisma/enums").GitProvider | null;
        userId: string;
    })[]>;
    getProject(projectId: string): Promise<({
        deployment: {
            name: string | null;
            status: import("../../generated/prisma/enums").DeploymentStatus;
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
        framework: import("../../generated/prisma/enums").Framework;
        nodeVersion: string;
        buildCommand: string | null;
        installCommand: string | null;
        outputDirectory: string | null;
        devCommand: string | null;
        gitRepositoryName: string | null;
        gitRepositoryOwner: string | null;
        gitRepositoryType: import("../../generated/prisma/enums").GitProvider | null;
        userId: string;
    }) | null>;
}
