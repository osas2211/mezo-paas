import { Module } from '@nestjs/common'
import { GithubController } from './github.controller'
import { GithubService } from './github.service'
import { HttpModule, HttpService } from '@nestjs/axios'
import { ConfigModule } from '@nestjs/config'
import { PrismaService } from 'src/prisma/prisma.service'

@Module({
  imports: [HttpModule, ConfigModule],
  controllers: [GithubController],
  providers: [GithubService, PrismaService]
})
export class GithubModule { }
