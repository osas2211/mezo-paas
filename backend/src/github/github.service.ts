import { Injectable, Logger, NotFoundException, UnauthorizedException } from '@nestjs/common'
import { firstValueFrom } from 'rxjs'
import { HttpService } from '@nestjs/axios'
import { GithubRepoDto } from './dto/github.dto'
import { PrismaService } from 'src/prisma/prisma.service'
import { UploadService } from 'src/upload/upload.service'
import { App as OctokitApp } from 'octokit'
import { ConfigService } from '@nestjs/config'

@Injectable()
export class GithubService {
  private readonly logger = new Logger(GithubService.name)
  private readonly githubApp: OctokitApp

  constructor(private readonly httpService: HttpService,
    private readonly prismaService: PrismaService,
    private readonly uploadService: UploadService,
    private readonly configService: ConfigService
  ) {
    const appId = this.configService.get<string>('GITHUB_APP_ID')
    const privateKey = this.configService.get<string>('GITHUB_PRIVATE_KEY')?.replace(/\\n/g, '\n')

    if (!appId || !privateKey) {
      throw new Error('GitHub App credentials are not fully configured in the environment.')
    }

    this.githubApp = new OctokitApp({
      appId,
      privateKey,
    })
  }

  async fetchInstallationRepos(
    installationId: string,
    access_Token: string,
    search?: string,
    limit?: number
  ): Promise<GithubRepoDto[]> {
    try {
      const reposResponse = await firstValueFrom(
        this.httpService.get(
          `https://api.github.com/user/installations/${installationId}/repositories?per_page=${100}&page=2`,
          {
            headers: {
              Authorization: `token ${access_Token}`,
              Accept: 'application/vnd.github.v3+json',
            },
          },
        ),
      )

      let repos: GithubRepoDto[] = reposResponse.data.repositories.reverse()

      if (search) {
        const lowerSearch = search.toLowerCase()
        repos = repos.filter(repo => repo.name.toLowerCase().includes(lowerSearch))
      }

      if (limit) {
        repos = repos.slice(0, limit)
      }

      return repos
    } catch (error) {
      this.logger.error('GitHub API Error', error.response?.data || error.message)
      throw new UnauthorizedException('Could not connect to GitHub')
    }

  }

  async getGithubUser(token: string): Promise<any> {
    try {
      const reposResponse = await firstValueFrom(
        this.httpService.get(
          `https://api.github.com/user`,
          {
            headers: {
              Authorization: `token ${token}`,
              Accept: 'application/vnd.github.v3+json',
            },
          },
        ),
      )
      return reposResponse.data
    } catch (error) {
      this.logger.error('GitHub API Error', error.response?.data || error.message)
      throw new UnauthorizedException('Could not connect to GitHub')
    }
  }

  async uninstallGithubApp(userId: string): Promise<any> {
    try {
      await this.prismaService.user.update({
        where: {
          id: userId,
        },
        data: {
          githubAccessToken: null,
          githubInstallationId: null,
          githubUsername: null
        },
      })
      return { success: true, message: 'GitHub app uninstalled successfully' }
    } catch (error) {
      this.logger.error('GitHub API Error', error.response?.data || error.message)
      throw new UnauthorizedException('Could not connect to GitHub')
    }
  }

  async fetchSingleRepoDatails(userId: string, repo: string) {
    const userData = await this.prismaService.user.findUnique({
      where: {
        id: userId,
      },
      select: {
        githubAccessToken: true,
        githubInstallationId: true,
        githubUsername: true,
      }
    })
    if (!userData?.githubAccessToken || !userData?.githubInstallationId || !userData?.githubUsername) {
      throw new UnauthorizedException('You are not authorized to perform this action')
    }
    const token = userData?.githubAccessToken
    try {
      const response = await firstValueFrom(
        this.httpService.get(
          `https://api.github.com/repos/${userData?.githubUsername}/${repo}`,
          {
            headers: {
              Authorization: `token ${token}`,
              Accept: 'application/vnd.github.v3+json',
            },
          },
        ),
      )
      return response.data as GithubRepoDto
    } catch (error) {
      this.logger.error('GitHub API Error', error.response?.data || error.message)
      throw new UnauthorizedException('Could not connect to GitHub')
    }
  }

  async importRepo(userId: string, repoName: string, branch: string = 'main') {
    const userData = await this.prismaService.user.findUnique({
      where: {
        id: userId,
      },
    })
    if (!userData?.githubAccessToken || !userData?.githubInstallationId || !userData?.githubUsername) {
      throw new UnauthorizedException('You are not authorized to perform this action')
    }

    // const octokit = await this.githubApp.getInstallationOctokit(Number(userData?.githubInstallationId))
    const cloneUrl = `https://x-access-token:${userData?.githubAccessToken}@github.com/${userData?.githubUsername}/${repoName}.git`
    const repo = await this.fetchSingleRepoDatails(userId, repoName)
    if (!repo) {
      throw new NotFoundException('Repository not found')
    }
    return await this.uploadService.uploadRepo(cloneUrl, repo.default_branch)
  }
}
