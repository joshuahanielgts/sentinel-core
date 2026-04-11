import React, { createContext, useContext, useState, useEffect } from 'react';
import type { Workspace } from '@/types/api';

interface WorkspaceContextType {
  workspace: Workspace | null;
  setWorkspace: (ws: Workspace | null) => void;
}

const WorkspaceContext = createContext<WorkspaceContextType | undefined>(undefined);

const STORAGE_KEY = 'sentinel_active_workspace';

export function WorkspaceProvider({ children }: { children: React.ReactNode }) {
  const [workspace, setWorkspaceState] = useState<Workspace | null>(null);

  const setWorkspace = (ws: Workspace | null) => {
    setWorkspaceState(ws);
    if (ws) {
      localStorage.setItem(STORAGE_KEY, ws.id);
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
  };

  const getStoredWorkspaceId = () => localStorage.getItem(STORAGE_KEY);

  useEffect(() => {
    const stored = getStoredWorkspaceId();
    if (stored && !workspace) {
      // Workspace will be loaded by the component that uses this context
      // We just store the ID for now
    }
  }, []);

  return (
    <WorkspaceContext.Provider value={{ workspace, setWorkspace }}>
      {children}
    </WorkspaceContext.Provider>
  );
}

export function useWorkspaceContext() {
  const context = useContext(WorkspaceContext);
  if (!context) throw new Error('useWorkspaceContext must be used within WorkspaceProvider');
  return context;
}

export function getStoredWorkspaceId(): string | null {
  return localStorage.getItem(STORAGE_KEY);
}
