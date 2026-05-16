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
        framework: import("generated/prisma/enums").Framework;
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
    getProjects(req: express.Request): Promise<({
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
        framework: import("generated/prisma/enums").Framework;
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
        framework: import("generated/prisma/enums").Framework;
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
    handleDeploymentStatus(projectId: string, body: {
        liveUrl?: string;
        status: DeploymentStatus;
    }, workerSecret: string): Promise<{
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
            framework: import("generated/prisma/enums").Framework;
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
}
