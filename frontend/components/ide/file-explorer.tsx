"use client"

import { useState } from "react"
import { Tree, Modal, Input, Dropdown, MenuProps } from "antd"
import type { DataNode } from "antd/es/tree"
import { File, Folder, Plus, MoreVertical, Trash2, Edit2 } from "lucide-react"
import type { StoredContract } from "@/types/ide"

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

  // Convert contracts to tree data
  const treeData: DataNode[] = contracts.map((contract) => ({
    key: contract.id,
    title: (
      <div className="flex items-center justify-between group w-full pr-2">
        <span className="truncate">{contract.name}</span>
        <Dropdown
          menu={{
            items: [
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
                    onOk: () => onFileDelete(contract.id),
                  })
                },
              },
            ] as MenuProps["items"],
          }}
          trigger={["click"]}
        >
          <button
            onClick={(e) => e.stopPropagation()}
            className="opacity-0 group-hover:opacity-100 p-1 hover:bg-white/10 rounded transition-opacity"
          >
            <MoreVertical size={14} className="text-white/60" />
          </button>
        </Dropdown>
      </div>
    ),
    icon: <File size={14} className="text-primary" />,
  }))

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

  return (
    <div className="h-full flex flex-col bg-[#0d0d0d]">
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-white/10">
        <div className="flex items-center gap-2 text-white/80 text-sm font-medium">
          <Folder size={14} />
          <span>Contracts</span>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setIsNewFileModalOpen(true)}
            className="p-1 hover:bg-white/10 rounded transition-colors"
            title="New File"
          >
            <Plus size={14} className="text-white/60" />
          </button>
        </div>
      </div>

      {/* File Tree */}
      <div className="flex-1 overflow-auto py-2">
        {contracts.length === 0 ? (
          <div className="px-3 py-4 text-center">
            <p className="text-white/40 text-xs mb-3">No contracts yet</p>
            <button
              onClick={onTemplatesClick}
              className="text-primary text-xs hover:underline"
            >
              Create from template
            </button>
          </div>
        ) : (
          <Tree
            treeData={treeData}
            selectedKeys={activeFileId ? [activeFileId] : []}
            onSelect={(keys) => {
              const key = keys[0] as string
              const contract = contracts.find((c) => c.id === key)
              if (contract) {
                onFileSelect(contract)
              }
            }}
            showIcon
            blockNode
            className="ide-file-tree"
          />
        )}
      </div>

      {/* Templates Button */}
      <div className="px-3 py-2 border-t border-white/10">
        <button
          onClick={onTemplatesClick}
          className="w-full text-xs text-white/60 hover:text-primary py-2 px-3 bg-white/5 hover:bg-white/10 rounded transition-colors"
        >
          + New from Template
        </button>
      </div>

      {/* New File Modal */}
      <Modal
        title="Create New Contract"
        open={isNewFileModalOpen}
        onOk={handleCreateFile}
        onCancel={() => {
          setIsNewFileModalOpen(false)
          setNewFileName("")
        }}
        okText="Create"
        centered
      >
        <div className="py-4">
          <Input
            placeholder="Contract name (e.g., MyContract.sol)"
            value={newFileName}
            onChange={(e) => setNewFileName(e.target.value)}
            onPressEnter={handleCreateFile}
            autoFocus
          />
        </div>
      </Modal>

      {/* Rename Modal */}
      <Modal
        title="Rename Contract"
        open={isRenameModalOpen}
        onOk={handleRenameFile}
        onCancel={() => {
          setIsRenameModalOpen(false)
          setRenameFileId(null)
          setRenameFileName("")
        }}
        okText="Rename"
        centered
      >
        <div className="py-4">
          <Input
            placeholder="New name"
            value={renameFileName}
            onChange={(e) => setRenameFileName(e.target.value)}
            onPressEnter={handleRenameFile}
            autoFocus
          />
        </div>
      </Modal>

      <style jsx global>{`
        .ide-file-tree .ant-tree {
          background: transparent;
          color: #e1e4e8;
        }
        .ide-file-tree .ant-tree-node-content-wrapper {
          color: #e1e4e8;
        }
        .ide-file-tree .ant-tree-node-selected .ant-tree-node-content-wrapper {
          background-color: rgba(179, 236, 17, 0.1) !important;
          color: #b3ec11;
        }
        .ide-file-tree .ant-tree-node-content-wrapper:hover {
          background-color: rgba(255, 255, 255, 0.05);
        }
        .ide-file-tree .ant-tree-treenode {
          padding: 2px 8px;
        }
      `}</style>
    </div>
  )
}
