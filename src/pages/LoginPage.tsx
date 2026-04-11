import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

type LoginForm = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const { signIn, signInWithGoogle } = useAuth();
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const { register, handleSubmit, formState: { errors } } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginForm) => {
    setLoading(true);
    try {
      await signIn(data.email, data.password);
      navigate('/workspaces');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="glass rounded-lg p-8 w-full max-w-md space-y-6">
      <div className="text-center">
        <h1 className="font-mono text-xl font-bold text-foreground blink-cursor">SYSTEM ACCESS</h1>
        <p className="text-sm text-muted-foreground mt-1">Enter credentials to authenticate</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="space-y-2">
          <Label className="font-mono text-xs text-muted-foreground">EMAIL</Label>
          <Input {...register('email')} type="email" placeholder="operator@sentinel.ai" className="bg-background font-mono text-sm" />
          {errors.email && <p className="text-xs text-destructive font-mono">{errors.email.message}</p>}
        </div>
        <div className="space-y-2">
          <Label className="font-mono text-xs text-muted-foreground">PASSWORD</Label>
          <Input {...register('password')} type="password" placeholder="••••••••" className="bg-background font-mono text-sm" />
          {errors.password && <p className="text-xs text-destructive font-mono">{errors.password.message}</p>}
        </div>
        <Button type="submit" disabled={loading} className="w-full btn-glow font-mono">
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
          AUTHENTICATE
        </Button>
      </form>

      <div className="relative">
        <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-border" /></div>
        <div className="relative flex justify-center text-xs"><span className="px-2 bg-card text-muted-foreground font-mono">OR</span></div>
      </div>

      <Button variant="outline" className="w-full font-mono text-sm" onClick={() => signInWithGoogle()}>
        CONTINUE WITH GOOGLE
      </Button>

      <p className="text-center text-sm text-muted-foreground">
        No account?{' '}
        <Link to="/signup" className="text-primary hover:underline font-mono">CREATE PROFILE</Link>
      </p>
    </div>
  );
}
