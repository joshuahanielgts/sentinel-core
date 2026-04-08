import { useEffect } from 'react'
import { Outlet, useNavigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { Shield } from 'lucide-react'

export default function AuthLayout() {
  const { user, loading } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (!loading && user) {
      navigate('/workspaces', { replace: true })
    }
  }, [user, loading, navigate])

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    )
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background cyber-grid scanline px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 flex flex-col items-center gap-3">
          <div className="flex h-14 w-14 items-center justify-center rounded-xl border border-primary/30 bg-accent/50 glow-blue">
            <Shield className="h-7 w-7 text-primary" />
          </div>
          <div className="text-center">
            <h1 className="text-lg font-bold tracking-widest text-primary glow-text-blue">
              SENTINEL
            </h1>
            <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
              Autonomous Legal Defense Grid
            </p>
          </div>
        </div>
        <Outlet />
      </div>
    </div>
  )
}
