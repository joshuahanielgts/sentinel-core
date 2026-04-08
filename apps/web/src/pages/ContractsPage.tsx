import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useContracts } from '@/hooks/useContracts'
import ContractGrid from '@/components/app/ContractGrid'
import UploadDialog from '@/components/app/UploadDialog'
import { Button } from '@/components/ui/button'
import { Plus, Search, FileText } from 'lucide-react'

export default function ContractsPage() {
  const { workspaceId } = useParams<{ workspaceId: string }>()
  const { data: contracts, isLoading } = useContracts(workspaceId!)
  const navigate = useNavigate()
  const [search, setSearch] = useState('')
  const [uploadOpen, setUploadOpen] = useState(false)

  const filtered = contracts?.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase())
  ) ?? []

  return (
    <div className="p-6">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-sm font-bold uppercase tracking-widest text-primary glow-text-blue">
          Contracts
        </h1>
        <Button onClick={() => setUploadOpen(true)} className="text-xs">
          <Plus className="mr-1 h-3.5 w-3.5" /> Upload
        </Button>
      </div>

      <div className="mb-5">
        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search contracts..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-lg border border-border/50 bg-accent/30 py-2 pl-9 pr-3 text-xs text-foreground outline-none placeholder:text-muted-foreground focus:border-primary/40 transition-colors"
          />
        </div>
      </div>

      {isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-32 animate-pulse rounded-lg border border-border/30 bg-card" />
          ))}
        </div>
      ) : filtered.length > 0 ? (
        <ContractGrid
          contracts={filtered}
          onSelect={(contract) => navigate(`/w/${workspaceId}/contracts/${contract.id}`)}
        />
      ) : (
        <div className="rounded-lg border border-border/50 bg-card p-12 text-center">
          <FileText className="mx-auto mb-3 h-8 w-8 text-primary/20" />
          <p className="mb-1 text-sm font-medium">No contracts yet</p>
          <p className="mb-4 text-xs text-muted-foreground">Upload your first contract to get started.</p>
          <Button onClick={() => setUploadOpen(true)} className="text-xs">
            <Plus className="mr-1 h-3.5 w-3.5" /> Upload Contract
          </Button>
        </div>
      )}

      <UploadDialog open={uploadOpen} onOpenChange={setUploadOpen} />
    </div>
  )
}
