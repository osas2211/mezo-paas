import { Module } from '@nestjs/common'
import { ProjectService } from './project.service'
import { ProjectController } from './project.controller'
import { PrismaService } from 'src/prisma/prisma.service'
import { GithubModule } from 'src/github/github.module'
import { UploadModule } from 'src/upload/upload.module'
import { ConfigModule } from '@nestjs/config'
import { EncryptionService } from 'src/encryption/encryption.service'

@Module({
  imports: [GithubModule, UploadModule, ConfigModule],
  providers: [ProjectService, PrismaService, EncryptionService],
  controllers: [ProjectController]
})
export class ProjectModule { }
