import { useLocation, Link } from 'react-router-dom'
import { useEffect } from 'react'
import { Shield } from 'lucide-react'

export default function NotFound() {
  const location = useLocation()
  useEffect(() => {
    console.error('404 — route not found:', location.pathname)
  }, [location.pathname])
  return (
    <div className="min-h-screen bg-background grid-bg scanlines
                    flex items-center justify-center">
      <div className="glass rounded-lg p-12 text-center space-y-6">
        <Shield className="w-14 h-14 text-primary mx-auto opacity-30" />
        <h1 className="font-mono text-7xl font-bold text-primary tracking-tight">
          404
        </h1>
        <p className="font-mono text-sm tracking-[0.3em] text-muted-foreground uppercase">
          Route Not Found
        </p>
        <p className="font-mono text-xs text-muted-foreground/60
                      bg-secondary/50 px-4 py-2 rounded">
          {location.pathname}
        </p>
        <Link
          to="/"
          className="inline-block font-mono text-xs text-primary
                     border border-primary/30 px-6 py-2 rounded
                     hover:bg-primary/10 transition-colors tracking-widest"
        >
          RETURN TO BASE
        </Link>
      </div>
    </div>
  )
}
