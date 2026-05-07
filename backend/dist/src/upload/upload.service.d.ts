import { ConfigService } from '@nestjs/config';
export declare class UploadService {
    private readonly configService;
    private readonly logger;
    private readonly git;
    private readonly s3Client;
    constructor(configService: ConfigService);
    importRepo(repoUrl: string, branch?: string): Promise<{
        session_id: string;
    }>;
    generate_session_id(): string;
    getAllFiles: (folderPath: string) => string[];
    uploadToS3(fileName: string, localFilePath: string): Promise<import("@aws-sdk/client-s3").PutObjectCommandOutput>;
    uploadDirectory(repoDir: string, s3DestinationFolder?: string): Promise<void>;
}
