import http from "http"
import httpProxy from "http-proxy"
import { createClient, createCluster } from "redis"
import "dotenv/config"

const proxy = httpProxy.createProxyServer({
  changeOrigin: true,
})

// Environment detection
const isProd = process.env.NODE_ENV === "production"
const backendUrl = process.env.BACKEND_URL // http://<API_PRIVATE_IP>:3000 (Prod) or http://localhost:3000 (Local)
const redis = createCluster({
  rootNodes: [
    { url: process.env.REDIS_URL }
  ],
  defaults: {
    socket: {
      // If you added the 's' to make it rediss://, 
      // this ensures the cluster client handles the handshake correctly
      tls: process.env.REDIS_URL?.startsWith('rediss')
    }
  }
})

async function main() {
  await redis.connect()
  console.log(`🌐 Mezo Gateway is live [Mode: ${isProd ? "PRODUCTION" : "LOCAL"}]`)

  const server = http.createServer(async (req, res) => {
    const host = req.headers.host || ""

    // 1. Handle API Routing (api.lvh.me or api.stellarsampled.com)
    if (host.startsWith("api.")) {
      return proxy.web(req, res, { target: backendUrl }, (err) => {
        console.error("Proxy Error for API:", err.message)
        res.writeHead(502)
        res.end("Bad Gateway: API Server unreachable.")
      })
    }

    // 2. Handle System Messages (Naked Domains)
    if (host === "stellarsampled.com" || host === "www.stellarsampled.com" || host === "lvh.me") {
      res.writeHead(200, { "Content-Type": "text/html" })
      return res.end("<h1>Mezo Gateway</h1><p>Operational. Use a subdomain to access projects.</p>")
    }

    // 3. Dynamic Subdomain Extraction
    // Works for project1.lvh.me AND project1.stellarsampled.com
    const projectId = host.split(".")[0]

    try {
      const targetPort = await redis.hGet("routing", projectId)

      if (!targetPort) {
        res.writeHead(404, { "Content-Type": "text/plain" })
        return res.end(`Project '${projectId}' not found.`)
      }

      proxy.web(
        req,
        res,
        { target: `http://localhost:${targetPort}` },
        (err) => {
          console.error(`Proxy Error for ${projectId}:`, err.message)
          if (!res.headersSent) {
            res.writeHead(502)
            res.end("Bad Gateway: Container offline.")
          }
        },
      )
    } catch (error) {
      console.error("Gateway Logic Error:", error)
      res.writeHead(500)
      res.end("Internal Gateway Error")
    }
  })

  // --- WebSocket Support ---
  server.on("upgrade", async (req, socket, head) => {
    const host = req.headers.host || ""

    if (host.startsWith("api.")) {
      return proxy.ws(req, socket, head, { target: backendUrl })
    }

    const projectId = host.split(".")[0]
    const targetPort = await redis.hGet("routing", projectId)

    if (targetPort) {
      proxy.ws(req, socket, head, { target: `http://localhost:${targetPort}` })
    } else {
      socket.destroy()
    }
  })

  // Listen on Port 80 for AWS, or 8010 for local development
  const PORT = isProd ? 80 : 8010
  server.listen(PORT, () => {
    console.log(`🚀 Proxy running on port ${PORT}`)
    if (!isProd) {
      console.log(`🔗 Local Test: http://api.lvh.me:${PORT}`)
    }
  })
}

main()