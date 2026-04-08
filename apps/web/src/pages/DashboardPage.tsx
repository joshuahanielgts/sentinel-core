import { useParams } from 'react-router-dom'
import { useDashboardStats } from '@/hooks/useDashboard'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { FileText, AlertTriangle, Clock, BarChart3 } from 'lucide-react'
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
} from 'recharts'
import type { RiskLevel } from '@/types/api'

const riskColors: Record<RiskLevel, string> = {
  low: '#22c55e',
  medium: '#eab308',
  high: '#f97316',
  critical: '#ef4444',
}

const riskBadgeColors: Record<RiskLevel, string> = {
  low: 'bg-green-100 text-green-800',
  medium: 'bg-yellow-100 text-yellow-800',
  high: 'bg-orange-100 text-orange-800',
  critical: 'bg-red-100 text-red-800',
}

export default function DashboardPage() {
  const { workspaceId } = useParams<{ workspaceId: string }>()
  const { data: stats, isLoading } = useDashboardStats(workspaceId!)

  if (isLoading) {
    return (
      <div className="p-6 space-y-6">
        <Skeleton className="h-8 w-48" />
        <div className="grid gap-4 md:grid-cols-3">
          <Skeleton className="h-28" />
          <Skeleton className="h-28" />
          <Skeleton className="h-28" />
        </div>
        <div className="grid gap-6 md:grid-cols-2">
          <Skeleton className="h-72" />
          <Skeleton className="h-72" />
        </div>
      </div>
    )
  }

  if (!stats) return null

  const pieData = Object.entries(stats.contracts_by_risk)
    .filter(([, v]) => v > 0)
    .map(([key, value]) => ({
      name: key.charAt(0).toUpperCase() + key.slice(1),
      value,
      color: riskColors[key as RiskLevel],
    }))

  const barData = Object.entries(stats.contracts_by_risk).map(([key, value]) => ({
    name: key.charAt(0).toUpperCase() + key.slice(1),
    count: value,
    fill: riskColors[key as RiskLevel],
  }))

  const highRiskCount = stats.contracts_by_risk.high + stats.contracts_by_risk.critical

  return (
    <div className="p-6">
      <h1 className="mb-6 text-2xl font-bold">Dashboard</h1>

      <div className="mb-6 grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="flex items-center gap-4 pt-6">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-100">
              <FileText className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{stats.total_contracts}</p>
              <p className="text-sm text-muted-foreground">Total Contracts</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center gap-4 pt-6">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-yellow-100">
              <Clock className="h-6 w-6 text-yellow-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{stats.pending_analysis}</p>
              <p className="text-sm text-muted-foreground">Pending Analysis</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center gap-4 pt-6">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-red-100">
              <AlertTriangle className="h-6 w-6 text-red-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{highRiskCount}</p>
              <p className="text-sm text-muted-foreground">High/Critical Risk</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="mb-6 grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <BarChart3 className="h-4 w-4" /> Risk Distribution
            </CardTitle>
          </CardHeader>
          <CardContent>
            {pieData.length > 0 ? (
              <ResponsiveContainer width="100%" height={240}>
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={4}
                    dataKey="value"
                    label={({ name, value }) => `${name}: ${value}`}
                  >
                    {pieData.map((entry) => (
                      <Cell key={entry.name} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-60 items-center justify-center text-sm text-muted-foreground">
                No analyzed contracts yet
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <BarChart3 className="h-4 w-4" /> Contracts by Risk Level
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={barData}>
                <XAxis dataKey="name" fontSize={12} />
                <YAxis allowDecimals={false} fontSize={12} />
                <Tooltip />
                <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                  {barData.map((entry) => (
                    <Cell key={entry.name} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <AlertTriangle className="h-4 w-4 text-destructive" /> Recent High-Risk Clauses
          </CardTitle>
        </CardHeader>
        <CardContent>
          {stats.recent_high_risk_clauses.length > 0 ? (
            <div className="space-y-3">
              {stats.recent_high_risk_clauses.map((clause) => (
                <div key={clause.id} className="flex items-start gap-3 rounded-lg border p-3">
                  <Badge
                    className={riskBadgeColors[clause.risk_level]}
                    variant="secondary"
                  >
                    {clause.risk_level}
                  </Badge>
                  <div className="flex-1">
                    <p className="text-sm font-medium">{clause.contract_name}</p>
                    <p className="text-xs text-muted-foreground">{clause.category}</p>
                    <p className="mt-1 text-sm">{clause.rationale}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="py-8 text-center text-sm text-muted-foreground">
              No high-risk clauses found yet.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
