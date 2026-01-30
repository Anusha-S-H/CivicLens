import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Logo } from '@/components/Logo';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { GlassCard } from '@/components/GlassCard';
import { Eye, EyeOff, Loader2, ArrowRight, Users, Building2, Shield, Check } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { UserRole } from '@/lib/mockData';
import { cn } from '@/lib/utils';

const roles: { value: UserRole; label: string; icon: typeof Users; description: string }[] = [
  { value: 'citizen', label: 'Citizen', icon: Users, description: 'Report civic issues' },
  { value: 'officer', label: 'Government Officer', icon: Building2, description: 'Monitor alerts and act' },
  { value: 'admin', label: 'Administrator', icon: Shield, description: 'Manage platform' },
];


export default function Login() {
  const { login, preferredRole, setPreferredRole } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(preferredRole);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRole) {
      toast({ title: 'Choose your role', description: 'Please select Citizen, Officer, or Admin.', variant: 'destructive' });
      return;
    }
    setIsLoading(true);

    try {
      const result = await login(email, password, selectedRole);
      if (result.success) {
        setPreferredRole(selectedRole);
        toast({
          title: 'Welcome back!',
          description: 'You have successfully logged in.',
        });
        navigate('/dashboard', { replace: true });
      } else {
        toast({
          title: 'Login failed',
          description: result.message || 'Invalid email or password.',
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Something went wrong. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background bg-hero-pattern p-4">
      {/* Background decorations */}
      <div className="fixed top-20 left-10 w-72 h-72 bg-primary/20 rounded-full blur-3xl animate-float" />
      <div className="fixed bottom-20 right-10 w-96 h-96 bg-accent/20 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }} />

      <div className="w-full max-w-md relative">
        <div className="text-center mb-8 animate-slide-in-up">
          <Link to="/" className="inline-block">
            <Logo size="lg" />
          </Link>
          <p className="text-muted-foreground mt-2">Welcome back to CivicLens</p>
        </div>

        <GlassCard className="animate-slide-in-up stagger-1">
          <div className="space-y-4 mb-6">
            <p className="text-sm font-medium text-muted-foreground">Who are you?</p>
            <div className="grid gap-2">
              {roles.map((role) => (
                <button
                  key={role.value}
                  type="button"
                  onClick={() => {
                    setSelectedRole(role.value);
                    setPreferredRole(role.value);
                  }}
                  className={cn(
                    'flex items-center gap-3 p-3 rounded-xl border transition-all text-left',
                    selectedRole === role.value
                      ? 'border-primary bg-primary/5 shadow-glow'
                      : 'border-border hover:border-primary/50'
                  )}
                >
                  <div className={cn(
                    'h-10 w-10 rounded-lg flex items-center justify-center',
                    selectedRole === role.value ? 'gradient-primary' : 'bg-muted'
                  )}>
                    <role.icon className={cn(
                      'h-5 w-5',
                      selectedRole === role.value ? 'text-primary-foreground' : 'text-muted-foreground'
                    )} />
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold">{role.label}</p>
                    <p className="text-xs text-muted-foreground">{role.description}</p>
                  </div>
                  {selectedRole === role.value && (
                    <span className="h-5 w-5 rounded-full bg-primary flex items-center justify-center">
                      <Check className="h-3 w-3 text-primary-foreground" />
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4 text-muted-foreground" />
                  ) : (
                    <Eye className="h-4 w-4 text-muted-foreground" />
                  )}
                </Button>
              </div>
            </div>

            <Button
              type="submit"
              variant="gradient"
              className="w-full"
              size="lg"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Signing in...
                </>
              ) : (
                <>
                  Sign In
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </Button>
          </form>

          <div className="mt-6 pt-6 border-t border-border/50">
            <p className="text-center text-sm text-muted-foreground">
              Don't have an account?{' '}
              <Link to="/signup" className="text-primary hover:underline font-medium">
                Create one
              </Link>
            </p>
          </div>
        </GlassCard>

        <p className="text-center mt-6 text-sm text-muted-foreground animate-slide-in-up stagger-2">
          <Link to="/" className="text-primary hover:underline font-medium">
            Back to home
          </Link>
        </p>
      </div>
    </div>
  );
}
