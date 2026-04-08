import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useContracts } from '@/hooks/useContracts'
import UploadDialog from '@/components/app/UploadDialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Plus, Search, FileText } from 'lucide-react'
import type { ContractStatus, RiskLevel } from '@/types/api'

const statusColors: Record<ContractStatus, string> = {
  pending: 'bg-yellow-100 text-yellow-800',
  uploaded: 'bg-blue-100 text-blue-800',
  analyzing: 'bg-purple-100 text-purple-800',
  complete: 'bg-green-100 text-green-800',
  error: 'bg-red-100 text-red-800',
}

const riskColors: Record<RiskLevel, string> = {
  low: 'bg-green-100 text-green-800',
  medium: 'bg-yellow-100 text-yellow-800',
  high: 'bg-orange-100 text-orange-800',
  critical: 'bg-red-100 text-red-800',
}

function getRiskLevel(score: number | null): RiskLevel | null {
  if (score === null) return null
  if (score <= 25) return 'low'
  if (score <= 50) return 'medium'
  if (score <= 75) return 'high'
  return 'critical'
}

export default function ContractsPage() {
  const { workspaceId } = useParams<{ workspaceId: string }>()
  const { data: contracts, isLoading } = useContracts(workspaceId!)
  const navigate = useNavigate()
  const [search, setSearch] = useState('')
  const [uploadOpen, setUploadOpen] = useState(false)

  const filtered = contracts?.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="p-6">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Contracts</h1>
        <Button onClick={() => setUploadOpen(true)}>
          <Plus className="mr-1 h-4 w-4" /> Upload
        </Button>
      </div>

      <div className="mb-4">
        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search contracts..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-20 animate-pulse rounded-xl bg-muted" />
          ))}
        </div>
      ) : filtered && filtered.length > 0 ? (
        <div className="space-y-3">
          {filtered.map((contract) => {
            const risk = getRiskLevel(contract.risk_score)
            return (
              <Card
                key={contract.id}
                className="cursor-pointer transition-shadow hover:shadow-md"
                onClick={() => navigate(`/w/${workspaceId}/contracts/${contract.id}`)}
              >
                <CardContent className="flex items-center gap-4 py-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
                    <FileText className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">{contract.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(contract.created_at).toLocaleDateString()}
                      {contract.file_size
                        ? ` · ${(contract.file_size / 1024 / 1024).toFixed(1)} MB`
                        : ''}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    {risk && (
                      <Badge className={riskColors[risk]} variant="secondary">
                        Risk: {contract.risk_score}
                      </Badge>
                    )}
                    <Badge className={statusColors[contract.status]} variant="secondary">
                      {contract.status}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      ) : (
        <Card>
          <CardContent className="flex flex-col items-center py-12 text-center">
            <FileText className="mb-3 h-10 w-10 text-muted-foreground" />
            <p className="mb-1 font-medium">No contracts yet</p>
            <p className="mb-4 text-sm text-muted-foreground">Upload your first contract to get started.</p>
            <Button onClick={() => setUploadOpen(true)}>
              <Plus className="mr-1 h-4 w-4" /> Upload Contract
            </Button>
          </CardContent>
        </Card>
      )}

      <UploadDialog open={uploadOpen} onOpenChange={setUploadOpen} />
    </div>
  )
}
