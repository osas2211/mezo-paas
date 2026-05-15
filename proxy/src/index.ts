import http, { IncomingMessage, ServerResponse } from "http"
import https from "https"
import fs from "fs"
import httpProxy from "http-proxy"
import { createClient, createCluster } from "redis"
import "dotenv/config"
import { Socket } from "net"

const proxy = httpProxy.createProxyServer({
  changeOrigin: true,
})

const isProd = process.env.NODE_ENV === "production"
const backendUrl = process.env.BACKEND_URL
const redisUrl = process.env.REDIS_URL || ""


const redis = isProd ? createCluster({
  rootNodes: [{ url: redisUrl }],
  defaults: {
    socket: { tls: redisUrl.startsWith('rediss') }
  }
}) : createClient({
  url: redisUrl
})

async function main() {
  await redis.connect()
  console.log(`🌐 Mezo Gateway is live [Mode: ${isProd ? "PRODUCTION" : "LOCAL"}]`)

  // --- CORE ROUTING LOGIC ---
  const handleRequest = async (req: IncomingMessage, res: ServerResponse) => {
    const host = req.headers.host || ""

    // 1. API Routing
    if (host.startsWith("api.")) {
      return proxy.web(req, res, { target: backendUrl }, (err) => {
        console.error("Proxy Error for API:", err.message)
        res.writeHead(502)
        res.end("Bad Gateway: API Server unreachable.")
      })
    }

    // 2. Naked Domain
    if (host === "stellarsampled.com" || host === "www.stellarsampled.com" || host === "lvh.me") {
      res.writeHead(200, { "Content-Type": "text/html" })
      return res.end("<h1>Mezo Gateway</h1><p>Operational. Secure Connection Active.</p>")
    }

    // 3. Dynamic Subdomain
    const projectId = host.split(".")[0]
    try {
      const targetPort = await redis.hGet("routing", projectId)
      if (!targetPort) {
        res.writeHead(404, { "Content-Type": "text/plain" })
        return res.end(`Project '${projectId}' not found. Check deployment status.`)
      }

      proxy.web(req, res, { target: `http://localhost:${targetPort}` }, (err) => {
        console.error(`Proxy Error for ${projectId}:`, err.message)
        if (!res.headersSent) {
          res.writeHead(502)
          res.end("Bad Gateway: Container offline.")
        }
      })
    } catch (error) {
      res.writeHead(500)
      res.end("Internal Gateway Error")
    }
  }

  // --- WEBSOCKET LOGIC ---
  const handleWs = async (req: IncomingMessage, socket: Socket, head: Buffer) => {
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
  }

  // --- SERVER BINDING ---
  if (isProd) {
    try {
      // Load the Certbot Certificates
      const privateKey = fs.readFileSync('/etc/letsencrypt/live/stellarsampled.com/privkey.pem', 'utf8')
      const certificate = fs.readFileSync('/etc/letsencrypt/live/stellarsampled.com/fullchain.pem', 'utf8')
      const credentials = { key: privateKey, cert: certificate }

      // 1. Start the HTTPS Server on Port 443
      const httpsServer = https.createServer(credentials, handleRequest)
      httpsServer.on("upgrade", handleWs)
      httpsServer.listen(443, () => console.log("🔒 HTTPS Proxy running on port 443"))

      // 2. Start HTTP Server on Port 80 ONLY to redirect to HTTPS
      http.createServer((req, res) => {
        res.writeHead(301, { "Location": "https://" + req.headers['host'] + req.url })
        res.end()
      }).listen(80, () => console.log("↪️  HTTP Redirect running on port 80"))

    } catch (err) {
      console.error("SSL Error: Could not read certs. Are you running with sudo?", (err as any).message)
    }
  } else {
    // Local Development
    const httpServer = http.createServer(handleRequest)
    httpServer.on("upgrade", handleWs)
    httpServer.listen(8010, () => {
      console.log("🚀 Local Proxy running on port 8010")
      console.log("🔗 Local Test: http://api.lvh.me:8010")
    })
  }
}

main()