import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Navbar } from '@/components/Navbar';
import { GlassCard } from '@/components/GlassCard';
import { AlertBadge } from '@/components/StatusBadge';
import { IssueTypeIcon } from '@/components/IssueTypeIcon';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  mockAlerts,
  mockAlertSummaries,
  issueTypeConfig,
  alertLevelConfig,
  AlertLevel,
} from '@/lib/mockData';
import {
  getDistrictVulnerability,
  getVulnerabilityDistricts,
  getSchemes,
  getKisanAnalysis,
  getMgnregaAnalysis,
  getScholarshipAnalysis,
  getAllReports,
  updateReportStatus,
  CitizenReport,
  VulnerabilityResponse,
  Scheme,
  SchemesResponse,
  SchemeAnalysisData,
} from '@/lib/api';
import {
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  Minus,
  Zap,
  Newspaper,
  Users,
  Clock,
  Shield,
  Loader2,
  BookOpen,
  CheckCircle2,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

export default function OfficerDashboard() {
  const { user } = useAuth();
  const { toast } = useToast();

  const [vDistricts, setVDistricts] = useState<string[]>([]);
  const [selectedVDistrict, setSelectedVDistrict] = useState('');
  const [vData, setVData] = useState<VulnerabilityResponse | null>(null);
  const [vLoading, setVLoading] = useState(false);
  const [vLoadingDistricts, setVLoadingDistricts] = useState(true);

  const [schemes, setSchemes] = useState<Scheme[]>([]);
  const [schemsLoading, setSchemesLoading] = useState(true);

  const [kisanData, setKisanData] = useState<SchemeAnalysisData | null>(null);
  const [mgnregaData, setMgnregaData] = useState<SchemeAnalysisData | null>(null);
  const [scholarshipData, setScholarshipData] = useState<SchemeAnalysisData | null>(null);
  const [analysisLoading, setAnalysisLoading] = useState(true);

  const [citizenReports, setCitizenReports] = useState<CitizenReport[]>([]);
  const [reportsLoading, setReportsLoading] = useState(true);

  // Status update dialog state
  const [updateDialogOpen, setUpdateDialogOpen] = useState(false);
  const [selectedReport, setSelectedReport] = useState<CitizenReport | null>(null);
  const [newStatus, setNewStatus] = useState('');
  const [officerNotes, setOfficerNotes] = useState('');
  const [updating, setUpdating] = useState(false);

  const getTrendIcon = (trend: 'up' | 'down' | 'stable') => {
    switch (trend) {
      case 'up':
        return <TrendingUp className="h-4 w-4 text-destructive" />;
      case 'down':
        return <TrendingDown className="h-4 w-4 text-success" />;
      default:
        return <Minus className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getAlertLevelGlow = (level: AlertLevel) => {
    switch (level) {
      case 'critical':
        return 'animate-glow border-destructive/50';
      case 'high':
        return 'border-orange-500/50';
      default:
        return '';
    }
  };

  const getVulnerabilityLevelStyles = (level: string) => {
    const normalized = level.toLowerCase();
    if (normalized === 'high') return 'bg-destructive/10 text-destructive border border-destructive/30';
    if (normalized === 'moderate') return 'bg-amber-100 text-amber-800 border border-amber-200';
    return 'bg-emerald-100 text-emerald-800 border border-emerald-200';
  };

  useEffect(() => {
    async function fetchDistricts() {
      try {
        const data = await getVulnerabilityDistricts();
        setVDistricts(data.districts);
      } catch (error) {
        toast({
          title: 'Error',
          description: 'Failed to load vulnerability districts',
          variant: 'destructive',
        });
      } finally {
        setVLoadingDistricts(false);
      }
    }
    fetchDistricts();
  }, [toast]);

  useEffect(() => {
    if (!selectedVDistrict) {
      setVData(null);
      return;
    }

    async function fetchData() {
      setVLoading(true);
      try {
        const data = await getDistrictVulnerability(selectedVDistrict);
        setVData(data);
      } catch (error) {
        toast({
          title: 'Error',
          description: 'Failed to load vulnerability profile',
          variant: 'destructive',
        });
      } finally {
        setVLoading(false);
      }
    }

    fetchData();
  }, [selectedVDistrict, toast]);

  useEffect(() => {
    async function fetchSchemes() {
      try {
        const data = await getSchemes();
        setSchemes(data.schemes);
      } catch (error) {
        toast({
          title: 'Error',
          description: 'Failed to load schemes',
          variant: 'destructive',
        });
      } finally {
        setSchemesLoading(false);
      }
    }
    fetchSchemes();
  }, [toast]);

  useEffect(() => {
    async function fetchAnalyses() {
      try {
        const [kisan, mgnrega, scholarship] = await Promise.all([
          getKisanAnalysis(),
          getMgnregaAnalysis(),
          getScholarshipAnalysis(),
        ]);
        setKisanData(kisan);
        setMgnregaData(mgnrega);
        setScholarshipData(scholarship);
      } catch (error) {
        toast({
          title: 'Error',
          description: 'Failed to load scheme analyses',
          variant: 'destructive',
        });
      } finally {
        setAnalysisLoading(false);
      }
    }
    fetchAnalyses();
  }, [toast]);

  useEffect(() => {
    async function fetchReports() {
      try {
        const data = await getAllReports();
        setCitizenReports(data.reports);
      } catch (error) {
        toast({
          title: 'Error',
          description: 'Failed to load citizen reports',
          variant: 'destructive',
        });
      } finally {
        setReportsLoading(false);
      }
    }
    fetchReports();
  }, [toast]);

  const handleOpenUpdateDialog = (report: CitizenReport) => {
    setSelectedReport(report);
    setNewStatus(report.status);
    setOfficerNotes(report.officer_notes || '');
    setUpdateDialogOpen(true);
  };

  const handleUpdateStatus = async () => {
    if (!selectedReport) return;

    setUpdating(true);
    try {
      await updateReportStatus(selectedReport.id, newStatus, officerNotes);
      
      // Refresh reports
      const data = await getAllReports();
      setCitizenReports(data.reports);

      toast({
        title: 'Success',
        description: 'Report status updated successfully',
      });

      setUpdateDialogOpen(false);
      setSelectedReport(null);
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to update report status',
        variant: 'destructive',
      });
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div className="min-h-screen bg-background bg-hero-pattern">
      <Navbar />

      <main className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8 animate-slide-in-up">
          <div>
            <h1 className="text-3xl font-bold mb-2">
              Alert Dashboard
            </h1>
            <p className="text-muted-foreground">
              Monitor civic alerts and take quick action
            </p>
          </div>
          <div className="flex items-center gap-2 mt-4 md:mt-0 text-sm text-muted-foreground">
            <Clock className="h-4 w-4" />
            Last updated: Just now
          </div>
        </div>

        {/* Alert Summary Cards */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {mockAlertSummaries.map((summary, index) => (
            <GlassCard
              key={summary.type}
              className={cn(
                'animate-slide-in-up',
                `stagger-${index + 1}`,
                getAlertLevelGlow(summary.alertLevel)
              )}
            >
              <div className="flex items-center justify-between mb-4">
                <IssueTypeIcon type={summary.type} size="lg" />
                <AlertBadge level={summary.alertLevel} pulse={summary.alertLevel === 'critical'} />
              </div>
              <h3 className="text-lg font-semibold mb-1">
                {issueTypeConfig[summary.type].label}
              </h3>
              <div className="flex items-center justify-between">
                <span className="text-2xl font-bold">{summary.count}</span>
                <div className="flex items-center gap-1">
                  {getTrendIcon(summary.trend)}
                  <span className="text-xs text-muted-foreground capitalize">{summary.trend}</span>
                </div>
              </div>
            </GlassCard>
          ))}
        </div>

        {/* Alerts Table */}
        <GlassCard className="animate-slide-in-up stagger-5">
          <div className="flex items-center gap-3 mb-6">
            <div className="h-12 w-12 rounded-xl gradient-primary flex items-center justify-center">
              <AlertTriangle className="h-6 w-6 text-primary-foreground" />
            </div>
            <div>
              <h2 className="text-xl font-semibold">Live Civic Alerts</h2>
              <p className="text-sm text-muted-foreground">AI-detected issues requiring attention</p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border/50">
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Type</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Area</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Level</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Signal Source</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Escalated To</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Action</th>
                </tr>
              </thead>
              <tbody>
                {mockAlerts.map((alert, index) => (
                  <tr
                    key={alert.id}
                    className={cn(
                      'border-b border-border/50 hover:bg-muted/30 transition-colors',
                      alert.quickActionRequired && 'bg-destructive/5',
                      `animate-slide-in-up stagger-${index + 1}`
                    )}
                  >
                    <td className="py-4 px-4">
                      <IssueTypeIcon type={alert.issueType} showLabel />
                    </td>
                    <td className="py-4 px-4 font-medium">{alert.area}</td>
                    <td className="py-4 px-4">
                      <AlertBadge level={alert.alertLevel} pulse={alert.alertLevel === 'critical'} />
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex flex-wrap gap-2">
                        {alert.signalSource.map((source, i) => (
                          <span
                            key={i}
                            className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-muted text-xs"
                          >
                            {source.includes('News') ? (
                              <Newspaper className="h-3 w-3" />
                            ) : (
                              <Users className="h-3 w-3" />
                            )}
                            {source}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="py-4 px-4 text-sm">{alert.escalatedAuthority}</td>
                    <td className="py-4 px-4">
                      {alert.quickActionRequired && (
                        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-destructive text-destructive-foreground text-xs font-medium animate-pulse">
                          <Zap className="h-3 w-3" />
                          Quick Action
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </GlassCard>

        {/* Citizen Reports Section */}
        <GlassCard className="mt-8 animate-slide-in-up stagger-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="h-12 w-12 rounded-xl bg-purple-500/10 flex items-center justify-center">
              <Users className="h-6 w-6 text-purple-500" />
            </div>
            <div>
              <h2 className="text-xl font-semibold">Citizen Reports</h2>
              <p className="text-sm text-muted-foreground">Submitted issues from citizens with contact information</p>
            </div>
          </div>

          {reportsLoading ? (
            <div className="flex items-center gap-3 text-muted-foreground">
              <Loader2 className="h-5 w-5 animate-spin" />
              <span>Loading citizen reports...</span>
            </div>
          ) : citizenReports.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border/50">
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Issue Type</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Location</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Citizen Name</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Email</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Status</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Date</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {citizenReports.map((report) => (
                    <tr
                      key={report.id}
                      className="border-b border-border/50 hover:bg-muted/30 transition-colors"
                    >
                      <td className="py-4 px-4">
                        <IssueTypeIcon type={report.issue_type as any} showLabel />
                      </td>
                      <td className="py-4 px-4 text-sm">{report.location}</td>
                      <td className="py-4 px-4 font-medium text-sm">{report.citizen_name}</td>
                      <td className="py-4 px-4 text-sm">
                        <a href={`mailto:${report.citizen_email}`} className="text-primary hover:underline">
                          {report.citizen_email}
                        </a>
                      </td>
                      <td className="py-4 px-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          report.status === 'submitted' ? 'bg-blue-100 text-blue-800' :
                          report.status === 'in-progress' ? 'bg-yellow-100 text-yellow-800' :
                          report.status === 'resolved' ? 'bg-green-100 text-green-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {report.status}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-sm text-muted-foreground">
                        {new Date(report.submitted_at).toLocaleDateString()}
                      </td>
                      <td className="py-4 px-4">
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => handleOpenUpdateDialog(report)}
                        >
                          Update
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="mt-4 p-4 bg-muted/30 rounded-lg">
                <p className="text-sm text-muted-foreground">
                  <span className="font-semibold">{citizenReports.length}</span> total reports
                </p>
              </div>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">No citizen reports yet.</p>
          )}
        </GlassCard>

        <GlassCard className="mt-8 animate-slide-in-up stagger-7">
          <div className="flex flex-col gap-4 mb-4">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-xl font-semibold">District Vulnerability</h2>
                <p className="text-sm text-muted-foreground">Review vulnerability profile by district</p>
              </div>
              <Select
                value={selectedVDistrict}
                onValueChange={(value) => setSelectedVDistrict(value)}
                disabled={vLoadingDistricts}
              >
                <SelectTrigger className="w-[240px]">
                  <SelectValue placeholder={vLoadingDistricts ? 'Loading districts...' : 'Choose a district...'} />
                </SelectTrigger>
                <SelectContent>
                  {vDistricts.map((district) => (
                    <SelectItem key={district} value={district}>
                      {district}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {vLoading ? (
            <div className="flex items-center gap-3 text-muted-foreground">
              <Loader2 className="h-5 w-5 animate-spin" />
              <span>Loading vulnerability profile...</span>
            </div>
          ) : vData ? (
            <div className="grid md:grid-cols-2 gap-4">
              <div className="p-4 rounded-lg bg-muted/40 border border-border/50">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <p className="text-sm text-muted-foreground">Vulnerability Level</p>
                    <p className="text-2xl font-semibold capitalize">{vData.vulnerability_level}</p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${getVulnerabilityLevelStyles(vData.vulnerability_level)}`}>
                    {vData.vulnerability_level}
                  </span>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Composite Score</p>
                  <p className="text-3xl font-bold">{(vData.vulnerability_score * 100).toFixed(0)}</p>
                  <p className="text-xs text-muted-foreground">0-100 scale (higher = more vulnerable)</p>
                </div>
              </div>

              <div className="p-4 rounded-lg bg-muted/40 border border-border/50">
                <p className="text-sm text-muted-foreground mb-2">Key Drivers</p>
                <ul className="space-y-2 text-sm">
                  {vData.drivers.map((driver, index) => (
                    <li key={index} className="flex items-center gap-2">
                      <span className="h-5 w-5 rounded-full bg-primary/10 text-primary text-xs font-semibold flex items-center justify-center">
                        {index + 1}
                      </span>
                      <span>{driver}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="md:col-span-2 p-4 rounded-lg bg-muted/20 border border-border/50">
                <p className="text-sm text-muted-foreground mb-2">Interpretation</p>
                <p className="text-sm leading-relaxed">{vData.interpretation}</p>
              </div>
            </div>
          ) : (
            <div className="text-sm text-muted-foreground">
              Select a district to view its vulnerability profile.
            </div>
          )}
        </GlassCard>

        <GlassCard className="mt-8 animate-slide-in-up stagger-7">
          <div className="flex items-center gap-3 mb-6">
            <div className="h-12 w-12 rounded-xl bg-amber-500/10 flex items-center justify-center">
              <BookOpen className="h-6 w-6 text-amber-500" />
            </div>
            <div>
              <h2 className="text-xl font-semibold">Central Government Schemes</h2>
              <p className="text-sm text-muted-foreground">All available welfare schemes and eligibility info</p>
            </div>
          </div>

          {schemsLoading ? (
            <div className="flex items-center gap-3 text-muted-foreground">
              <Loader2 className="h-5 w-5 animate-spin" />
              <span>Loading schemes...</span>
            </div>
          ) : schemes.length > 0 ? (
            <div className="grid md:grid-cols-2 gap-4">
              {schemes.map((scheme, index) => (
                <div key={scheme.name} className="p-4 rounded-lg border border-border/50 hover:border-primary/50 transition-colors hover-lift">
                  <div className="flex items-start gap-3 mb-3">
                    <div className="h-9 w-9 rounded-lg bg-amber-500/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <CheckCircle2 className="h-5 w-5 text-amber-500" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold truncate">{scheme.name}</h3>
                      <p className="text-xs text-muted-foreground line-clamp-2">{scheme.description}</p>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div>
                      <p className="text-xs font-medium text-muted-foreground mb-1">Eligibility Criteria:</p>
                      <ul className="text-xs space-y-1">
                        {scheme.eligibility.slice(0, 2).map((e, i) => (
                          <li key={i} className="flex items-start gap-1.5">
                            <span className="text-success mt-0.5">✓</span>
                            <span>{e}</span>
                          </li>
                        ))}
                        {scheme.eligibility.length > 2 && (
                          <li className="text-muted-foreground italic">+{scheme.eligibility.length - 2} more...</li>
                        )}
                      </ul>
                    </div>
                    <div>
                      <p className="text-xs font-medium text-muted-foreground mb-1">Required Documents:</p>
                      <ul className="text-xs space-y-0.5">
                        {scheme.documents.slice(0, 2).map((d, i) => (
                          <li key={i} className="flex items-start gap-1.5">
                            <span className="text-primary">•</span>
                            <span>{d}</span>
                          </li>
                        ))}
                        {scheme.documents.length > 2 && (
                          <li className="text-muted-foreground italic">+{scheme.documents.length - 2} more...</li>
                        )}
                      </ul>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-sm text-muted-foreground">No schemes available.</div>
          )}

          {/* Scheme Analysis Section */}
          {!analysisLoading && (
            <div className="border-t border-border/50 mt-6 pt-6">
              <h3 className="text-lg font-semibold mb-4">Scheme Coverage Analysis</h3>
              <div className="grid md:grid-cols-3 gap-4">
                {/* PM-KISAN Analysis */}
                <div className="p-4 rounded-lg border border-border/50 bg-gradient-to-br from-green-500/5 to-transparent">
              <div className="flex items-center gap-3 mb-4">
                <div className="h-9 w-9 rounded-lg bg-green-500/10 flex items-center justify-center">
                  <Zap className="h-5 w-5 text-green-500" />
                </div>
                <div>
                  <h4 className="font-semibold text-sm">PM-KISAN</h4>
                  <p className="text-xs text-muted-foreground">Income support</p>
                </div>
              </div>

              {kisanData ? (
                <div className="space-y-2">
                  <div className="grid grid-cols-3 gap-1">
                    <div className="p-2 rounded bg-muted/40">
                      <p className="text-xs text-muted-foreground">Districts</p>
                      <p className="text-base font-bold">{kisanData.total_districts}</p>
                    </div>
                    <div className="p-2 rounded bg-muted/40">
                      <p className="text-xs text-muted-foreground">Avg Coverage</p>
                      <p className="text-base font-bold">{((kisanData.avg_coverage || 0) * 100).toFixed(0)}%</p>
                    </div>
                    <div className="p-2 rounded bg-red-500/10">
                      <p className="text-xs text-muted-foreground">Anomalies</p>
                      <p className="text-base font-bold text-red-500">{kisanData.anomalies.length}</p>
                    </div>
                  </div>
                  <div className="mt-2 pt-2 border-t border-border/50">
                    <p className="text-xs font-medium mb-1">Lowest Coverage (Top 3):</p>
                    <div className="space-y-0.5">
                      {kisanData.lowest_districts.slice(0, 3).map((dist, idx) => (
                        <div key={idx} className="flex items-center justify-between text-xs p-1 rounded bg-muted/20">
                          <span className="truncate">{dist.district}</span>
                          <span className="font-semibold text-green-600">{((dist.coverage_ratio || 0) * 100).toFixed(0)}%</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-xs text-muted-foreground">Loading...</div>
              )}
            </div>

            {/* MGNREGA Analysis */}
            <div className="p-4 rounded-lg border border-border/50 bg-gradient-to-br from-blue-500/5 to-transparent">
              <div className="flex items-center gap-3 mb-4">
                <div className="h-9 w-9 rounded-lg bg-blue-500/10 flex items-center justify-center">
                  <Users className="h-5 w-5 text-blue-500" />
                </div>
                <div>
                  <h4 className="font-semibold text-sm">MGNREGA</h4>
                  <p className="text-xs text-muted-foreground">Employment guarantee</p>
                </div>
              </div>

              {mgnregaData ? (
                <div className="space-y-2">
                  <div className="grid grid-cols-3 gap-1">
                    <div className="p-2 rounded bg-muted/40">
                      <p className="text-xs text-muted-foreground">Districts</p>
                      <p className="text-base font-bold">{mgnregaData.total_districts}</p>
                    </div>
                    <div className="p-2 rounded bg-muted/40">
                      <p className="text-xs text-muted-foreground">Avg Ben.</p>
                      <p className="text-base font-bold">{((mgnregaData.avg_beneficiaries || 0) / 1000).toFixed(1)}K</p>
                    </div>
                    <div className="p-2 rounded bg-red-500/10">
                      <p className="text-xs text-muted-foreground">Anomalies</p>
                      <p className="text-base font-bold text-red-500">{mgnregaData.anomalies.length}</p>
                    </div>
                  </div>
                  <div className="mt-2 pt-2 border-t border-border/50">
                    <p className="text-xs font-medium mb-1">Lowest Participation (Top 3):</p>
                    <div className="space-y-0.5">
                      {mgnregaData.lowest_districts.slice(0, 3).map((dist, idx) => (
                        <div key={idx} className="flex items-center justify-between text-xs p-1 rounded bg-muted/20">
                          <span className="truncate">{dist.district}</span>
                          <span className="font-semibold text-blue-600">{((dist.beneficiaries || 0) / 1000).toFixed(0)}K</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-xs text-muted-foreground">Loading...</div>
              )}
            </div>

            {/* Scholarship Analysis */}
            <div className="p-4 rounded-lg border border-border/50 bg-gradient-to-br from-purple-500/5 to-transparent">
              <div className="flex items-center gap-3 mb-4">
                <div className="h-9 w-9 rounded-lg bg-purple-500/10 flex items-center justify-center">
                  <BookOpen className="h-5 w-5 text-purple-500" />
                </div>
                <div>
                  <h4 className="font-semibold text-sm">Scholarship</h4>
                  <p className="text-xs text-muted-foreground">Post-matric TN</p>
                </div>
              </div>

              {scholarshipData ? (
                <div className="space-y-2">
                  <div className="grid grid-cols-3 gap-1">
                    <div className="p-2 rounded bg-muted/40">
                      <p className="text-xs text-muted-foreground">Districts</p>
                      <p className="text-base font-bold">{scholarshipData.total_districts}</p>
                    </div>
                    <div className="p-2 rounded bg-muted/40">
                      <p className="text-xs text-muted-foreground">Avg Ben.</p>
                      <p className="text-base font-bold">{((scholarshipData.avg_beneficiaries || 0) / 1000).toFixed(1)}K</p>
                    </div>
                    <div className="p-2 rounded bg-red-500/10">
                      <p className="text-xs text-muted-foreground">Anomalies</p>
                      <p className="text-base font-bold text-red-500">{scholarshipData.anomalies.length}</p>
                    </div>
                  </div>
                  <div className="mt-2 pt-2 border-t border-border/50">
                    <p className="text-xs font-medium mb-1">Lowest Coverage (Top 3):</p>
                    <div className="space-y-0.5">
                      {scholarshipData.lowest_districts.slice(0, 3).map((dist, idx) => (
                        <div key={idx} className="flex items-center justify-between text-xs p-1 rounded bg-muted/20">
                          <span className="truncate">{dist.district}</span>
                          <span className="font-semibold text-purple-600">{((dist.beneficiaries || 0) / 1000).toFixed(0)}K</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-xs text-muted-foreground">Loading...</div>
              )}
            </div>
              </div>
            </div>
          )}
        </GlassCard>
      </main>

      {/* Update Status Dialog */}
      <Dialog open={updateDialogOpen} onOpenChange={setUpdateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Update Report Status</DialogTitle>
            <DialogDescription>
              Update the status and add notes for report #{selectedReport?.id}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Status</label>
              <Select value={newStatus} onValueChange={setNewStatus}>
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="submitted">Submitted</SelectItem>
                  <SelectItem value="in-progress">In Progress</SelectItem>
                  <SelectItem value="resolved">Resolved</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Officer Notes</label>
              <Textarea
                placeholder="Add notes about the report status..."
                value={officerNotes}
                onChange={(e) => setOfficerNotes(e.target.value)}
                rows={4}
              />
            </div>

            {selectedReport && (
              <div className="p-3 bg-muted/50 rounded-lg text-sm">
                <p className="font-medium mb-1">Report Details:</p>
                <p className="text-muted-foreground">Type: {selectedReport.issue_type}</p>
                <p className="text-muted-foreground">Location: {selectedReport.location}</p>
                <p className="text-muted-foreground">Citizen: {selectedReport.citizen_name}</p>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setUpdateDialogOpen(false)}
              disabled={updating}
            >
              Cancel
            </Button>
            <Button onClick={handleUpdateStatus} disabled={updating}>
              {updating ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Updating...
                </>
              ) : (
                'Update Status'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
