import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Navbar } from '@/components/Navbar';
import { GlassCard } from '@/components/GlassCard';
import { Button } from '@/components/ui/button';
import { IssueTypeIcon } from '@/components/IssueTypeIcon';
import { IssueType } from '@/lib/mockData';
import { getMyReports, CitizenReport } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { Loader2, MapPin, Clock, FileText, RefreshCw } from 'lucide-react';

export default function MyReports() {
  const { user } = useAuth();
  const { toast: showToast } = useToast();
  const [myReports, setMyReports] = useState<CitizenReport[]>([]);
  const [reportsLoading, setReportsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    async function fetchReports() {
      if (!user?.email) {
        setReportsLoading(false);
        return;
      }
      try {
        const data = await getMyReports(user.email);
        setMyReports(data.reports);
      } catch (error) {
        showToast({
          title: 'Error',
          description: 'Failed to load your reports',
          variant: 'destructive',
        });
      } finally {
        setReportsLoading(false);
      }
    }

    fetchReports();

    // Set up auto-refresh every 30 seconds to get live updates from officers
    const refreshInterval = setInterval(fetchReports, 30000);

    return () => clearInterval(refreshInterval);
  }, [user?.email, showToast]);

  const handleRefresh = async () => {
    if (!user?.email) return;

    setRefreshing(true);
    try {
      const data = await getMyReports(user.email);
      setMyReports(data.reports);
      showToast({
        title: 'Refreshed',
        description: 'Your reports have been updated with the latest status',
      });
    } catch (error) {
      showToast({
        title: 'Error',
        description: 'Failed to refresh reports',
        variant: 'destructive',
      });
    } finally {
      setRefreshing(false);
    }
  };

  return (
    <div className="min-h-screen bg-background bg-hero-pattern">
      <Navbar />

      <main className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8 animate-slide-in-up">
          <h1 className="text-3xl font-bold mb-2">
            <span className="gradient-text">My Reports</span>
          </h1>
          <p className="text-muted-foreground">
            View all your submitted civic issue reports and their current status.
          </p>
        </div>

        {/* Reports List */}
        <GlassCard className="animate-slide-in-up">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold">Your Reports</h2>
            <Button
              size="sm"
              variant="outline"
              onClick={handleRefresh}
              disabled={refreshing}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
              {refreshing ? 'Refreshing...' : 'Refresh'}
            </Button>
          </div>
          {reportsLoading ? (
            <div className="flex items-center gap-3 text-muted-foreground">
              <Loader2 className="h-5 w-5 animate-spin" />
              <span>Loading your reports...</span>
            </div>
          ) : myReports.length > 0 ? (
            <div className="space-y-4">
              {myReports.map((report, index) => (
                <div
                  key={report.id}
                  className={cn(
                    'flex items-start gap-4 p-4 rounded-xl bg-muted/30 hover:bg-muted/50 transition-colors',
                    `animate-slide-in-up stagger-${index + 1}`
                  )}
                >
                  <IssueTypeIcon type={report.issue_type as IssueType} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-medium truncate">{report.issue_type} Issue</h3>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        report.status === 'submitted' ? 'bg-blue-100 text-blue-800' :
                        report.status === 'in-progress' ? 'bg-yellow-100 text-yellow-800' :
                        report.status === 'resolved' ? 'bg-green-100 text-green-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {report.status}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground line-clamp-2 mb-2">{report.description}</p>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        {report.location}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {new Date(report.submitted_at).toLocaleDateString()}
                      </span>
                    </div>
                    {report.image_url && (
                      <div className="mt-3">
                        <img 
                          src={report.image_url} 
                          alt="Report evidence" 
                          className="w-32 h-32 object-cover rounded-lg border border-border"
                        />
                      </div>
                    )}
                    {report.officer_notes && (
                      <div className="mt-3 p-3 rounded-lg bg-muted/50 text-xs">
                        <p className="font-medium mb-1">Officer Notes:</p>
                        <p className="text-muted-foreground">{report.officer_notes}</p>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
              <h3 className="text-lg font-medium mb-2">No reports yet</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Submit your first report from the dashboard to get started.
              </p>
            </div>
          )}
        </GlassCard>

        {/* Stats Summary */}
        {myReports.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
            <GlassCard className="animate-slide-in-up stagger-1">
              <div className="text-center">
                <div className="text-3xl font-bold gradient-text mb-2">
                  {myReports.length}
                </div>
                <div className="text-sm text-muted-foreground">Total Reports</div>
              </div>
            </GlassCard>
            <GlassCard className="animate-slide-in-up stagger-2">
              <div className="text-center">
                <div className="text-3xl font-bold gradient-text mb-2">
                  {myReports.filter(r => r.status === 'in-progress').length}
                </div>
                <div className="text-sm text-muted-foreground">In Progress</div>
              </div>
            </GlassCard>
            <GlassCard className="animate-slide-in-up stagger-3">
              <div className="text-center">
                <div className="text-3xl font-bold gradient-text mb-2">
                  {myReports.filter(r => r.status === 'resolved').length}
                </div>
                <div className="text-sm text-muted-foreground">Resolved</div>
              </div>
            </GlassCard>
          </div>
        )}
      </main>
    </div>
  );
}
