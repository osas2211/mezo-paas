import { UploadService } from './upload.service';
export declare class UploadController {
    private readonly uploadService;
    constructor(uploadService: UploadService);
    importRepo(repoUrl: string, branch: string, projectId: string): Promise<{
        folder_name: string;
    }>;
}
