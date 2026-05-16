export interface ProjectI {
  id: string
  name: string
  userId: string
  createdAt: number
  updatedAt: number

  // Framework & Runtime Defaults
  framework: 'nextjs' | 'nestjs' | 'vite' | 'astro' | 'bun' | 'html' | 'reactjs' | null
  nodeVersion: '22.x' | '20.x' | '18.x'

  // Build Configurations (Overrides standard framework settings)
  buildCommand?: string | null
  installCommand?: string | null
  outputDirectory?: string | null
  devCommand?: string | null

  // The connected Git provider (Required for automatic CI/CD)
  gitRepositoryOwner: string
  gitRepositoryName: string
  gitRepositoryType: 'github' | 'gitlab' | 'bitbucket'

  // Environment Variables associated with this project
  environmentVariables?: Record<string, string>

  // Information regarding the most recent deployments
  // latestDeployments?: Array<{
  //   id: string
  //   url: string
  //   status: 'QUEUED' | 'BUILDING' | 'READY' | 'ERROR' | 'CANCELED'
  //   createdAt: number
  // }>
  deployment?: DeploymentI
}


export interface DeploymentI {
  id: string
  url: string
  name?: string          // Optional: You might want to store a user-friendly name
  status: "PENDING_DEPLOYMENT" | "QUEUED" | "BUILDING" | "READY" | "ERROR" | "CANCELED"
  createdAt: number      // Unix timestamp in ms
  updatedAt?: number       // Unix timestamp in ms
  deploymentStartedAt?: number
  deploymentFinishedAt?: number
}



