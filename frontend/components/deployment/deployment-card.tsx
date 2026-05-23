"use client"
import { Avatar } from 'antd';
import { Globe } from 'lucide-react';
import moment from 'moment';
import Link from 'next/link';
import React from 'react'

interface Props {
    id: string;
    status: string;
    url: string;
    port: number;
    name: string;
    createdAt: string;
    updatedAt: string;
    deploymentStartedAt: string;
    deploymentFinishedAt: string;
    project: {
      name: string;
      id: string;
      gitRepositoryName: string;
      gitRepositoryOwner: string;
    };
  }
export const DeploymentCard = (props: Props) => {

    const statusColors = {
    READY: "text-emerald-400 bg-emerald-400/10 border-emerald-400/20",
    BUILDING: "text-blue-400 bg-blue-400/10 border-blue-400/20 animate-pulse",
    ERROR: "text-red-400 bg-red-400/10 border-red-400/20",
    QUEUED: "text-amber-400 bg-amber-400/10 border-amber-400/20",
    PENDING_DEPLOYMENT: "text-zinc-400 bg-zinc-800 border-zinc-700",
    CANCELED: "text-zinc-400 bg-zinc-800 border-zinc-700",
    QUEUED_FOR_BUILDING: "text-amber-400 bg-amber-400/10 border-amber-400/20",
    SUSPENDED: "text-red-400 bg-red-400/10 border-red-400/20",
  }
  
  const colorClass =
    statusColors[props.status as keyof typeof statusColors] ||
    statusColors.PENDING_DEPLOYMENT

    const duration =
        props?.deploymentFinishedAt &&
        props?.deploymentStartedAt
          ? moment(props?.deploymentFinishedAt).diff(
              moment(props?.deploymentStartedAt),
              "seconds",
            )
          : 0

    const formattedTimeSeconds = Math.floor(duration)
  const formattedTimeMinutes = Math.floor(
    duration / 60,
  )
  const formattedTimeString =
    formattedTimeMinutes > 0
      ? `${formattedTimeMinutes} min ${formattedTimeSeconds % 60} sec`
      : `${formattedTimeSeconds} sec`
    
  return (
    <div>
      <div className="border border-white/10 bg-white/5 p-1 text-sm">
        <div className={`border border-white/20 bg-dark p-3 min-h-14 space-y-5`}>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-[1fr_1fr_4fr_1fr] gap-4">
            <div>
              <p>{props.id?.slice(0, 12)}</p>
              <p className='text-white/50'>Production</p>
            </div>
           
            <div>
               <div className={`flex items-center gap-2 rounded-full text-xs font-medium `}>
                  <div className={`w-2 h-2 rounded-full -mt-1 ${props.status === "READY" ? "bg-emerald-400" : props.status === "BUILDING" ? "bg-blue-400" : props.status === "ERROR" ? "bg-red-400" : props.status === "SUSPENDED" ? "bg-red-400" : "bg-current"}`}/>
                  <p className="text-white/70">{props.status.replace(/_/g, " ")}</p>
                </div>
                <p className="text-xs text-white/90">{formattedTimeString}</p>

            </div>
             <div>
              <p className='text-xs'><span className="text-white/50">ASSIGNED PORT:</span> {props.port || "-"}</p>
              {props.url ? (
                <div className="flex items-center gap-1">
                <Globe size={16}/>
                <Link href={props.url} target='_blank' className='underline'>{props?.url?.length > 40 ? props?.url?.slice(0, 40) + "..." : props.url}</Link>
              </div>
              ) :(
                <p className='text-xs'>N/A</p>
              )}
            </div>
            <div className='flex items-center gap-2 justify-end'>
              <p className='text-white/60'>{moment(props.createdAt).fromNow()} by <span className=''>{props.project.gitRepositoryOwner}</span></p>
              <Avatar src={`https://cdn-icons-png.flaticon.com/512/25/25231.png`} className='bg-white!' size={28}/>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
