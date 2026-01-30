import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Navbar } from '@/components/Navbar';
import { GlassCard } from '@/components/GlassCard';
import { Button } from '@/components/ui/button';
import { getSchemes, Scheme } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import { FileText, ArrowRight, Loader2 } from 'lucide-react';

export default function Schemes() {
  const { toast } = useToast();
  const [schemes, setSchemes] = useState<Scheme[]>([]);
  const [loading, setLoading] = useState(true);

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
        setLoading(false);
      }
    }

    fetchSchemes();
  }, [toast]);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Government Schemes</h1>
          <p className="text-muted-foreground">
            Find and understand welfare schemes in simple language
          </p>
        </div>

        {loading ? (
          <div className="flex items-center gap-3 text-muted-foreground">
            <Loader2 className="h-5 w-5 animate-spin" />
            <span>Loading schemes...</span>
          </div>
        ) : schemes.length > 0 ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {schemes.map((scheme, index) => (
              <GlassCard key={scheme.name} className="flex flex-col">
                <div className="flex items-start gap-3 mb-4">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <FileText className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold line-clamp-2">{scheme.name}</h3>
                    <p className="text-xs text-muted-foreground">Central Government</p>
                  </div>
                </div>

                <p className="text-muted-foreground text-sm mb-6 flex-grow line-clamp-3">
                  {scheme.description}
                </p>

                <div className="space-y-3 text-xs text-muted-foreground mb-6">
                  <div>
                    <p className="font-medium mb-1">Eligibility snapshot</p>
                    <ul className="space-y-1">
                      {scheme.eligibility.slice(0, 2).map((rule, idx) => (
                        <li key={idx} className="flex gap-2">
                          <span className="text-success">✓</span>
                          <span className="line-clamp-2">{rule}</span>
                        </li>
                      ))}
                      {scheme.eligibility.length > 2 && (
                        <li className="italic">+{scheme.eligibility.length - 2} more</li>
                      )}
                    </ul>
                  </div>

                  <div>
                    <p className="font-medium mb-1">Documents</p>
                    <ul className="space-y-1">
                      {scheme.documents.slice(0, 2).map((doc, idx) => (
                        <li key={idx} className="flex gap-2">
                          <span className="text-primary">•</span>
                          <span className="line-clamp-2">{doc}</span>
                        </li>
                      ))}
                      {scheme.documents.length > 2 && (
                        <li className="italic">+{scheme.documents.length - 2} more</li>
                      )}
                    </ul>
                  </div>
                </div>

                <Button variant="outline" className="w-full group" asChild>
                  <Link to={`/schemes/${index}`}>
                    View Details
                    <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </Link>
                </Button>
              </GlassCard>
            ))}
          </div>
        ) : (
          <div className="text-muted-foreground">No schemes available right now.</div>
        )}
      </main>
    </div>
  );
}
