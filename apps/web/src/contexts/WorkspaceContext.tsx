import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from 'react'
import type { Workspace } from '@/types/api'

interface WorkspaceContextType {
  workspace: Workspace | null
  setWorkspace: (workspace: Workspace | null) => void
  savedWorkspaceId: string | null
}

const WorkspaceContext = createContext<WorkspaceContextType | null>(null)

export function WorkspaceProvider({ children }: { children: ReactNode }) {
  const [workspace, setWorkspaceState] = useState<Workspace | null>(null)
  const [savedWorkspaceId] = useState<string | null>(
    () => localStorage.getItem('sentinel_active_workspace')
  )

  const setWorkspace = useCallback((ws: Workspace | null) => {
    setWorkspaceState(ws)
    if (ws) {
      localStorage.setItem('sentinel_active_workspace', ws.id)
    } else {
      localStorage.removeItem('sentinel_active_workspace')
    }
  }, [])

  return (
    <WorkspaceContext.Provider value={{ workspace, setWorkspace, savedWorkspaceId }}>
      {children}
    </WorkspaceContext.Provider>
  )
}

export function useWorkspace() {
  const context = useContext(WorkspaceContext)
  if (!context) {
    throw new Error('useWorkspace must be used within a WorkspaceProvider')
  }
  return context
}
