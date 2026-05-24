import { createClient, createCluster } from "redis"
import "dotenv/config"

const redisUrl = process.env.REDIS_URL || ""
const isProduction = process.env.NODE_ENV === "production"

const client = isProduction
  ? createCluster({
      rootNodes: [{ url: redisUrl }],
      defaults: { socket: { tls: redisUrl.startsWith("rediss") } },
    })
  : createClient({ url: redisUrl })

async function run() {
  await client.connect()
  console.log("Connected to Redis...")

  const allKeys = await client.hKeys("routing")
  console.log(allKeys)

  if (isProduction) {
    try {
      // client.masters may not be directly iterable depending on the redis client types.
      // Normalize to an array of master nodes for safe iteration.
      const rawMasters: any = (client as any).masters || []
      const mastersArr = Array.isArray(rawMasters)
        ? rawMasters
        : Object.values(rawMasters)
      console.log(`Found ${mastersArr.length} master nodes. Arming warheads...`)

      for (const master of mastersArr) {
        // master may expose a .client or be a client itself
        const mClient = master.client ?? master
        await mClient.flushAll()
        console.log(
          `- Dropped bomb on node: ${master.id ?? master.name ?? "unknown"}`,
        )
      }

      console.log("BOOM! The entire cluster has been completely reset.")
    } catch (error) {
      console.error("Failed to nuke cluster:", error)
    }
  } else {
    await client.flushAll()

    console.log("BOOM! Redis has been completely reset.")
  }

  await client.quit()
}

run()
