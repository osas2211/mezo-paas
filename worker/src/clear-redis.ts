import { createClient, createCluster } from "redis";
import "dotenv/config";

const redisUrl = process.env.REDIS_URL || "";
const isProduction = process.env.NODE_ENV === "production";

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

  if (isProduction) {
    try {
      const masters = client.masters;
      console.log(`Found ${masters.length} master nodes. Arming warheads...`);

      for (const master of masters) {
        await master.client.flushAll();
        console.log(`- Dropped bomb on node: ${master.id}`);
      }

      console.log("BOOM! The entire cluster has been completely reset.");
    } catch (error) {
      console.error("Failed to nuke cluster:", error);
    }
  } else {
    await client.flushAll();

    console.log("BOOM! Redis has been completely reset.");
  }

  await client.quit();
}

run();
