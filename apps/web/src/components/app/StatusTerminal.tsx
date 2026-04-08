import { useEffect, useState } from 'react'
import type { ContractStatus } from '@/types/api'

interface StatusTerminalProps {
  status: ContractStatus
  contractName: string
  errorMessage?: string | null
}

const statusLines: Record<string, string[]> = {
  pending: [
    '> Initializing upload pipeline...',
    '> Awaiting file transfer...',
  ],
  uploaded: [
    '> File received successfully.',
    '> Document verified — ready for analysis.',
    '> Awaiting ANALYZE command...',
  ],
  analyzing: [
    '> SENTINEL ANALYSIS ENGINE v2.5 ONLINE',
    '> Loading Gemini 2.5 Pro neural weights...',
    '> Extracting document structure...',
    '> Scanning clause boundaries...',
    '> Running adversarial risk assessment...',
    '> Cross-referencing obligation matrices...',
    '> Computing aggregate threat score...',
  ],
  complete: [
    '> Analysis complete.',
    '> All clauses classified. Risk score computed.',
    '> SENTINEL DEFENSE GRID ARMED.',
  ],
  error: [
    '> !! ANALYSIS ENGINE ERROR !!',
  ],
}

export default function StatusTerminal({ status, contractName, errorMessage }: StatusTerminalProps) {
  const [visibleLines, setVisibleLines] = useState<string[]>([])
  const lines = statusLines[status] || []

  useEffect(() => {
    setVisibleLines([`> Target: ${contractName}`])

    if (status !== 'analyzing') {
      setVisibleLines((prev) => [...prev, ...lines])
      if (status === 'error' && errorMessage) {
        setVisibleLines((prev) => [...prev, `> ${errorMessage}`])
      }
      return
    }

    let i = 0
    const timer = setInterval(() => {
      if (i < lines.length) {
        setVisibleLines((prev) => [...prev, lines[i]])
        i++
      } else {
        setVisibleLines((prev) => {
          const last = prev[prev.length - 1]
          if (last?.endsWith('...')) {
            return [...prev.slice(0, -1), last + '.']
          }
          return [...prev, '> Processing' + '.'.repeat((i % 3) + 1)]
        })
        i++
      }
    }, 800)

    return () => clearInterval(timer)
  }, [status, contractName, errorMessage])

  return (
    <div className="rounded-lg border border-border/50 bg-[#060a14] p-4 font-mono text-xs scanline">
      <div className="mb-2 flex items-center gap-2">
        <div className="h-2 w-2 rounded-full bg-neon-green animate-pulse-glow" />
        <span className="text-[10px] font-bold uppercase tracking-widest text-neon-green">
          Sentinel Terminal
        </span>
      </div>
      <div className="space-y-1">
        {visibleLines.map((line, i) => (
          <div
            key={i}
            className={`${
              line.includes('!!') ? 'text-neon-pink glow-text-red' :
              line.includes('complete') || line.includes('ARMED') ? 'text-neon-green glow-text-green' :
              'text-neon-blue/70'
            }`}
          >
            {line}
          </div>
        ))}
        {status === 'analyzing' && (
          <span className="text-neon-blue animate-type-cursor">_</span>
        )}
      </div>
    </div>
  )
}
