import { ProjectService } from './project.service';
import express from 'express';
import { PrismaService } from "../prisma/prisma.service";
import { DeploymentStatus } from "../../generated/prisma/enums";
export declare class ProjectController {
    private readonly projectService;
    private readonly prismaService;
    constructor(projectService: ProjectService, prismaService: PrismaService);
    create(req: express.Request, repoName: string, envVariables?: JSON): Promise<{
        user: {
            email: string;
            id: string;
        };
        deployment: {
            url: string;
            name: string | null;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            status: DeploymentStatus;
            projectId: string;
        } | null;
    } & {
        name: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        description: string | null;
        framework: import("generated/prisma/enums").Framework;
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
    getProjects(req: express.Request): Promise<({
        deployment: {
            url: string;
            name: string | null;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            status: DeploymentStatus;
            projectId: string;
        } | null;
    } & {
        name: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        description: string | null;
        framework: import("generated/prisma/enums").Framework;
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
            name: string | null;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            status: DeploymentStatus;
            projectId: string;
        } | null;
    } & {
        name: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        description: string | null;
        framework: import("generated/prisma/enums").Framework;
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
    handleDeploymentStatus(projectId: string, body: {
        liveUrl?: string;
        status: DeploymentStatus;
    }, workerSecret: string): Promise<{
        success: boolean;
        message: string;
        project: {
            deployment: {
                url: string;
                name: string | null;
                id: string;
                createdAt: Date;
                updatedAt: Date;
                status: DeploymentStatus;
                projectId: string;
            } | null;
        } & {
            name: string;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            userId: string;
            description: string | null;
            framework: import("generated/prisma/enums").Framework;
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
}
