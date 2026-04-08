import { CheckCircle2 } from 'lucide-react'

interface ObligationTimelineProps {
  obligations: string[]
}

export default function ObligationTimeline({ obligations }: ObligationTimelineProps) {
  if (!obligations || obligations.length === 0) {
    return (
      <p className="py-4 text-center text-xs text-muted-foreground">No obligations found.</p>
    )
  }

  return (
    <div className="relative space-y-0">
      <div className="absolute left-[11px] top-3 bottom-3 w-px bg-gradient-to-b from-primary/40 via-primary/20 to-transparent" />
      {obligations.map((ob, i) => (
        <div key={i} className="relative flex items-start gap-3 py-2.5 pl-0">
          <div className="relative z-10 mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-primary/30 bg-[#0a0e1a]">
            <CheckCircle2 className="h-3 w-3 text-primary" />
          </div>
          <p className="text-xs leading-relaxed text-foreground/80 pt-0.5">{ob}</p>
        </div>
      ))}
    </div>
  )
}
