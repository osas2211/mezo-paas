import { ProjectService } from './project.service';
import express from 'express';
import { PrismaService } from "../prisma/prisma.service";
export declare class ProjectController {
    private readonly projectService;
    private readonly prismaService;
    constructor(projectService: ProjectService, prismaService: PrismaService);
    create(req: express.Request, repoName: string, envVariables?: JSON): Promise<{
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
        environmentVariables: string | null;
        userId: string;
    }>;
    getProjects(req: express.Request): Promise<({
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
        environmentVariables: string | null;
        userId: string;
    })[]>;
    getProject(projectId: string): Promise<({
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
        environmentVariables: string | null;
        userId: string;
    }) | null>;
}
