import { get, set, del, keys, clear } from "idb-keyval"
import type {
  StoredContract,
  Project,
  DeployedContract,
  IDESettings,
  DEFAULT_SETTINGS,
} from "@/types/ide"

const CONTRACTS_PREFIX = "ide:contracts:"
const PROJECTS_PREFIX = "ide:projects:"
const DEPLOYMENTS_PREFIX = "ide:deployments:"
const SETTINGS_KEY = "ide:settings"

// Generate unique ID
export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`
}

// Contract Storage
export async function saveContract(contract: StoredContract): Promise<void> {
  await set(`${CONTRACTS_PREFIX}${contract.id}`, contract)
}

export async function getContract(id: string): Promise<StoredContract | undefined> {
  return await get(`${CONTRACTS_PREFIX}${id}`)
}

export async function getAllContracts(): Promise<StoredContract[]> {
  const allKeys = await keys()
  const contractKeys = allKeys.filter(
    (key) => typeof key === "string" && key.startsWith(CONTRACTS_PREFIX)
  )
  const contracts: StoredContract[] = []
  for (const key of contractKeys) {
    const contract = await get(key)
    if (contract) contracts.push(contract)
  }
  return contracts.sort((a, b) => b.updatedAt - a.updatedAt)
}

export async function deleteContract(id: string): Promise<void> {
  await del(`${CONTRACTS_PREFIX}${id}`)
}

export async function createContract(
  name: string,
  content: string,
  projectId?: string
): Promise<StoredContract> {
  const contract: StoredContract = {
    id: generateId(),
    name,
    content,
    createdAt: Date.now(),
    updatedAt: Date.now(),
    projectId,
  }
  await saveContract(contract)
  return contract
}

export async function updateContract(
  id: string,
  updates: Partial<Pick<StoredContract, "name" | "content" | "projectId">>
): Promise<StoredContract | undefined> {
  const contract = await getContract(id)
  if (!contract) return undefined
  const updated = {
    ...contract,
    ...updates,
    updatedAt: Date.now(),
  }
  await saveContract(updated)
  return updated
}

// Project Storage
export async function saveProject(project: Project): Promise<void> {
  await set(`${PROJECTS_PREFIX}${project.id}`, project)
}

export async function getProject(id: string): Promise<Project | undefined> {
  return await get(`${PROJECTS_PREFIX}${id}`)
}

export async function getAllProjects(): Promise<Project[]> {
  const allKeys = await keys()
  const projectKeys = allKeys.filter(
    (key) => typeof key === "string" && key.startsWith(PROJECTS_PREFIX)
  )
  const projects: Project[] = []
  for (const key of projectKeys) {
    const project = await get(key)
    if (project) projects.push(project)
  }
  return projects.sort((a, b) => b.updatedAt - a.updatedAt)
}

export async function deleteProject(id: string): Promise<void> {
  await del(`${PROJECTS_PREFIX}${id}`)
}

export async function createProject(name: string): Promise<Project> {
  const project: Project = {
    id: generateId(),
    name,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  }
  await saveProject(project)
  return project
}

// Deployment Storage
export async function saveDeployment(deployment: DeployedContract): Promise<void> {
  await set(`${DEPLOYMENTS_PREFIX}${deployment.id}`, deployment)
}

export async function getDeployment(id: string): Promise<DeployedContract | undefined> {
  return await get(`${DEPLOYMENTS_PREFIX}${id}`)
}

export async function getAllDeployments(): Promise<DeployedContract[]> {
  const allKeys = await keys()
  const deploymentKeys = allKeys.filter(
    (key) => typeof key === "string" && key.startsWith(DEPLOYMENTS_PREFIX)
  )
  const deployments: DeployedContract[] = []
  for (const key of deploymentKeys) {
    const deployment = await get(key)
    if (deployment) deployments.push(deployment)
  }
  return deployments.sort((a, b) => b.deployedAt - a.deployedAt)
}

export async function getDeploymentsByChain(chainId: number): Promise<DeployedContract[]> {
  const all = await getAllDeployments()
  return all.filter((d) => d.chainId === chainId)
}

export async function deleteDeployment(id: string): Promise<void> {
  await del(`${DEPLOYMENTS_PREFIX}${id}`)
}

// Settings Storage
export async function getSettings(): Promise<IDESettings> {
  const settings = await get(SETTINGS_KEY)
  if (!settings) {
    const { DEFAULT_SETTINGS } = await import("@/types/ide")
    return DEFAULT_SETTINGS
  }
  return settings
}

export async function saveSettings(settings: IDESettings): Promise<void> {
  await set(SETTINGS_KEY, settings)
}

export async function updateSettings(
  updates: Partial<IDESettings>
): Promise<IDESettings> {
  const current = await getSettings()
  const updated = { ...current, ...updates }
  await saveSettings(updated)
  return updated
}

// Clear all IDE data
export async function clearAllIDEData(): Promise<void> {
  const allKeys = await keys()
  const ideKeys = allKeys.filter(
    (key) =>
      typeof key === "string" &&
      (key.startsWith(CONTRACTS_PREFIX) ||
        key.startsWith(PROJECTS_PREFIX) ||
        key.startsWith(DEPLOYMENTS_PREFIX) ||
        key === SETTINGS_KEY)
  )
  for (const key of ideKeys) {
    await del(key)
  }
}
