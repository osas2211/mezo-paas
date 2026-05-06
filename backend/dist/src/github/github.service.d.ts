import { HttpService } from '@nestjs/axios';
import { GithubRepoDto } from './dto/github.dto';
import { PrismaService } from "../prisma/prisma.service";
export declare class GithubService {
    private readonly httpService;
    private readonly prismaService;
    private readonly logger;
    constructor(httpService: HttpService, prismaService: PrismaService);
    fetchInstallationRepos(installationId: string, access_Token: string, search?: string, limit?: number): Promise<GithubRepoDto[]>;
    getGithubUser(token: string): Promise<any>;
    uninstallGithubApp(installationId: string, token: string, userId: string): Promise<any>;
}
