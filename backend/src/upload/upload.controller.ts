import { Body, Controller, Post } from '@nestjs/common'
import { UploadService } from './upload.service'

@Controller('upload')
export class UploadController {
  constructor(private readonly uploadService: UploadService) { }

  @Post('/import')
  async importRepo(@Body('repoUrl') repoUrl: string) {
    return await this.uploadService.uploadRepo(repoUrl)
  }
}
