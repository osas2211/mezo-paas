import { createClient, createCluster } from "redis"
import { downloadS3Folder } from "./s3"
import { buildAndRun } from "./docker"
import * as fs from "fs"
import { generateDockerfile } from "./detector"
import path from "path"
import { decrypt } from "./crypto"
import "dotenv/config"
import { exec } from "child_process"
import { promisify } from "util"

const execAsync = promisify(exec)

const redisUrl = process.env.REDIS_URL || ""
const isProduction = process.env.NODE_ENV === "production"

const redis = isProduction ? createCluster({
  rootNodes: [
    { url: redisUrl }
  ],
  defaults: {
    socket: {
      tls: redisUrl.startsWith('rediss')
    }
  }
}) : createClient({
  url: redisUrl
})

type statusType = "PENDING_DEPLOYMENT" | "QUEUED_FOR_BUILDING" | "BUILDING" | "READY" | "ERROR" | "CANCELED" | "SUSPENDED"

const updateDeploymentStatus = async (projectId: string, status: statusType, liveUrl?: string, url_port?: string) => {
  await fetch(`${process.env.BACKEND_URL}/api/v1/project/${projectId}/deployment-status`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      'x-worker-secret': process.env.WORKER_SECRET!
    },
    body: JSON.stringify({ status, liveUrl, url_port })
  })
}

async function main() {
  await redis.connect()
  console.log("👷 Mezo Worker is live and listening...")

  while (true) {
    const job = await redis.brPop("deployment-queue", 0)
    if (!job) continue

    // Parse the job and check for an explicit 'action' flag
    const jobData = JSON.parse(job.element)
    const action = jobData.action || "DEPLOY"
    const url_port = jobData.url_port || ""
    const { projectId, folder_name, encryptedEnv, s3_folder_name } = jobData

    // ==========================================
    // THE KILL SWITCH (Fired by the Billing Cron)
    // ==========================================
    if (action === "KILL_CONTAINER") {
      console.log(`🚨 Billing Trigger: Terminating container for ${folder_name}...`)
      try {
        // 1. Force stop and remove the container 
        // Note: Make sure buildAndRun names the container using folder_name!
        await execAsync(`docker stop mezo-runtime-${projectId}`)
        await execAsync(`docker rm mezo-runtime-${projectId}`)

        // 2. Erase it from the Proxy's memory so it throws a clean 404/503
        await redis.hDel("routing", folder_name)
        await redis.hSet("status", folder_name, "offline")

        console.log(`🛑 Successfully destroyed container and routed offline: ${folder_name}`)
      } catch (err: any) {
        console.error(`⚠️ Notice for ${folder_name}: Container might already be dead.`, err.message)
      }

      continue
    }

    if (action === "RESTART_CONTAINER") {
      console.log(`🚨 Restarting container for ${folder_name}...`)
      try {

        await execAsync(`docker run -d -p ${url_port}:3000 --name mezo-runtime-${projectId} mezo-app-${projectId}`)
        await redis.hSet("routing", folder_name, url_port)
        await redis.hSet("status", folder_name, "live")

        console.log(`🛑 Successfully restarted container and routed : ${folder_name}, Port: ${url_port}`)
      } catch (err: any) {
        console.error(`⚠️ Notice for ${folder_name}: Container might already be dead and can't be restarted.`, err.message)
      }

      continue
    }

    // ==========================================
    // DEPLOYMENT LOGIC
    // ==========================================
    const localPath = `./temp/${folder_name}`

    try {
      console.log(`🚀 Deploying: ${folder_name}`)
      let envVars = {}

      if (encryptedEnv) {
        console.log(`🔐 Decrypting environment variables for ${folder_name}...`)
        envVars = decrypt(encryptedEnv)

        // Remove empty environment variables
        envVars = Object.fromEntries(Object.entries(envVars).filter(([key, value]) => key && value))
        // Ensure port is 3000
        envVars = { ...envVars, PORT: "3000", port: "3000" }
      }

      console.log(`Downloading S3 folder 'repos/${s3_folder_name}' to '${localPath}'...`)
      await downloadS3Folder(`repos/${s3_folder_name}`, localPath)
      console.log(`S3 folder downloaded.`)

      const autoDockerFile = generateDockerfile(localPath, envVars)
      if (autoDockerFile) {
        console.log(`📝 No Dockerfile found. Injecting auto-generated Node.js template.`)
        fs.writeFileSync(path.join(localPath, "Dockerfile"), autoDockerFile)
      }

      await updateDeploymentStatus(projectId, "BUILDING")
      const startTime = Date.now()

      const port = await buildAndRun(projectId, localPath, envVars)

      await redis.hSet("routing", folder_name, port.toString()) // Ensure port is stringified for Redis
      await redis.hSet("status", folder_name, "live")

      console.log(`✅ Success! ${folder_name} on port ${port}`)

      const liveUrl = `http://${folder_name}.${process.env.NODE_ENV === 'production' ? 'mezo.host' : 'lvh.me:8010'}`
      console.log(`🌐 Live URL: ${liveUrl}`)

      await updateDeploymentStatus(projectId, "READY", liveUrl, port.toString())
      console.log(`✅ Deployment complete. URL saved to DB.`)

      const endTime = Date.now()
      const duration = (endTime - startTime) / 1000
      const minutes = Math.floor(duration / 60)
      const seconds = Math.floor(duration % 60)
      console.log(`⏱️ Deployment took ${minutes} minutes and ${seconds} seconds`)
    } catch (err) {
      console.error(`❌ Failed ${folder_name}:`, err)
      await updateDeploymentStatus(projectId, "ERROR")
    } finally {
      fs.rmSync(localPath, { recursive: true, force: true })
    }
  }
}

main()