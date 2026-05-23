import { Loader2 } from 'lucide-react';
import { useEffect, useState, useRef } from 'react';

interface TerminalProps {
  folderName: string; // Pass the folder_name of the project being deployed
  buildLogs?: string; // The massive string from your Prisma DB (if historical)
}

export function BuildLogs({ folderName, buildLogs }: TerminalProps) {
  const [logs, setLogs] = useState<string[]>([]);
  const terminalEndRef = useRef<HTMLDivElement>(null);

  // HYDRATE HISTORICAL LOGS
  // If the parent component fetches old logs from the DB, load them instantly.
  useEffect(() => {
    if (buildLogs) {
      setLogs(buildLogs.split('\n'));
    }
  }, [buildLogs]);

  // THE LIVE STREAM LISTENER
  useEffect(() => {
    if (!folderName) return;
    
    
    if (buildLogs && buildLogs.length > 0) return;

    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
    const eventSource = new EventSource(`${API_URL}/api/v1/logs/${folderName}`);

    eventSource.onmessage = (event) => {
      setLogs((prevLogs) => [...prevLogs, event.data]);
    };

    eventSource.onerror = (error) => {
      console.log("Log stream ended or disconnected.");
      eventSource.close();
    };

    return () => {
      eventSource.close();
    };
  }, [folderName, buildLogs]);

  useEffect(() => {
    if (terminalEndRef.current) {
      terminalEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [logs]);

  return (
    <div className="w-full max-w-full mx-auto overflow-hidden border border-dark-alt shadow-2xl ">
      <div className="bg-dark-alt px-4 py-4 flex items-center gap-2 border-b border-dark-alt">
        <div className="w-3 h-3 rounded-full bg-red-500"></div>
        <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
        <div className="w-3 h-3 rounded-full bg-green-500"></div>
        <span className="ml-4 text-xs text-gray-400 font-mono">
          {buildLogs ? `Historical Logs: ${folderName}` : `Live Build: ${folderName}`}
        </span>
      </div>

      <div className="p-4 h-150 overflow-y-auto font-mono text-sm">
        {logs.length === 0 && !buildLogs ? (
         <div className="flex items-center gap-2">
           <Loader2 className="animate-spin text-gray-500" />
           <p className="text-gray-500 animate-pulse">Loading build logs...</p>
         </div>
        ) : null}
        
        {logs.map((log, index) => {
          let textColor = "text-gray-300";
          if (log.includes("[System]")) textColor = "text-blue-400 font-bold";
          if (log.includes("Step")) textColor = "text-yellow-400 font-medium";
          if (log.includes("[Error]") || log.toLowerCase().includes("warn")) textColor = "text-red-400";
          if (log.includes("✅") || log.includes("Success")) textColor = "text-green-400 font-bold";

          return (
            <div key={index} className={`mb-1 ${textColor} whitespace-pre-wrap`}>
              {log}
            </div>
          );
        })}
        
        <div ref={terminalEndRef} />
      </div>
    </div>
  );
}