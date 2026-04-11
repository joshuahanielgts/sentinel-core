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

const signupSchema = z.object({
  fullName: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

type SignupForm = z.infer<typeof signupSchema>;

export default function SignupPage() {
  const { signUp } = useAuth();
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const { register, handleSubmit, formState: { errors } } = useForm<SignupForm>({
    resolver: zodResolver(signupSchema),
  });

  const onSubmit = async (data: SignupForm) => {
    setLoading(true);
    try {
      await signUp(data.email, data.password, data.fullName);
      toast.success('Account created! Check your email to confirm.');
      navigate('/login');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Signup failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="glass rounded-lg p-8 w-full max-w-md space-y-6">
      <div className="text-center">
        <h1 className="font-mono text-xl font-bold text-foreground">CREATE OPERATOR PROFILE</h1>
        <p className="text-sm text-muted-foreground mt-1">Initialize your Sentinel AI account</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="space-y-2">
          <Label className="font-mono text-xs text-muted-foreground">FULL NAME</Label>
          <Input {...register('fullName')} placeholder="John Doe" className="bg-background font-mono text-sm" />
          {errors.fullName && <p className="text-xs text-destructive font-mono">{errors.fullName.message}</p>}
        </div>
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
          INITIALIZE ACCOUNT
        </Button>
      </form>

      <p className="text-center text-sm text-muted-foreground">
        Already registered?{' '}
        <Link to="/login" className="text-primary hover:underline font-mono">AUTHENTICATE</Link>
      </p>
    </div>
  );
}
