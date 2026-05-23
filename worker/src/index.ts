import { createClient, createCluster } from "redis";
import { downloadS3Folder } from "./s3";
import { buildAndRun } from "./docker";
import * as fs from "fs";
import { generateDockerfile } from "./detector";
import path from "path";
import { decrypt } from "./crypto";
import "dotenv/config";
import { exec } from "child_process";
import { promisify } from "util";

const execAsync = promisify(exec);

const redisUrl = process.env.REDIS_URL || "";
const isProduction = process.env.NODE_ENV === "production";

// 1. Queue Listener Client
const redis = isProduction
  ? createCluster({
      rootNodes: [{ url: redisUrl }],
      defaults: { socket: { tls: redisUrl.startsWith("rediss") } },
    })
  : createClient({ url: redisUrl });

// 2. Pub/Sub Publisher Client
const pubClient = isProduction
  ? createCluster({
      rootNodes: [{ url: redisUrl }],
      defaults: { socket: { tls: redisUrl.startsWith("rediss") } },
    })
  : createClient({ url: redisUrl });

type statusType =
  | "PENDING_DEPLOYMENT"
  | "QUEUED_FOR_BUILDING"
  | "BUILDING"
  | "READY"
  | "ERROR"
  | "CANCELED"
  | "SUSPENDED";

const updateDeploymentStatus = async (
  projectId: string,
  status: statusType,
  liveUrl?: string,
  url_port?: string,
  logs?: string,
) => {
  await fetch(
    `${process.env.BACKEND_URL}/api/v1/project/${projectId}/deployment-status`,
    {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        "x-worker-secret": process.env.WORKER_SECRET!,
      },
      body: JSON.stringify({ status, liveUrl, url_port, logs }),
    },
  );
};

// NEW: Stream log helper
const streamLog = async (
  folder_name: string,
  projectId: string,
  message: string,
) => {
  // console.log(message);
  try {
    await pubClient.publish(`logs:${folder_name}`, message);
    await redis.rPush(`log_buffer:${projectId}`, message);
  } catch (err) {
    console.error(`Redis publish failed for ${folder_name}:`, err);
  }
};

async function main() {
  await redis.connect();
  await pubClient.connect();
  console.log("👷 Mezo Worker is live and listening...");

  while (true) {
    const job = await redis.brPop("deployment-queue", 0);
    if (!job) continue;

    const jobData = JSON.parse(job.element);
    const action = jobData.action || "DEPLOY";
    const url_port = jobData.url_port || "";
    const { projectId, folder_name, encryptedEnv, s3_folder_name } = jobData;

    // ==========================================
    // THE KILL SWITCH
    // ==========================================
    if (action === "KILL_CONTAINER") {
      console.log(
        `🚨 Billing Trigger: Terminating container for ${folder_name}...`,
      );
      try {
        await execAsync(`docker stop mezo-runtime-${projectId}`);
        await execAsync(`docker rm mezo-runtime-${projectId}`);
        await redis.hDel("routing", folder_name);
        await redis.hSet("status", folder_name, "offline");
        console.log(
          `🛑 Successfully destroyed container and routed offline: ${folder_name}`,
        );
      } catch (err: any) {
        console.error(
          `⚠️ Notice for ${folder_name}: Container might already be dead.`,
          err.message,
        );
      }
      continue;
    }

    // ==========================================
    // RESTART LOGIC
    // ==========================================
    if (action === "RESTART_CONTAINER") {
      console.log(`🚨 Restarting container for ${folder_name}...`);
      try {
        await execAsync(
          `docker run -d -p ${url_port}:3000 --name mezo-runtime-${projectId} mezo-app-${projectId}`,
        );
        await redis.hSet("routing", folder_name, url_port);
        await redis.hSet("status", folder_name, "live");
        console.log(
          `🛑 Successfully restarted container and routed : ${folder_name}, Port: ${url_port}`,
        );
      } catch (err: any) {
        console.error(
          `⚠️ Notice for ${folder_name}: Container might already be dead and can't be restarted.`,
          err.message,
        );
      }
      continue;
    }

    // ==========================================
    // DEPLOYMENT LOGIC (With Streaming)
    // ==========================================
    const localPath = `./temp/${folder_name}`;

    try {
      await updateDeploymentStatus(projectId, "BUILDING");
      const startTime = Date.now();
      await streamLog(
        s3_folder_name,
        projectId,
        `🚀 Deploying: ${folder_name}`,
      );
      let envVars = {};

      if (encryptedEnv) {
        await streamLog(
          s3_folder_name,
          projectId,
          `🔐 Decrypting environment variables...`,
        );
        envVars = decrypt(encryptedEnv);
        envVars = Object.fromEntries(
          Object.entries(envVars).filter(([key, value]) => key && value),
        );
        envVars = { ...envVars, PORT: "3000", port: "3000" };
      }

      await streamLog(
        s3_folder_name,
        projectId,
        `📥 Downloading S3 folder 'repos/${s3_folder_name}'...`,
      );
      await downloadS3Folder(`repos/${s3_folder_name}`, localPath);

      const autoDockerFile = generateDockerfile(localPath, envVars);
      if (autoDockerFile) {
        await streamLog(
          s3_folder_name,
          projectId,
          `📝 Injecting auto-generated Node.js Dockerfile...`,
        );
        fs.writeFileSync(path.join(localPath, "Dockerfile"), autoDockerFile);
      }

      // await updateDeploymentStatus(projectId, "BUILDING");
      // const startTime = Date.now();

      // PASS THE STREAM CALLBACK HERE
      const port = await buildAndRun(projectId, localPath, envVars, (msg) => {
        streamLog(s3_folder_name, projectId, msg);
      });

      await redis.hSet("routing", folder_name, port.toString());
      await redis.hSet("status", folder_name, "live");

      await streamLog(
        s3_folder_name,
        projectId,
        `✅ Success! ${folder_name} on port ${port}`,
      );

      const liveUrl = `http://${folder_name}.${process.env.NODE_ENV === "production" ? "mezo.host" : "lvh.me:8010"}`;
      await streamLog(s3_folder_name, projectId, `🌐 Live URL: ${liveUrl}`);

      const endTime = Date.now();
      const duration = (endTime - startTime) / 1000;
      await streamLog(
        s3_folder_name,
        projectId,
        `✅ Deployment complete in ${Math.floor(duration / 60)}m ${Math.floor(duration % 60)}s. URL saved to DB.`,
      );

      const rawLogs = await redis.lRange(`log_buffer:${projectId}`, 0, -1);
      const massiveLogString = rawLogs.join("\n");

      await updateDeploymentStatus(
        projectId,
        "READY",
        liveUrl,
        port.toString(),
        massiveLogString,
      );
    } catch (err: any) {
      const errMsg = `❌ Failed ${folder_name}: ${err.message || err}`;
      await streamLog(s3_folder_name, projectId, errMsg);
      console.error(errMsg);

      // If it crashed, we still want to save the partial logs!
      const rawLogs = await redis.lRange(`log_buffer:${projectId}`, 0, -1);
      const massiveLogString = rawLogs.join("\n");

      await updateDeploymentStatus(
        projectId,
        "ERROR",
        undefined,
        undefined,
        massiveLogString,
      );
    } finally {
      fs.rmSync(localPath, { recursive: true, force: true });

      // const status = await redis.hGet("status", folder_name);
      // if (status === "live") {
      //   const rawLogs = await redis.lRange(`log_buffer:${projectId}`, 0, -1);
      //   const massiveLogString = rawLogs.join("\n");

      //   await updateDeploymentStatus(
      //     projectId,
      //     "READY",
      //     undefined,
      //     undefined,
      //     massiveLogString,
      //   );
      // }

      await redis.del(`log_buffer:${projectId}`);
    }
  }
}

main();
