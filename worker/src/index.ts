import { createClient } from "redis"
import { downloadS3Folder } from "./s3"
import { buildAndRun } from "./docker"
import * as fs from "fs"
import "dotenv/config"
import { generateDockerfile } from "./detector"
import path from "path"
import { decrypt } from "./crypto"

const redis = createClient({ url: process.env.REDIS_URL })

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
      const startTime = Date.now()
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

      const port = await buildAndRun(projectId, localPath, envVars)

      // Update status and port mapping for the Proxy
      await redis.hSet("routing", folder_name, port)
      await redis.hSet("status", folder_name, "live")

      console.log(`✅ Success! ${folder_name} on port ${port}`)
      const endTime = Date.now()
      const duration = (endTime - startTime) / 1000
      console.log(`⏱️ Deployment took ${duration} seconds`)
    } catch (err) {
      console.error(`❌ Failed ${folder_name}:`, err)
      await redis.hSet("status", folder_name, "failed")
    } finally {
      fs.rmSync(localPath, { recursive: true, force: true })
    }
  }
}

main()
