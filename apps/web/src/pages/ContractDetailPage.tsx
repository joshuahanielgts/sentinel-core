import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useContract, useAnalyzeContract, useClauses } from '@/hooks/useContracts'
import RiskMeter from '@/components/app/RiskMeter'
import ClauseCard from '@/components/app/ClauseCard'
import NeuralChat from '@/components/app/NeuralChat'
import StatusTerminal from '@/components/app/StatusTerminal'
import ObligationTimeline from '@/components/app/ObligationTimeline'
import { exportAnalysisReport } from '@/lib/exportPdf'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Skeleton } from '@/components/ui/skeleton'
import {
  ArrowLeft,
  MessageSquare,
  Play,
  AlertTriangle,
  FileText,
  Loader2,
  Download,
  Shield,
} from 'lucide-react'
import type { ContractStatus } from '@/types/api'

export default function ContractDetailPage() {
  const { workspaceId, contractId } = useParams<{
    workspaceId: string
    contractId: string
  }>()
  const navigate = useNavigate()
  const { data: contract, isLoading: contractLoading } = useContract(contractId!)
  const { data: clauses, isLoading: clausesLoading } = useClauses(contractId!)
  const analyzeContract = useAnalyzeContract()
  const [chatOpen, setChatOpen] = useState(false)

  if (contractLoading) {
    return (
      <div className="p-6 space-y-6">
        <Skeleton className="h-6 w-64 bg-accent" />
        <Skeleton className="h-40 w-full bg-accent" />
        <Skeleton className="h-80 w-full bg-accent" />
      </div>
    )
  }

  if (!contract) {
    return (
      <div className="flex h-full items-center justify-center">
        <p className="text-xs text-muted-foreground">Contract not found</p>
      </div>
    )
  }

  const canAnalyze = contract.status === 'uploaded'
  const isAnalyzing = contract.status === 'analyzing'
  const isComplete = contract.status === 'complete'

  return (
    <div className="flex h-full">
      <div className="flex-1 overflow-auto p-6">
        <div className="mb-4">
          <Button
            variant="ghost"
            size="sm"
            className="text-xs text-muted-foreground hover:text-primary"
            onClick={() => navigate(`/w/${workspaceId}/contracts`)}
          >
            <ArrowLeft className="mr-1 h-3.5 w-3.5" /> Back
          </Button>
        </div>

        <div className="mb-6 flex items-start justify-between">
          <div>
            <h1 className="text-lg font-bold text-foreground">{contract.name}</h1>
            <div className="mt-1 flex items-center gap-3 text-[10px] uppercase tracking-wider text-muted-foreground">
              <span className="flex items-center gap-1">
                <StatusDot status={contract.status} />
                {contract.status}
              </span>
              <span>{new Date(contract.created_at).toLocaleDateString()}</span>
              {contract.file_size && (
                <span>{(contract.file_size / 1024 / 1024).toFixed(1)} MB</span>
              )}
            </div>
          </div>
          <div className="flex gap-2">
            {canAnalyze && (
              <Button
                onClick={() => analyzeContract.mutate(contractId!)}
                disabled={analyzeContract.isPending}
                className="text-xs"
              >
                {analyzeContract.isPending ? (
                  <Loader2 className="mr-1 h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Play className="mr-1 h-3.5 w-3.5" />
                )}
                Analyze
              </Button>
            )}
            {isAnalyzing && (
              <Button disabled className="text-xs">
                <Loader2 className="mr-1 h-3.5 w-3.5 animate-spin" /> Analyzing...
              </Button>
            )}
            {isComplete && (
              <>
                <Button
                  variant="outline"
                  className="text-xs border-border/50"
                  onClick={() => exportAnalysisReport(contract, clauses || [])}
                >
                  <Download className="mr-1 h-3.5 w-3.5" /> Export PDF
                </Button>
                <Button
                  variant="outline"
                  className="text-xs border-border/50"
                  onClick={() => setChatOpen(!chatOpen)}
                >
                  <MessageSquare className="mr-1 h-3.5 w-3.5" />
                  {chatOpen ? 'Close Chat' : 'Chat'}
                </Button>
              </>
            )}
          </div>
        </div>

        {contract.error_message && (
          <div className="mb-6 rounded-lg border border-destructive/20 bg-destructive/5 px-4 py-3 text-xs text-destructive">
            <AlertTriangle className="mr-2 inline h-3.5 w-3.5" />
            {contract.error_message}
          </div>
        )}

        {isComplete && contract.risk_score !== null && (
          <div className="mb-6 grid gap-4 md:grid-cols-3">
            <Card className="flex flex-col items-center justify-center border-border/50 bg-card py-6">
              <RiskMeter score={contract.risk_score} />
            </Card>

            <Card className="border-border/50 bg-card">
              <CardHeader className="pb-2">
                <CardTitle className="text-[10px] font-bold uppercase tracking-wider text-primary">
                  Summary
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-xs leading-relaxed text-foreground/80">{contract.summary}</p>
              </CardContent>
            </Card>

            <div className="space-y-4">
              {contract.key_obligations && contract.key_obligations.length > 0 && (
                <Card className="border-border/50 bg-card">
                  <CardHeader className="pb-1">
                    <CardTitle className="text-[10px] font-bold uppercase tracking-wider text-primary">
                      Obligations
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ObligationTimeline obligations={contract.key_obligations} />
                  </CardContent>
                </Card>
              )}
              {contract.red_flags && contract.red_flags.length > 0 && (
                <Card className="border-border/50 bg-card">
                  <CardHeader className="pb-2">
                    <CardTitle className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-[#ff3366]">
                      <AlertTriangle className="h-3 w-3" /> Red Flags
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-1.5">
                      {contract.red_flags.map((rf, i) => (
                        <li key={i} className="flex gap-2 text-xs text-foreground/80">
                          <span className="text-[#ff3366]">-</span>
                          {rf}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        )}

        {isComplete && (
          <Tabs defaultValue="all">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-xs font-bold uppercase tracking-wider text-primary">Clauses</h2>
              <TabsList className="bg-accent/50">
                <TabsTrigger value="all" className="text-[10px]">All</TabsTrigger>
                <TabsTrigger value="critical" className="text-[10px]">Critical</TabsTrigger>
                <TabsTrigger value="high" className="text-[10px]">High</TabsTrigger>
                <TabsTrigger value="medium" className="text-[10px]">Medium</TabsTrigger>
                <TabsTrigger value="low" className="text-[10px]">Low</TabsTrigger>
              </TabsList>
            </div>

            {clausesLoading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-24 w-full bg-accent" />
                ))}
              </div>
            ) : (
              ['all', 'critical', 'high', 'medium', 'low'].map((level) => (
                <TabsContent key={level} value={level} className="space-y-3">
                  {(clauses || [])
                    .filter((c) => level === 'all' || c.risk_level === level)
                    .map((clause) => (
                      <ClauseCard key={clause.id} clause={clause} />
                    ))}
                  {(clauses || []).filter(
                    (c) => level === 'all' || c.risk_level === level
                  ).length === 0 && (
                    <p className="py-8 text-center text-xs text-muted-foreground">
                      No {level === 'all' ? '' : level} clauses found.
                    </p>
                  )}
                </TabsContent>
              ))
            )}
          </Tabs>
        )}

        {!isComplete && contract.status !== 'error' && (
          <StatusTerminal
            status={contract.status}
            contractName={contract.name}
          />
        )}

        {!isComplete && contract.status !== 'error' && contract.status === 'uploaded' && (
          <div className="mt-6 text-center">
            <Button
              onClick={() => analyzeContract.mutate(contractId!)}
              disabled={analyzeContract.isPending}
              className="text-xs"
            >
              <Play className="mr-1 h-3.5 w-3.5" /> Start Analysis
            </Button>
          </div>
        )}
      </div>

      {isComplete && (
        <NeuralChat
          contractId={contractId!}
          open={chatOpen}
          onClose={() => setChatOpen(false)}
        />
      )}
    </div>
  )
}

function StatusDot({ status }: { status: ContractStatus }) {
  const colors: Record<ContractStatus, string> = {
    pending: 'bg-[#ffaa00]',
    uploaded: 'bg-[#00d4ff]',
    analyzing: 'bg-[#a855f7] animate-pulse',
    complete: 'bg-[#00ff88]',
    error: 'bg-[#ff3366]',
  }
  return <span className={`inline-block h-1.5 w-1.5 rounded-full ${colors[status]}`} />
}
