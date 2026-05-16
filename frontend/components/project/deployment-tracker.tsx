import { ProjectI } from "@/types/project"
import { LoadingOutlined } from "@ant-design/icons"
import { useQueryClient } from "@tanstack/react-query"
import moment from "moment"
import React, { useEffect, useState } from "react"
import { io, Socket } from "socket.io-client"

// Replace with your actual NestJS API URL
const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:8000"

type statusType =
  | "PENDING_DEPLOYMENT"
  | "QUEUED_FOR_BUILDING"
  | "BUILDING"
  | "READY"
  | "ERROR"
  | "CANCELED"

export default function DeploymentTracker({
  projectId,
  project,
}: {
  projectId: string
  project: ProjectI
}) {
  const queryClient = useQueryClient()
  const statusColors = {
    READY: "text-emerald-400 bg-emerald-400/10 border-emerald-400/20",
    BUILDING: "text-blue-400 bg-blue-400/10 border-blue-400/20 animate-pulse",
    ERROR: "text-red-400 bg-red-400/10 border-red-400/20",
    QUEUED: "text-amber-400 bg-amber-400/10 border-amber-400/20",
    PENDING_DEPLOYMENT: "text-zinc-400 bg-zinc-800 border-zinc-700",
    CANCELED: "text-zinc-400 bg-zinc-800 border-zinc-700",
    QUEUED_FOR_BUILDING: "text-amber-400 bg-amber-400/10 border-amber-400/20",
  }

  const [status, setStatus] = useState<statusType>(
    project.deployment?.status as statusType,
  )
  const colorClass =
    statusColors[status as keyof typeof statusColors] ||
    statusColors.PENDING_DEPLOYMENT
  const [startTime, setStartTime] = useState<number | null>(null)
  const [elapsedMs, setElapsedMs] = useState<number>(0)

  useEffect(() => {
    // 1. Connect to the NestJS Gateway namespace
    const socket: Socket = io(`${SOCKET_URL}/deployments`)

    socket.on("connect", () => {
      // 2. Tell the backend we only want updates for THIS project
      socket.emit("join-project-room", projectId)
    })

    // 3. Listen for the broadcast events from NestJS
    socket.on("status-update", (data) => {
      setStatus(data.status)
      if (data.startTime) {
        setStartTime(data.startTime)
      }
    })

    return () => {
      socket.disconnect() // Cleanup when user leaves the page
    }
  }, [projectId])

  const startTimeFromProject = project.deployment?.deploymentStartedAt
    ? new Date(project.deployment?.deploymentStartedAt).getTime()
    : 0

  useEffect(() => {
    let interval: NodeJS.Timeout | undefined = undefined

    // Only run the high-speed timer if the status is actively building
    if (status === "BUILDING") {
      queryClient.invalidateQueries({ queryKey: ["project", projectId] })
      interval = setInterval(() => {
        // Calculate the difference between NOW and when the backend said it started
        setElapsedMs((Date.now() - startTimeFromProject) / 1000)
      }, 100) // 100ms makes it feel buttery smooth
    } else if (status === "READY" || status === "ERROR") {
      // If it finishes, the interval stops automatically, freezing the final time on screen
      clearInterval(interval)
      queryClient.invalidateQueries({ queryKey: ["project", projectId] })
    }

    return () => clearInterval(interval)
  }, [status, startTime, project])

  const duration =
    project.deployment?.deploymentFinishedAt &&
    project.deployment?.deploymentStartedAt
      ? moment(project.deployment?.deploymentFinishedAt).diff(
          moment(project.deployment?.deploymentStartedAt),
          "seconds",
        )
      : 0
  const isBuilt = status === "READY" || status === "ERROR"

  // Format the milliseconds into a clean seconds string (e.g., "12.4s")
  const formattedTimeSeconds = Math.floor(isBuilt ? duration : elapsedMs)
  const formattedTimeMinutes = Math.floor(
    isBuilt ? duration / 60 : elapsedMs / 60,
  )
  const formattedTimeString =
    formattedTimeMinutes > 0
      ? `${formattedTimeMinutes} min ${formattedTimeSeconds % 60} sec`
      : `${formattedTimeSeconds} sec`

  return (
    <>
      {" "}
      <div className="flex gap-6 flex-wrap">
        <div>
          <p className="text-xs text-white/60 capitalize tracking-wider mb-2 font-normal">
            Status
          </p>
          <div
            className={`inline-flex items-center gap-2 px-2.5 py-1 rounded-full border text-xs font-medium ${colorClass}`}
          >
            <div
              className={`w-2 h-2 rounded-full ${status === "READY" ? "bg-emerald-400" : status === "BUILDING" ? "bg-blue-400" : status === "ERROR" ? "bg-red-400" : "bg-current"}`}
            />
            {status.replace(/_/g, " ")}
          </div>
        </div>

        <div>
          <p className="text-xs text-white/60 capitalize tracking-wider mb-2 font-normal">
            Created
          </p>
          <p className="text-xs text-white/90">
            {moment(project.createdAt).fromNow()}
          </p>
        </div>
      </div>
      <div>
        <p className="text-xs text-white/60 capitalize tracking-wider mb-2 font-normal">
          Deployment duration
        </p>
        {status === "PENDING_DEPLOYMENT" ? (
          <div className="flex items-center gap-2">
            <LoadingOutlined style={{ color: "#b3ec11", fontSize: 15 }} />
            <p className="text-xs text-white/90 italic">
              Preparing deployment...
            </p>
          </div>
        ) : (
          <p className="text-xs text-white/90">{formattedTimeString}</p>
        )}
      </div>
    </>
  )
}
