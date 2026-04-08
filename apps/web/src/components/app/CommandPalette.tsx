import { useState, useEffect, useRef, useCallback } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useContracts } from '@/hooks/useContracts'
import { FileText, Search, X } from 'lucide-react'

interface CommandPaletteProps {
  open: boolean
  onClose: () => void
}

export default function CommandPalette({ open, onClose }: CommandPaletteProps) {
  const { workspaceId } = useParams<{ workspaceId: string }>()
  const { data: contracts } = useContracts(workspaceId || '')
  const [query, setQuery] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)
  const navigate = useNavigate()

  const filtered = contracts?.filter((c) =>
    c.name.toLowerCase().includes(query.toLowerCase())
  ) ?? []

  useEffect(() => {
    if (open) {
      setQuery('')
      setTimeout(() => inputRef.current?.focus(), 50)
    }
  }, [open])

  const handleSelect = useCallback((contractId: string) => {
    onClose()
    navigate(`/w/${workspaceId}/contracts/${contractId}`)
  }, [navigate, workspaceId, onClose])

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }
    if (open) {
      document.addEventListener('keydown', onKeyDown)
      return () => document.removeEventListener('keydown', onKeyDown)
    }
  }, [open, onClose])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-[20vh]">
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-lg rounded-xl border border-border/50 bg-card shadow-2xl glow-blue">
        <div className="flex items-center gap-3 border-b border-border/50 px-4 py-3">
          <Search className="h-4 w-4 text-primary" />
          <input
            ref={inputRef}
            type="text"
            placeholder="Search contracts..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="flex-1 bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground"
          />
          <button onClick={onClose} className="rounded p-1 hover:bg-accent">
            <X className="h-4 w-4 text-muted-foreground" />
          </button>
        </div>

        <div className="max-h-72 overflow-y-auto p-2">
          {filtered.length === 0 ? (
            <div className="py-8 text-center text-sm text-muted-foreground">
              {query ? 'No contracts match your search' : 'Type to search contracts'}
            </div>
          ) : (
            filtered.map((contract) => (
              <button
                key={contract.id}
                onClick={() => handleSelect(contract.id)}
                className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left transition-colors hover:bg-accent/50"
              >
                <FileText className="h-4 w-4 text-primary/60" />
                <div className="flex-1 min-w-0">
                  <p className="truncate text-sm font-medium">{contract.name}</p>
                  <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
                    {contract.status}
                    {contract.risk_score !== null && ` · Risk: ${contract.risk_score}`}
                  </p>
                </div>
              </button>
            ))
          )}
        </div>

        <div className="border-t border-border/50 px-4 py-2 text-[10px] text-muted-foreground">
          <kbd className="rounded border border-border bg-accent px-1.5 py-0.5 font-mono">ESC</kbd>
          {' '}to close
        </div>
      </div>
    </div>
  )
}
