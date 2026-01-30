import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Logo } from '@/components/Logo';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { GlassCard } from '@/components/GlassCard';
import { UserRole } from '@/lib/mockData';
import { Eye, EyeOff, Loader2, ArrowRight, Users, Building2, Shield, Check } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

const roles: { value: UserRole; label: string; icon: typeof Users; description: string }[] = [
  {
    value: 'citizen',
    label: 'Citizen',
    icon: Users,
    description: 'Report civic issues in your area',
  },
  {
    value: 'officer',
    label: 'Government Officer',
    icon: Building2,
    description: 'Monitor alerts and take action',
  },
  {
    value: 'admin',
    label: 'Administrator',
    icon: Shield,
    description: 'Manage platform and users',
  },
];

export default function Signup() {
  const { signup, preferredRole, setPreferredRole } = useAuth();
  const [step, setStep] = useState<'role' | 'details'>(preferredRole ? 'details' : 'role');
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(preferredRole);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleRoleSelect = (role: UserRole) => {
    setSelectedRole(role);
    setPreferredRole(role);
  };

  const handleContinue = () => {
    if (selectedRole) {
      setStep('details');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRole) return;

    setIsLoading(true);

    try {
      const result = await signup(name, email, password, selectedRole);
      if (result.success) {
        setPreferredRole(selectedRole);
        toast({
          title: 'Account created!',
          description: 'Welcome to CivicLens.',
        });
        navigate('/dashboard', { replace: true });
      } else {
        toast({
          title: 'Signup failed',
          description: result.message || 'Email already registered.',
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

      <div className="w-full max-w-lg relative">
        <div className="text-center mb-8 animate-slide-in-up">
          <Link to="/" className="inline-block">
            <Logo size="lg" />
          </Link>
          <p className="text-muted-foreground mt-2">
            {step === 'role' ? 'Choose how you want to use CivicLens' : 'Create your account'}
          </p>
        </div>

        <GlassCard className="animate-slide-in-up stagger-1">
          {step === 'role' ? (
            <div className="space-y-6">
              <div className="grid gap-4">
                {roles.map((role) => (
                  <button
                    key={role.value}
                    type="button"
                    onClick={() => handleRoleSelect(role.value)}
                    className={cn(
                      'flex items-center gap-4 p-4 rounded-xl border-2 transition-all duration-300 text-left hover-lift',
                      selectedRole === role.value
                        ? 'border-primary bg-primary/5 shadow-glow'
                        : 'border-border hover:border-primary/50'
                    )}
                  >
                    <div className={cn(
                      'h-12 w-12 rounded-xl flex items-center justify-center transition-colors',
                      selectedRole === role.value
                        ? 'gradient-primary'
                        : 'bg-muted'
                    )}>
                      <role.icon className={cn(
                        'h-6 w-6',
                        selectedRole === role.value ? 'text-primary-foreground' : 'text-muted-foreground'
                      )} />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold">{role.label}</h3>
                      <p className="text-sm text-muted-foreground">{role.description}</p>
                    </div>
                    {selectedRole === role.value && (
                      <div className="h-6 w-6 rounded-full bg-primary flex items-center justify-center">
                        <Check className="h-4 w-4 text-primary-foreground" />
                      </div>
                    )}
                  </button>
                ))}
              </div>

              <Button
                variant="gradient"
                className="w-full"
                size="lg"
                onClick={handleContinue}
                disabled={!selectedRole}
              >
                Continue
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                {selectedRole && (
                  <>
                    {roles.find(r => r.value === selectedRole)?.icon && (
                      <div className="h-10 w-10 rounded-lg gradient-primary flex items-center justify-center">
                        {(() => {
                          const Icon = roles.find(r => r.value === selectedRole)?.icon;
                          return Icon ? <Icon className="h-5 w-5 text-primary-foreground" /> : null;
                        })()}
                      </div>
                    )}
                    <div>
                      <p className="text-sm font-medium">
                        {roles.find(r => r.value === selectedRole)?.label}
                      </p>
                      <button
                        type="button"
                        onClick={() => setStep('role')}
                        className="text-xs text-primary hover:underline"
                      >
                        Change role
                      </button>
                    </div>
                  </>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="Enter your full name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>

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
                    placeholder="Create a password"
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
                    Creating account...
                  </>
                ) : (
                  <>
                    Create Account
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </Button>
            </form>
          )}
        </GlassCard>

        <p className="text-center mt-6 text-sm text-muted-foreground animate-slide-in-up stagger-2">
          Already have an account?{' '}
          <Link to="/login" className="text-primary hover:underline font-medium">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
