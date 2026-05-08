import { ConfigService } from '@nestjs/config';
import { GithubService } from './github.service';
import express from 'express';
import { PrismaService } from "../prisma/prisma.service";
import { HttpService } from '@nestjs/axios';
export declare class GithubController {
    private readonly configService;
    private readonly githubService;
    private readonly prismaService;
    private readonly httpService;
    constructor(configService: ConfigService, githubService: GithubService, prismaService: PrismaService, httpService: HttpService);
    install(req: express.Request): {
        url: string;
    };
    callback(code: string, installationId: string, res: express.Response, state: string): Promise<void>;
    getRepos(req: express.Request, search?: string, limit?: string): Promise<import("./dto/github.dto").GithubRepoDto[]>;
    getGithubUser(req: express.Request): Promise<any>;
    uninstallGithubApp(req: express.Request): Promise<any>;
    importRepo(req: express.Request, repoName: string): Promise<{
        folder_name: string;
    }>;
}
