"use client"

import { useState, useCallback, useEffect } from "react"
import type {
  StoredContract,
  OpenFile,
  ConsoleLog,
  CompilationResult,
  CompiledContract,
  IDESettings,
  DEFAULT_SETTINGS,
} from "@/types/ide"
import {
  getAllContracts,
  createContract,
  updateContract,
  deleteContract,
  getSettings,
  saveSettings,
} from "@/lib/ide/storage"
import { generateId } from "@/lib/ide/storage"
import { BLANK_CONTRACT } from "@/lib/ide/templates"

export function useIDEState() {
  // Files state
  const [contracts, setContracts] = useState<StoredContract[]>([])
  const [openFiles, setOpenFiles] = useState<OpenFile[]>([])
  const [activeFileId, setActiveFileId] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Compilation state
  const [compilationResult, setCompilationResult] = useState<CompilationResult | null>(null)
  const [selectedContract, setSelectedContract] = useState<CompiledContract | null>(null)

  // Console state
  const [consoleLogs, setConsoleLogs] = useState<ConsoleLog[]>([])

  // Settings state
  const [settings, setSettings] = useState<IDESettings | null>(null)

  // Load contracts and settings on mount
  useEffect(() => {
    async function loadData() {
      try {
        const [loadedContracts, loadedSettings] = await Promise.all([
          getAllContracts(),
          getSettings(),
        ])
        setContracts(loadedContracts)
        setSettings(loadedSettings)

        // Open the most recent contract if available
        if (loadedContracts.length > 0) {
          const mostRecent = loadedContracts[0]
          setOpenFiles([
            {
              id: mostRecent.id,
              name: mostRecent.name,
              content: mostRecent.content,
              isDirty: false,
            },
          ])
          setActiveFileId(mostRecent.id)
        }
      } catch (error) {
        console.error("Failed to load IDE data:", error)
        addLog("error", "Failed to load saved contracts")
      } finally {
        setIsLoading(false)
      }
    }
    loadData()
  }, [])

  // Get the active open file
  const activeFile = openFiles.find((f) => f.id === activeFileId) || null

  // Console log helper
  const addLog = useCallback(
    (type: ConsoleLog["type"], message: string, details?: string) => {
      const log: ConsoleLog = {
        id: generateId(),
        type,
        message,
        timestamp: Date.now(),
        details,
      }
      setConsoleLogs((prev) => [...prev, log])
    },
    []
  )

  const clearLogs = useCallback(() => {
    setConsoleLogs([])
  }, [])

  // File operations
  const createNewFile = useCallback(
    async (name: string, content: string = BLANK_CONTRACT) => {
      try {
        const contract = await createContract(name, content)
        setContracts((prev) => [contract, ...prev])

        // Open the new file
        const newOpenFile: OpenFile = {
          id: contract.id,
          name: contract.name,
          content: contract.content,
          isDirty: false,
        }
        setOpenFiles((prev) => [...prev, newOpenFile])
        setActiveFileId(contract.id)

        addLog("success", `Created new file: ${name}`)
        return contract
      } catch (error) {
        addLog("error", `Failed to create file: ${name}`)
        throw error
      }
    },
    [addLog]
  )

  const openFile = useCallback((contract: StoredContract) => {
    setOpenFiles((prev) => {
      const existing = prev.find((f) => f.id === contract.id)
      if (existing) {
        setActiveFileId(contract.id)
        return prev
      }
      const newFile: OpenFile = {
        id: contract.id,
        name: contract.name,
        content: contract.content,
        isDirty: false,
      }
      setActiveFileId(contract.id)
      return [...prev, newFile]
    })
  }, [])

  const closeFile = useCallback(
    (fileId: string) => {
      setOpenFiles((prev) => {
        const index = prev.findIndex((f) => f.id === fileId)
        const newFiles = prev.filter((f) => f.id !== fileId)

        // If closing the active file, activate the next one
        if (activeFileId === fileId && newFiles.length > 0) {
          const newActiveIndex = Math.min(index, newFiles.length - 1)
          setActiveFileId(newFiles[newActiveIndex].id)
        } else if (newFiles.length === 0) {
          setActiveFileId(null)
        }

        return newFiles
      })
    },
    [activeFileId]
  )

  const updateFileContent = useCallback((fileId: string, content: string) => {
    setOpenFiles((prev) =>
      prev.map((f) =>
        f.id === fileId
          ? { ...f, content, isDirty: true }
          : f
      )
    )
  }, [])

  const saveFile = useCallback(
    async (fileId: string) => {
      const file = openFiles.find((f) => f.id === fileId)
      if (!file) return

      try {
        await updateContract(fileId, { content: file.content })
        setOpenFiles((prev) =>
          prev.map((f) => (f.id === fileId ? { ...f, isDirty: false } : f))
        )
        setContracts((prev) =>
          prev.map((c) =>
            c.id === fileId
              ? { ...c, content: file.content, updatedAt: Date.now() }
              : c
          )
        )
        addLog("success", `Saved: ${file.name}`)
      } catch (error) {
        addLog("error", `Failed to save: ${file.name}`)
      }
    },
    [openFiles, addLog]
  )

  const saveActiveFile = useCallback(async () => {
    if (activeFileId) {
      await saveFile(activeFileId)
    }
  }, [activeFileId, saveFile])

  const renameFile = useCallback(
    async (fileId: string, newName: string) => {
      try {
        await updateContract(fileId, { name: newName })
        setContracts((prev) =>
          prev.map((c) =>
            c.id === fileId ? { ...c, name: newName, updatedAt: Date.now() } : c
          )
        )
        setOpenFiles((prev) =>
          prev.map((f) => (f.id === fileId ? { ...f, name: newName } : f))
        )
        addLog("success", `Renamed to: ${newName}`)
      } catch (error) {
        addLog("error", `Failed to rename file`)
      }
    },
    [addLog]
  )

  const deleteFile = useCallback(
    async (fileId: string) => {
      try {
        const contract = contracts.find((c) => c.id === fileId)
        await deleteContract(fileId)
        setContracts((prev) => prev.filter((c) => c.id !== fileId))
        closeFile(fileId)
        addLog("info", `Deleted: ${contract?.name || "file"}`)
      } catch (error) {
        addLog("error", `Failed to delete file`)
      }
    },
    [contracts, closeFile, addLog]
  )

  // Settings operations
  const updateSettingsValue = useCallback(
    async (updates: Partial<IDESettings>) => {
      if (!settings) return
      const newSettings = { ...settings, ...updates }
      setSettings(newSettings)
      await saveSettings(newSettings)
    },
    [settings]
  )

  // Refresh contracts list
  const refreshContracts = useCallback(async () => {
    const loadedContracts = await getAllContracts()
    setContracts(loadedContracts)
  }, [])

  return {
    // Files
    contracts,
    openFiles,
    activeFileId,
    activeFile,
    isLoading,

    // File operations
    createNewFile,
    openFile,
    closeFile,
    updateFileContent,
    saveFile,
    saveActiveFile,
    renameFile,
    deleteFile,
    setActiveFileId,
    refreshContracts,

    // Compilation
    compilationResult,
    setCompilationResult,
    selectedContract,
    setSelectedContract,

    // Console
    consoleLogs,
    addLog,
    clearLogs,

    // Settings
    settings,
    updateSettingsValue,
  }
}

export type IDEState = ReturnType<typeof useIDEState>
