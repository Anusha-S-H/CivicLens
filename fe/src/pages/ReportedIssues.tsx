import { useState, useEffect } from 'react';
import { Navbar } from '@/components/Navbar';
import { GlassCard } from '@/components/GlassCard';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { IssueTypeIcon } from '@/components/IssueTypeIcon';
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
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { getAllReports, updateReportStatus, CitizenReport } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import {
  Loader2,
  MapPin,
  Clock,
  User,
  Mail,
  ImageIcon,
  CheckCircle2,
  AlertCircle,
  Clock3,
  MoreVertical,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export default function ReportedIssues() {
  const { toast } = useToast();
  const [reports, setReports] = useState<CitizenReport[]>([]);
  const [filteredReports, setFilteredReports] = useState<CitizenReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<string>('all');

  // Update dialog
  const [updateDialogOpen, setUpdateDialogOpen] = useState(false);
  const [selectedReport, setSelectedReport] = useState<CitizenReport | null>(null);
  const [newStatus, setNewStatus] = useState('');
  const [officerNotes, setOfficerNotes] = useState('');
  const [updating, setUpdating] = useState(false);

  // Image preview dialog
  const [imageDialogOpen, setImageDialogOpen] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  // Alert dialog
  const [alertDialogOpen, setAlertDialogOpen] = useState(false);
  const [deleteConfirmReport, setDeleteConfirmReport] = useState<CitizenReport | null>(null);

  useEffect(() => {
    fetchReports();
    // Auto-refresh every 30 seconds
    const interval = setInterval(fetchReports, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    // Filter reports based on selected status
    if (selectedStatus === 'all') {
      setFilteredReports(reports);
    } else {
      setFilteredReports(reports.filter((r) => r.status === selectedStatus));
    }
  }, [reports, selectedStatus]);

  const fetchReports = async () => {
    try {
      const data = await getAllReports();
      setReports(data.reports || []);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to load reported issues',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchReports();
    setRefreshing(false);
    toast({
      title: 'Refreshed',
      description: 'Reported issues have been updated',
    });
  };

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

      toast({
        title: 'Success',
        description: 'Report status updated and citizen has been notified via email',
      });

      setUpdateDialogOpen(false);
      setSelectedReport(null);
      setNewStatus('');
      setOfficerNotes('');

      // Refresh reports
      await fetchReports();
    } catch (error) {
      toast({
        title: 'Error',
        description:
          error instanceof Error ? error.message : 'Failed to update report status',
        variant: 'destructive',
      });
    } finally {
      setUpdating(false);
    }
  };

  const handleImagePreview = (imageUrl: string | null) => {
    setPreviewImage(imageUrl);
    setImageDialogOpen(true);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'resolved':
        return <CheckCircle2 className="h-5 w-5 text-green-500" />;
      case 'in-progress':
        return <Clock3 className="h-5 w-5 text-blue-500" />;
      case 'submitted':
        return <AlertCircle className="h-5 w-5 text-yellow-500" />;
      default:
        return <AlertCircle className="h-5 w-5 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'resolved':
        return 'bg-green-500/10 text-green-700 border-green-300';
      case 'in-progress':
        return 'bg-blue-500/10 text-blue-700 border-blue-300';
      case 'submitted':
        return 'bg-yellow-500/10 text-yellow-700 border-yellow-300';
      default:
        return 'bg-gray-500/10 text-gray-700 border-gray-300';
    }
  };

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString('en-IN', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return dateString;
    }
  };

  return (
    <div className="min-h-screen bg-background bg-hero-pattern">
      <Navbar />

      <main className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8 animate-slide-in-up">
          <h1 className="text-3xl font-bold mb-2">
            <span className="gradient-text">Reported Issues</span>
          </h1>
          <p className="text-muted-foreground">
            View and manage all civic issues reported by citizens. Update status and notify
            citizens.
          </p>
        </div>

        {/* Filters and Controls */}
        <GlassCard className="mb-8 animate-slide-in-up">
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <div className="flex gap-2">
              <span className="text-sm font-medium text-muted-foreground">Filter by Status:</span>
              <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Issues</SelectItem>
                  <SelectItem value="submitted">Submitted</SelectItem>
                  <SelectItem value="in-progress">In Progress</SelectItem>
                  <SelectItem value="resolved">Resolved</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex gap-2">
              <span className="text-sm text-muted-foreground">
                Total: <strong>{filteredReports.length}</strong> issues
              </span>
              <Button
                size="sm"
                variant="outline"
                onClick={handleRefresh}
                disabled={refreshing}
              >
                <Loader2 className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
                {refreshing ? 'Refreshing...' : 'Refresh'}
              </Button>
            </div>
          </div>
        </GlassCard>

        {/* Issues Grid */}
        {loading ? (
          <GlassCard className="animate-slide-in-up">
            <div className="flex items-center justify-center gap-3 py-12 text-muted-foreground">
              <Loader2 className="h-6 w-6 animate-spin" />
              <span>Loading reported issues...</span>
            </div>
          </GlassCard>
        ) : filteredReports.length > 0 ? (
          <div className="grid gap-6 animate-slide-in-up">
            {filteredReports.map((report, index) => (
              <div
                key={report.id}
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <GlassCard
                  className="hover:shadow-lg transition-all duration-300 animate-slide-in-up"
                >
                  <div className="grid md:grid-cols-[1fr,200px] gap-6">
                  {/* Left: Issue Details */}
                  <div className="space-y-4">
                    {/* Header with Title and Status */}
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                      <div className="flex items-start gap-3">
                        <IssueTypeIcon type={report.issue_type as any} size="lg" />
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="text-xl font-semibold capitalize">
                              {report.issue_type}
                            </h3>
                            <span className="text-xs text-muted-foreground">#{report.id}</span>
                          </div>
                          <p className="text-sm text-muted-foreground mt-1">{report.description}</p>
                        </div>
                      </div>

                      {/* Status Badge */}
                      <div className={cn('px-3 py-2 rounded-lg border text-sm font-medium flex items-center gap-2 whitespace-nowrap', getStatusColor(report.status))}>
                        {getStatusIcon(report.status)}
                        {report.status.replace('-', ' ').toUpperCase()}
                      </div>
                    </div>

                    {/* Citizen Details */}
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div className="space-y-3">
                        <div className="flex items-center gap-2 text-sm">
                          <User className="h-4 w-4 text-muted-foreground" />
                          <div>
                            <p className="text-xs text-muted-foreground">Reported by</p>
                            <p className="font-medium">{report.citizen_name}</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 text-sm">
                          <Mail className="h-4 w-4 text-muted-foreground" />
                          <div>
                            <p className="text-xs text-muted-foreground">Email</p>
                            <p className="font-medium text-blue-600 hover:underline">
                              <a href={`mailto:${report.citizen_email}`}>
                                {report.citizen_email}
                              </a>
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-3">
                        <div className="flex items-center gap-2 text-sm">
                          <MapPin className="h-4 w-4 text-muted-foreground" />
                          <div>
                            <p className="text-xs text-muted-foreground">Location</p>
                            <p className="font-medium">{report.location}</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 text-sm">
                          <Clock className="h-4 w-4 text-muted-foreground" />
                          <div>
                            <p className="text-xs text-muted-foreground">Submitted</p>
                            <p className="font-medium">{formatDate(report.submitted_at)}</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Officer Notes */}
                    {report.officer_notes && (
                      <div className="p-3 bg-blue-50 dark:bg-blue-950/30 rounded-lg border border-blue-200 dark:border-blue-800">
                        <p className="text-xs font-semibold text-blue-900 dark:text-blue-300 mb-1">
                          Officer Notes
                        </p>
                        <p className="text-sm text-blue-800 dark:text-blue-200">{report.officer_notes}</p>
                      </div>
                    )}
                  </div>

                  {/* Right: Image and Actions */}
                  <div className="flex flex-col gap-4">
                    {/* Image Preview */}
                    {report.image_url ? (
                      <div className="relative group">
                        <img
                          src={report.image_url}
                          alt={`Issue report - ${report.issue_type}`}
                          className="w-full h-48 object-cover rounded-lg border border-border cursor-pointer hover:opacity-90 transition-opacity"
                          onClick={() => handleImagePreview(report.image_url)}
                        />
                        <div
                          className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-lg cursor-pointer"
                          onClick={() => handleImagePreview(report.image_url)}
                        >
                          <ImageIcon className="h-8 w-8 text-white" />
                        </div>
                      </div>
                    ) : (
                      <div className="w-full h-48 bg-muted rounded-lg border border-dashed border-border flex items-center justify-center">
                        <ImageIcon className="h-8 w-8 text-muted-foreground" />
                      </div>
                    )}

                    {/* Action Menu */}
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button size="sm" variant="outline" className="w-full">
                          <MoreVertical className="h-4 w-4 mr-2" />
                          Actions
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-48">
                        <DropdownMenuItem onClick={() => handleOpenUpdateDialog(report)}>
                          Update Status & Notify
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              </GlassCard>
              </div>
            ))}
          </div>
        ) : (
          <GlassCard className="animate-slide-in-up">
            <div className="flex flex-col items-center justify-center gap-4 py-12 text-center text-muted-foreground">
              <AlertCircle className="h-12 w-12 opacity-50" />
              <div>
                <p className="font-medium">No issues found</p>
                <p className="text-sm">
                  {selectedStatus === 'all'
                    ? 'There are no reported civic issues yet.'
                    : `There are no ${selectedStatus} issues.`}
                </p>
              </div>
            </div>
          </GlassCard>
        )}
      </main>

      {/* Update Status Dialog */}
      <Dialog open={updateDialogOpen} onOpenChange={setUpdateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Update Report Status</DialogTitle>
            <DialogDescription>
              Update the status for issue #{selectedReport?.id} and notify the citizen via email
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* Current Details */}
            {selectedReport && (
              <div className="p-3 bg-muted/50 rounded-lg text-sm space-y-2">
                <div>
                  <p className="text-xs font-semibold text-muted-foreground">Issue Type</p>
                  <p className="capitalize">{selectedReport.issue_type}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold text-muted-foreground">Location</p>
                  <p>{selectedReport.location}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold text-muted-foreground">Reported By</p>
                  <p>{selectedReport.citizen_name} ({selectedReport.citizen_email})</p>
                </div>
              </div>
            )}

            {/* Status Selection */}
            <div className="space-y-2">
              <label className="text-sm font-medium">New Status</label>
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

            {/* Officer Notes */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Officer Notes (Optional)</label>
              <Textarea
                placeholder="Add notes about what action was taken, next steps, or any other relevant information..."
                value={officerNotes}
                onChange={(e) => setOfficerNotes(e.target.value)}
                rows={4}
                className="resize-none"
              />
              <p className="text-xs text-muted-foreground">
                This note will be included in the email notification sent to the citizen.
              </p>
            </div>
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
                'Update & Notify'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Image Preview Dialog */}
      <Dialog open={imageDialogOpen} onOpenChange={setImageDialogOpen}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Issue Image</DialogTitle>
          </DialogHeader>
          <div className="flex items-center justify-center">
            {previewImage ? (
              <img
                src={previewImage}
                alt="Issue preview"
                className="max-w-full max-h-[70vh] object-contain rounded-lg"
              />
            ) : (
              <div className="text-muted-foreground">No image available</div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
