import http from "http"
import httpProxy from "http-proxy"
import { createClient } from "redis"
import "dotenv/config"

const proxy = httpProxy.createProxyServer({
  // This helps when the containerized app expects a specific host header
  changeOrigin: true,
})

const redis = createClient({ url: process.env.REDIS_URL })

async function main() {
  await redis.connect()
  console.log("🌐 Mezo Proxy Gateway is live")

  const server = http.createServer(async (req, res) => {
    const host = req.headers.host || ""

    // Extract Project ID (e.g., project1.lvh.me:8080 -> project1)
    const projectId = host.split(".")[0]

    // Avoid proxying if someone hits the naked lvh.me domain
    if (projectId === "lvh" || !projectId) {
      res.writeHead(200)
      return res.end("Mezo PaaS Gateway - System Operational")
    }

    try {
      const targetPort = await redis.hGet("routing", projectId)

      if (!targetPort) {
        res.writeHead(404, { "Content-Type": "text/plain" })
        return res.end("Project not found or deployment in progress.")
      }

      // Standard HTTP Proxying
      proxy.web(
        req,
        res,
        { target: `http://localhost:${targetPort}` },
        (err) => {
          console.error(`Proxy Error for ${projectId}:`, err.message)
          if (!res.headersSent) {
            res.writeHead(502)
            res.end("Bad Gateway: App container might be restarting.")
          }
        },
      )
    } catch (error) {
      console.error("Gateway Logic Error:", error)
      res.writeHead(500)
      res.end("Internal Gateway Error")
    }
  })

  // --- CRITICAL: WebSocket Support ---
  // This allows HMR (Hot Module Replacement) and Socket.io to work
  server.on("upgrade", async (req, socket, head) => {
    const host = req.headers.host || ""
    const projectId = host.split(".")[0]
    const targetPort = await redis.hGet("routing", projectId)

    if (targetPort) {
      proxy.ws(req, socket, head, { target: `http://localhost:${targetPort}` })
    } else {
      socket.destroy()
    }
  })

  const PORT = 8010
  server.listen(PORT, () => {
    console.log(`🌐 Local Proxy Gateway running at http://lvh.me:${PORT}`)
    console.log(`🚀 Test your projects at http://[PROJECT_ID].lvh.me:${PORT}`)
  })
}

main()
