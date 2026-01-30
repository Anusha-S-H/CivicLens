import { useState } from 'react';
import { GlassCard } from '@/components/GlassCard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { createCivicAlert, CivicAlertResponse } from '@/lib/api';
import { Loader2, AlertTriangle, Newspaper, Video } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const ISSUE_TYPES = ['Roads', 'Garbage', 'Water', 'Power'];

export function CivicAlertForm() {
  const [issueType, setIssueType] = useState<string>('');
  const [urgency, setUrgency] = useState<number>(5);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<CivicAlertResponse | null>(null);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!issueType) {
      toast({
        title: 'Error',
        description: 'Please select an issue type',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      const data = await createCivicAlert({
        issue_type: issueType,
        urgency: urgency,
      });
      setResult(data);
      toast({
        title: 'Success',
        description: 'Alert created successfully',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to create alert',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const getAlertColor = (level: string) => {
    switch (level.toLowerCase()) {
      case 'critical': return 'text-red-600 bg-red-50 border-red-200 dark:bg-red-950 dark:border-red-800';
      case 'high': return 'text-orange-600 bg-orange-50 border-orange-200 dark:bg-orange-950 dark:border-orange-800';
      case 'medium': return 'text-yellow-600 bg-yellow-50 border-yellow-200 dark:bg-yellow-950 dark:border-yellow-800';
      case 'low': return 'text-blue-600 bg-blue-50 border-blue-200 dark:bg-blue-950 dark:border-blue-800';
      default: return 'text-gray-600 bg-gray-50 border-gray-200 dark:bg-gray-950 dark:border-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      <GlassCard>
        <h2 className="text-xl font-semibold mb-4">Create Civic Alert</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="issue-type">Issue Type</Label>
            <Select value={issueType} onValueChange={setIssueType}>
              <SelectTrigger id="issue-type">
                <SelectValue placeholder="Select issue type..." />
              </SelectTrigger>
              <SelectContent>
                {ISSUE_TYPES.map((type) => (
                  <SelectItem key={type} value={type}>
                    {type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="urgency">Urgency Level (1-10)</Label>
            <div className="flex items-center gap-4">
              <Input
                id="urgency"
                type="range"
                min="1"
                max="10"
                value={urgency}
                onChange={(e) => setUrgency(Number(e.target.value))}
                className="flex-1"
              />
              <span className="text-lg font-semibold w-8 text-center">{urgency}</span>
            </div>
          </div>

          <Button type="submit" disabled={loading} className="w-full">
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Create Alert
          </Button>
        </form>
      </GlassCard>

      {result && (
        <GlassCard className={`border-2 ${getAlertColor(result.alert_level)}`}>
          <div className="flex items-start gap-4 mb-4">
            <AlertTriangle className="h-6 w-6 shrink-0 mt-1" />
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <h3 className="text-xl font-bold">Alert Level: {result.alert_level}</h3>
              </div>
              <p className="text-sm opacity-90">Issue Type: {result.issue_type}</p>
            </div>
          </div>

          <div className="space-y-3">
            <div className="p-3 rounded-lg bg-background/50">
              <p className="text-sm font-medium mb-1">Escalated Authority</p>
              <p className="text-sm">{result.authority}</p>
            </div>

            <div className="grid grid-cols-4 gap-3">
              <div className="p-3 rounded-lg bg-background/50">
                <p className="text-xs text-muted-foreground">News</p>
                <p className="text-lg font-semibold">{result.news_count}</p>
              </div>
              <div className="p-3 rounded-lg bg-background/50">
                <p className="text-xs text-muted-foreground">Videos</p>
                <p className="text-lg font-semibold">{result.video_count || 0}</p>
              </div>
              <div className="p-3 rounded-lg bg-background/50">
                <p className="text-xs text-muted-foreground">Urgency</p>
                <p className="text-lg font-semibold">{result.urgency}</p>
              </div>
              <div className="p-3 rounded-lg bg-background/50">
                <p className="text-xs text-muted-foreground">Score</p>
                <p className="text-lg font-semibold">{result.score}</p>
              </div>
            </div>

            {result.recent_articles && result.recent_articles.length > 0 && (
              <div>
                <h4 className="font-medium mb-2 flex items-center gap-2">
                  <Newspaper className="h-4 w-4" />
                  Recent News Articles
                </h4>
                <div className="space-y-2">
                  {result.recent_articles.map((article: any, index: number) => (
                    <a
                      key={index}
                      href={article.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 rounded bg-background/50 text-sm hover:bg-background/70 transition-colors block"
                    >
                      <p className="font-medium">{article.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {article.source} • {new Date(article.publishedAt).toLocaleDateString()}
                      </p>
                    </a>
                  ))}
                </div>
              </div>
            )}

            {result.recent_videos && result.recent_videos.length > 0 && (
              <div>
                <h4 className="font-medium mb-2 flex items-center gap-2">
                  <Video className="h-4 w-4 text-orange-500" />
                  Recent Videos
                </h4>
                <div className="space-y-2">
                  {result.recent_videos.map((video: any, index: number) => (
                    <a
                      key={index}
                      href={video.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 rounded bg-background/50 text-sm hover:bg-background/70 transition-colors block"
                    >
                      <p className="font-medium">{video.title}</p>
                      <p className="text-xs text-muted-foreground">
                        YouTube • {new Date(video.publishedAt).toLocaleDateString()}
                      </p>
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>
        </GlassCard>
      )}
    </div>
  );
}
