import {
  Controller,
  Sse,
  Param,
  MessageEvent,
  OnModuleDestroy,
} from '@nestjs/common';
import { RedisClientType, RedisClusterType } from 'redis';
import { Observable, Subject } from 'rxjs';
import { createClient, createCluster } from 'redis';
import { ConfigService } from '@nestjs/config';

@Controller('api/v1/logs')
export class LogsController implements OnModuleDestroy {
  // We only need ONE client in this file: the subscriber
  private subClient: RedisClientType | RedisClusterType | any;

  constructor(private readonly configService: ConfigService) {
    const isProduction =
      this.configService.get<string>('NODE_ENV') === 'production';
    const redisUrl = this.configService.get<string>('REDIS_URL') || '';

    this.subClient = isProduction
      ? createCluster({
          rootNodes: [{ url: redisUrl }],
          defaults: {
            socket: {
              tls: redisUrl.startsWith('rediss'),
            },
          },
        })
      : createClient({
          url: redisUrl,
        });

    this.subClient.connect().catch(console.error);
  }

  @Sse(':folderName')
  streamLogs(
    @Param('folderName') folderName: string,
  ): Observable<MessageEvent> {
    const subject = new Subject<MessageEvent>();
    const channelName = `logs:${folderName}`;

    const messageHandler = (message: string) => {
      subject.next({ data: message });
    };

    // Execute the subscription
    this.subClient.subscribe(channelName, messageHandler).catch((err: any) => {
      console.error(`Failed to subscribe to ${channelName}:`, err);
      subject.error(err);
    });

    // Cleanup when the React frontend disconnects
    return new Observable((observer) => {
      const subscription = subject.subscribe(observer);

      return () => {
        // CRITICAL FIX: Pass the messageHandler so you only unsubscribe THIS specific user's connection!
        this.subClient
          .unsubscribe(channelName, messageHandler)
          .catch(console.error);
        subscription.unsubscribe();
      };
    });
  }

  // Graceful shutdown
  async onModuleDestroy() {
    if (this.subClient) {
      await this.subClient.quit();
    }
  }
}
