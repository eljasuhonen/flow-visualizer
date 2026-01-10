/**
 * CARF Service Layer - Backend-Ready API Abstraction
 * 
 * This service layer provides a clean interface for fetching CARF data.
 * Currently uses mock data but is structured for easy backend integration.
 */

import { getScenario, Scenario } from '@/data/mockData';

export interface AnalysisRequest {
  query: string;
  scenarioId: string;
  simulationParams?: SimulationParams;
}

export interface SimulationParams {
  investmentMultiplier: number;  // 0.5 - 2.0
  confidenceThreshold: number;   // 0.0 - 1.0
  uncertaintyTolerance: number;  // 0.0 - 1.0
  policyStrictness: 'relaxed' | 'standard' | 'strict';
}

export interface AnalysisResponse {
  success: boolean;
  scenario: Scenario;
  timestamp: string;
  executionTimeMs: number;
}

export interface StepProgress {
  step: number;
  name: string;
  status: 'pending' | 'running' | 'complete' | 'error';
  data?: unknown;
}

// Default simulation parameters
export const defaultSimulationParams: SimulationParams = {
  investmentMultiplier: 1.0,
  confidenceThreshold: 0.7,
  uncertaintyTolerance: 0.3,
  policyStrictness: 'standard',
};

/**
 * Apply simulation parameters to modify scenario data
 */
function applySimulationParams(scenario: Scenario, params: SimulationParams): Scenario {
  const modified = JSON.parse(JSON.stringify(scenario)) as Scenario;
  
  // Modify causal result based on investment multiplier
  const originalValue = modified.causalResult.effect;
  modified.causalResult.effect = originalValue * params.investmentMultiplier;
  
  // Adjust confidence intervals (tuple format: [lower, upper])
  const ciRange = modified.causalResult.confidenceInterval[1] - modified.causalResult.confidenceInterval[0];
  const newRange = ciRange * (1 + (1 - params.confidenceThreshold));
  const mid = (modified.causalResult.confidenceInterval[1] + modified.causalResult.confidenceInterval[0]) / 2;
  modified.causalResult.confidenceInterval = [
    mid - newRange / 2,
    mid + newRange / 2,
  ];
  
  // Adjust belief state uncertainties
  modified.beliefStates = modified.beliefStates.map(bs => ({
    ...bs,
    epistemicUncertainty: Math.min(1, bs.epistemicUncertainty * (1 + params.uncertaintyTolerance)),
    aleatoricUncertainty: Math.min(1, bs.aleatoricUncertainty * (1 + params.uncertaintyTolerance * 0.5)),
  }));
  
  // Adjust Cynefin confidence
  modified.cynefin.confidence = Math.max(0.5, modified.cynefin.confidence * params.confidenceThreshold);
  
  // Apply policy strictness
  if (params.policyStrictness === 'strict') {
    modified.guardian.policies = modified.guardian.policies.map(p => ({
      ...p,
      status: p.status === 'pending' ? 'fail' as const : p.status,
    }));
  } else if (params.policyStrictness === 'relaxed') {
    modified.guardian.policies = modified.guardian.policies.map(p => ({
      ...p,
      status: p.status === 'fail' ? 'pending' as const : p.status,
    }));
  }
  
  return modified;
}

/**
 * Simulate a step-by-step analysis with progress callbacks
 */
export async function runAnalysis(
  request: AnalysisRequest,
  onProgress?: (progress: StepProgress) => void
): Promise<AnalysisResponse> {
  const startTime = Date.now();
  const steps = ['QueryParser', 'CynefinRouter', 'CausalAnalyst', 'BayesianUpdater', 'Guardian'];
  const delays = [400, 600, 1200, 800, 500];
  
  // Simulate each step
  for (let i = 0; i < steps.length; i++) {
    onProgress?.({
      step: i + 1,
      name: steps[i],
      status: 'running',
    });
    
    await new Promise(r => setTimeout(r, delays[i]));
    
    onProgress?.({
      step: i + 1,
      name: steps[i],
      status: 'complete',
    });
  }
  
  let scenario = getScenario(request.scenarioId);
  
  // Apply simulation parameters if provided
  if (request.simulationParams) {
    scenario = applySimulationParams(scenario, request.simulationParams);
  }
  
  return {
    success: true,
    scenario,
    timestamp: new Date().toISOString(),
    executionTimeMs: Date.now() - startTime,
  };
}

/**
 * Fetch scenario metadata (for quick access without full analysis)
 */
export async function getScenarioMetadata(scenarioId: string): Promise<{
  name: string;
  domain: string;
  description: string;
}> {
  // Simulate network delay
  await new Promise(r => setTimeout(r, 100));
  
  const scenario = getScenario(scenarioId);
  return {
    name: scenario.name,
    domain: scenario.cynefin.domain,
    description: scenario.description,
  };
}

/**
 * Submit approval decision to backend
 */
export async function submitDecision(
  receiptId: string,
  decision: 'approve' | 'reject' | 'clarify',
  reason?: string
): Promise<{ success: boolean; confirmationId: string }> {
  // Simulate network delay
  await new Promise(r => setTimeout(r, 300));
  
  return {
    success: true,
    confirmationId: `conf_${Date.now().toString(36)}`,
  };
}
