import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Navbar } from '@/components/Navbar';
import { GlassCard } from '@/components/GlassCard';
import { Button } from '@/components/ui/button';
import { getSchemeDetails, Scheme } from '@/lib/api';
import {
  ArrowLeft,
  CheckCircle2,
  XCircle,
  FileText,
  Users,
  UserX,
  ClipboardList,
  ListOrdered,
  Loader2,
  HelpCircle,
} from 'lucide-react';

export default function SchemeDetails() {
  const { schemeId } = useParams<{ schemeId: string }>();
  const [scheme, setScheme] = useState<Scheme | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Eligibility checker state
  const [showEligibilityCheck, setShowEligibilityCheck] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<number, boolean>>({});
  const [eligibilityResult, setEligibilityResult] = useState<{ 
    eligible: boolean; 
    reason?: string;
  } | null>(null);

  useEffect(() => {
    if (!schemeId) {
      setError('Scheme not found');
      setLoading(false);
      return;
    }

    const idNum = Number(schemeId);
    if (Number.isNaN(idNum)) {
      setError('Scheme not found');
      setLoading(false);
      return;
    }

    async function fetchScheme() {
      try {
        const data = await getSchemeDetails(idNum);
        setScheme(data);
      } catch (e) {
        setError('Scheme not found');
      } finally {
        setLoading(false);
      }
    }

    fetchScheme();
  }, [schemeId]);

  // Generate questions from eligibility criteria
  const eligibilityQuestions = scheme ? scheme.eligibility : [];
  const notEligibleQuestions = scheme ? scheme.not_eligible : [];

  const handleAnswer = (answer: boolean) => {
    const newAnswers = { ...answers, [currentQuestion]: answer };
    setAnswers(newAnswers);

    // Check if we're checking eligibility criteria (should be true)
    if (currentQuestion < eligibilityQuestions.length) {
      if (!answer) {
        setEligibilityResult({ 
          eligible: false, 
          reason: `You must meet this requirement: ${eligibilityQuestions[currentQuestion]}` 
        });
        return;
      }
    } 
    // Check if we're checking not_eligible criteria (should be false)
    else {
      const notEligibleIndex = currentQuestion - eligibilityQuestions.length;
      if (answer) {
        setEligibilityResult({ 
          eligible: false, 
          reason: `You cannot be: ${notEligibleQuestions[notEligibleIndex]}` 
        });
        return;
      }
    }

    // Move to next question
    const totalQuestions = eligibilityQuestions.length + notEligibleQuestions.length;
    if (currentQuestion < totalQuestions - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      // All questions passed
      setEligibilityResult({ eligible: true });
    }
  };

  const resetEligibilityCheck = () => {
    setShowEligibilityCheck(false);
    setCurrentQuestion(0);
    setAnswers({});
    setEligibilityResult(null);
  };

  const startEligibilityCheck = () => {
    setShowEligibilityCheck(true);
    setCurrentQuestion(0);
    setAnswers({});
    setEligibilityResult(null);
  };

  const getCurrentQuestion = () => {
    if (!scheme) return '';
    if (currentQuestion < eligibilityQuestions.length) {
      return eligibilityQuestions[currentQuestion];
    } else {
      const notEligibleIndex = currentQuestion - eligibilityQuestions.length;
      return notEligibleQuestions[notEligibleIndex];
    }
  };

  const getTotalQuestions = () => {
    return eligibilityQuestions.length + notEligibleQuestions.length;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="container mx-auto px-4 py-8 flex items-center gap-3 text-muted-foreground">
          <Loader2 className="h-5 w-5 animate-spin" />
          <span>Loading scheme...</span>
        </main>
      </div>
    );
  }

  if (error || !scheme) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="container mx-auto px-4 py-8">
          <p className="text-sm text-muted-foreground">Scheme not found</p>
          <Button asChild className="mt-4">
            <Link to="/schemes">Back to Schemes</Link>
          </Button>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <Button variant="ghost" asChild className="mb-6">
          <Link to="/schemes">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Schemes
          </Link>
        </Button>

        <div className="mb-8">
          <span className="text-sm font-medium text-primary uppercase tracking-wide">
            {scheme.id || 'Scheme'}
          </span>
          <h1 className="text-3xl font-bold mt-1 mb-3">{scheme.name}</h1>
          <p className="text-lg text-muted-foreground">{scheme.description}</p>
        </div>

        {/* Eligibility Check Button */}
        {!showEligibilityCheck && getTotalQuestions() > 0 && (
          <Button 
            variant="gradient" 
            size="lg" 
            className="mb-8"
            onClick={startEligibilityCheck}
          >
            <HelpCircle className="mr-2 h-5 w-5" />
            Check My Eligibility
          </Button>
        )}

        {/* Eligibility Checker */}
        {showEligibilityCheck && (
          <GlassCard className="mb-8">
            <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
              <HelpCircle className="h-5 w-5 text-primary" />
              Eligibility Check
            </h2>

            {!eligibilityResult ? (
              <div className="space-y-6">
                <div className="text-sm text-muted-foreground">
                  Question {currentQuestion + 1} of {getTotalQuestions()}
                </div>
                <p className="text-lg font-medium">
                  {currentQuestion < eligibilityQuestions.length 
                    ? `Do you meet this requirement: ${getCurrentQuestion()}?`
                    : `Are you in this category: ${getCurrentQuestion()}?`
                  }
                </p>
                <div className="flex gap-4">
                  <Button 
                    variant="outline" 
                    size="lg"
                    className="flex-1"
                    onClick={() => handleAnswer(true)}
                  >
                    <CheckCircle2 className="mr-2 h-5 w-5 text-green-500" />
                    Yes
                  </Button>
                  <Button 
                    variant="outline" 
                    size="lg"
                    className="flex-1"
                    onClick={() => handleAnswer(false)}
                  >
                    <XCircle className="mr-2 h-5 w-5 text-red-500" />
                    No
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {eligibilityResult.eligible ? (
                  <div className="flex items-center gap-3 p-4 rounded-lg bg-green-500/10 border border-green-500/20">
                    <CheckCircle2 className="h-8 w-8 text-green-500 shrink-0" />
                    <div>
                      <p className="font-semibold text-green-600 dark:text-green-400">
                        You appear to be eligible! ✓
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Based on your answers, you may qualify for this scheme. Please visit the nearest service center with required documents to apply.
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center gap-3 p-4 rounded-lg bg-red-500/10 border border-red-500/20">
                    <XCircle className="h-8 w-8 text-red-500 shrink-0" />
                    <div>
                      <p className="font-semibold text-red-600 dark:text-red-400">
                        You may not be eligible
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {eligibilityResult.reason}
                      </p>
                    </div>
                  </div>
                )}
                <Button variant="outline" onClick={resetEligibilityCheck}>
                  Check Again
                </Button>
              </div>
            )}
          </GlassCard>
        )}

        {/* Details Grid */}
        <div className="grid gap-6 md:grid-cols-2">
          <GlassCard>
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Users className="h-5 w-5 text-green-500" />
              Who Can Apply
            </h3>
            <ul className="space-y-2">
              {scheme.eligibility.map((item, index) => (
                <li key={index} className="flex items-start gap-2 text-sm">
                  <CheckCircle2 className="h-4 w-4 text-green-500 shrink-0 mt-0.5" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </GlassCard>

          <GlassCard>
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <UserX className="h-5 w-5 text-red-500" />
              Who Cannot Apply
            </h3>
            <ul className="space-y-2">
              {scheme.not_eligible.map((item, index) => (
                <li key={index} className="flex items-start gap-2 text-sm">
                  <XCircle className="h-4 w-4 text-red-500 shrink-0 mt-0.5" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </GlassCard>

          <GlassCard>
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <ClipboardList className="h-5 w-5 text-primary" />
              Documents Required
            </h3>
            <ul className="space-y-2">
              {scheme.documents.map((item, index) => (
                <li key={index} className="flex items-start gap-2 text-sm">
                  <FileText className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </GlassCard>

          <GlassCard>
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <ListOrdered className="h-5 w-5 text-primary" />
              How to Apply
            </h3>
            <ol className="space-y-2">
              {scheme.apply_steps.map((step, index) => (
                <li key={index} className="flex items-start gap-3 text-sm">
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary/10 text-xs font-medium text-primary shrink-0">
                    {index + 1}
                  </span>
                  <span>{step}</span>
                </li>
              ))}
            </ol>
          </GlassCard>
        </div>
      </main>
    </div>
  );
}
