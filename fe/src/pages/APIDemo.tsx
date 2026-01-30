import { Navbar } from '@/components/Navbar';
import { GlassCard } from '@/components/GlassCard';
import { CivicAlertForm } from '@/components/CivicAlertForm';
import { IssueClassifier } from '@/components/IssueClassifier';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Activity, AlertTriangle, BarChart3, Shield } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function APIDemo() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Backend Integration Demo</h1>
          <p className="text-muted-foreground">
            Test the connected backend API features
          </p>
        </div>

        <Tabs defaultValue="classifier" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="classifier">
              <Activity className="h-4 w-4 mr-2" />
              Classifier
            </TabsTrigger>
            <TabsTrigger value="alerts">
              <AlertTriangle className="h-4 w-4 mr-2" />
              Alerts
            </TabsTrigger>
            <TabsTrigger value="analytics">
              <BarChart3 className="h-4 w-4 mr-2" />
              Analytics
            </TabsTrigger>
            <TabsTrigger value="vulnerability">
              <Shield className="h-4 w-4 mr-2" />
              Vulnerability
            </TabsTrigger>
          </TabsList>

          <TabsContent value="classifier">
            <IssueClassifier />
          </TabsContent>

          <TabsContent value="alerts">
            <CivicAlertForm />
          </TabsContent>

          <TabsContent value="analytics">
            <div className="grid gap-6 md:grid-cols-2">
              <GlassCard>
                <h3 className="text-lg font-semibold mb-4">MGNREGA Analysis</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  View AI-powered anomaly detection for MGNREGA participation across districts
                </p>
                <div className="space-y-2">
                  <div className="p-3 rounded-lg bg-muted/30">
                    <p className="text-sm font-medium">Endpoint</p>
                    <code className="text-xs">GET /api/mgnrega-analysis</code>
                  </div>
                  <div className="p-3 rounded-lg bg-muted/30">
                    <p className="text-sm font-medium">Features</p>
                    <ul className="text-xs space-y-1 mt-1">
                      <li>• Lowest participation districts</li>
                      <li>• AI anomaly detection</li>
                      <li>• Average beneficiaries</li>
                    </ul>
                  </div>
                </div>
              </GlassCard>

              <GlassCard>
                <h3 className="text-lg font-semibold mb-4">Scholarship Analysis</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Identify districts with low scholarship uptake using machine learning
                </p>
                <div className="space-y-2">
                  <div className="p-3 rounded-lg bg-muted/30">
                    <p className="text-sm font-medium">Endpoint</p>
                    <code className="text-xs">GET /api/scholarship-analysis</code>
                  </div>
                  <div className="p-3 rounded-lg bg-muted/30">
                    <p className="text-sm font-medium">Features</p>
                    <ul className="text-xs space-y-1 mt-1">
                      <li>• Post-Matric SC students data</li>
                      <li>• Isolation Forest ML model</li>
                      <li>• District-wise comparison</li>
                    </ul>
                  </div>
                </div>
              </GlassCard>
            </div>
          </TabsContent>

          <TabsContent value="vulnerability">
            <div className="space-y-6">
              <GlassCard>
                <h3 className="text-lg font-semibold mb-4">Integrated Pages</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  These pages are fully connected to the backend API
                </p>
                <div className="grid gap-4 md:grid-cols-2">
                  <Link 
                    to="/welfare-gap"
                    className="p-4 rounded-lg border border-border hover:border-primary/50 hover:bg-muted/30 transition-all"
                  >
                    <h4 className="font-semibold mb-2">Welfare Gap Index</h4>
                    <p className="text-sm text-muted-foreground mb-2">
                      Understand why welfare schemes don't reach everyone
                    </p>
                    <code className="text-xs bg-muted px-2 py-1 rounded">
                      GET /api/welfare-gap?district=X
                    </code>
                  </Link>

                  <Link 
                    to="/vulnerability"
                    className="p-4 rounded-lg border border-border hover:border-primary/50 hover:bg-muted/30 transition-all"
                  >
                    <h4 className="font-semibold mb-2">District Vulnerability</h4>
                    <p className="text-sm text-muted-foreground mb-2">
                      View vulnerability scores and risk drivers
                    </p>
                    <code className="text-xs bg-muted px-2 py-1 rounded">
                      GET /api/vulnerability?district=X
                    </code>
                  </Link>
                </div>
              </GlassCard>

              <GlassCard>
                <h3 className="text-lg font-semibold mb-4">API Health Status</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Check if the backend API is running properly
                </p>
                <div className="p-4 rounded-lg bg-muted/30">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">Health Check Endpoint</span>
                    <span className="text-xs text-success">✓ Available</span>
                  </div>
                  <code className="text-xs">GET /api/health</code>
                </div>
              </GlassCard>
            </div>
          </TabsContent>
        </Tabs>

        <GlassCard className="mt-8 bg-primary/5 border-primary/20">
          <h3 className="text-lg font-semibold mb-3">🚀 Getting Started</h3>
          <div className="space-y-2 text-sm">
            <p>1. Make sure the backend API is running on <code className="bg-muted px-2 py-0.5 rounded">http://localhost:5000</code></p>
            <p>2. Try the features above to test the integration</p>
            <p>3. Check the browser console for API requests and responses</p>
            <p>4. View the source code in <code className="bg-muted px-2 py-0.5 rounded">fe/src/lib/api.ts</code></p>
          </div>
        </GlassCard>
      </main>
    </div>
  );
}
