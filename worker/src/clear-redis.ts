import { createClient, createCluster } from "redis";
import "dotenv/config";

const redisUrl = process.env.REDIS_URL || "";
const isProduction = process.env.NODE_ENV === "production";

// 1. Queue Listener Client
const client = isProduction
  ? createCluster({
      rootNodes: [{ url: redisUrl }],
      defaults: { socket: { tls: redisUrl.startsWith("rediss") } },
    })
  : createClient({ url: redisUrl });

async function run() {
  await client.connect();
  console.log("Connected to Redis...");
  const allKeys = await client.hKeys("routing");
  console.log(allKeys);

  // The nuclear option: Wipes every single key in the database
  await client.flushAll();
  console.log(allKeys);

  console.log("BOOM! Redis has been completely reset.");
  await client.quit();
}

run();
