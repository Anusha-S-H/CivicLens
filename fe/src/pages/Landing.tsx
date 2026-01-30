import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Logo } from '@/components/Logo';
import { Button } from '@/components/ui/button';
import { GlassCard } from '@/components/GlassCard';
import { useAuth } from '@/contexts/AuthContext';
import { UserRole } from '@/lib/mockData';
import {
  Eye,
  Shield,
  Users,
  Zap,
  ArrowRight,
  CheckCircle2,
  Building2,
  TrendingUp,
  Bell,
  X,
} from 'lucide-react';

export default function Landing() {
  const { preferredRole, setPreferredRole } = useAuth();
  const [showRoleGate, setShowRoleGate] = useState(!preferredRole);

  const roles: { value: UserRole; label: string; description: string; icon: typeof Users }[] = [
    { value: 'citizen', label: 'Citizen', description: 'Report issues and track responses', icon: Users },
    { value: 'officer', label: 'Government Officer', description: 'Monitor alerts and act quickly', icon: Building2 },
    { value: 'admin', label: 'Administrator', description: 'Oversee the platform and users', icon: Shield },
  ];

  useEffect(() => {
    if (preferredRole) {
      setShowRoleGate(false);
    }
  }, [preferredRole]);

  const features = [
    {
      icon: Eye,
      title: 'AI-Powered Detection',
      description: 'Advanced algorithms analyze news and citizen reports to detect civic issues early.',
    },
    {
      icon: Bell,
      title: 'Real-time Alerts',
      description: 'Instant notifications to authorities when issues reach critical levels.',
    },
    {
      icon: Users,
      title: 'Citizen Participation',
      description: 'Easy reporting system empowers citizens to contribute to city improvement.',
    },
    {
      icon: Shield,
      title: 'Prevent Failures',
      description: 'Proactive approach helps prevent infrastructure failures before they occur.',
    },
  ];

  const stats = [
    { value: '50K+', label: 'Reports Processed' },
    { value: '89%', label: 'Faster Response' },
    { value: '200+', label: 'Cities' },
    { value: '95%', label: 'Satisfaction' },
  ];

  return (
    <div className="min-h-screen bg-background bg-hero-pattern">
      {showRoleGate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm px-4">
          <GlassCard className="w-full max-w-xl p-6 relative">
            <div className="flex items-start justify-between mb-4">
              <div>
                <p className="text-xs uppercase text-muted-foreground">Step 1</p>
                <h2 className="text-2xl font-semibold">Who are you?</h2>
                <p className="text-sm text-muted-foreground">Choose your role to tailor the experience.</p>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowRoleGate(false)}
                aria-label="Close role selection"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            <div className="grid gap-3">
              {roles.map((role) => (
                <button
                  key={role.value}
                  type="button"
                  onClick={() => {
                    setPreferredRole(role.value);
                    setShowRoleGate(false);
                  }}
                  className="flex items-center gap-3 p-3 rounded-xl border border-border hover:border-primary/60 transition-colors text-left"
                >
                  <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center">
                    <role.icon className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold">{role.label}</p>
                    <p className="text-xs text-muted-foreground">{role.description}</p>
                  </div>
                </button>
              ))}
            </div>
            <p className="text-xs text-muted-foreground mt-3">
              Your choice helps us route you to the right dashboards. You can change it later on login/signup.
            </p>
          </GlassCard>
        </div>
      )}
      {/* Navbar */}
      <nav className="sticky top-0 z-50 glass border-b border-border/50">
        <div className="container mx-auto px-4">
          <div className="flex h-16 items-center justify-between">
            <Logo size="md" />
            <div className="flex items-center gap-4">
              <Button variant="ghost" asChild>
                <Link to="/login">Login</Link>
              </Button>
              <Button variant="gradient" asChild>
                <Link to="/signup">Get Started</Link>
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative py-20 lg:py-32 overflow-hidden">
        {/* Background decorations */}
        <div className="absolute top-20 left-10 w-72 h-72 bg-primary/20 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-accent/20 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-secondary/10 rounded-full blur-3xl" />

        <div className="container mx-auto px-4 relative">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary mb-8 animate-fade-in">
              <Zap className="h-4 w-4" />
              <span className="text-sm font-medium">AI-Powered Civic Intelligence</span>
            </div>

            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6 animate-slide-in-up">
              Predict. Prevent.{' '}
              <span className="gradient-text">Protect.</span>
            </h1>

            <p className="text-lg md:text-xl text-muted-foreground mb-10 max-w-2xl mx-auto animate-slide-in-up stagger-1">
              CivicLens helps cities predict and prevent civic failures using AI and citizen participation. 
              Transform reactive governance into proactive city management.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center animate-slide-in-up stagger-2">
              <Button variant="gradient" size="xl" asChild>
                <Link to="/signup" className="gap-2">
                  Start Reporting
                  <ArrowRight className="h-5 w-5" />
                </Link>
              </Button>
              <Button variant="glass" size="xl" asChild>
                <Link to="/login">View Demo</Link>
              </Button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-20 animate-slide-in-up stagger-3">
              {stats.map((stat, index) => (
                <div key={index} className="text-center">
                  <div className="text-3xl md:text-4xl font-bold gradient-text">{stat.value}</div>
                  <div className="text-sm text-muted-foreground mt-1">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 relative">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              How CivicLens Works
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Our AI-powered platform combines citizen reports with real-time data to 
              create actionable alerts for city authorities.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <GlassCard key={index} className="text-center animate-slide-in-up" glow={index === 0}>
                <div className="h-14 w-14 rounded-2xl gradient-primary flex items-center justify-center mx-auto mb-4">
                  <feature.icon className="h-7 w-7 text-primary-foreground" />
                </div>
                <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                <p className="text-sm text-muted-foreground">{feature.description}</p>
              </GlassCard>
            ))}
          </div>
        </div>
      </section>

      {/* Role Cards Section */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Built for Everyone
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Whether you're a citizen, government officer, or administrator, 
              CivicLens provides the right tools for your role.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Citizen Card */}
            <GlassCard className="relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full -translate-y-1/2 translate-x-1/2" />
              <Users className="h-10 w-10 text-primary mb-4" />
              <h3 className="text-xl font-semibold mb-3">Citizens</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-success" />
                  Report civic issues easily
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-success" />
                  Track your reports
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-success" />
                  Upload photos & descriptions
                </li>
              </ul>
            </GlassCard>

            {/* Officer Card */}
            <GlassCard className="relative overflow-hidden border-2 border-primary/20">
              <div className="absolute top-0 right-0 w-32 h-32 bg-secondary/10 rounded-full -translate-y-1/2 translate-x-1/2" />
              <Building2 className="h-10 w-10 text-secondary mb-4" />
              <h3 className="text-xl font-semibold mb-3">Government Officers</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-success" />
                  Real-time alert dashboard
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-success" />
                  AI-powered early warnings
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-success" />
                  Quick action notifications
                </li>
              </ul>
            </GlassCard>

            {/* Admin Card */}
            <GlassCard className="relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-accent/10 rounded-full -translate-y-1/2 translate-x-1/2" />
              <TrendingUp className="h-10 w-10 text-accent mb-4" />
              <h3 className="text-xl font-semibold mb-3">Administrators</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-success" />
                  Platform-wide analytics
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-success" />
                  User management
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-success" />
                  Authority escalation mapping
                </li>
              </ul>
            </GlassCard>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 relative overflow-hidden">
        <div className="absolute inset-0 gradient-hero opacity-5" />
        <div className="container mx-auto px-4 relative">
          <GlassCard className="max-w-4xl mx-auto text-center py-12" glow>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Ready to Transform Your City?
            </h2>
            <p className="text-muted-foreground mb-8 max-w-xl mx-auto">
              Join thousands of citizens and government officials using CivicLens 
              to build smarter, safer cities.
            </p>
            <Button variant="gradient" size="xl" asChild>
              <Link to="/signup" className="gap-2">
                Get Started Free
                <ArrowRight className="h-5 w-5" />
              </Link>
            </Button>
          </GlassCard>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 border-t border-border/50">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <Logo size="sm" />
            <p className="text-sm text-muted-foreground">
              © 2024 CivicLens. Built for smarter cities.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
