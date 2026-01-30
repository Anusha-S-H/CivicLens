import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Navbar } from '@/components/Navbar';
import { GlassCard } from '@/components/GlassCard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { IssueTypeIcon } from '@/components/IssueTypeIcon';
import { IssueType, issueTypeConfig } from '@/lib/mockData';
import { submitReport, getMyReports, CitizenReport } from '@/lib/api';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Camera,
  Upload,
  Loader2,
  CheckCircle2,
  MapPin,
  Clock,
  Sparkles,
  X,
  FileText,
  TrendingUp,
  RefreshCw,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

export default function CitizenDashboard() {
  const { user } = useAuth();
  const { toast: showToast } = useToast();
  const [issueType, setIssueType] = useState<IssueType | ''>('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [myReports, setMyReports] = useState<CitizenReport[]>([]);
  const [reportsLoading, setReportsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setImage(null);
    setImagePreview(null);
  };

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!issueType || !location || !description) {
      showToast({
        title: 'Error',
        description: 'Please fill in all required fields',
        variant: 'destructive',
      });
      return;
    }

    setIsSubmitting(true);
    try {
      await submitReport({
        citizen_name: user?.name || 'Anonymous',
        citizen_email: user?.email || 'unknown@example.com',
        issue_type: issueType,
        location,
        description,
        image_url: imagePreview || undefined,
      });

      showToast({
        title: 'Report Submitted!',
        description: 'Your civic issue has been reported successfully. We\'ll keep you updated.',
      });

      // Refresh reports
      if (user?.email) {
        const data = await getMyReports(user.email);
        setMyReports(data.reports);
      }

      // Reset form
      setIssueType('');
      setDescription('');
      setLocation('');
      setImage(null);
      setImagePreview(null);
    } catch (error) {
      showToast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to submit report',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRefreshReports = async () => {
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
        {/* Welcome Section */}
        <div className="mb-8 animate-slide-in-up">
          <h1 className="text-3xl font-bold mb-2">
            Welcome back, <span className="gradient-text">{user?.name}</span>!
          </h1>
          <p className="text-muted-foreground">
            Help improve your city by reporting civic issues.
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Report Form */}
          <div className="lg:col-span-2 space-y-6">
            <GlassCard className="animate-slide-in-up stagger-1">
              <div className="flex items-center gap-3 mb-6">
                <div className="h-12 w-12 rounded-xl gradient-primary flex items-center justify-center">
                  <FileText className="h-6 w-6 text-primary-foreground" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold">Report Civic Issue</h2>
                  <p className="text-sm text-muted-foreground">Help us identify problems in your area</p>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Image Upload */}
                <div className="space-y-2">
                  <Label>Photo Evidence (Optional)</Label>
                  <div className={cn(
                    'relative border-2 border-dashed rounded-xl transition-all duration-300',
                    imagePreview ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'
                  )}>
                    {imagePreview ? (
                      <div className="relative aspect-video">
                        <img
                          src={imagePreview}
                          alt="Preview"
                          className="w-full h-full object-cover rounded-xl"
                        />
                        <Button
                          type="button"
                          variant="destructive"
                          size="icon"
                          className="absolute top-2 right-2"
                          onClick={removeImage}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ) : (
                      <label className="flex flex-col items-center justify-center p-8 cursor-pointer">
                        <div className="h-16 w-16 rounded-2xl bg-muted flex items-center justify-center mb-4">
                          <Camera className="h-8 w-8 text-muted-foreground" />
                        </div>
                        <p className="text-sm font-medium mb-1">Upload a photo</p>
                        <p className="text-xs text-muted-foreground">Click or drag & drop</p>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleImageChange}
                          className="hidden"
                        />
                      </label>
                    )}
                  </div>
                </div>

                {/* Issue Type */}
                <div className="space-y-2">
                  <Label>Issue Type</Label>
                  <Select value={issueType} onValueChange={(value) => setIssueType(value as IssueType)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select issue type" />
                    </SelectTrigger>
                    <SelectContent>
                      {(Object.keys(issueTypeConfig) as IssueType[]).map((type) => (
                        <SelectItem key={type} value={type}>
                          <div className="flex items-center gap-2">
                            <IssueTypeIcon type={type} size="sm" />
                            <span>{issueTypeConfig[type].label}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Location */}
                <div className="space-y-2">
                  <Label htmlFor="location">Location</Label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="location"
                      placeholder="Enter location or address"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      className="pl-10"
                      required
                    />
                  </div>
                </div>

                {/* Description */}
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    placeholder="Describe the issue in detail..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={4}
                    required
                  />
                </div>

                <Button
                  type="submit"
                  variant="gradient"
                  size="lg"
                  className="w-full"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Submitting Report...
                    </>
                  ) : (
                    <>
                      <Upload className="h-4 w-4" />
                      Submit Report
                    </>
                  )}
                </Button>
              </form>
            </GlassCard>

            {/* My Reports */}
            <GlassCard className="animate-slide-in-up stagger-2">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold">My Reports</h2>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleRefreshReports}
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
                            'bg-green-100 text-green-800'
                          }`}>
                            {report.status}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground line-clamp-2">{report.description}</p>
                        <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            {report.location}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {new Date(report.submitted_at).toLocaleDateString()}
                          </span>
                        </div>
                        {report.officer_notes && (
                          <div className="mt-2 p-2 rounded bg-muted/50 text-xs">
                            <p className="font-medium">Officer Notes:</p>
                            <p className="text-muted-foreground">{report.officer_notes}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">No reports yet. Submit your first report above!</p>
              )}
            </GlassCard>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Impact Card */}
            <GlassCard className="animate-slide-in-up stagger-3" glow>
              <div className="flex items-center gap-3 mb-4">
                <div className="h-10 w-10 rounded-xl bg-success/10 flex items-center justify-center">
                  <Sparkles className="h-5 w-5 text-success" />
                </div>
                <h3 className="font-semibold">Your Impact</h3>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-3 rounded-lg bg-muted/50">
                  <div className="text-2xl font-bold gradient-text">3</div>
                  <div className="text-xs text-muted-foreground">Reports</div>
                </div>
                <div className="text-center p-3 rounded-lg bg-muted/50">
                  <div className="text-2xl font-bold gradient-text">1</div>
                  <div className="text-xs text-muted-foreground">Resolved</div>
                </div>
              </div>
            </GlassCard>

            {/* Info Card */}
            <GlassCard className="animate-slide-in-up stagger-4">
              <div className="flex items-center gap-3 mb-4">
                <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
                  <TrendingUp className="h-5 w-5 text-primary" />
                </div>
                <h3 className="font-semibold">Why Report?</h3>
              </div>
              <ul className="space-y-3 text-sm">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-success mt-0.5 shrink-0" />
                  <span className="text-muted-foreground">Your reports help identify patterns early</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-success mt-0.5 shrink-0" />
                  <span className="text-muted-foreground">AI escalates critical issues to authorities</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-success mt-0.5 shrink-0" />
                  <span className="text-muted-foreground">Together, we prevent civic failures</span>
                </li>
              </ul>
            </GlassCard>
          </div>
        </div>

        {/* Schemes CTA */}
        <div className="mt-8">
          <GlassCard className="animate-slide-in-up flex items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-semibold">Explore welfare schemes</h2>
              <p className="text-sm text-muted-foreground">Browse all schemes and detailed eligibility in the Schemes section.</p>
            </div>
            <Button variant="outline" asChild>
              <Link to="/schemes">Go to Schemes</Link>
            </Button>
          </GlassCard>
        </div>
      </main>
    </div>
  );
}
