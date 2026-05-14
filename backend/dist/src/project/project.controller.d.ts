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
            url: string;
            id: string;
            name: string | null;
            createdAt: Date;
            updatedAt: Date;
            projectId: string;
            status: import("../../generated/prisma/enums").DeploymentStatus;
        } | null;
    } & {
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
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
    }>;
    getProjects(req: express.Request): Promise<({
        deployment: {
            url: string;
            id: string;
            name: string | null;
            createdAt: Date;
            updatedAt: Date;
            projectId: string;
            status: import("../../generated/prisma/enums").DeploymentStatus;
        } | null;
    } & {
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
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
    })[]>;
    getProject(projectId: string): Promise<({
        deployment: {
            url: string;
            id: string;
            name: string | null;
            createdAt: Date;
            updatedAt: Date;
            projectId: string;
            status: import("../../generated/prisma/enums").DeploymentStatus;
        } | null;
    } & {
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
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
    }) | null>;
    handleDeploymentSuccess(projectId: string, body: {
        liveUrl: string;
    }, workerSecret: string): Promise<{
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
                status: import("../../generated/prisma/enums").DeploymentStatus;
            } | null;
        } & {
            id: string;
            name: string;
            createdAt: Date;
            updatedAt: Date;
            userId: string;
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
        };
    }>;
}
