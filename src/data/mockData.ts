// CARF Epistemic Cockpit Mock Data
// Comprehensive mock data for S3AE, BCX, and TEH scenarios

export type CynefinDomain = 'clear' | 'complicated' | 'complex' | 'chaotic';
export type ConfidenceLevel = 'high' | 'medium' | 'low';
export type PolicyStatus = 'pass' | 'fail' | 'pending';

export interface DomainScores {
  clear: number;
  complicated: number;
  complex: number;
  chaotic: number;
}

export interface CynefinClassification {
  domain: CynefinDomain;
  entropy: number;
  confidence: number;
  scores: DomainScores;
  solver: string;
  reasoning: string;
}

export interface DAGNode {
  id: string;
  label: string;
  type: 'variable' | 'confounder' | 'intervention' | 'outcome';
  x: number;
  y: number;
  value?: number;
  unit?: string;
}

export interface DAGEdge {
  id: string;
  source: string;
  target: string;
  effectSize: number;
  pValue: number;
  validated: boolean;
  confounders?: string[];
}

export interface CausalDAG {
  nodes: DAGNode[];
  edges: DAGEdge[];
  backdoorPaths: string[][];
}

export interface BayesianBeliefState {
  variable: string;
  priorMean: number;
  priorStd: number;
  posteriorMean: number;
  posteriorStd: number;
  epistemicUncertainty: number;
  aleatoricUncertainty: number;
  totalUncertainty: number;
  confidenceLevel: ConfidenceLevel;
  interpretation: string;
  observations: { time: string; value: number }[];
}

export interface CausalAnalysisResult {
  effect: number;
  unit: string;
  description: string;
  confidenceInterval: [number, number];
  pValue: number;
  refutationsPassed: number;
  refutationsTotal: number;
  refutationDetails: { name: string; passed: boolean; pValue: number }[];
  confoundersControlled: { name: string; controlled: boolean }[];
  evidenceBase: string;
  metaAnalysis: boolean;
  studies: number;
}

export interface PolicyCheck {
  id: string;
  name: string;
  description: string;
  status: PolicyStatus;
  version: string;
  details?: string;
}

export interface GuardianDecision {
  proposedAction: {
    type: string;
    target: string;
    amount: number;
    unit: string;
    expectedEffect: string;
  };
  policies: PolicyCheck[];
  overallStatus: PolicyStatus;
  requiresHumanApproval: boolean;
}

export interface ExecutionStep {
  id: string;
  node: string;
  status: 'success' | 'warning' | 'error' | 'pending';
  duration: number;
  timestamp: string;
  inputs?: Record<string, unknown>;
  outputs?: Record<string, unknown>;
  subSteps?: ExecutionStep[];
}

export interface ExecutionTrace {
  receiptId: string;
  sessionId: string;
  totalDuration: number;
  steps: ExecutionStep[];
  langsmithUrl: string;
}

export interface Scenario {
  id: string;
  name: string;
  domain: string;
  description: string;
  query: string;
  suggestedQueries: string[];
  cynefin: CynefinClassification;
  dag: CausalDAG;
  beliefStates: BayesianBeliefState[];
  causalResult: CausalAnalysisResult;
  guardian: GuardianDecision;
  trace: ExecutionTrace;
}

// S3AE - Scope 3 Attribution Engine Scenario
export const s3aeScenario: Scenario = {
  id: 's3ae-supplier-investment',
  name: 'Scope 3 Attribution Engine',
  domain: 'S3AE',
  description: 'Analyze causal impact of supplier sustainability investments on Scope 3 emissions',
  query: 'What is the causal impact of our $10M supplier sustainability program on Scope 3 emissions?',
  suggestedQueries: [
    'Which suppliers have the highest emissions reduction potential?',
    'What ROI can we expect from renewable energy investments?',
    'How do shipping mode changes affect our carbon footprint?',
  ],
  cynefin: {
    domain: 'complicated',
    entropy: 0.32,
    confidence: 0.87,
    scores: { clear: 0.12, complicated: 0.87, complex: 0.45, chaotic: 0.08 },
    solver: 'CausalAnalyst',
    reasoning: 'Linear supply chain relationships with measurable intervention points. Expert analysis required but deterministic outcomes expected.',
  },
  dag: {
    nodes: [
      { id: 'investment', label: 'Sustainability Investment', type: 'intervention', x: 100, y: 200, value: 10, unit: 'M USD' },
      { id: 'supplier_tech', label: 'Supplier Technology Upgrade', type: 'variable', x: 300, y: 100 },
      { id: 'energy_source', label: 'Energy Source Mix', type: 'variable', x: 300, y: 300 },
      { id: 'production_efficiency', label: 'Production Efficiency', type: 'confounder', x: 500, y: 50 },
      { id: 'market_price', label: 'Market Commodity Price', type: 'confounder', x: 500, y: 350 },
      { id: 'emissions', label: 'Scope 3 Emissions', type: 'outcome', x: 700, y: 200, value: -750, unit: 'tonnes CO2e' },
    ],
    edges: [
      { id: 'e1', source: 'investment', target: 'supplier_tech', effectSize: 0.72, pValue: 0.001, validated: true },
      { id: 'e2', source: 'investment', target: 'energy_source', effectSize: 0.65, pValue: 0.003, validated: true },
      { id: 'e3', source: 'supplier_tech', target: 'emissions', effectSize: -0.48, pValue: 0.012, validated: true, confounders: ['production_efficiency'] },
      { id: 'e4', source: 'energy_source', target: 'emissions', effectSize: -0.55, pValue: 0.008, validated: true, confounders: ['market_price'] },
      { id: 'e5', source: 'production_efficiency', target: 'supplier_tech', effectSize: 0.25, pValue: 0.045, validated: true },
      { id: 'e6', source: 'market_price', target: 'energy_source', effectSize: -0.18, pValue: 0.089, validated: false },
    ],
    backdoorPaths: [
      ['investment', 'supplier_tech', 'production_efficiency', 'emissions'],
      ['investment', 'energy_source', 'market_price', 'emissions'],
    ],
  },
  beliefStates: [
    {
      variable: 'Emissions Reduction',
      priorMean: -500,
      priorStd: 200,
      posteriorMean: -750,
      posteriorStd: 85,
      epistemicUncertainty: 0.18,
      aleatoricUncertainty: 0.12,
      totalUncertainty: 0.22,
      confidenceLevel: 'high',
      interpretation: 'High confidence in emissions reduction estimate. Safe to proceed with decision.',
      observations: [
        { time: 'Q1 2024', value: -180 },
        { time: 'Q2 2024', value: -420 },
        { time: 'Q3 2024', value: -610 },
        { time: 'Q4 2024', value: -750 },
      ],
    },
    {
      variable: 'Investment ROI',
      priorMean: 2.5,
      priorStd: 1.2,
      posteriorMean: 3.2,
      posteriorStd: 0.45,
      epistemicUncertainty: 0.15,
      aleatoricUncertainty: 0.08,
      totalUncertainty: 0.17,
      confidenceLevel: 'high',
      interpretation: 'Strong positive ROI expected with narrow confidence interval.',
      observations: [
        { time: 'Q1 2024', value: 1.8 },
        { time: 'Q2 2024', value: 2.4 },
        { time: 'Q3 2024', value: 2.9 },
        { time: 'Q4 2024', value: 3.2 },
      ],
    },
  ],
  causalResult: {
    effect: -75,
    unit: 'tonnes CO2e per $1M invested',
    description: 'Each $1M invested in supplier sustainability programs causally reduces Scope 3 emissions by approximately 75 tonnes CO2e annually.',
    confidenceInterval: [-92, -58],
    pValue: 0.003,
    refutationsPassed: 4,
    refutationsTotal: 5,
    refutationDetails: [
      { name: 'Placebo Treatment', passed: true, pValue: 0.89 },
      { name: 'Random Common Cause', passed: true, pValue: 0.76 },
      { name: 'Data Subset', passed: true, pValue: 0.04 },
      { name: 'Bootstrap', passed: true, pValue: 0.02 },
      { name: 'Sensitivity Analysis', passed: false, pValue: 0.06 },
    ],
    confoundersControlled: [
      { name: 'Production Efficiency', controlled: true },
      { name: 'Market Commodity Price', controlled: true },
      { name: 'Seasonal Variation', controlled: true },
      { name: 'Geographic Location', controlled: false },
    ],
    evidenceBase: 'Based on 45 supplier programs across 12 regions',
    metaAnalysis: true,
    studies: 45,
  },
  guardian: {
    proposedAction: {
      type: 'BUDGET_ALLOCATION',
      target: 'Supplier Sustainability Program',
      amount: 10,
      unit: 'M USD',
      expectedEffect: 'Reduce Scope 3 emissions by 750 tonnes CO2e annually',
    },
    policies: [
      { id: 'p1', name: 'Budget Authority', description: 'Allocation within authorized spending limits', status: 'pass', version: '2.1.0' },
      { id: 'p2', name: 'ESG Compliance', description: 'Meets corporate sustainability targets', status: 'pass', version: '3.0.1' },
      { id: 'p3', name: 'ROI Threshold', description: 'Expected ROI exceeds minimum threshold of 2.0x', status: 'pass', version: '1.5.0' },
      { id: 'p4', name: 'Risk Assessment', description: 'Risk score within acceptable bounds', status: 'pass', version: '2.0.0' },
      { id: 'p5', name: 'Stakeholder Approval', description: 'Requires sign-off from Sustainability Committee', status: 'pending', version: '1.0.0' },
    ],
    overallStatus: 'pending',
    requiresHumanApproval: true,
  },
  trace: {
    receiptId: 'rcpt_s3ae_2024_001_7f8a9b2c',
    sessionId: 'sess_abc123def456',
    totalDuration: 4250,
    steps: [
      { id: 's1', node: 'QueryParser', status: 'success', duration: 120, timestamp: '2024-01-15T10:30:00Z' },
      { id: 's2', node: 'CynefinRouter', status: 'success', duration: 340, timestamp: '2024-01-15T10:30:00.120Z' },
      { id: 's3', node: 'CausalAnalyst', status: 'success', duration: 2310, timestamp: '2024-01-15T10:30:00.460Z' },
      { id: 's4', node: 'BayesianUpdater', status: 'success', duration: 890, timestamp: '2024-01-15T10:30:02.770Z' },
      { id: 's5', node: 'Guardian', status: 'warning', duration: 590, timestamp: '2024-01-15T10:30:03.660Z' },
    ],
    langsmithUrl: 'https://smith.langchain.com/public/trace/abc123',
  },
};

// BCX - Building Circularity Index Scenario
export const bcxScenario: Scenario = {
  id: 'bcx-material-quality',
  name: 'Building Circularity Index',
  domain: 'BCX',
  description: 'Bayesian assessment of reclaimed material quality under uncertainty',
  query: 'Should we use reclaimed steel beams for the new construction project given quality uncertainty?',
  suggestedQueries: [
    'What is the circularity score of available materials?',
    'How does material provenance affect structural integrity?',
    'What testing protocols reduce quality uncertainty?',
  ],
  cynefin: {
    domain: 'complex',
    entropy: 0.68,
    confidence: 0.62,
    scores: { clear: 0.08, complicated: 0.35, complex: 0.72, chaotic: 0.28 },
    solver: 'BayesianExplorer',
    reasoning: 'Material quality exhibits emergent properties based on usage history. Multiple feedback loops between quality assessment and decision outcomes.',
  },
  dag: {
    nodes: [
      { id: 'testing', label: 'Material Testing', type: 'intervention', x: 100, y: 200 },
      { id: 'provenance', label: 'Provenance Data', type: 'variable', x: 250, y: 100 },
      { id: 'age', label: 'Material Age', type: 'confounder', x: 250, y: 300 },
      { id: 'quality', label: 'Structural Quality', type: 'variable', x: 450, y: 150 },
      { id: 'certification', label: 'Certification Status', type: 'variable', x: 450, y: 250 },
      { id: 'decision', label: 'Use Decision', type: 'outcome', x: 650, y: 200 },
    ],
    edges: [
      { id: 'e1', source: 'testing', target: 'quality', effectSize: 0.85, pValue: 0.001, validated: true },
      { id: 'e2', source: 'provenance', target: 'quality', effectSize: 0.45, pValue: 0.023, validated: true },
      { id: 'e3', source: 'age', target: 'quality', effectSize: -0.35, pValue: 0.041, validated: true },
      { id: 'e4', source: 'quality', target: 'certification', effectSize: 0.78, pValue: 0.002, validated: true },
      { id: 'e5', source: 'quality', target: 'decision', effectSize: 0.65, pValue: 0.008, validated: true },
      { id: 'e6', source: 'certification', target: 'decision', effectSize: 0.55, pValue: 0.015, validated: true },
    ],
    backdoorPaths: [['testing', 'quality', 'age', 'provenance']],
  },
  beliefStates: [
    {
      variable: 'Material Quality Score',
      priorMean: 0.65,
      priorStd: 0.25,
      posteriorMean: 0.78,
      posteriorStd: 0.12,
      epistemicUncertainty: 0.35,
      aleatoricUncertainty: 0.18,
      totalUncertainty: 0.42,
      confidenceLevel: 'medium',
      interpretation: 'Moderate uncertainty in quality assessment. Additional testing recommended before final decision.',
      observations: [
        { time: 'Test 1', value: 0.72 },
        { time: 'Test 2', value: 0.75 },
        { time: 'Test 3', value: 0.81 },
        { time: 'Test 4', value: 0.78 },
      ],
    },
  ],
  causalResult: {
    effect: 0.78,
    unit: 'quality confidence score',
    description: 'Non-destructive testing improves quality confidence by 78% compared to provenance-only assessment.',
    confidenceInterval: [0.62, 0.94],
    pValue: 0.012,
    refutationsPassed: 3,
    refutationsTotal: 4,
    refutationDetails: [
      { name: 'Placebo Treatment', passed: true, pValue: 0.82 },
      { name: 'Random Common Cause', passed: true, pValue: 0.68 },
      { name: 'Data Subset', passed: true, pValue: 0.05 },
      { name: 'Sensitivity Analysis', passed: false, pValue: 0.08 },
    ],
    confoundersControlled: [
      { name: 'Material Age', controlled: true },
      { name: 'Storage Conditions', controlled: false },
    ],
    evidenceBase: 'Based on 23 reclaimed material assessments',
    metaAnalysis: false,
    studies: 23,
  },
  guardian: {
    proposedAction: {
      type: 'MATERIAL_APPROVAL',
      target: 'Reclaimed Steel Beams Lot #2847',
      amount: 450,
      unit: 'tonnes',
      expectedEffect: 'Reduce embodied carbon by 65% compared to virgin steel',
    },
    policies: [
      { id: 'p1', name: 'Structural Safety', description: 'Meets building code requirements', status: 'pass', version: '4.2.0' },
      { id: 'p2', name: 'Quality Threshold', description: 'Quality score above minimum 0.70', status: 'pass', version: '2.0.0' },
      { id: 'p3', name: 'Uncertainty Limit', description: 'Total uncertainty below 0.50', status: 'pass', version: '1.2.0' },
      { id: 'p4', name: 'Insurance Coverage', description: 'Material covered under project insurance', status: 'pending', version: '3.0.0' },
    ],
    overallStatus: 'pending',
    requiresHumanApproval: true,
  },
  trace: {
    receiptId: 'rcpt_bcx_2024_002_3e4f5g6h',
    sessionId: 'sess_def456ghi789',
    totalDuration: 3180,
    steps: [
      { id: 's1', node: 'QueryParser', status: 'success', duration: 95, timestamp: '2024-01-15T11:00:00Z' },
      { id: 's2', node: 'CynefinRouter', status: 'success', duration: 280, timestamp: '2024-01-15T11:00:00.095Z' },
      { id: 's3', node: 'BayesianExplorer', status: 'success', duration: 1850, timestamp: '2024-01-15T11:00:00.375Z' },
      { id: 's4', node: 'UncertaintyQuantifier', status: 'warning', duration: 520, timestamp: '2024-01-15T11:00:02.225Z' },
      { id: 's5', node: 'Guardian', status: 'success', duration: 435, timestamp: '2024-01-15T11:00:02.745Z' },
    ],
    langsmithUrl: 'https://smith.langchain.com/public/trace/def456',
  },
};

// TEH - Transactive Energy Holon Scenario
export const tehScenario: Scenario = {
  id: 'teh-grid-stability',
  name: 'Transactive Energy Holon',
  domain: 'TEH',
  description: 'Real-time grid stability decision under chaotic market conditions',
  query: 'Should we activate demand response given current grid instability and price volatility?',
  suggestedQueries: [
    'What is our current energy flexibility capacity?',
    'How do neighboring holons affect our stability?',
    'What is the optimal battery dispatch strategy?',
  ],
  cynefin: {
    domain: 'chaotic',
    entropy: 0.89,
    confidence: 0.41,
    scores: { clear: 0.05, complicated: 0.18, complex: 0.52, chaotic: 0.89 },
    solver: 'EmergencyResponder',
    reasoning: 'Extreme price volatility and cascading grid effects. No stable patterns detectable. Immediate action required with continuous monitoring.',
  },
  dag: {
    nodes: [
      { id: 'demand_response', label: 'Demand Response', type: 'intervention', x: 100, y: 200 },
      { id: 'grid_frequency', label: 'Grid Frequency', type: 'variable', x: 300, y: 100 },
      { id: 'price_signal', label: 'Price Signal', type: 'variable', x: 300, y: 300 },
      { id: 'neighbor_load', label: 'Neighbor Holon Load', type: 'confounder', x: 500, y: 100 },
      { id: 'weather', label: 'Weather Conditions', type: 'confounder', x: 500, y: 300 },
      { id: 'stability', label: 'Grid Stability', type: 'outcome', x: 700, y: 200 },
    ],
    edges: [
      { id: 'e1', source: 'demand_response', target: 'grid_frequency', effectSize: 0.55, pValue: 0.042, validated: false },
      { id: 'e2', source: 'demand_response', target: 'price_signal', effectSize: -0.42, pValue: 0.068, validated: false },
      { id: 'e3', source: 'grid_frequency', target: 'stability', effectSize: 0.72, pValue: 0.015, validated: true },
      { id: 'e4', source: 'price_signal', target: 'stability', effectSize: 0.35, pValue: 0.089, validated: false },
      { id: 'e5', source: 'neighbor_load', target: 'grid_frequency', effectSize: -0.48, pValue: 0.031, validated: true },
      { id: 'e6', source: 'weather', target: 'price_signal', effectSize: 0.62, pValue: 0.022, validated: true },
    ],
    backdoorPaths: [
      ['demand_response', 'grid_frequency', 'neighbor_load', 'stability'],
      ['demand_response', 'price_signal', 'weather', 'stability'],
    ],
  },
  beliefStates: [
    {
      variable: 'Grid Stability Index',
      priorMean: 0.45,
      priorStd: 0.35,
      posteriorMean: 0.52,
      posteriorStd: 0.28,
      epistemicUncertainty: 0.55,
      aleatoricUncertainty: 0.42,
      totalUncertainty: 0.72,
      confidenceLevel: 'low',
      interpretation: 'High uncertainty in stability prediction. Multiple scenarios possible. Proceed with caution and continuous monitoring.',
      observations: [
        { time: '10:00', value: 0.68 },
        { time: '10:15', value: 0.42 },
        { time: '10:30', value: 0.55 },
        { time: '10:45', value: 0.38 },
        { time: '11:00', value: 0.52 },
      ],
    },
  ],
  causalResult: {
    effect: 0.15,
    unit: 'stability improvement probability',
    description: 'Demand response activation has 15% probability of improving grid stability, but high uncertainty due to cascading effects.',
    confidenceInterval: [-0.12, 0.42],
    pValue: 0.145,
    refutationsPassed: 1,
    refutationsTotal: 4,
    refutationDetails: [
      { name: 'Placebo Treatment', passed: true, pValue: 0.65 },
      { name: 'Random Common Cause', passed: false, pValue: 0.12 },
      { name: 'Data Subset', passed: false, pValue: 0.18 },
      { name: 'Sensitivity Analysis', passed: false, pValue: 0.22 },
    ],
    confoundersControlled: [
      { name: 'Neighbor Holon Load', controlled: false },
      { name: 'Weather Conditions', controlled: true },
      { name: 'Time of Day', controlled: true },
    ],
    evidenceBase: 'Based on 8 similar events in past 30 days',
    metaAnalysis: false,
    studies: 8,
  },
  guardian: {
    proposedAction: {
      type: 'DEMAND_RESPONSE_ACTIVATION',
      target: 'Industrial Load Shedding',
      amount: 2.5,
      unit: 'MW',
      expectedEffect: 'Reduce grid stress by estimated 12-18%',
    },
    policies: [
      { id: 'p1', name: 'Safety Override', description: 'Emergency action permitted under grid stress', status: 'pass', version: '5.0.0' },
      { id: 'p2', name: 'Customer Contract', description: 'Within agreed demand response limits', status: 'pass', version: '2.3.0' },
      { id: 'p3', name: 'Compensation Rate', description: 'Compensation rate calculated correctly', status: 'pass', version: '1.8.0' },
      { id: 'p4', name: 'Cascade Risk', description: 'Cascade risk assessment completed', status: 'fail', version: '1.0.0', details: 'Unable to assess cascade risk due to incomplete neighbor data' },
    ],
    overallStatus: 'fail',
    requiresHumanApproval: true,
  },
  trace: {
    receiptId: 'rcpt_teh_2024_003_9i0j1k2l',
    sessionId: 'sess_ghi789jkl012',
    totalDuration: 1850,
    steps: [
      { id: 's1', node: 'QueryParser', status: 'success', duration: 45, timestamp: '2024-01-15T11:00:00Z' },
      { id: 's2', node: 'CynefinRouter', status: 'warning', duration: 180, timestamp: '2024-01-15T11:00:00.045Z' },
      { id: 's3', node: 'EmergencyResponder', status: 'success', duration: 920, timestamp: '2024-01-15T11:00:00.225Z' },
      { id: 's4', node: 'RiskAssessor', status: 'error', duration: 450, timestamp: '2024-01-15T11:00:01.145Z' },
      { id: 's5', node: 'Guardian', status: 'error', duration: 255, timestamp: '2024-01-15T11:00:01.595Z' },
    ],
    langsmithUrl: 'https://smith.langchain.com/public/trace/ghi789',
  },
};

export const scenarios: Record<string, Scenario> = {
  s3ae: s3aeScenario,
  bcx: bcxScenario,
  teh: tehScenario,
};

export const getScenario = (id: string): Scenario => {
  return scenarios[id] || s3aeScenario;
};

export const scenarioList = [
  { id: 's3ae', name: 'Scope 3 Attribution', domain: 'S3AE', icon: '🌍' },
  { id: 'bcx', name: 'Building Circularity', domain: 'BCX', icon: '🏗️' },
  { id: 'teh', name: 'Transactive Energy', domain: 'TEH', icon: '⚡' },
];
