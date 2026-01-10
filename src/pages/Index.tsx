import { useState, useCallback } from 'react';
import { DashboardHeader } from '@/components/carf/DashboardHeader';
import { QueryInput } from '@/components/carf/QueryInput';
import { CynefinRouter } from '@/components/carf/CynefinRouter';
import { CausalDAG } from '@/components/carf/CausalDAG';
import { BayesianPanel } from '@/components/carf/BayesianPanel';
import { CausalAnalysisCard } from '@/components/carf/CausalAnalysisCard';
import { GuardianPanel } from '@/components/carf/GuardianPanel';
import { ExecutionTrace } from '@/components/carf/ExecutionTrace';
import { DeveloperDebugView } from '@/components/carf/DeveloperDebugView';
import { ExecutiveSummaryView } from '@/components/carf/ExecutiveSummaryView';
import { SimulationControls } from '@/components/carf/SimulationControls';
import { getScenario, Scenario } from '@/data/mockData';
import { runAnalysis, SimulationParams, defaultSimulationParams } from '@/services/carfService';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { Loader2, Sparkles, User, Code, BarChart3 } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

type ViewMode = 'end-user' | 'developer' | 'executive';

export default function Index() {
  const [selectedScenario, setSelectedScenario] = useState('s3ae');
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [scenario, setScenario] = useState<Scenario | null>(null);
  const [hasStarted, setHasStarted] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>('end-user');
  const [simulationParams, setSimulationParams] = useState<SimulationParams>(defaultSimulationParams);
  const [executionTimeMs, setExecutionTimeMs] = useState(0);

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
    
    const response = await runAnalysis(
      { query, scenarioId: selectedScenario, simulationParams },
      (progress) => setCurrentStep(progress.step)
    );
    
    setScenario(response.scenario);
    setExecutionTimeMs(response.executionTimeMs);
    setIsProcessing(false);
    toast.success('Analysis complete', {
      description: `Processed via ${response.scenario.cynefin.solver}`,
    });
  }, [selectedScenario, simulationParams]);

  const handleApprove = () => {
    toast.success('Action approved', { description: 'Queued for execution with receipt ID generated' });
  };

  const handleReject = (reason: string) => {
    toast.error('Action rejected', { description: reason });
  };

  const handleClarification = () => {
    toast.info('Clarification requested', { description: 'System will provide additional context' });
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
        {/* View Mode Tabs */}
        <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as ViewMode)} className="mb-6">
          <TabsList className="grid w-full max-w-md grid-cols-3">
            <TabsTrigger value="end-user" className="text-xs">
              <User className="h-3 w-3 mr-1" />
              End-User
            </TabsTrigger>
            <TabsTrigger value="developer" className="text-xs">
              <Code className="h-3 w-3 mr-1" />
              Developer
            </TabsTrigger>
            <TabsTrigger value="executive" className="text-xs">
              <BarChart3 className="h-3 w-3 mr-1" />
              Executive
            </TabsTrigger>
          </TabsList>
        </Tabs>

        {/* End-User View */}
        {viewMode === 'end-user' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left Panel */}
            <div className="lg:col-span-3 space-y-4">
              <QueryInput onSubmit={simulateAnalysis} suggestedQueries={currentScenarioData.suggestedQueries} isProcessing={isProcessing} />
              <SimulationControls params={simulationParams} onChange={setSimulationParams} onReset={() => setSimulationParams(defaultSimulationParams)} disabled={isProcessing} />
              {isProcessing && currentStep < 1 && (
                <div className="flex items-center justify-center gap-3 p-6 bg-card border border-border/50 rounded-lg animate-pulse">
                  <Loader2 className="h-5 w-5 animate-spin text-primary" />
                  <span className="text-sm text-muted-foreground">Initializing...</span>
                </div>
              )}
              <CynefinRouter classification={scenario?.cynefin || currentScenarioData.cynefin} isVisible={currentStep >= 1} />
              <BayesianPanel beliefStates={scenario?.beliefStates || currentScenarioData.beliefStates} isVisible={currentStep >= 3} />
            </div>

            {/* Center Panel */}
            <div className="lg:col-span-6 space-y-4">
              {!hasStarted && (
                <div className="flex flex-col items-center justify-center min-h-[400px] border border-dashed border-border/50 rounded-lg bg-muted/20">
                  <div className="text-center space-y-4 p-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-2">
                      <Sparkles className="h-8 w-8 text-primary" />
                    </div>
                    <h3 className="text-xl font-semibold">Ready for Analysis</h3>
                    <p className="text-sm text-muted-foreground max-w-md">Enter a query to begin causal analysis with the CARF system.</p>
                  </div>
                </div>
              )}
              {hasStarted && currentStep < 2 && isProcessing && (
                <div className="flex items-center justify-center min-h-[300px] border border-border/50 rounded-lg bg-card">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              )}
              <CausalDAG dag={scenario?.dag || currentScenarioData.dag} isVisible={currentStep >= 2} />
              <CausalAnalysisCard result={scenario?.causalResult || currentScenarioData.causalResult} isVisible={currentStep >= 3} />
              <GuardianPanel decision={scenario?.guardian || currentScenarioData.guardian} isVisible={currentStep >= 4} onApprove={handleApprove} onReject={handleReject} onRequestClarification={handleClarification} />
            </div>

            {/* Right Panel */}
            <div className="lg:col-span-3 space-y-4">
              {hasStarted && currentStep < 5 && isProcessing && (
                <div className="p-4 border border-border/50 rounded-lg bg-card space-y-2">
                  {['QueryParser', 'CynefinRouter', 'CausalAnalyst', 'BayesianUpdater', 'Guardian'].map((step, i) => (
                    <div key={step} className={cn("flex items-center gap-2 text-xs p-2 rounded", currentStep > i ? "bg-status-success/10 text-status-success" : currentStep === i ? "bg-primary/10 text-primary" : "text-muted-foreground")}>
                      {currentStep > i ? <span className="w-4 h-4 rounded-full bg-status-success text-white flex items-center justify-center text-[10px]">✓</span> : currentStep === i ? <Loader2 className="h-4 w-4 animate-spin" /> : <span className="w-4 h-4 rounded-full border border-muted-foreground/30" />}
                      {step}
                    </div>
                  ))}
                </div>
              )}
              <ExecutionTrace trace={scenario?.trace || currentScenarioData.trace} isVisible={currentStep >= 5} />
            </div>
          </div>
        )}

        {/* Developer View */}
        {viewMode === 'developer' && (
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            <div className="space-y-4">
              <QueryInput onSubmit={simulateAnalysis} suggestedQueries={currentScenarioData.suggestedQueries} isProcessing={isProcessing} />
              <SimulationControls params={simulationParams} onChange={setSimulationParams} onReset={() => setSimulationParams(defaultSimulationParams)} disabled={isProcessing} />
            </div>
            <div className="lg:col-span-3">
              <DeveloperDebugView scenario={scenario} isVisible={hasStarted && currentStep >= 5} executionTimeMs={executionTimeMs} />
            </div>
          </div>
        )}

        {/* Executive View */}
        {viewMode === 'executive' && (
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            <div className="space-y-4">
              <QueryInput onSubmit={simulateAnalysis} suggestedQueries={currentScenarioData.suggestedQueries} isProcessing={isProcessing} />
            </div>
            <div className="lg:col-span-3">
              <ExecutiveSummaryView scenario={scenario} isVisible={hasStarted && currentStep >= 5} onApprove={handleApprove} onReject={handleReject} />
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
