import { useAuth } from '@/contexts/AuthContext';
import { Navbar } from '@/components/Navbar';
import { GlassCard } from '@/components/GlassCard';
import { AlertBadge } from '@/components/StatusBadge';
import {
  mockPlatformMetrics,
  mockActivityTimeline,
  mockUsers,
  mockAlerts,
} from '@/lib/mockData';
import {
  FileText,
  AlertTriangle,
  AlertCircle,
  Clock,
  Users,
  TrendingUp,
  ArrowUpRight,
  Activity,
  Shield,
  Settings,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

export default function AdminDashboard() {
  const { user } = useAuth();

  const metrics = [
    {
      label: 'Total Reports',
      value: mockPlatformMetrics.totalReports.toLocaleString(),
      icon: FileText,
      color: 'text-primary',
      bgColor: 'bg-primary/10',
    },
    {
      label: 'Active Alerts',
      value: mockPlatformMetrics.activeAlerts,
      icon: AlertTriangle,
      color: 'text-warning',
      bgColor: 'bg-warning/10',
    },
    {
      label: 'Critical Alerts',
      value: mockPlatformMetrics.criticalAlerts,
      icon: AlertCircle,
      color: 'text-destructive',
      bgColor: 'bg-destructive/10',
    },
    {
      label: 'Avg Response',
      value: mockPlatformMetrics.avgResponseTime,
      icon: Clock,
      color: 'text-secondary',
      bgColor: 'bg-secondary/10',
    },
  ];

  const roleIcons = {
    citizen: Users,
    officer: Shield,
    admin: Settings,
  };

  return (
    <div className="min-h-screen bg-background bg-hero-pattern">
      <Navbar />

      <main className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8 animate-slide-in-up">
          <div>
            <h1 className="text-3xl font-bold mb-2">
              Admin Dashboard
            </h1>
            <p className="text-muted-foreground">
              Platform overview and system management
            </p>
          </div>
          <Button variant="gradient" asChild className="mt-4 md:mt-0">
            <Link to="/alerts" className="gap-2">
              <AlertTriangle className="h-4 w-4" />
              View Alert Engine
            </Link>
          </Button>
        </div>

        {/* Metrics Cards */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {metrics.map((metric, index) => (
            <GlassCard
              key={metric.label}
              className={cn('animate-slide-in-up', `stagger-${index + 1}`)}
            >
              <div className="flex items-center justify-between mb-4">
                <div className={cn('h-12 w-12 rounded-xl flex items-center justify-center', metric.bgColor)}>
                  <metric.icon className={cn('h-6 w-6', metric.color)} />
                </div>
                <ArrowUpRight className="h-4 w-4 text-success" />
              </div>
              <h3 className="text-sm text-muted-foreground mb-1">{metric.label}</h3>
              <div className="text-2xl font-bold">{metric.value}</div>
            </GlassCard>
          ))}
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Activity Timeline */}
          <div className="lg:col-span-2 space-y-6">
            <GlassCard className="animate-slide-in-up stagger-5">
              <div className="flex items-center gap-3 mb-6">
                <div className="h-12 w-12 rounded-xl gradient-primary flex items-center justify-center">
                  <Activity className="h-6 w-6 text-primary-foreground" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold">System Activity</h2>
                  <p className="text-sm text-muted-foreground">Recent platform events</p>
                </div>
              </div>

              <div className="space-y-4">
                {mockActivityTimeline.map((activity, index) => (
                  <div
                    key={index}
                    className={cn(
                      'flex items-start gap-4 p-4 rounded-xl bg-muted/30 hover:bg-muted/50 transition-colors',
                      `animate-slide-in-up stagger-${index + 1}`
                    )}
                  >
                    <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                      <Clock className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-medium">{activity.action}</h4>
                        <span className="text-xs text-muted-foreground">{activity.time}</span>
                      </div>
                      <p className="text-sm text-muted-foreground">{activity.details}</p>
                    </div>
                  </div>
                ))}
              </div>
            </GlassCard>

            {/* Authority Escalation Preview */}
            <GlassCard className="animate-slide-in-up">
              <div className="flex items-center gap-3 mb-6">
                <div className="h-12 w-12 rounded-xl bg-accent/10 flex items-center justify-center">
                  <TrendingUp className="h-6 w-6 text-accent" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold">Escalation Mapping</h2>
                  <p className="text-sm text-muted-foreground">Current authority assignments</p>
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                {mockAlerts.slice(0, 4).map((alert, index) => (
                  <div
                    key={alert.id}
                    className="p-4 rounded-xl border border-border/50 hover:border-primary/50 transition-colors"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium capitalize">{alert.issueType}</span>
                      <AlertBadge level={alert.alertLevel} />
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">{alert.area}</p>
                    <div className="text-xs text-primary font-medium">
                      → {alert.escalatedAuthority}
                    </div>
                  </div>
                ))}
              </div>
            </GlassCard>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Performance Card */}
            <GlassCard className="animate-slide-in-up stagger-2" glow>
              <h3 className="font-semibold mb-4">Platform Health</h3>
              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between text-sm mb-2">
                    <span className="text-muted-foreground">Citizen Satisfaction</span>
                    <span className="font-medium text-success">{mockPlatformMetrics.citizenSatisfaction}</span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div className="h-full bg-success rounded-full" style={{ width: '87%' }} />
                  </div>
                </div>
                <div>
                  <div className="flex items-center justify-between text-sm mb-2">
                    <span className="text-muted-foreground">Resolved Today</span>
                    <span className="font-medium">{mockPlatformMetrics.resolvedToday}</span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div className="h-full gradient-primary rounded-full" style={{ width: '65%' }} />
                  </div>
                </div>
              </div>
            </GlassCard>

            {/* User Management Preview */}
            <GlassCard className="animate-slide-in-up stagger-3">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold">User Roles</h3>
                <span className="text-xs text-muted-foreground">{mockUsers.length} users</span>
              </div>

              <div className="space-y-3">
                {mockUsers.map((mockUser, index) => {
                  const RoleIcon = roleIcons[mockUser.role];
                  return (
                    <div
                      key={mockUser.id}
                      className="flex items-center gap-3 p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
                    >
                      <div className="h-10 w-10 rounded-full gradient-primary flex items-center justify-center">
                        <span className="text-sm font-medium text-primary-foreground">
                          {mockUser.name.charAt(0)}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{mockUser.name}</p>
                        <p className="text-xs text-muted-foreground truncate">{mockUser.email}</p>
                      </div>
                      <div className="flex items-center gap-1 px-2 py-1 rounded-md bg-muted text-xs capitalize">
                        <RoleIcon className="h-3 w-3" />
                        {mockUser.role}
                      </div>
                    </div>
                  );
                })}
              </div>
            </GlassCard>
          </div>
        </div>
      </main>
    </div>
  );
}
