import { Module } from '@nestjs/common';
import { GithubController } from './github.controller';
import { GithubService } from './github.service';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule } from '@nestjs/config';
import { PrismaService } from 'src/prisma/prisma.service';
import { UploadModule } from 'src/upload/upload.module';

@Module({
  imports: [HttpModule, ConfigModule, UploadModule],
  controllers: [GithubController],
  providers: [GithubService, PrismaService],
  exports: [GithubService]
})
export class GithubModule {}
