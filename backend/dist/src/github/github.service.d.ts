import { HttpService } from '@nestjs/axios';
import { GithubRepoDto } from './dto/github.dto';
import { PrismaService } from "../prisma/prisma.service";
import { UploadService } from "../upload/upload.service";
import { ConfigService } from '@nestjs/config';
export declare class GithubService {
    private readonly httpService;
    private readonly prismaService;
    private readonly uploadService;
    private readonly configService;
    private readonly logger;
    private readonly githubApp;
    constructor(httpService: HttpService, prismaService: PrismaService, uploadService: UploadService, configService: ConfigService);
    fetchInstallationRepos(installationId: string, access_Token: string, search?: string, limit?: number): Promise<GithubRepoDto[]>;
    getGithubUser(token: string): Promise<any>;
    uninstallGithubApp(userId: string): Promise<any>;
    fetchSingleRepoDatails(userId: string, repo: string): Promise<GithubRepoDto>;
    importRepo(userId: string, repoName: string, branch?: string): Promise<{
        session_id: string;
    }>;
}
