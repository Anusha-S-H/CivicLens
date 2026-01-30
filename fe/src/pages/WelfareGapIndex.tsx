import { useState, useEffect } from 'react';
import { Navbar } from '@/components/Navbar';
import { GlassCard } from '@/components/GlassCard';
import { StatusBadge } from '@/components/StatusBadge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { getWelfareGapDistricts, getWelfareGapIndex, WelfareGapResponse } from '@/lib/api';
import { AlertTriangle, Info, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function WelfareGapIndex() {
  const [selectedDistrict, setSelectedDistrict] = useState<string>('');
  const [districts, setDistricts] = useState<string[]>([]);
  const [districtData, setDistrictData] = useState<WelfareGapResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingDistricts, setLoadingDistricts] = useState(true);
  const { toast } = useToast();

  // Load districts on mount
  useEffect(() => {
    async function fetchDistricts() {
      try {
        const data = await getWelfareGapDistricts();
        setDistricts(data.districts);
      } catch (error) {
        toast({
          title: 'Error',
          description: 'Failed to load districts',
          variant: 'destructive',
        });
      } finally {
        setLoadingDistricts(false);
      }
    }
    fetchDistricts();
  }, [toast]);

  // Load district data when selected
  useEffect(() => {
    if (!selectedDistrict) {
      setDistrictData(null);
      return;
    }

    async function fetchDistrictData() {
      setLoading(true);
      try {
        const data = await getWelfareGapIndex(selectedDistrict);
        setDistrictData(data);
      } catch (error) {
        toast({
          title: 'Error',
          description: 'Failed to load district data',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    }
    fetchDistrictData();
  }, [selectedDistrict, toast]);

  const getRiskBadgeVariant = (level: string) => {
    const normalizedLevel = level.toLowerCase();
    switch (normalizedLevel) {
      case 'low': return 'success';
      case 'medium': return 'warning';
      case 'high': return 'error';
      default: return 'default';
    }
  };

  const getGapColor = (gap: string) => {
    const gapType = gap.toLowerCase();
    const colors: Record<string, string> = {
      'awareness': 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20',
      'access': 'bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-500/20',
      'documentation': 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20',
      'trust': 'bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20',
      'data': 'bg-gray-500/10 text-gray-600 dark:text-gray-400 border-gray-500/20',
      'migration': 'bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/20',
    };
    
    for (const [key, value] of Object.entries(colors)) {
      if (gapType.includes(key)) return value;
    }
    
    return 'bg-muted text-muted-foreground';
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Welfare Gap Index</h1>
          <p className="text-muted-foreground">
            Understand why welfare schemes don't reach everyone in a district
          </p>
        </div>

        {/* District Selector */}
        <GlassCard className="mb-6">
          <label className="block text-sm font-medium mb-2">Select District</label>
          <Select value={selectedDistrict} onValueChange={setSelectedDistrict} disabled={loadingDistricts}>
            <SelectTrigger className="w-full md:w-80">
              <SelectValue placeholder={loadingDistricts ? "Loading districts..." : "Choose a district..."} />
            </SelectTrigger>
            <SelectContent>
              {districts.map((district) => (
                <SelectItem key={district} value={district}>
                  {district}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </GlassCard>

        {/* Loading State */}
        {loading && (
          <GlassCard className="text-center py-12">
            <Loader2 className="h-12 w-12 text-primary mx-auto mb-4 animate-spin" />
            <p className="text-muted-foreground">Loading welfare gap data...</p>
          </GlassCard>
        )}

        {/* Results */}
        {!loading && districtData ? (
          <div className="space-y-6 animate-fade-in">
            {/* Risk Level Card */}
            <GlassCard>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-primary" />
                  Risk Assessment
                </h2>
                <StatusBadge 
                  status={districtData.risk_level} 
                  variant={getRiskBadgeVariant(districtData.risk_level)}
                  size="lg"
                />
              </div>
              <p className="text-2xl font-bold capitalize mb-2">
                {districtData.risk_level} Risk
              </p>
              <p className="text-muted-foreground text-sm">
                {districtData.district} District
              </p>
              <div className="mt-4 pt-4 border-t grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Avg Coverage</p>
                  <p className="text-lg font-semibold">{(districtData.average_coverage * 100).toFixed(1)}%</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Coverage Variance</p>
                  <p className="text-lg font-semibold">{(districtData.coverage_variance * 100).toFixed(1)}%</p>
                </div>
              </div>
            </GlassCard>

            {/* Identified Gaps */}
            {districtData.gaps.length > 0 && (
              <GlassCard>
                <h2 className="text-xl font-semibold mb-4">Identified Gaps</h2>
                <div className="space-y-3">
                  {districtData.gaps.map((gap, index) => (
                    <div key={index} className="border rounded-lg p-4">
                      <div className="flex items-start gap-3 mb-2">
                        <span className={`px-3 py-1.5 rounded-full text-sm font-medium border ${getGapColor(gap.type)}`}>
                          {gap.type}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">{gap.explanation}</p>
                      <p className="text-sm font-medium text-primary">→ {gap.action}</p>
                    </div>
                  ))}
                </div>
              </GlassCard>
            )}

            {/* Scheme Coverage Details */}
            {districtData.schemes.length > 0 && (
              <GlassCard>
                <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                  <Info className="h-5 w-5 text-primary" />
                  Scheme Coverage Details
                </h2>
                <div className="space-y-2">
                  {districtData.schemes.map((scheme, index) => (
                    <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                      <span className="text-sm font-medium">{scheme.scheme}</span>
                      <span className="text-sm text-muted-foreground">{(scheme.coverage_ratio * 100).toFixed(1)}%</span>
                    </div>
                  ))}
                </div>
              </GlassCard>
            )}
          </div>
        ) : !loading && selectedDistrict && !districtData ? (
          <GlassCard className="text-center py-12">
            <AlertTriangle className="h-12 w-12 text-destructive mx-auto mb-4" />
            <p className="text-muted-foreground">
              No data available for the selected district
            </p>
          </GlassCard>
        ) : !loading && !selectedDistrict ? (
          <GlassCard className="text-center py-12">
            <AlertTriangle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">
              Select a district to view the Welfare Gap Index
            </p>
          </GlassCard>
        ) : null}
      </main>
    </div>
  );
}
