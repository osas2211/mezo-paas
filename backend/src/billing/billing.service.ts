// src/billing/billing.service.ts
import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../prisma/prisma.service';
import { createCluster, createClient } from 'redis';
import { ConfigService } from '@nestjs/config';
import { DeploymentStatus } from '../../generated/prisma/enums';
import {
  TransactionType,
  TransactionAction,
} from '../../generated/prisma/enums'

@Injectable()
export class BillingMeterService {
  private readonly logger = new Logger(BillingMeterService.name);

  constructor(
    private prisma: PrismaService,
    private configService: ConfigService,
  ) { }

  // Runs once a day to charge for active servers
  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT, { timeZone: 'Africa/Lagos' })
  async meterUsage() {
    const isProduction =
      this.configService.get<string>('NODE_ENV') === 'production';
    const redisUrl = this.configService.get<string>('REDIS_URL') || '';
    const redisClient = isProduction
      ? createCluster({
        rootNodes: [{ url: redisUrl }],
        defaults: {
          socket: {
            // Automatically handle the AWS TLS handshake if using rediss://
            tls: redisUrl.startsWith('rediss'),
          },
        },
      })
      : createClient({
        url: redisUrl,
      });
    await redisClient.connect();
    this.logger.log('Starting daily billing cycle...');

    const activeUsers = await this.prisma.user.findMany({
      include: { projects: { where: { active: true } }, wallet: true },
    });

    for (const user of activeUsers) {
      if (user.projects.length === 0) continue;

      // Total daily cost of all their running PM2 servers
      const totalDailyCost = user.projects.reduce(
        (sum, p) => sum + Number(p.dailyCreditCost),
        0,
      );

      // TRACK B: The Whale Check
      // If their staked capacity covers the daily cost, we do nothing. They ride free on yield.
      if (Number(user.wallet?.stakedBalance) >= totalDailyCost) {
        // TODO: Skip daily billing, charge from rewards
        continue;
      }

      // TRACK A: The Regular Dev Check
      // They don't have staked capacity, burn their consumable credits
      if (Number(user.wallet?.creditBalance) >= totalDailyCost) {
        await this.prisma.user.update({
          where: { id: user.id },
          data: {
            wallet: {
              update: {
                creditBalance: String(
                  Number(user.wallet?.creditBalance) - totalDailyCost,
                ),
              },
            },
            transactions: {
              create: {
                action: TransactionAction.Billing,
                type: TransactionType.DEBIT,
                title: 'Daily billing',
                amount: String(totalDailyCost),
              },
            },
          },
        });
      } else {
        // THEY RAN OUT OF MONEY. WE STOP SERVERS.
        this.logger.warn(
          `User ${user.wallet?.address} ran out of credits. Shutting down apps...`,
        );

        for (const project of user.projects) {
          const deploymentPayload = {
            projectId: project.id,
            action: 'KILL_CONTAINER',
            folder_name: project.name + '-' + project.id,
          };
          const containerName = `mezo-runtime-${project.id}`;
          await redisClient.lPush(
            'deployment-queue',
            JSON.stringify(deploymentPayload),
          );
          await this.prisma.project.update({
            where: { id: project.id },
            data: {
              active: false,
              deployment: { update: { status: DeploymentStatus.SUSPENDED } },
            },
          });
          this.logger.log(`Event sent to stop container: ${containerName}`);
        }
      }
    }
  }
}
