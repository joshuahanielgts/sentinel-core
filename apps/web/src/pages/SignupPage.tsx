import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'

export default function SignupPage() {
  const { signUp } = useAuth()
  const navigate = useNavigate()
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await signUp(email, password, fullName)
      navigate('/workspaces')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to sign up')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="border-border/50 glow-blue-sm">
      <CardHeader>
        <CardTitle className="text-xl text-primary glow-text-blue">Register Operator</CardTitle>
        <CardDescription className="text-xs text-muted-foreground">
          Create credentials for the Sentinel defense grid
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="rounded-md border border-destructive/20 bg-destructive/5 px-3 py-2 text-xs text-destructive">
              {error}
            </div>
          )}
          <div className="space-y-2">
            <Label htmlFor="name" className="text-xs">Callsign</Label>
            <Input
              id="name"
              placeholder="Jane Doe"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
              className="border-border/50 bg-accent/30 text-xs"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email" className="text-xs">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="operator@sentinel.ai"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="border-border/50 bg-accent/30 text-xs"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password" className="text-xs">Passphrase</Label>
            <Input
              id="password"
              type="password"
              placeholder="Minimum 6 characters"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              minLength={6}
              required
              className="border-border/50 bg-accent/30 text-xs"
            />
          </div>
          <Button type="submit" className="w-full text-xs" disabled={loading}>
            {loading ? 'Provisioning...' : 'Create Account'}
          </Button>
        </form>
      </CardContent>
      <CardFooter className="justify-center">
        <p className="text-[11px] text-muted-foreground">
          Already registered?{' '}
          <Link to="/login" className="font-medium text-primary hover:underline">
            Sign in
          </Link>
        </p>
      </CardFooter>
    </Card>
  )
}
