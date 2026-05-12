import { Body, Controller, Get, Param, Post, Query, Req, UnauthorizedException, UseGuards } from '@nestjs/common'
import { AuthGuard } from 'src/auth/auth.guard'
import { ProjectService } from './project.service'
import express from 'express'
import { PrismaService } from 'src/prisma/prisma.service'

@Controller('project')
export class ProjectController {
  constructor(
    private readonly projectService: ProjectService,
    private readonly prismaService: PrismaService
  ) { }

  @UseGuards(AuthGuard)
  @Post('create')
  async create(
    @Req() req: express.Request,
    @Body("repoName") repoName: string,
    @Body("envVariables") envVariables?: JSON
  ) {
    const parsedEnvVariables = envVariables ?? {}
    const user = await this.prismaService.user.findUnique({ where: { id: req["user"]?.userId }, select: { githubAccessToken: true, githubInstallationId: true } })
    if (!user?.githubAccessToken || !user.githubInstallationId) {
      throw new UnauthorizedException('You are not authorized to perform this action')
    }

    return this.projectService.create(repoName, req["user"]?.userId as string, user.githubAccessToken, parsedEnvVariables)
  }

  @UseGuards(AuthGuard)
  @Get('list')
  async getProjects(@Req() req: express.Request) {
    return this.projectService.getProjects(req["user"]?.userId as string)
  }

  @UseGuards(AuthGuard)
  @Get(':projectId')
  async getProject(@Param("projectId") projectId: string) {
    return this.projectService.getProject(projectId)
  }
}
