import Docker from "dockerode"
import * as tar from "tar-fs"
import fs from "fs"
import path from "path"

const docker = new Docker()

export async function buildAndRun(
  projectId: string,
  sourcePath: string,
  envVars?: Record<string, string>,
): Promise<string> {
  const tagName = `mezo-app-${projectId}:latest`
  const dockerIgnoreContent = `
node_modules
.git
.env
dist
build
`
  fs.writeFileSync(
    path.join(sourcePath, ".dockerignore"),
    dockerIgnoreContent.trim(),
  )

  // Format for Build-Time (Next.js / React)
  const buildargs: Record<string, string> = {}
  for (const [key, value] of Object.entries(envVars ?? {})) {
    buildargs[key.toUpperCase()] = value
  }

  // Format for Run-Time (Node.js / NestJS)
  // Docker expects an array of "KEY=VALUE" strings
  const runtimeEnvArray = Object.entries(envVars ?? {}).map(
    ([key, value]) => `${key.toUpperCase()}=${value}`,
  )


  // Build Phase
  const stream = await docker.buildImage(tar.pack(sourcePath), {
    t: tagName,
    buildargs,
  })
  await new Promise((res, rej) => {
    docker.modem.followProgress(stream, (err, result) =>
      err ? rej(err) : res(result),
    )
  })

  // const port_tcp = `${envVars?.port || envVars?.PORT || 3000}/tcp`
  const port_tcp = "3000/tcp"

  //  Create and Start Container
  const container = await docker.createContainer({
    Image: tagName,
    name: `mezo-runtime-${projectId}`,
    Env: runtimeEnvArray, // Pass runtime env vars
    HostConfig: {
      PortBindings: { [port_tcp]: [{ HostPort: "0" }] }, // Auto-assigns free host port
    },
  })

  await container.start()
  const info = await container.inspect()

  // Return the port Docker gave us
  return info.NetworkSettings.Ports[port_tcp][0].HostPort
}
