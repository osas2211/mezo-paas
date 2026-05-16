import { Body, Controller, Get, Headers, Param, Patch, Post, Query, Req, UnauthorizedException, UseGuards } from '@nestjs/common'
import { AuthGuard } from 'src/auth/auth.guard'
import { ProjectService } from './project.service'
import express from 'express'
import { PrismaService } from 'src/prisma/prisma.service'
import { DeploymentStatus } from 'generated/prisma/enums'
import { UpdateDeploymentStatusDto } from './dto/project.dto'

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

  @Patch(':projectId/deployment-status')
  async handleDeploymentStatus(
    @Param('projectId') projectId: string,
    @Body() body: UpdateDeploymentStatusDto,
    @Headers('x-worker-secret') workerSecret: string,
  ) {
    return this.projectService.updateDeploymentStatus(projectId, workerSecret, body.status, body.liveUrl)
  }
}
