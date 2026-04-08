import { useParams } from 'react-router-dom'
import { useDashboardStats } from '@/hooks/useDashboard'
import ThreatFeed from '@/components/app/ThreatFeed'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { FileText, AlertTriangle, Clock, Activity } from 'lucide-react'
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
} from 'recharts'
import type { RiskLevel } from '@/types/api'

const riskColors: Record<RiskLevel, string> = {
  low: '#00ff88',
  medium: '#ffaa00',
  high: '#ff6633',
  critical: '#ff3366',
}

export default function DashboardPage() {
  const { workspaceId } = useParams<{ workspaceId: string }>()
  const { data: stats, isLoading } = useDashboardStats(workspaceId!)

  if (isLoading) {
    return (
      <div className="p-6 space-y-6">
        <Skeleton className="h-6 w-48 bg-accent" />
        <div className="grid gap-4 md:grid-cols-3">
          <Skeleton className="h-24 bg-accent" />
          <Skeleton className="h-24 bg-accent" />
          <Skeleton className="h-24 bg-accent" />
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
      <h1 className="mb-6 text-sm font-bold uppercase tracking-widest text-primary glow-text-blue">
        Command Center
      </h1>

      <div className="mb-6 grid gap-4 md:grid-cols-3">
        <Card className="border-border/50 bg-card holo-hover">
          <CardContent className="flex items-center gap-4 pt-6">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-primary/20 bg-primary/5">
              <FileText className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground tabular-nums">{stats.total_contracts}</p>
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Total Contracts</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/50 bg-card holo-hover">
          <CardContent className="flex items-center gap-4 pt-6">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-[#ffaa00]/20 bg-[#ffaa00]/5">
              <Clock className="h-5 w-5 text-[#ffaa00]" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground tabular-nums">{stats.pending_analysis}</p>
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Pending Analysis</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/50 bg-card holo-hover">
          <CardContent className="flex items-center gap-4 pt-6">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-[#ff3366]/20 bg-[#ff3366]/5">
              <AlertTriangle className="h-5 w-5 text-[#ff3366]" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground tabular-nums">{highRiskCount}</p>
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground">High/Critical Risk</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="mb-6 grid gap-6 md:grid-cols-2">
        <Card className="border-border/50 bg-card">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-primary">
              <Activity className="h-3.5 w-3.5" /> Risk Distribution
            </CardTitle>
          </CardHeader>
          <CardContent>
            {pieData.length > 0 ? (
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={85}
                    paddingAngle={4}
                    dataKey="value"
                    stroke="none"
                    label={({ name, value }) => `${name}: ${value}`}
                  >
                    {pieData.map((entry) => (
                      <Cell key={entry.name} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#0f1629',
                      border: '1px solid rgba(0,212,255,0.2)',
                      borderRadius: '8px',
                      fontSize: '11px',
                      color: '#e0e6f0',
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-52 items-center justify-center text-xs text-muted-foreground">
                No analyzed contracts yet
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="border-border/50 bg-card">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-primary">
              <Activity className="h-3.5 w-3.5" /> Contracts by Risk
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={barData}>
                <XAxis dataKey="name" fontSize={10} tick={{ fill: '#5e6e8a' }} axisLine={{ stroke: '#1e2a45' }} />
                <YAxis allowDecimals={false} fontSize={10} tick={{ fill: '#5e6e8a' }} axisLine={{ stroke: '#1e2a45' }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f1629',
                    border: '1px solid rgba(0,212,255,0.2)',
                    borderRadius: '8px',
                    fontSize: '11px',
                    color: '#e0e6f0',
                  }}
                />
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

      <Card className="border-border/50 bg-card">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#ff3366]">
            <AlertTriangle className="h-3.5 w-3.5" /> Threat Feed
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ThreatFeed clauses={stats.recent_high_risk_clauses} />
        </CardContent>
      </Card>
    </div>
  )
}
