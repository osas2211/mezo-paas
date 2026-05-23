import { IsEnum, IsOptional, IsString } from 'class-validator';
import { DeploymentStatus } from '../../../generated/prisma/enums';

export class UpdateDeploymentStatusDto {
  @IsString()
  @IsOptional()
  liveUrl?: string;

  @IsString()
  @IsOptional()
  url_port?: string;

  @IsString()
  @IsOptional()
  logs?: string;

  @IsEnum(DeploymentStatus)
  status: DeploymentStatus;
}
