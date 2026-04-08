import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useContract, useAnalyzeContract, useClauses } from '@/hooks/useContracts'
import RiskGauge from '@/components/app/RiskGauge'
import ClauseCard from '@/components/app/ClauseCard'
import ChatPanel from '@/components/app/ChatPanel'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Skeleton } from '@/components/ui/skeleton'
import {
  ArrowLeft,
  MessageSquare,
  Play,
  AlertTriangle,
  CheckCircle,
  FileText,
  Loader2,
} from 'lucide-react'
import type { ContractStatus } from '@/types/api'

const statusIcons: Record<ContractStatus, React.ReactNode> = {
  pending: <FileText className="h-4 w-4 text-yellow-600" />,
  uploaded: <CheckCircle className="h-4 w-4 text-blue-600" />,
  analyzing: <Loader2 className="h-4 w-4 animate-spin text-purple-600" />,
  complete: <CheckCircle className="h-4 w-4 text-green-600" />,
  error: <AlertTriangle className="h-4 w-4 text-red-600" />,
}

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
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-48 w-full" />
        <Skeleton className="h-96 w-full" />
      </div>
    )
  }

  if (!contract) {
    return (
      <div className="flex h-full items-center justify-center">
        <p className="text-muted-foreground">Contract not found</p>
      </div>
    )
  }

  const canAnalyze = contract.status === 'uploaded'
  const isAnalyzing = contract.status === 'analyzing'
  const isComplete = contract.status === 'complete'

  return (
    <div className="flex h-full">
      <div className="flex-1 overflow-auto p-6">
        <div className="mb-6">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate(`/w/${workspaceId}/contracts`)}
          >
            <ArrowLeft className="mr-1 h-4 w-4" /> Back to Contracts
          </Button>
        </div>

        <div className="mb-6 flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold">{contract.name}</h1>
            <div className="mt-1 flex items-center gap-3 text-sm text-muted-foreground">
              <span className="flex items-center gap-1">
                {statusIcons[contract.status]} {contract.status}
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
              >
                {analyzeContract.isPending ? (
                  <Loader2 className="mr-1 h-4 w-4 animate-spin" />
                ) : (
                  <Play className="mr-1 h-4 w-4" />
                )}
                Analyze
              </Button>
            )}
            {isAnalyzing && (
              <Button disabled>
                <Loader2 className="mr-1 h-4 w-4 animate-spin" /> Analyzing...
              </Button>
            )}
            {isComplete && (
              <Button variant="outline" onClick={() => setChatOpen(!chatOpen)}>
                <MessageSquare className="mr-1 h-4 w-4" />
                {chatOpen ? 'Close Chat' : 'Chat'}
              </Button>
            )}
          </div>
        </div>

        {contract.error_message && (
          <div className="mb-6 rounded-md bg-destructive/10 px-4 py-3 text-sm text-destructive">
            <AlertTriangle className="mr-2 inline h-4 w-4" />
            {contract.error_message}
          </div>
        )}

        {isComplete && contract.risk_score !== null && (
          <div className="mb-6 grid gap-6 md:grid-cols-3">
            <Card className="flex flex-col items-center py-6">
              <div className="relative">
                <RiskGauge score={contract.risk_score} />
              </div>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Summary
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm leading-relaxed">{contract.summary}</p>
              </CardContent>
            </Card>

            <div className="space-y-4">
              {contract.key_obligations && contract.key_obligations.length > 0 && (
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                      Key Obligations
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-1 text-sm">
                      {contract.key_obligations.map((ob, i) => (
                        <li key={i} className="flex gap-2">
                          <span className="text-muted-foreground">-</span>
                          {ob}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              )}
              {contract.red_flags && contract.red_flags.length > 0 && (
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="flex items-center gap-1 text-sm font-medium text-destructive">
                      <AlertTriangle className="h-3.5 w-3.5" /> Red Flags
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-1 text-sm">
                      {contract.red_flags.map((rf, i) => (
                        <li key={i} className="flex gap-2">
                          <span className="text-destructive">-</span>
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
              <h2 className="text-lg font-semibold">Clauses</h2>
              <TabsList>
                <TabsTrigger value="all">All</TabsTrigger>
                <TabsTrigger value="critical">Critical</TabsTrigger>
                <TabsTrigger value="high">High</TabsTrigger>
                <TabsTrigger value="medium">Medium</TabsTrigger>
                <TabsTrigger value="low">Low</TabsTrigger>
              </TabsList>
            </div>

            {clausesLoading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-28 w-full" />
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
                    <p className="py-8 text-center text-sm text-muted-foreground">
                      No {level === 'all' ? '' : level} clauses found.
                    </p>
                  )}
                </TabsContent>
              ))
            )}
          </Tabs>
        )}

        {!isComplete && contract.status !== 'error' && (
          <Card>
            <CardContent className="flex flex-col items-center py-12 text-center">
              {contract.status === 'pending' && (
                <>
                  <FileText className="mb-3 h-10 w-10 text-muted-foreground" />
                  <p className="font-medium">Upload in progress</p>
                  <p className="text-sm text-muted-foreground">
                    This contract is being uploaded.
                  </p>
                </>
              )}
              {contract.status === 'uploaded' && (
                <>
                  <Play className="mb-3 h-10 w-10 text-muted-foreground" />
                  <p className="font-medium">Ready for analysis</p>
                  <p className="mb-4 text-sm text-muted-foreground">
                    Click the Analyze button to start AI risk assessment.
                  </p>
                  <Button
                    onClick={() => analyzeContract.mutate(contractId!)}
                    disabled={analyzeContract.isPending}
                  >
                    <Play className="mr-1 h-4 w-4" /> Start Analysis
                  </Button>
                </>
              )}
              {contract.status === 'analyzing' && (
                <>
                  <Loader2 className="mb-3 h-10 w-10 animate-spin text-purple-600" />
                  <p className="font-medium">Analysis in progress</p>
                  <p className="text-sm text-muted-foreground">
                    The AI is reviewing your contract. This may take a minute.
                  </p>
                </>
              )}
            </CardContent>
          </Card>
        )}
      </div>

      {isComplete && (
        <ChatPanel
          contractId={contractId!}
          open={chatOpen}
          onClose={() => setChatOpen(false)}
        />
      )}
    </div>
  )
}
