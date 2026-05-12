import { Body, Controller, Delete, Get, NotFoundException, Post, Query, Req, Res, UnauthorizedException, UseGuards } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { GithubService } from './github.service'
import express from 'express'
import { AuthGuard } from 'src/auth/auth.guard'
import { PrismaService } from 'src/prisma/prisma.service'
import { firstValueFrom } from 'rxjs'
import { HttpService } from '@nestjs/axios'

@Controller('github')
export class GithubController {
  constructor(
    private readonly configService: ConfigService,
    private readonly githubService: GithubService,
    private readonly prismaService: PrismaService,
    private readonly httpService: HttpService,
  ) { }

  @UseGuards(AuthGuard)
  @Get('install')
  install(@Req() req: express.Request) {
    const appName = this.configService.get<string>('GITHUB_APP_NAME')
    const userId = req["user"]?.userId

    // Encode the userId into a string. 
    // For production, it is HIGHLY recommended to use a signed JWT here 
    // to prevent CSRF attacks, but Base64 works for basic passing of data.
    const statePayload = JSON.stringify({ userId })
    const state = Buffer.from(statePayload).toString('base64')
    return { url: `https://github.com/apps/${appName}/installations/new?state=${state}` }
  }

  // 2. Callback endpoint triggered by GitHub
  @Get('callback')
  async callback(
    @Query('code') code: string,
    @Query('installation_id') installationId: string,
    @Res() res: express.Response,
    @Query('state') state: string,
  ) {

    const clientId = this.configService.get<string>('GITHUB_CLIENT_ID')
    const clientSecret = this.configService.get<string>('GITHUB_CLIENT_SECRET')
    const frontendUrl = this.configService.get<string>('FRONTEND_URL')

    try {
      const tokenResponse = await firstValueFrom(
        this.httpService.post(
          'https://github.com/login/oauth/access_token',
          {
            client_id: clientId,
            client_secret: clientSecret,
            code: code,
          },
          { headers: { accept: 'application/json' } },
        ),
      )

      const generated_accessToken = tokenResponse.data.access_token

      // Decode the state to get the userId
      const decodedState = JSON.parse(Buffer.from(state, 'base64').toString('utf-8'))
      const userId = decodedState.userId
      const githubUser = await this.githubService.getGithubUser(generated_accessToken)

      await this.prismaService.user.update({
        where: {
          id: userId,
        },
        data: {
          githubAccessToken: generated_accessToken,
          githubInstallationId: installationId,
          githubUsername: githubUser.login,
        },
      })


      // Redirect back to frontend on success
      return res.redirect(`${frontendUrl}/dashboard?status=success`)
    } catch (error) {
      // Redirect back to frontend on error
      return res.redirect(`${frontendUrl}/dashboard?status=error`)
    }
  }

  @UseGuards(AuthGuard)
  @Get('repos')
  async getRepos(
    @Req() req: express.Request,
    @Query('search') search?: string,
    @Query('limit') limit?: string
  ) {
    const user = await this.prismaService.user.findUnique({ where: { id: req["user"]?.userId }, select: { githubAccessToken: true, githubInstallationId: true } })
    const installationId = user?.githubInstallationId
    const access_token = user?.githubAccessToken
    if (!installationId || !access_token) {
      throw new UnauthorizedException('You are not authorized to perform this action')
    }
    return this.githubService.fetchInstallationRepos(
      installationId!,
      access_token as string,
      search,
      limit ? parseInt(limit, 10) : undefined
    )
  }

  @UseGuards(AuthGuard)
  @Get('user')
  async getGithubUser(@Req() req: express.Request) {
    const user = await this.prismaService.user.findUnique({ where: { id: req["user"]?.userId }, select: { githubAccessToken: true } })
    const access_token = user?.githubAccessToken
    if (!access_token) {
      throw new UnauthorizedException('You are not authorized to perform this action')
    }
    return this.githubService.getGithubUser(access_token as string)
  }

  @UseGuards(AuthGuard)
  @Delete('uninstall')
  async uninstallGithubApp(@Req() req: express.Request) {
    const user = await this.prismaService.user.findUnique({ where: { id: req["user"]?.userId }, select: { githubAccessToken: true, githubInstallationId: true } })
    const installationId = user?.githubInstallationId
    const access_token = user?.githubAccessToken
    if (!installationId || !access_token) {
      throw new UnauthorizedException('You are not authorized to perform this action')
    }

    return this.githubService.uninstallGithubApp(req["user"]?.userId as string)
  }

  @UseGuards(AuthGuard)
  @Post('import')
  async importRepo(
    @Req() req: express.Request,
    @Body("repoName") repoName: string,
    @Body("projectId") projectId: string,
  ) {
    const user = await this.prismaService.user.findUnique({ where: { id: req["user"]?.userId }, select: { githubAccessToken: true, githubInstallationId: true, githubUsername: true } })
    const installationId = user?.githubInstallationId
    const access_token = user?.githubAccessToken
    if (!installationId || !access_token || !user?.githubUsername) {
      throw new UnauthorizedException('You are not authorized to perform this action')
    }
    const repo = await this.githubService.fetchSingleRepoDatails(req["user"]?.userId as string, repoName)
    if (!repo) {
      throw new NotFoundException('Repository not found')
    }
    return this.githubService.importRepo(repoName, repo.default_branch, access_token, user?.githubUsername as string, projectId)
  }
}
