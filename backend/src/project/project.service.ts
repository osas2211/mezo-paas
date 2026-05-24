import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { GithubService } from 'src/github/github.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { Logger } from '@nestjs/common';
import * as semver from 'semver';
import { App as OctokitApp, Octokit } from 'octokit';
import { ConfigService } from '@nestjs/config';
import { DeploymentStatus, Framework } from 'generated/prisma/enums';
import { EncryptionService } from 'src/encryption/encryption.service';
import { ProjectGateway } from './project.gateway';
import { createClient, createCluster } from 'redis';

@Injectable()
export class ProjectService {
  private readonly logger = new Logger(ProjectService.name);
  private readonly octokitApp: OctokitApp;
  private readonly isProduction: boolean;
  private readonly redisUrl: string;

  constructor(
    private readonly prismaService: PrismaService,
    private readonly githubService: GithubService,
    private readonly configService: ConfigService,
    private readonly encryptionService: EncryptionService,
    private readonly buildGateway: ProjectGateway,
  ) {
    const appId = this.configService.get<string>('GITHUB_APP_ID');
    const privateKey = this.configService
      .get<string>('GITHUB_PRIVATE_KEY')
      ?.replace(/\\n/g, '\n');

    if (!appId || !privateKey) {
      throw new Error(
        'GitHub App credentials are not fully configured in the environment.',
      );
    }

    this.octokitApp = new OctokitApp({
      appId,
      privateKey,
    });

    this.isProduction =
      this.configService.get<string>('NODE_ENV') === 'production';
    this.redisUrl = this.configService.get<string>('REDIS_URL') || '';
  }

  async create(
    repoName: string,
    userId: string,
    userToken: string,
    environmentVariables: Record<string, string> = {},
  ) {
    const redisClient = this.isProduction
      ? createCluster({
          rootNodes: [{ url: this.redisUrl }],
          defaults: {
            socket: {
              tls: this.redisUrl.startsWith('rediss'),
            },
          },
        })
      : createClient({
          url: this.redisUrl,
        });
    await redisClient.connect();
    const githubRepo = await this.githubService.fetchSingleRepoDatails(
      userId,
      repoName,
    );
    const analysis = await this.analyzeRepository(
      githubRepo.owner.login,
      githubRepo.name,
      userToken,
    );
    if (
      analysis.framework !== 'reactjs' &&
      analysis.framework !== 'nextjs' &&
      analysis.framework !== 'node' &&
      analysis.framework !== 'nestjs'
    ) {
      throw new BadRequestException(
        'We currently only support Next.js, React, Node and NestJS projects',
      );
    }

    const encryptedEnvironmentVariables = await this.encryptionService.encrypt(
      JSON.stringify(environmentVariables),
    );

    const projectWithName = await this.prismaService.project.findFirst({
      where: {
        name: repoName,
      },
    });

    const nameInRedis = await redisClient.hGet('routing', repoName);

    const isUniqueName = nameInRedis
      ? false
      : repoName === 'app'
        ? false
        : repoName === 'blog'
          ? false
          : repoName === 'docs'
            ? false
            : repoName === 'dashboard'
              ? false
              : repoName === 'mezo'
                ? false
                : repoName === 'portal'
                  ? false
                  : repoName === 'landing'
                    ? false
                    : repoName === 'wallet'
                      ? false
                      : repoName === 'api'
                        ? false
                        : repoName === 'redis'
                          ? false
                          : repoName === 'worker'
                            ? false
                            : repoName === 'www'
                              ? false
                              : repoName === 'gateway'
                                ? false
                                : repoName === 'infra'
                                  ? false
                                  : true;

    // const dailyCreditCost = analysis.framework === "node" || analysis.framework === "nestjs" ? "10" : "5"
    const project = await this.prismaService.project.create({
      data: {
        name: repoName,
        userId: userId,
        framework: analysis.framework || 'node',
        nodeVersion: analysis.nodeVersion,
        gitRepositoryOwner: githubRepo.owner.login,
        gitRepositoryName: githubRepo.name,
        gitRepositoryType: 'github',
        buildCommand: analysis.defaultBuildCommand,
        outputDirectory: analysis.defaultOutputDirectory,
        installCommand: 'npm install',
        devCommand: 'npm run dev',
        dailyCreditCost: '10',
        deployment: {
          create: {
            url: '',
          },
        },
        environmentVariables: encryptedEnvironmentVariables,
      },
      include: {
        deployment: true,
        user: {
          select: {
            email: true,
            id: true,
          },
        },
      },
    });
    this.buildGateway.broadcastStatus(
      project.id,
      DeploymentStatus.PENDING_DEPLOYMENT,
      Date.now(),
    );
    await this.githubService.importRepo(
      githubRepo.name,
      githubRepo.default_branch,
      userToken,
      githubRepo.owner.login,
      project.id,
      encryptedEnvironmentVariables,
      isUniqueName,
    );
    this.buildGateway.broadcastStatus(
      project.id,
      DeploymentStatus.QUEUED_FOR_BUILDING,
      Date.now(),
    );
    return project;
  }

  async getProjects(userId: string) {
    const select = {
      id: true,
      name: true,
      description: true,
      framework: true,
      nodeVersion: true,
      buildCommand: true,
      installCommand: true,
      outputDirectory: true,
      devCommand: true,
      gitRepositoryName: true,
      gitRepositoryOwner: true,
      gitRepositoryType: true,
      createdAt: true,
      updatedAt: true,
      userId: true,
      environmentVariables: true,
      active: true,
      dailyCreditCost: true,
      creditUsedThisMonth: true,
      deployment: {
        select: {
          id: true,
          projectId: true,
          status: true,
          url: true,
          port: true,
          name: true,
          createdAt: true,
          updatedAt: true,
          deploymentStartedAt: true,
          deploymentFinishedAt: true,
        },
      },
    };
    return this.prismaService.project.findMany({
      where: { userId },
      select,
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async getProject(projectId: string) {
    return this.prismaService.project.findUnique({
      where: { id: projectId },
      include: { deployment: true },
    });
  }

  async deleteProject() {
    return {};
  }

  async editProject() {
    return {};
  }

  async getEnvVariables(projectId: string, userId: string) {
    const project = await this.prismaService.project.findUnique({
      where: { id: projectId, userId: userId },
      select: { environmentVariables: true },
    });

    if (!project || !project.environmentVariables) {
      throw new Error('Project or environment variables not found');
    }
    const decryptedVariables = await this.encryptionService.decrypt(
      project.environmentVariables,
    );
    return JSON.parse(decryptedVariables) as Record<string, string>;
  }

  async getDeployments(userId: string, status?: DeploymentStatus) {
    const select = {
      id: true,
      status: true,
      url: true,
      port: true,
      name: true,
      createdAt: true,
      updatedAt: true,
      deploymentStartedAt: true,
      deploymentFinishedAt: true,
      project: {
        select: {
          name: true,
          id: true,
          gitRepositoryName: true,
          gitRepositoryOwner: true,
        },
      },
    };
    if (!status) {
      return await this.prismaService.deployment.findMany({
        where: { project: { userId } },
        select,
        orderBy: {
          createdAt: 'desc',
        },
      });
    }
    return await this.prismaService.deployment.findMany({
      where: { status: status, project: { userId } },
      select,
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async deploymentStats(userId: string) {
    const deployments = await this.prismaService.deployment.findMany({
      where: { project: { userId } },
    });
    const totalDeployments = await this.prismaService.deployment.count({
      where: {
        project: { userId },
        status: {
          in: [
            DeploymentStatus.ERROR,
            DeploymentStatus.SUSPENDED,
            DeploymentStatus.READY,
          ],
        },
      },
    });
    const successfulDeployments = deployments.filter(
      (deployment) => deployment.status === DeploymentStatus.READY,
    );
    const failedDeployments = deployments.filter(
      (deployment) =>
        deployment.status === DeploymentStatus.ERROR ||
        deployment.status === DeploymentStatus.SUSPENDED,
    );
    const deploymentSuccessRate =
      (successfulDeployments.length / deployments.length) * 100;
    const totalProjects = await this.prismaService.project.count({
      where: {
        userId,
      },
    });
    const totalServices = await this.prismaService.project.count({
      where: {
        userId,
        framework: {
          in: [Framework.node, Framework.nestjs, Framework.bun],
        },
      },
    });

    return {
      successRate: Number(deploymentSuccessRate.toFixed(2)),
      totalDeployments,
      successfulDeployments: successfulDeployments.length,
      failedDeployments: failedDeployments.length,
      totalServices,
      totalProjects,
    };
  }

  async updateDeploymentStatus(
    projectId: string,
    workerSecret: string,
    status: DeploymentStatus,
    liveUrl?: string,
    url_port?: string,
    logs?: string,
  ) {
    if (workerSecret !== this.configService.get<string>('WORKER_SECRET')) {
      throw new UnauthorizedException('Invalid Worker Secret');
    }

    const project = await this.prismaService.project.findUnique({
      where: { id: projectId },
      include: { deployment: true },
    });
    if (!project) {
      throw new BadRequestException('Project not found');
    }

    if (status === DeploymentStatus.READY) {
      await this.prismaService.deployment.update({
        where: { projectId },
        data: {
          url: liveUrl,
          status: status,
          port: url_port,
          deploymentFinishedAt: new Date().toISOString(),
          buildLogs: logs || '',
        },
      });
    } else if (status === DeploymentStatus.BUILDING) {
      await this.prismaService.deployment.update({
        where: { projectId },
        data: {
          status: status,
          deploymentStartedAt: new Date().toISOString(),
        },
      });
    } else {
      await this.prismaService.deployment.update({
        where: { projectId },
        data: {
          status: status,
          deploymentFinishedAt: new Date().toISOString(),
          buildLogs: logs || '',
        },
      });
    }
    this.buildGateway.broadcastStatus(project.id, status, Date.now());

    return {
      success: true,
      message: 'Deployment status updated successfully',
      project,
    };
  }

  async stopProject(projectId: string) {
    const redisClient = this.isProduction
      ? createCluster({
          rootNodes: [{ url: this.redisUrl }],
          defaults: {
            socket: {
              tls: this.redisUrl.startsWith('rediss'),
            },
          },
        })
      : createClient({
          url: this.redisUrl,
        });
    await redisClient.connect();
    const project = await this.prismaService.project.findUnique({
      where: { id: projectId },
      include: { deployment: true },
    });
    if (!project) {
      throw new BadRequestException('Project not found');
    }

    const deploymentPayload = {
      projectId: project.id,
      action: 'KILL_CONTAINER',
      folder_name: project.name + '-' + project.id,
    };
    await redisClient.lPush(
      'deployment-queue',
      JSON.stringify(deploymentPayload),
    );
    await this.prismaService.project.update({
      where: { id: project.id },
      data: {
        active: false,
        deployment: { update: { status: DeploymentStatus.SUSPENDED } },
      },
    });
    return { success: true, message: 'Project stopped successfully' };
  }

  async restartProject(projectId: string) {
    const redisClient = this.isProduction
      ? createCluster({
          rootNodes: [{ url: this.redisUrl }],
          defaults: {
            socket: {
              tls: this.redisUrl.startsWith('rediss'),
            },
          },
        })
      : createClient({
          url: this.redisUrl,
        });
    await redisClient.connect();
    const project = await this.prismaService.project.findUnique({
      where: { id: projectId },
      include: { deployment: true },
    });
    if (!project) {
      throw new BadRequestException('Project not found');
    }

    const deploymentPayload = {
      projectId: project.id,
      action: 'RESTART_CONTAINER',
      folder_name: project.name + '-' + project.id,
      url_port: project?.deployment?.port,
    };
    await redisClient.lPush(
      'deployment-queue',
      JSON.stringify(deploymentPayload),
    );
    await this.prismaService.project.update({
      where: { id: project.id },
      data: {
        active: true,
        deployment: { update: { status: DeploymentStatus.READY } },
      },
    });
    return { success: true, message: 'Project restarted successfully' };
  }

  private async analyzeRepository(owner: string, repo: string, token: string) {
    const octokit = new Octokit({ auth: token });

    // 1. Fetch package.json
    let packageJson: any = null;
    try {
      const { data } = await octokit.rest.repos.getContent({
        owner,
        repo,
        path: 'package.json',
      });

      // GitHub returns file content as Base64
      if ('content' in data) {
        const decoded = Buffer.from(data.content as string, 'base64').toString(
          'utf-8',
        );
        packageJson = JSON.parse(decoded);
      }
    } catch (e: any) {
      this.logger.error(`Error fetching package.json: ${e.message}`, e.stack);
    }

    // 2. Fetch .nvmrc (optional)
    let nvmrc: string | null = null;
    try {
      const { data } = await octokit.rest.repos.getContent({
        owner,
        repo,
        path: '.nvmrc',
      });
      if ('content' in data) {
        nvmrc = Buffer.from(data.content, 'base64').toString('utf-8').trim();
      }
    } catch (e) {
      // Ignore if .nvmrc doesn't exist
    }

    // 3. Determine Node Version
    const nodeVersion = this.detectNodeVersion(packageJson, nvmrc);

    // 4. Determine Framework
    const framework = this.detectFramework(packageJson);

    return {
      nodeVersion,
      framework,
      // You can also use the framework to set default build commands automatically
      defaultBuildCommand: this.getDefaultBuildCommand(framework),
      defaultOutputDirectory: this.getDefaultOutputDir(framework),
    };
  }

  private detectNodeVersion(packageJson: any, nvmrc: string | null): string {
    const defaultVersion = '20.x'; // Your PaaS default

    // Highest priority: .nvmrc
    if (nvmrc) {
      const match = nvmrc.match(/v?(\d+)/);
      if (match) return `${match[1]}.x`;
    }

    // Second priority: package.json engines
    if (packageJson?.engines?.node) {
      const engineStr = packageJson.engines.node;
      // Use semver to find the minimum required version, then map to major version
      const minVersion = semver.minVersion(engineStr);
      if (minVersion) {
        return `${minVersion.major}.x`;
      }
    }

    return defaultVersion;
  }

  private detectFramework(packageJson: any): Framework | null {
    if (!packageJson) return null;

    const deps = {
      ...(packageJson.dependencies || {}),
      ...(packageJson.devDependencies || {}),
    };

    if (deps['next']) return 'nextjs';
    if (deps['@nestjs/core']) return 'nestjs';
    if (deps['nuxt']) return 'nuxtjs';
    if (deps['@sveltejs/kit']) return 'sveltekit';
    if (deps['@remix-run/react']) return 'remix';
    if (deps['@angular/core']) return 'angular';
    if (deps['gatsby']) return 'gatsby';
    if (deps['vite']) return 'vite';
    if (deps['react-scripts']) return 'reactjs';

    return 'node'; // Generic Node.js fallback
  }

  private getDefaultBuildCommand(framework: string | null): string {
    const map: Record<string, string> = {
      nextjs: 'npm run build',
      nestjs: 'npm run build',
      vite: 'npm run build',
      // Add other framework defaults...
    };
    return framework && map[framework]
      ? map[framework]
      : 'npm install && npm run build';
  }

  private getDefaultOutputDir(framework: string | null): string {
    const map: Record<string, string> = {
      nextjs: '.next',
      nestjs: 'dist',
      vite: 'dist',
      sveltekit: '.svelte-kit/output',
    };
    return framework && map[framework] ? map[framework] : 'dist';
  }
}
