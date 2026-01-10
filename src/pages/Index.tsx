import { useState, useCallback } from 'react';
import { DashboardHeader } from '@/components/carf/DashboardHeader';
import { QueryInput } from '@/components/carf/QueryInput';
import { CynefinRouter } from '@/components/carf/CynefinRouter';
import { CausalDAG } from '@/components/carf/CausalDAG';
import { BayesianPanel } from '@/components/carf/BayesianPanel';
import { CausalAnalysisCard } from '@/components/carf/CausalAnalysisCard';
import { GuardianPanel } from '@/components/carf/GuardianPanel';
import { ExecutionTrace } from '@/components/carf/ExecutionTrace';
import { getScenario, Scenario } from '@/data/mockData';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { Loader2, Sparkles } from 'lucide-react';

export default function Index() {
  const [selectedScenario, setSelectedScenario] = useState('s3ae');
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [scenario, setScenario] = useState<Scenario | null>(null);
  const [hasStarted, setHasStarted] = useState(false);

  const sessionId = 'sess_demo_' + Math.random().toString(36).slice(2, 10);

  const handleScenarioChange = (id: string) => {
    setSelectedScenario(id);
    setCurrentStep(0);
    setScenario(null);
    setHasStarted(false);
  };

  const simulateAnalysis = useCallback(async (query: string) => {
    setIsProcessing(true);
    setHasStarted(true);
    setCurrentStep(0);
    
    const data = getScenario(selectedScenario);
    
    // Simulate step-by-step reveal with realistic timing
    const stepDelays = [400, 600, 1200, 800, 500];
    
    for (let i = 1; i <= 5; i++) {
      await new Promise(r => setTimeout(r, stepDelays[i - 1]));
      setCurrentStep(i);
    }
    
    setScenario(data);
    setIsProcessing(false);
    toast.success('Analysis complete', {
      description: `Processed via ${data.cynefin.solver}`,
    });
  }, [selectedScenario]);

  const handleApprove = () => {
    toast.success('Action approved', {
      description: 'Queued for execution with receipt ID generated',
    });
  };

  const handleReject = (reason: string) => {
    toast.error('Action rejected', {
      description: reason,
    });
  };

  const handleClarification = () => {
    toast.info('Clarification requested', {
      description: 'System will provide additional context',
    });
  };

  const currentScenarioData = getScenario(selectedScenario);

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader
        selectedScenario={selectedScenario}
        onScenarioChange={handleScenarioChange}
        sessionId={sessionId}
      />

      <main className="container mx-auto p-4 lg:p-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Panel - Query & Classification */}
          <div className="lg:col-span-3 space-y-4">
            <div className="space-y-2">
              <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                Query Input
              </h2>
              <QueryInput
                onSubmit={simulateAnalysis}
                suggestedQueries={currentScenarioData.suggestedQueries}
                isProcessing={isProcessing}
              />
            </div>

            {/* Processing Indicator */}
            {isProcessing && currentStep < 1 && (
              <div className="flex items-center justify-center gap-3 p-6 bg-card border border-border/50 rounded-lg animate-pulse">
                <Loader2 className="h-5 w-5 animate-spin text-primary" />
                <span className="text-sm text-muted-foreground">Initializing analysis...</span>
              </div>
            )}

            <CynefinRouter
              classification={scenario?.cynefin || currentScenarioData.cynefin}
              isVisible={currentStep >= 1}
            />

            <BayesianPanel
              beliefStates={scenario?.beliefStates || currentScenarioData.beliefStates}
              isVisible={currentStep >= 3}
            />
          </div>

          {/* Center Panel - DAG & Analysis */}
          <div className="lg:col-span-6 space-y-4">
            {!hasStarted && (
              <div className="flex flex-col items-center justify-center min-h-[400px] border border-dashed border-border/50 rounded-lg bg-muted/20">
                <div className="text-center space-y-4 p-8">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-2">
                    <Sparkles className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold">Ready for Analysis</h3>
                  <p className="text-sm text-muted-foreground max-w-md">
                    Enter a query in the left panel or select a suggested query to begin 
                    causal analysis with the CARF Neuro-Symbolic system.
                  </p>
                  <div className="flex flex-wrap justify-center gap-2 pt-2">
                    <span className="px-2 py-1 bg-cynefin-clear/20 text-cynefin-clear text-xs rounded">Clear</span>
                    <span className="px-2 py-1 bg-cynefin-complicated/20 text-cynefin-complicated text-xs rounded">Complicated</span>
                    <span className="px-2 py-1 bg-cynefin-complex/20 text-cynefin-complex text-xs rounded">Complex</span>
                    <span className="px-2 py-1 bg-cynefin-chaotic/20 text-cynefin-chaotic text-xs rounded">Chaotic</span>
                  </div>
                </div>
              </div>
            )}

            {hasStarted && currentStep < 2 && isProcessing && (
              <div className="flex items-center justify-center min-h-[300px] border border-border/50 rounded-lg bg-card">
                <div className="text-center space-y-3">
                  <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto" />
                  <p className="text-sm text-muted-foreground">Building causal graph...</p>
                </div>
              </div>
            )}

            <CausalDAG
              dag={scenario?.dag || currentScenarioData.dag}
              isVisible={currentStep >= 2}
            />

            <CausalAnalysisCard
              result={scenario?.causalResult || currentScenarioData.causalResult}
              isVisible={currentStep >= 3}
            />

            <GuardianPanel
              decision={scenario?.guardian || currentScenarioData.guardian}
              isVisible={currentStep >= 4}
              onApprove={handleApprove}
              onReject={handleReject}
              onRequestClarification={handleClarification}
            />
          </div>

          {/* Right Panel - Trace */}
          <div className="lg:col-span-3 space-y-4">
            {hasStarted && currentStep < 5 && isProcessing && (
              <div className="p-4 border border-border/50 rounded-lg bg-card">
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                    <span className="text-xs text-muted-foreground">Processing...</span>
                  </div>
                  {/* Step indicators */}
                  <div className="space-y-2">
                    {['QueryParser', 'CynefinRouter', 'CausalAnalyst', 'BayesianUpdater', 'Guardian'].map((step, i) => (
                      <div
                        key={step}
                        className={cn(
                          "flex items-center gap-2 text-xs p-2 rounded",
                          currentStep > i ? "bg-status-success/10 text-status-success" :
                          currentStep === i ? "bg-primary/10 text-primary" : "text-muted-foreground"
                        )}
                      >
                        {currentStep > i ? (
                          <span className="w-4 h-4 rounded-full bg-status-success text-white flex items-center justify-center text-[10px]">✓</span>
                        ) : currentStep === i ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <span className="w-4 h-4 rounded-full border border-muted-foreground/30" />
                        )}
                        {step}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            <ExecutionTrace
              trace={scenario?.trace || currentScenarioData.trace}
              isVisible={currentStep >= 5}
            />
            
            {/* Help Card when not started */}
            {!hasStarted && (
              <div className="p-4 border border-border/50 rounded-lg bg-card space-y-3">
                <h3 className="text-sm font-semibold">How it works</h3>
                <ol className="text-xs text-muted-foreground space-y-2">
                  <li className="flex gap-2">
                    <span className="font-bold text-primary">1.</span>
                    <span>Enter your query or select a suggestion</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="font-bold text-primary">2.</span>
                    <span>Cynefin Router classifies the problem domain</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="font-bold text-primary">3.</span>
                    <span>Causal DAG is constructed and analyzed</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="font-bold text-primary">4.</span>
                    <span>Bayesian beliefs are updated with uncertainty</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="font-bold text-primary">5.</span>
                    <span>Guardian checks policies for your approval</span>
                  </li>
                </ol>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
