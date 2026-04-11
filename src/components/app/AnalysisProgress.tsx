import { StatusTerminal } from './StatusTerminal';

const ANALYSIS_LINES = [
  'LOADING DOCUMENT...',
  'EXTRACTING TEXT LAYER...',
  'INITIALIZING NEURAL ANALYSIS...',
  'SCANNING CLAUSE PATTERNS...',
  'COMPUTING RISK VECTORS...',
  'GENERATING ASSESSMENT...',
];

interface AnalysisProgressProps {
  active: boolean;
}

export function AnalysisProgress({ active }: AnalysisProgressProps) {
  return (
    <div className="glow-card rounded-lg bg-card p-6 space-y-4">
      <div className="flex items-center gap-2">
        <div className="w-2 h-2 rounded-full bg-cyan spin-slow" />
        <h3 className="font-mono text-sm text-foreground">ANALYSIS IN PROGRESS</h3>
      </div>
      <StatusTerminal lines={ANALYSIS_LINES} active={active} />
    </div>
  );
}
