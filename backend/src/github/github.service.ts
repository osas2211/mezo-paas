import { Injectable, Logger, UnauthorizedException } from '@nestjs/common'
import { firstValueFrom } from 'rxjs'
import { HttpService } from '@nestjs/axios'
import { GithubRepoDto } from './dto/github.dto'
import { PrismaService } from 'src/prisma/prisma.service'

@Injectable()
export class GithubService {
  private readonly logger = new Logger(GithubService.name)
  constructor(private readonly httpService: HttpService,
    private readonly prismaService: PrismaService,

  ) { }

  async fetchInstallationRepos(
    installationId: string,
    access_Token: string,
    search?: string,
    limit?: number
  ): Promise<GithubRepoDto[]> {
    try {
      // 2. Fetch the repositories the user granted access to
      const reposResponse = await firstValueFrom(
        this.httpService.get(
          `https://api.github.com/user/installations/${installationId}/repositories?per_page=${100}`,
          {
            headers: {
              Authorization: `token ${access_Token}`,
              Accept: 'application/vnd.github.v3+json',
            },
          },
        ),
      )

      let repos: GithubRepoDto[] = reposResponse.data.repositories

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

  async uninstallGithubApp(installationId: string, token: string, userId: string): Promise<any> {
    console.log(installationId, token, userId)
    try {
      const response = await firstValueFrom(
        this.httpService.delete(
          `https://api.github.com/user/installations/${installationId}`,
          {
            headers: {
              Authorization: `token ${token}`,
              Accept: 'application/vnd.github.v3+json',
            },
          },
        ),
      )
      await this.prismaService.user.update({
        where: {
          id: userId,
        },
        data: {
          githubAccessToken: null,
          githubInstallationId: null,
        },
      })
      return response.data
    } catch (error) {
      this.logger.error('GitHub API Error', error.response?.data || error.message)
      throw new UnauthorizedException('Could not connect to GitHub')
    }
  }
}
