import { useState } from 'react';
import { GlassCard } from '@/components/GlassCard';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { classifyIssue, ClassifyIssueResponse } from '@/lib/api';
import { Loader2, CheckCircle2, Building2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export function IssueClassifier() {
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ClassifyIssueResponse | null>(null);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!text.trim()) {
      toast({
        title: 'Error',
        description: 'Please enter issue description',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      const data = await classifyIssue({ text });
      setResult(data);
      toast({
        title: 'Success',
        description: 'Issue classified successfully',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to classify issue',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      'Housing': 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300',
      'Employment': 'bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-300',
      'Health': 'bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300',
      'Education': 'bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300',
      'Food': 'bg-orange-100 text-orange-700 dark:bg-orange-950 dark:text-orange-300',
      'Documents': 'bg-yellow-100 text-yellow-700 dark:bg-yellow-950 dark:text-yellow-300',
      'Pension': 'bg-pink-100 text-pink-700 dark:bg-pink-950 dark:text-pink-300',
      'Utilities': 'bg-teal-100 text-teal-700 dark:bg-teal-950 dark:text-teal-300',
    };
    return colors[category] || 'bg-gray-100 text-gray-700 dark:bg-gray-950 dark:text-gray-300';
  };

  return (
    <div className="space-y-6">
      <GlassCard>
        <h2 className="text-xl font-semibold mb-4">Civic Issue Classifier</h2>
        <p className="text-sm text-muted-foreground mb-4">
          Describe your civic issue and we'll classify it and route it to the appropriate authority.
        </p>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="issue-text">Issue Description</Label>
            <Textarea
              id="issue-text"
              placeholder="Example: My ration card application has been pending for 3 months..."
              value={text}
              onChange={(e) => setText(e.target.value)}
              rows={5}
              className="resize-none"
            />
            <p className="text-xs text-muted-foreground mt-1">
              Be specific about the problem, scheme name, or service you need help with
            </p>
          </div>

          <Button type="submit" disabled={loading} className="w-full">
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Classify Issue
          </Button>
        </form>
      </GlassCard>

      {result && (
        <GlassCard className="border-2 border-primary/20">
          <div className="flex items-start gap-3 mb-6">
            <CheckCircle2 className="h-6 w-6 text-success shrink-0 mt-1" />
            <div>
              <h3 className="text-lg font-semibold mb-1">Issue Classified</h3>
              <p className="text-sm text-muted-foreground">
                Your issue has been analyzed and categorized
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="p-4 rounded-lg bg-muted/30">
                <p className="text-sm text-muted-foreground mb-2">Category</p>
                <span className={`inline-block px-3 py-1.5 rounded-full text-sm font-medium ${getCategoryColor(result.category)}`}>
                  {result.category}
                </span>
              </div>

              <div className="p-4 rounded-lg bg-muted/30">
                <p className="text-sm text-muted-foreground mb-2">Nature of Issue</p>
                <p className="text-sm font-semibold">{result.nature}</p>
              </div>
            </div>

            <div className="p-4 rounded-lg bg-primary/5 border border-primary/20">
              <div className="flex items-start gap-3">
                <Building2 className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm text-muted-foreground mb-1">
                    Recommended Authority
                  </p>
                  <p className="font-semibold text-primary">{result.authority}</p>
                </div>
              </div>
            </div>

            <div className="p-4 rounded-lg bg-muted/10">
              <p className="text-sm text-muted-foreground mb-1">Your Issue</p>
              <p className="text-sm italic">&ldquo;{result.original_text}&rdquo;</p>
            </div>
          </div>
        </GlassCard>
      )}
    </div>
  );
}
