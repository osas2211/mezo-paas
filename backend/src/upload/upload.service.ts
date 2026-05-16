import { Injectable, Logger } from '@nestjs/common'
import { existsSync, mkdirSync, readdirSync, statSync } from 'fs'
import * as fs from 'fs'
import { join, relative } from 'path'
import { simpleGit } from 'simple-git'
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3'
import { ConfigService } from '@nestjs/config'
import { createCluster, createClient } from 'redis'

@Injectable()
export class UploadService {
  private readonly logger = new Logger(UploadService.name);
  private readonly git = simpleGit();
  private readonly s3Client: S3Client

  constructor(
    private readonly configService: ConfigService
  ) {



    const accessKeyId = this.configService.get<string>('AWS_ACCESS_KEY')
    const secretAccessKey = this.configService.get<string>('AWS_SECRET_KEY')

    this.s3Client = new S3Client({
      region: this.configService.get<string>('AWS_REGION') || 'us-east-1',
      // Only include the credentials object if the keys actually exist
      ...(accessKeyId && secretAccessKey ? {
        credentials: {
          accessKeyId,
          secretAccessKey,
        },
      } : {}),
    })
  }

  async uploadRepo(repoUrl: string, branch: string = 'master', projectId: string, encryptedEnvironmentVariables?: string) {
    const isProduction = this.configService.get<string>('NODE_ENV') === 'production'
    const redisUrl = this.configService.get<string>('REDIS_URL') || ""
    const repoName = repoUrl.split('/').pop() || ''
    const redisClient = isProduction ? createCluster({
      rootNodes: [
        { url: redisUrl }
      ],
      defaults: {
        socket: {
          // Automatically handle the AWS TLS handshake if using rediss://
          tls: redisUrl.startsWith('rediss')
        }
      }
    }) : createClient({
      url: redisUrl
    })
    await redisClient.connect()
    this.logger.log(`Importing repo from ${repoUrl}`)

    const folder_name = repoName.replace(".git", "") + "-" + projectId
    const repoDir = join(__dirname, 'repos', folder_name)
    if (!existsSync(repoDir)) {
      mkdirSync(repoDir, { recursive: true })
    }
    await this.git.clone(repoUrl, repoDir, {
      '--branch': branch,
    })
    this.logger.log(`Repo imported successfully: ${repoUrl}`)
    await this.uploadDirectory(repoDir, `repos/${folder_name}`)



    const deploymentPayload = {
      "projectId": projectId,
      "encryptedEnv": encryptedEnvironmentVariables,
      "folder_name": folder_name,
    }

    await redisClient.lPush('deployment-queue', JSON.stringify(deploymentPayload))


    // const value = await redisClient.brPop('deployment-queue', 0)
    // console.log('value', value)
    // Get all in queue
    // const queueList = await redisClient.lRange('deployment-queue', 0, -1)
    // console.log('All value', queueList)
    fs.rmSync(repoDir, { recursive: true, force: true })
    return { folder_name }
  }

  generate_session_id() {
    const subset = "123456789qwertyuiopasdfghjklzxcvbnm"
    const length = 12
    let id = ""
    for (let i = 0; i < length; i++) {
      id += subset[Math.floor(Math.random() * subset.length)]
    }
    return id
  }

  getAllFiles = (folderPath: string): string[] => {
    let response: string[] = []

    const allFilesAndFolders = readdirSync(folderPath)
    allFilesAndFolders.forEach((file) => {
      const fullFilePath = join(folderPath, file)
      if (statSync(fullFilePath).isDirectory()) {
        response = response.concat(this.getAllFiles(fullFilePath))
      } else {
        response.push(fullFilePath)
      }
    })
    return response
  };

  async uploadToS3(fileName: string, localFilePath: string) {
    // 1. Use streams instead of reading the entire file into memory
    const fileStream = fs.createReadStream(localFilePath)

    const uploadParams = {
      Bucket: this.configService.get<string>('AWS_S3_BUCKET_NAME') || '',
      Key: fileName,
      Body: fileStream,
      // ContentType: mime.lookup(localFilePath) || 'application/octet-stream' 
    }

    const response = await this.s3Client.send(new PutObjectCommand(uploadParams))
    return response
  }

  async uploadDirectory(repoDir: string, s3DestinationFolder: string = '') {
    const files = this.getAllFiles(repoDir)

    // 2. Map the files to an array of upload promises
    const uploadPromises = files.map((file) => {
      // 3. Reliably calculate the relative path from the base directory
      let relativePath = relative(repoDir, file)

      // 4. Ensure S3 gets forward slashes, even if run on Windows
      relativePath = relativePath.replace(/\\/g, '/')

      // Append an S3 destination folder prefix if needed
      const s3Key = s3DestinationFolder ? `${s3DestinationFolder}/${relativePath}` : relativePath

      return this.uploadToS3(s3Key, file)
    })

    // 5. Upload files concurrently
    await Promise.all(uploadPromises)
    console.log(`Successfully uploaded ${files.length} files.`)
  }
}
