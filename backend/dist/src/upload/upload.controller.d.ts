import { UploadService } from './upload.service';
export declare class UploadController {
    private readonly uploadService;
    constructor(uploadService: UploadService);
    importRepo(repoUrl: string): Promise<{
        folder_name: string;
    }>;
}
