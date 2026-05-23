import Docker from "dockerode";
import * as tar from "tar-fs";
import fs from "fs";
import path from "path";

const docker = new Docker();

export async function buildAndRun(
  projectId: string,
  sourcePath: string,
  envVars?: Record<string, string>,
  onLog?: (msg: string) => void, // <-- NEW: Streaming callback
): Promise<string> {
  const tagName = `mezo-app-${projectId}:latest`;
  const dockerIgnoreContent = `
node_modules
.git
.env
dist
build
`;
  fs.writeFileSync(
    path.join(sourcePath, ".dockerignore"),
    dockerIgnoreContent.trim(),
  );

  // Format for Build-Time (Next.js / React)
  const buildargs: Record<string, string> = {};
  for (const [key, value] of Object.entries(envVars ?? {})) {
    buildargs[key.toUpperCase()] = value;
  }

  // Format for Run-Time (Node.js / NestJS)
  const runtimeEnvArray = Object.entries(envVars ?? {}).map(
    ([key, value]) => `${key.toUpperCase()}=${value}`,
  );

  // Build Phase
  if (onLog)
    onLog(`[System] Initializing Docker build pipeline for ${tagName}...`);

  const stream = await docker.buildImage(tar.pack(sourcePath), {
    t: tagName,
    buildargs,
  });

  await new Promise((res, rej) => {
    docker.modem.followProgress(
      stream,
      (err, result) => (err ? rej(err) : res(result)),
      // NEW: This captures the live build output layer by layer
      (event) => {
        if (onLog) {
          // Docker outputs standard logs in event.stream, and pulling/extracting in event.status
          if (event.stream && event.stream.trim()) {
            onLog(event.stream.trim());
          } else if (event.status && event.status.trim()) {
            // Optional: Include progress details if you want to see layer downloads
            // const progress = event.progress ? ` ${event.progress}` : '';
            // onLog(`[Docker] ${event.status.trim()}${progress}`);
          } else if (event.error) {
            onLog(`[Error] ${event.error}`);
          }
        }
      },
    );
  });

  if (onLog) onLog(`[System] Build complete. Provisioning container...`);

  const port_tcp = "3000/tcp";

  // Create and Start Container
  const container = await docker.createContainer({
    Image: tagName,
    name: `mezo-runtime-${projectId}`,
    Env: runtimeEnvArray,
    HostConfig: {
      PortBindings: { [port_tcp]: [{ HostPort: "0" }] },
    },
  });

  await container.start();
  const info = await container.inspect();

  const finalPort = info.NetworkSettings.Ports[port_tcp][0].HostPort;
  if (onLog)
    onLog(`[System] Container live and bound to host port ${finalPort}`);

  return finalPort;
}
