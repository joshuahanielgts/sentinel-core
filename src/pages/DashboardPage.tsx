import { useParams } from 'react-router-dom';
import { useDashboard } from '@/hooks/useDashboard';
import { FileText, Clock, AlertTriangle } from 'lucide-react';
import { ThreatFeed } from '@/components/app/ThreatFeed';
import { DashboardSkeleton } from '@/components/app/DashboardSkeleton';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { useEffect } from 'react';
import type { RiskLevel } from '@/types/api';

const RISK_COLORS: Record<RiskLevel, string> = {
  low: 'hsl(160,84%,39%)',
  medium: 'hsl(38,92%,50%)',
  high: 'hsl(25,95%,53%)',
  critical: 'hsl(0,84%,60%)',
};

export default function DashboardPage() {
  const { workspaceId } = useParams();
  const { data: stats, isLoading } = useDashboard(workspaceId);

  useEffect(() => {
    document.title = 'SENTINEL AI | Dashboard';
  }, []);

  const pieData = stats ? (Object.entries(stats.contracts_by_risk) as [RiskLevel, number][])
    .filter(([, v]) => v > 0)
    .map(([key, value]) => ({ name: key.toUpperCase(), value, fill: RISK_COLORS[key] })) : [];

  const barData = stats ? (Object.entries(stats.contracts_by_risk) as [RiskLevel, number][])
    .map(([key, value]) => ({ name: key.toUpperCase(), count: value, fill: RISK_COLORS[key] })) : [];

  const highCriticalCount = stats ? (stats.contracts_by_risk.high || 0) + (stats.contracts_by_risk.critical || 0) : 0;

  if (isLoading) {
    return <DashboardSkeleton />;
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <h1 className="font-mono text-2xl font-bold text-foreground">THREAT OVERVIEW</h1>
        <span className="flex items-center gap-1.5 text-xs font-mono text-risk-low">
          <span className="w-2 h-2 rounded-full bg-risk-low pulse-dot" />
          LIVE
        </span>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="glass rounded-lg p-5 glow-card">
          <div className="flex items-center gap-3">
            <FileText className="w-8 h-8 text-primary" />
            <div>
              <p className="text-xs text-muted-foreground font-mono">TOTAL CONTRACTS</p>
              <p className="text-3xl font-mono font-bold text-foreground">{stats?.total_contracts ?? 0}</p>
            </div>
          </div>
        </div>
        <div className="glass rounded-lg p-5 glow-card">
          <div className="flex items-center gap-3">
            <Clock className="w-8 h-8 text-risk-medium" />
            <div>
              <p className="text-xs text-muted-foreground font-mono">PENDING ANALYSIS</p>
              <p className="text-3xl font-mono font-bold text-risk-medium">{stats?.pending_analysis ?? 0}</p>
            </div>
          </div>
        </div>
        <div className={`glass rounded-lg p-5 glow-card ${highCriticalCount > 0 ? 'pulse-critical' : ''}`}>
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-8 h-8 text-risk-critical" />
            <div>
              <p className="text-xs text-muted-foreground font-mono">HIGH/CRITICAL RISK</p>
              <p className="text-3xl font-mono font-bold text-risk-critical">{highCriticalCount}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="glass rounded-lg p-5 glow-card">
          <h3 className="font-mono text-sm text-muted-foreground mb-4">RISK DISTRIBUTION</h3>
          {pieData.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" innerRadius={60} outerRadius={90} dataKey="value" stroke="none">
                  {pieData.map((entry, i) => <Cell key={i} fill={entry.fill} />)}
                </Pie>
                <Tooltip contentStyle={{ background: 'hsl(215,60%,10%)', border: '1px solid hsl(215,54%,23%)', borderRadius: '8px', fontFamily: 'JetBrains Mono', fontSize: '12px' }} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[250px] flex items-center justify-center text-muted-foreground font-mono text-sm">NO DATA</div>
          )}
          <div className="flex gap-4 justify-center mt-2">
            {(['low', 'medium', 'high', 'critical'] as RiskLevel[]).map((level) => (
              <div key={level} className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-sm" style={{ background: RISK_COLORS[level] }} />
                <span className="text-xs font-mono text-muted-foreground">{level.toUpperCase()}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="glass rounded-lg p-5 glow-card">
          <h3 className="font-mono text-sm text-muted-foreground mb-4">CONTRACTS BY RISK LEVEL</h3>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={barData}>
              <XAxis dataKey="name" tick={{ fontSize: 11, fontFamily: 'JetBrains Mono', fill: 'hsl(215,16%,65%)' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fontFamily: 'JetBrains Mono', fill: 'hsl(215,16%,65%)' }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ background: 'hsl(215,60%,10%)', border: '1px solid hsl(215,54%,23%)', borderRadius: '8px', fontFamily: 'JetBrains Mono', fontSize: '12px' }} />
              <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                {barData.map((entry, i) => <Cell key={i} fill={entry.fill} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Threat Feed */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <span className="w-2 h-2 rounded-full bg-risk-critical pulse-dot" />
          <h3 className="font-mono text-sm text-foreground">ACTIVE THREAT FEED</h3>
        </div>
        <ThreatFeed clauses={stats?.recent_high_risk_clauses ?? []} />
      </div>
    </div>
  );
}
