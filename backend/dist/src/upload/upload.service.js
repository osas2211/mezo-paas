"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var UploadService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.UploadService = void 0;
const common_1 = require("@nestjs/common");
const fs_1 = require("fs");
const fs = __importStar(require("fs"));
const path_1 = require("path");
const simple_git_1 = require("simple-git");
const client_s3_1 = require("@aws-sdk/client-s3");
const config_1 = require("@nestjs/config");
const redis_1 = require("redis");
let UploadService = UploadService_1 = class UploadService {
    configService;
    logger = new common_1.Logger(UploadService_1.name);
    git = (0, simple_git_1.simpleGit)();
    s3Client;
    constructor(configService) {
        this.configService = configService;
        this.s3Client = new client_s3_1.S3Client({
            region: this.configService.get('AWS_REGION') || 'us-east-1',
            credentials: {
                accessKeyId: this.configService.get('AWS_ACCESS_KEY') || '',
                secretAccessKey: this.configService.get('AWS_SECRET_KEY') || '',
            },
        });
    }
    async uploadRepo(repoUrl, branch = 'master', projectId, encryptedEnvironmentVariables) {
        const repoName = repoUrl.split('/').pop() || '';
        const redisClient = (0, redis_1.createClient)();
        await redisClient.connect();
        this.logger.log(`Importing repo from ${repoUrl}`);
        const folder_name = repoName.replace(".git", "") + "-" + projectId;
        const repoDir = (0, path_1.join)(__dirname, 'repos', folder_name);
        if (!(0, fs_1.existsSync)(repoDir)) {
            (0, fs_1.mkdirSync)(repoDir, { recursive: true });
        }
        await this.git.clone(repoUrl, repoDir, {
            '--branch': branch,
        });
        this.logger.log(`Repo imported successfully: ${repoUrl}`);
        await this.uploadDirectory(repoDir, `repos/${folder_name}`);
        const deploymentPayload = {
            "projectId": projectId,
            "encryptedEnv": encryptedEnvironmentVariables,
            "folder_name": folder_name,
        };
        await redisClient.lPush('deployment-queue', JSON.stringify(deploymentPayload));
        fs.rmSync(repoDir, { recursive: true, force: true });
        return { folder_name };
    }
    generate_session_id() {
        const subset = "123456789qwertyuiopasdfghjklzxcvbnm";
        const length = 12;
        let id = "";
        for (let i = 0; i < length; i++) {
            id += subset[Math.floor(Math.random() * subset.length)];
        }
        return id;
    }
    getAllFiles = (folderPath) => {
        let response = [];
        const allFilesAndFolders = (0, fs_1.readdirSync)(folderPath);
        allFilesAndFolders.forEach((file) => {
            const fullFilePath = (0, path_1.join)(folderPath, file);
            if ((0, fs_1.statSync)(fullFilePath).isDirectory()) {
                response = response.concat(this.getAllFiles(fullFilePath));
            }
            else {
                response.push(fullFilePath);
            }
        });
        return response;
    };
    async uploadToS3(fileName, localFilePath) {
        const fileStream = fs.createReadStream(localFilePath);
        const uploadParams = {
            Bucket: this.configService.get('AWS_S3_BUCKET_NAME') || '',
            Key: fileName,
            Body: fileStream,
        };
        const response = await this.s3Client.send(new client_s3_1.PutObjectCommand(uploadParams));
        return response;
    }
    async uploadDirectory(repoDir, s3DestinationFolder = '') {
        const files = this.getAllFiles(repoDir);
        const uploadPromises = files.map((file) => {
            let relativePath = (0, path_1.relative)(repoDir, file);
            relativePath = relativePath.replace(/\\/g, '/');
            const s3Key = s3DestinationFolder ? `${s3DestinationFolder}/${relativePath}` : relativePath;
            return this.uploadToS3(s3Key, file);
        });
        await Promise.all(uploadPromises);
        console.log(`Successfully uploaded ${files.length} files.`);
    }
};
exports.UploadService = UploadService;
exports.UploadService = UploadService = UploadService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], UploadService);
//# sourceMappingURL=upload.service.js.map