"use client"

import { useState } from "react"
import { Modal, Dropdown, MenuProps } from "antd"
import { FileCode, FolderOpen, Plus, MoreVertical, Trash2, Edit2 } from "lucide-react"
import type { StoredContract } from "@/types/ide"
import { EmptyState, Field, IconButton, IdeButton, IdeModal, PanelHeader, ide } from "./ui"

interface FileExplorerProps {
  contracts: StoredContract[]
  activeFileId: string | null
  onFileSelect: (contract: StoredContract) => void
  onFileCreate: (name: string) => void
  onFileRename: (id: string, name: string) => void
  onFileDelete: (id: string) => void
  onTemplatesClick: () => void
}

export default function FileExplorer({
  contracts,
  activeFileId,
  onFileSelect,
  onFileCreate,
  onFileRename,
  onFileDelete,
  onTemplatesClick,
}: FileExplorerProps) {
  const [isNewFileModalOpen, setIsNewFileModalOpen] = useState(false)
  const [isRenameModalOpen, setIsRenameModalOpen] = useState(false)
  const [newFileName, setNewFileName] = useState("")
  const [renameFileId, setRenameFileId] = useState<string | null>(null)
  const [renameFileName, setRenameFileName] = useState("")

  const fileMenu = (contract: StoredContract): MenuProps["items"] => [
    {
      key: "rename",
      label: "Rename",
      icon: <Edit2 size={14} />,
      onClick: (e) => {
        e.domEvent.stopPropagation()
        setRenameFileId(contract.id)
        setRenameFileName(contract.name)
        setIsRenameModalOpen(true)
      },
    },
    {
      key: "delete",
      label: "Delete",
      icon: <Trash2 size={14} />,
      danger: true,
      onClick: (e) => {
        e.domEvent.stopPropagation()
        Modal.confirm({
          title: "Delete File",
          content: `Are you sure you want to delete "${contract.name}"?`,
          okText: "Delete",
          okButtonProps: { danger: true },
          centered: true,
          onOk: () => onFileDelete(contract.id),
        })
      },
    },
  ]

  const handleCreateFile = () => {
    if (newFileName.trim()) {
      const fileName = newFileName.endsWith(".sol")
        ? newFileName
        : `${newFileName}.sol`
      onFileCreate(fileName)
      setNewFileName("")
      setIsNewFileModalOpen(false)
    }
  }

  const handleRenameFile = () => {
    if (renameFileId && renameFileName.trim()) {
      const fileName = renameFileName.endsWith(".sol")
        ? renameFileName
        : `${renameFileName}.sol`
      onFileRename(renameFileId, fileName)
      setRenameFileId(null)
      setRenameFileName("")
      setIsRenameModalOpen(false)
    }
  }

  const closeNewFile = () => {
    setIsNewFileModalOpen(false)
    setNewFileName("")
  }

  const closeRename = () => {
    setIsRenameModalOpen(false)
    setRenameFileId(null)
    setRenameFileName("")
  }

  return (
    <div className="h-full flex flex-col">
      <PanelHeader
        icon={<FolderOpen size={13} />}
        title="Contracts"
        meta={
          contracts.length > 0 ? (
            <span className="text-[10px] text-white/30">{contracts.length}</span>
          ) : undefined
        }
        actions={
          <IconButton onClick={() => setIsNewFileModalOpen(true)} title="New File" aria-label="New File">
            <Plus size={14} />
          </IconButton>
        }
      />

      {/* File List */}
      <div className="flex-1 overflow-auto p-2">
        {contracts.length === 0 ? (
          <EmptyState
            className="py-8"
            icon={<FileCode size={28} />}
            title="No contracts yet"
            caption="Start from a template or create an empty file."
          />
        ) : (
          <ul className="space-y-0.5">
            {contracts.map((contract) => {
              const isActive = contract.id === activeFileId
              return (
                <li key={contract.id}>
                  <div
                    onClick={() => onFileSelect(contract)}
                    className={`group flex items-center gap-2 pl-2.5 pr-1 h-8 text-xs cursor-pointer rounded-lg transition-colors ${
                      isActive
                        ? "bg-primary/10 text-primary"
                        : "text-white/60 hover:text-white hover:bg-white/5"
                    }`}
                  >
                    <FileCode size={13} className={isActive ? "text-primary shrink-0" : "text-white/30 shrink-0"} />
                    <span className="truncate flex-1">{contract.name}</span>
                    <Dropdown menu={{ items: fileMenu(contract) }} trigger={["click"]}>
                      <IconButton
                        onClick={(e) => e.stopPropagation()}
                        aria-label={`${contract.name} options`}
                        className="h-6! w-6! opacity-0 group-hover:opacity-100"
                      >
                        <MoreVertical size={13} />
                      </IconButton>
                    </Dropdown>
                  </div>
                </li>
              )
            })}
          </ul>
        )}
      </div>

      {/* Templates Button */}
      <div className="p-2 border-t border-white/10">
        <IdeButton variant="secondary" size="sm" block icon={<Plus size={13} />} onClick={onTemplatesClick}>
          New from Template
        </IdeButton>
      </div>

      {/* New File Modal */}
      <IdeModal
        open={isNewFileModalOpen}
        onClose={closeNewFile}
        title="Create New Contract"
        icon={<FileCode />}
        width={440}
      >
        <div className="space-y-5">
          <Field label="File name" hint=".sol is added automatically">
            <input
              className={ide.input}
              placeholder="MyContract.sol"
              value={newFileName}
              onChange={(e) => setNewFileName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleCreateFile()}
              autoFocus
            />
          </Field>
          <div className="flex justify-end gap-2">
            <IdeButton variant="secondary" size="md" onClick={closeNewFile}>
              Cancel
            </IdeButton>
            <IdeButton variant="primary" size="md" onClick={handleCreateFile} disabled={!newFileName.trim()}>
              Create
            </IdeButton>
          </div>
        </div>
      </IdeModal>

      {/* Rename Modal */}
      <IdeModal
        open={isRenameModalOpen}
        onClose={closeRename}
        title="Rename Contract"
        icon={<Edit2 />}
        width={440}
      >
        <div className="space-y-5">
          <Field label="New name">
            <input
              className={ide.input}
              placeholder="New name"
              value={renameFileName}
              onChange={(e) => setRenameFileName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleRenameFile()}
              autoFocus
            />
          </Field>
          <div className="flex justify-end gap-2">
            <IdeButton variant="secondary" size="md" onClick={closeRename}>
              Cancel
            </IdeButton>
            <IdeButton variant="primary" size="md" onClick={handleRenameFile} disabled={!renameFileName.trim()}>
              Rename
            </IdeButton>
          </div>
        </div>
      </IdeModal>
    </div>
  )
}
