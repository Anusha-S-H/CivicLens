import { useState, useEffect } from 'react';
import { Navbar } from '@/components/Navbar';
import { GlassCard } from '@/components/GlassCard';
import { AlertBadge } from '@/components/StatusBadge';
import { IssueTypeIcon } from '@/components/IssueTypeIcon';
import { mockAlerts, issueTypeConfig, CivicAlert } from '@/lib/mockData';
import {
  AlertTriangle,
  Newspaper,
  Users,
  Zap,
  ChevronRight,
  Brain,
  ArrowRight,
  Lightbulb,
  Target,
  Video,
  Loader2,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface LiveSignal {
  type: 'news' | 'video' | 'citizen';
  source: string;
  title: string;
  time: string;
  image?: string;
  url?: string;
}

export default function AlertEngine() {
  const [selectedAlert, setSelectedAlert] = useState<CivicAlert | null>(mockAlerts[0]);
  const [liveSignals, setLiveSignals] = useState<LiveSignal[]>([]);
  const [loading, setLoading] = useState(false);

  // Fetch live real-time data on component mount and when selectedAlert changes
  useEffect(() => {
    if (selectedAlert) {
      fetchLiveData(selectedAlert.issueType);
    }
  }, [selectedAlert]);

  const fetchLiveData = async (issueType: string) => {
    setLoading(true);
    try {
      const response = await fetch(
        `http://localhost:5000/api/civic-live?issue_type=${issueType}&location=India`
      );
      const data = await response.json();

      const signals: LiveSignal[] = [];

      // Add news articles
      if (data.articles) {
        data.articles.forEach((article: any) => {
          signals.push({
            type: 'news',
            source: article.source || 'News Source',
            title: article.title,
            time: new Date(article.publishedAt).toLocaleTimeString('en-US', {
              year: 'numeric',
              month: 'short',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            }),
            image: article.image,
            url: article.url,
          });
        });
      }

      // Add videos
      if (data.videos) {
        data.videos.forEach((video: any) => {
          signals.push({
            type: 'video',
            source: 'YouTube',
            title: video.title,
            time: new Date(video.publishedAt).toLocaleTimeString('en-US', {
              year: 'numeric',
              month: 'short',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            }),
            image: video.thumbnail,
            url: video.url,
          });
        });
      }

      // Sort by newest first and take top 10
      setLiveSignals(signals.slice(0, 10));
    } catch (error) {
      console.error('Error fetching live data:', error);
      // Fallback to mock data
      setLiveSignals([
        { type: 'news', source: 'City Times', title: 'Heavy rainfall causes road damage in Central District', time: '2 min ago' },
        { type: 'citizen', source: 'Citizen Report #1247', title: 'Large pothole on MG Road near metro', time: '5 min ago' },
        { type: 'video', source: 'YouTube', title: 'Road Safety Crisis: Infrastructure Update', time: '8 min ago' },
        { type: 'news', source: 'Daily Express', title: 'Water main burst affects East Zone residents', time: '12 min ago' },
        { type: 'citizen', source: 'Citizen Report #1245', title: 'No water supply since morning', time: '15 min ago' },
      ]);
    } finally {
      setLoading(false);
    }
  };

  // Simulated incoming signals fallback
  const incomingSignals = liveSignals.length > 0 ? liveSignals : [
    { type: 'news', source: 'City Times', title: 'Heavy rainfall causes road damage in Central District', time: '2 min ago' },
    { type: 'citizen', source: 'Citizen Report #1247', title: 'Large pothole on MG Road near metro', time: '5 min ago' },
    { type: 'citizen', source: 'Citizen Report #1246', title: 'Road cave-in near Sector 15', time: '8 min ago' },
    { type: 'news', source: 'Daily Express', title: 'Water main burst affects East Zone residents', time: '12 min ago' },
    { type: 'citizen', source: 'Citizen Report #1245', title: 'No water supply since morning', time: '15 min ago' },
    { type: 'citizen', source: 'Citizen Report #1244', title: 'Garbage overflow in Green Park', time: '20 min ago' },
  ];

  return (
    <div className="min-h-screen bg-background bg-hero-pattern">
      <Navbar />

      <main className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8 animate-slide-in-up">
          <div className="h-14 w-14 rounded-2xl gradient-primary flex items-center justify-center shadow-glow">
            <Brain className="h-7 w-7 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">AI Civic Alert Engine</h1>
            <p className="text-muted-foreground">Real-time analysis of civic signals from News & Videos</p>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Left Panel - Incoming Signals */}
          <div className="space-y-6">
            <GlassCard className="animate-slide-in-up stagger-1">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
                    <Target className="h-5 w-5 text-primary" />
                  </div>
                  <h2 className="text-xl font-semibold">Live Signals</h2>
                </div>
                <span className="flex items-center gap-1 px-3 py-1 rounded-full bg-success/10 text-success text-xs font-medium">
                  <span className="h-2 w-2 rounded-full bg-success animate-pulse" />
                  {loading ? 'Updating...' : 'Live'}
                </span>
              </div>

              {loading && (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-5 w-5 animate-spin text-primary" />
                </div>
              )}

              <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2">
                {incomingSignals.map((signal, index) => (
                  <a
                    key={index}
                    href={signal.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={cn(
                      'flex items-start gap-3 p-4 rounded-xl border border-border/50 hover:border-primary/50 hover:bg-muted/30 transition-all cursor-pointer',
                      `animate-slide-in-up stagger-${(index % 5) + 1}`
                    )}
                  >
                    <div className={cn(
                      'h-10 w-10 rounded-lg flex items-center justify-center shrink-0',
                      signal.type === 'news' ? 'bg-accent/10' : signal.type === 'video' ? 'bg-orange-500/10' : 'bg-primary/10'
                    )}>
                      {signal.type === 'news' ? (
                        <Newspaper className="h-5 w-5 text-accent" />
                      ) : signal.type === 'video' ? (
                        <Video className="h-5 w-5 text-orange-500" />
                      ) : (
                        <Users className="h-5 w-5 text-primary" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs text-muted-foreground">{signal.source}</span>
                        <span className="text-xs text-muted-foreground">•</span>
                        <span className="text-xs text-muted-foreground">{signal.time}</span>
                      </div>
                      <p className="text-sm font-medium line-clamp-2">{signal.title}</p>
                    </div>
                    <ChevronRight className="h-5 w-5 text-muted-foreground shrink-0" />
                  </a>
                ))}
              </div>
            </GlassCard>
          </div>

          {/* Right Panel - Alert Decision */}
          <div className="space-y-6">
            {/* Active Alerts */}
            <GlassCard className="animate-slide-in-up stagger-2">
              <h3 className="font-semibold mb-4">Select Alert to Analyze</h3>
              <div className="flex flex-wrap gap-2">
                {mockAlerts.map((alert) => (
                  <button
                    key={alert.id}
                    onClick={() => setSelectedAlert(alert)}
                    className={cn(
                      'flex items-center gap-2 px-3 py-2 rounded-lg border transition-all',
                      selectedAlert?.id === alert.id
                        ? 'border-primary bg-primary/5 shadow-glow'
                        : 'border-border hover:border-primary/50'
                    )}
                  >
                    <IssueTypeIcon type={alert.issueType} size="sm" />
                    <span className="text-sm font-medium">{alert.area}</span>
                  </button>
                ))}
              </div>
            </GlassCard>

            {selectedAlert && (
              <>
                {/* Alert Decision Card */}
                <GlassCard className={cn(
                  'animate-slide-in-up stagger-3',
                  selectedAlert.alertLevel === 'critical' && 'border-2 border-destructive/50 animate-glow'
                )}>
                  {selectedAlert.quickActionRequired && (
                    <div className="flex items-center gap-2 px-4 py-2 mb-4 -mx-6 -mt-6 rounded-t-xl bg-destructive text-destructive-foreground">
                      <Zap className="h-4 w-4" />
                      <span className="text-sm font-medium">Quick Action Required</span>
                    </div>
                  )}

                  <div className="flex items-center gap-4 mb-6">
                    <IssueTypeIcon type={selectedAlert.issueType} size="lg" />
                    <div className="flex-1">
                      <h2 className="text-xl font-semibold mb-1">
                        {issueTypeConfig[selectedAlert.issueType].label} Alert
                      </h2>
                      <p className="text-muted-foreground">{selectedAlert.area}</p>
                    </div>
                    <AlertBadge level={selectedAlert.alertLevel} pulse={selectedAlert.alertLevel === 'critical'} />
                  </div>

                  <div className="grid gap-4 mb-6">
                    <div className="p-4 rounded-xl bg-muted/30">
                      <p className="text-sm text-muted-foreground mb-1">Signal Sources</p>
                      <div className="flex flex-wrap gap-2">
                        {selectedAlert.signalSource.map((source, i) => (
                          <span
                            key={i}
                            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-background text-sm font-medium"
                          >
                            {source.includes('News') ? (
                              <Newspaper className="h-4 w-4 text-accent" />
                            ) : (
                              <Users className="h-4 w-4 text-primary" />
                            )}
                            {source}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="flex items-center gap-3 p-4 rounded-xl bg-primary/5 border border-primary/20">
                      <ArrowRight className="h-5 w-5 text-primary" />
                      <div>
                        <p className="text-sm text-muted-foreground">Escalated To</p>
                        <p className="font-semibold text-primary">{selectedAlert.escalatedAuthority}</p>
                      </div>
                    </div>
                  </div>

                  <p className="text-sm text-muted-foreground">{selectedAlert.description}</p>
                </GlassCard>

                {/* AI Explanation */}
                <GlassCard className="animate-slide-in-up stagger-4">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="h-10 w-10 rounded-xl bg-accent/10 flex items-center justify-center">
                      <Lightbulb className="h-5 w-5 text-accent" />
                    </div>
                    <h3 className="font-semibold">AI Analysis</h3>
                  </div>

                  <div className="space-y-3 text-sm">
                    <p className="text-muted-foreground">
                      <span className="font-medium text-foreground">Pattern Detected:</span> Multiple reports 
                      in the same area within a short timeframe indicate a developing situation.
                    </p>
                    <p className="text-muted-foreground">
                      <span className="font-medium text-foreground">Alert Level Rationale:</span> The combination 
                      of {selectedAlert.signalSource.length} signal sources and {selectedAlert.alertLevel === 'critical' ? 'high' : 'moderate'} 
                      {' '}citizen report volume triggered the {selectedAlert.alertLevel} alert status.
                    </p>
                    <p className="text-muted-foreground">
                      <span className="font-medium text-foreground">Recommendation:</span> 
                      {selectedAlert.quickActionRequired 
                        ? ' Immediate dispatch of response teams advised to prevent further escalation.'
                        : ' Continue monitoring. Situation currently under control.'}
                    </p>
                  </div>
                </GlassCard>
              </>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
