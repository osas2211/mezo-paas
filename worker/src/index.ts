import { createClient, createCluster } from "redis"
import { downloadS3Folder } from "./s3"
import { buildAndRun } from "./docker"
import * as fs from "fs"
import { generateDockerfile } from "./detector"
import path from "path"
import { decrypt } from "./crypto"
import "dotenv/config"

const redisUrl = process.env.REDIS_URL || ""
const isProduction = process.env.NODE_ENV === "production"


const redis = isProduction ? createCluster({
  rootNodes: [
    { url: redisUrl }
  ],
  defaults: {
    socket: {
      // Automatically handle the AWS TLS handshake if using rediss://
      tls: redisUrl.startsWith('rediss')
    }
  }
}) : createClient({
  url: redisUrl
})

type statusType = "PENDING_DEPLOYMENT" | "QUEUED_FOR_BUILDING" | "BUILDING" | "READY" | "ERROR" | "CANCELED"

const updateDeploymentStatus = async (projectId: string, status: statusType, liveUrl?: string) => {
  await fetch(`${process.env.BACKEND_URL}/api/v1/project/${projectId}/deployment-status`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      'x-worker-secret': process.env.WORKER_SECRET! // Must match the backend .env
    },
    body: JSON.stringify({ status, liveUrl })
  })
}

async function main() {
  await redis.connect()
  console.log("👷 Mezo Worker is live and listening...")
  // const queueList = await redis.lRange("deployment-queue", 0, -1)
  // console.log("All value", queueList)

  while (true) {
    // brPop blocks until a job arrives
    const job = await redis.brPop("deployment-queue", 0)
    if (!job) continue
    const { projectId, encryptedEnv, folder_name } = JSON.parse(job.element)

    const localPath = `./temp/${folder_name}`

    try {

      console.log(`🚀 Deploying: ${folder_name}`)
      let envVars = {}

      if (encryptedEnv) {
        console.log(`🔐 Decrypting environment variables for ${folder_name}...`)
        envVars = decrypt(encryptedEnv)
      }

      await downloadS3Folder(`repos/${folder_name}`, localPath)

      // 2. Check for Dockerfile, generate one if missing
      const autoDockerFile = generateDockerfile(localPath)
      if (autoDockerFile) {
        console.log(
          `📝 No Dockerfile found. Injecting auto-generated Node.js template.`,
        )
        fs.writeFileSync(path.join(localPath, "Dockerfile"), autoDockerFile)
      }

      updateDeploymentStatus(projectId, "BUILDING")
      const startTime = Date.now()
      const port = await buildAndRun(projectId, localPath, envVars)

      // Update status and port mapping for the Proxy
      await redis.hSet("routing", folder_name, port)
      await redis.hSet("status", folder_name, "live")

      console.log(`✅ Success! ${folder_name} on port ${port}`)

      const liveUrl = `http://${folder_name}.${process.env.NODE_ENV === 'production' ? 'stellarsampled.com' : 'lvh.me:8010'}`
      console.log(`🌐 Live URL: ${liveUrl}`)

      // 3Ping the NestJS API to save it to Postgres
      await updateDeploymentStatus(projectId, "READY", liveUrl)

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
