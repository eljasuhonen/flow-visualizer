# CARF Epistemic Cockpit — UI Component Documentation

A comprehensive technical breakdown of all UI components powering the CARF (Causal Analysis and Reasoning Framework) Epistemic Cockpit.

---

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Core Components](#core-components)
   - [DashboardHeader](#dashboardheader)
   - [QueryInput](#queryinput)
   - [CynefinRouter](#cynefinrouter)
   - [CausalDAG](#causaldag)
   - [BayesianPanel](#bayesianpanel)
   - [CausalAnalysisCard](#causalanalysiscard)
   - [GuardianPanel](#guardianpanel)
   - [ExecutionTrace](#executiontrace)
3. [View Mode Components](#view-mode-components)
   - [DeveloperDebugView](#developerdebugview)
   - [ExecutiveSummaryView](#executivesummaryview)
4. [Control Components](#control-components)
   - [SimulationControls](#simulationcontrols)
5. [Data Flow](#data-flow)
6. [Design System Tokens](#design-system-tokens)
7. [Animation Patterns](#animation-patterns)

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────────┐
│                         Index.tsx (Page)                            │
│  ┌──────────────────────────────────────────────────────────────┐   │
│  │                    DashboardHeader                            │   │
│  │  Logo | Scenario Selector | Session ID | Theme Toggle | User  │   │
│  └──────────────────────────────────────────────────────────────┘   │
│                                                                      │
│  ┌──────────────────────────────────────────────────────────────┐   │
│  │              View Mode Tabs (End-User | Developer | Exec)     │   │
│  └──────────────────────────────────────────────────────────────┘   │
│                                                                      │
│  ┌────────────┐  ┌──────────────────────┐  ┌────────────────────┐   │
│  │ LEFT COL   │  │     CENTER COLUMN     │  │   RIGHT COLUMN    │   │
│  │            │  │                       │  │                   │   │
│  │ QueryInput │  │ CausalDAG             │  │ Progress Steps    │   │
│  │ Simulation │  │ CausalAnalysisCard    │  │ ExecutionTrace    │   │
│  │ Controls   │  │ GuardianPanel         │  │                   │   │
│  │ Cynefin    │  │                       │  │                   │   │
│  │ Router     │  │                       │  │                   │   │
│  │ Bayesian   │  │                       │  │                   │   │
│  │ Panel      │  │                       │  │                   │   │
│  └────────────┘  └──────────────────────┘  └────────────────────┘   │
└─────────────────────────────────────────────────────────────────────┘
```

### Component Visibility Flow

Components are revealed sequentially based on `currentStep`:

| Step | Components Revealed |
|------|---------------------|
| 0    | Initial state (Query Input visible) |
| 1    | CynefinRouter |
| 2    | CausalDAG |
| 3    | BayesianPanel, CausalAnalysisCard |
| 4    | GuardianPanel |
| 5    | ExecutionTrace, Debug/Executive Views |

---

## Core Components

### DashboardHeader

**Location:** `src/components/carf/DashboardHeader.tsx`

**Purpose:** Global navigation bar with branding, scenario selection, session tracking, and user controls.

#### Props Interface

```typescript
interface DashboardHeaderProps {
  selectedScenario: string;        // Current scenario ID
  onScenarioChange: (id: string) => void;  // Callback when scenario changes
  sessionId: string;               // Unique session identifier
}
```

#### Structure

```
┌─────────────────────────────────────────────────────────────────────┐
│ [Logo] CARF Epistemic Cockpit v1.0.0 | [Scenario ▼] [●Session] | ⚙️🔔👤│
└─────────────────────────────────────────────────────────────────────┘
```

#### Key Features

| Feature | Implementation |
|---------|----------------|
| **Logo** | Gradient hexagon icon with `Hexagon` from lucide-react |
| **Theme Toggle** | Local state with `document.documentElement.classList.toggle('dark')` |
| **Scenario Selector** | Radix Select with emoji icons and domain badges |
| **Session Indicator** | Pulsing green dot with truncated session ID |
| **Notification Bell** | Ghost button with destructive dot indicator |

#### Styling Tokens

- `glass-strong` — Frosted glass background effect
- `text-gradient` — Primary gradient text for title
- `bg-gradient-to-br from-primary to-accent` — Logo background

---

### QueryInput

**Location:** `src/components/carf/QueryInput.tsx`

**Purpose:** Primary user input for submitting analysis queries with suggested quick-actions.

#### Props Interface

```typescript
interface QueryInputProps {
  onSubmit: (query: string) => void;  // Callback with query text
  suggestedQueries: string[];          // Array of preset suggestions
  isProcessing: boolean;               // Disables input during analysis
}
```

#### Structure

```
┌─────────────────────────────────────────────────┐
│ [Textarea: "Ask a question..."]                 │
│                                    [📎] [Send] │
├─────────────────────────────────────────────────┤
│ SUGGESTED QUERIES                               │
│ [Badge 1] [Badge 2] [Badge 3]                   │
└─────────────────────────────────────────────────┘
```

#### Key Features

| Feature | Implementation |
|---------|----------------|
| **Submit on Enter** | `handleKeyDown` checks `!e.shiftKey` before submitting |
| **Loading State** | Button shows `Sparkles` icon with "Analyzing..." text |
| **Clickable Suggestions** | Badges populate textarea on click |
| **Attachment Button** | Placeholder for future file upload |

#### Keyboard Handling

```typescript
const handleKeyDown = (e: React.KeyboardEvent) => {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault();
    handleSubmit();
  }
};
```

---

### CynefinRouter

**Location:** `src/components/carf/CynefinRouter.tsx`

**Purpose:** Classifies the problem domain according to Cynefin framework and routes to appropriate solver.

#### Props Interface

```typescript
interface CynefinRouterProps {
  classification: CynefinClassification;  // Domain classification data
  isVisible: boolean;                     // Controls render
}
```

#### Data Structure

```typescript
interface CynefinClassification {
  domain: 'clear' | 'complicated' | 'complex' | 'chaotic';
  confidence: number;      // 0-1
  entropy: number;         // 0-1 signal entropy
  solver: string;          // e.g., "BayesianInference"
  reasoning: string;       // Explanation text
  scores: Record<CynefinDomain, number>;  // Per-domain scores
}
```

#### Visual Design

```
┌─────────────────────────────────────────────────┐
│ 🧭 Cynefin Classification         [COMPLICATED] │
├─────────────────────────────────────────────────┤
│ Expert analysis - Sense, Analyze, Respond       │
│                                                 │
│ Signal Entropy  ████████░░░░  0.64              │
│ Confidence      ████████████  87%               │
│                                                 │
│ 🛤️ Routed to: BayesianInference                │
│                                                 │
│ ▼ View domain scores                            │
│   Clear        ██░░░░░░░░  15%                  │
│   Complicated  ████████░░  64%                  │
│   Complex      ████░░░░░░  18%                  │
│   Chaotic      █░░░░░░░░░  3%                   │
│                                                 │
│ 🧠 [Reasoning text...]                          │
└─────────────────────────────────────────────────┘
```

#### Domain Configuration

```typescript
const domainConfig = {
  clear: {
    label: 'Clear',
    color: 'text-cynefin-clear',
    bgColor: 'bg-cynefin-clear',
    description: 'Best practice - Sense, Categorize, Respond',
  },
  complicated: {
    label: 'Complicated',
    color: 'text-cynefin-complicated',
    bgColor: 'bg-cynefin-complicated',
    description: 'Expert analysis - Sense, Analyze, Respond',
  },
  complex: {
    label: 'Complex',
    color: 'text-cynefin-complex',
    bgColor: 'bg-cynefin-complex',
    description: 'Emergent practice - Probe, Sense, Respond',
  },
  chaotic: {
    label: 'Chaotic',
    color: 'text-cynefin-chaotic',
    bgColor: 'bg-cynefin-chaotic',
    description: 'Novel practice - Act, Sense, Respond',
  },
};
```

---

### CausalDAG

**Location:** `src/components/carf/CausalDAG.tsx`

**Purpose:** Interactive Directed Acyclic Graph visualization for causal relationships.

#### Props Interface

```typescript
interface CausalDAGProps {
  dag: CausalDAGType;                    // Graph data
  isVisible: boolean;                    // Controls render
  onNodeClick?: (node: DAGNode) => void; // Node selection callback
}
```

#### Data Structures

```typescript
interface DAGNode {
  id: string;
  label: string;
  type: 'variable' | 'confounder' | 'intervention' | 'outcome';
  x: number;       // Position
  y: number;
  value?: number;  // Optional metric
  unit?: string;
}

interface DAGEdge {
  id: string;
  source: string;      // Node ID
  target: string;      // Node ID
  effectSize: number;  // Causal effect magnitude
  pValue: number;      // Statistical significance
  validated: boolean;  // Whether empirically validated
  confounders?: string[];  // Affecting confounders
}
```

#### Visual Elements

| Element | Shape | Color Token |
|---------|-------|-------------|
| Variable | Circle | `chart-1` |
| Confounder | Diamond | `chart-4` |
| Intervention | Hexagon | `chart-2` |
| Outcome | Circle (larger) | `chart-3` |
| Validated Edge | Solid line | `chart-1` |
| Pending Edge | Dashed line | `muted-foreground` |

#### Interaction Controls

```
┌────────────────────────────────────────────────────────────┐
│ 🌳 Causal DAG                      [−] [100%] [+] [⛶]    │
├────────────────────────────────────────────────────────────┤
│ [Toggle] Show Confounders    [Toggle] Highlight Backdoors │
├────────────────────────────────────────────────────────────┤
│                                                            │
│        ◇ Seasonality                                       │
│           ↘                                                │
│    [Investment] ──(+0.42)──▶ [Revenue]                     │
│           ↗                     ↑                          │
│        ◇ Market                 │                          │
│          Conditions ────────────┘                          │
│                                                            │
│                                    6 nodes · 8 edges       │
├────────────────────────────────────────────────────────────┤
│ ● Variable  ◆ Confounder  ⬡ Intervention  ● Outcome       │
│ ── Validated  - - Pending                                  │
└────────────────────────────────────────────────────────────┘
```

#### SVG Construction

```typescript
// Dynamic viewBox calculation
const viewBox = useMemo(() => {
  const padding = 80;
  const minX = Math.min(...dag.nodes.map(n => n.x)) - padding;
  const maxX = Math.max(...dag.nodes.map(n => n.x)) + padding;
  const minY = Math.min(...dag.nodes.map(n => n.y)) - padding;
  const maxY = Math.max(...dag.nodes.map(n => n.y)) + padding + 30;
  return `${minX} ${minY} ${maxX - minX} ${maxY - minY}`;
}, [dag.nodes]);
```

---

### BayesianPanel

**Location:** `src/components/carf/BayesianPanel.tsx`

**Purpose:** Visualizes Bayesian belief states with prior/posterior distributions and uncertainty decomposition.

#### Props Interface

```typescript
interface BayesianPanelProps {
  beliefStates: BayesianBeliefState[];  // Array of belief states
  isVisible: boolean;
}
```

#### Data Structure

```typescript
interface BayesianBeliefState {
  variable: string;
  priorMean: number;
  priorStd: number;
  posteriorMean: number;
  posteriorStd: number;
  confidenceLevel: 'high' | 'medium' | 'low';
  interpretation: string;
  epistemicUncertainty: number;  // 0-1
  aleatoricUncertainty: number;  // 0-1
  totalUncertainty: number;      // 0-1
  observations: Array<{ time: string; value: number }>;
}
```

#### Visual Layout

```
┌───────────────────────────────────────────────────────────┐
│ 📊 Bayesian Belief State              [Variable ▼]       │
├───────────────────────────────────────────────────────────┤
│                                                           │
│      ╭──────╮                                             │
│     ╱        ╲   ← Prior (dashed)                         │
│    ╱    ╭────╲───╮                                        │
│   ╱    ╱      ╲   ╲  ← Posterior (solid)                  │
│  ╱    ╱        ╲   ╲                                      │
│ ─────╱──────────╲───╲───────────                          │
│              ↑ Mean reference line                         │
│                                                           │
│        - - Prior    ── Posterior                          │
│                                                           │
│ ┌─────────────┐  ┌─────────────┐                          │
│ │ Post. Mean  │  │   95% CI    │                          │
│ │   142.50    │  │ [128, 157]  │                          │
│ │  ±8.25 std  │  │             │                          │
│ └─────────────┘  └─────────────┘                          │
│                                                           │
│ UNCERTAINTY DECOMPOSITION                                 │
│ Epistemic  ██████░░░░   42%                               │
│ Aleatoric  ████░░░░░░   28%                               │
│ ─────────────────────────────                             │
│ Total      ████████░░   58%                               │
│                                                           │
│ ┌─────────────────────────────────────────────────────┐   │
│ │ ℹ️ Medium Confidence                                 │   │
│ │ Evidence moderately supports revenue hypothesis     │   │
│ └─────────────────────────────────────────────────────┘   │
│                                                           │
│ 📈 Belief Evolution                                       │
│ ─╲_╱───╲╱─────────── (sparkline)                          │
└───────────────────────────────────────────────────────────┘
```

#### Distribution Generation

```typescript
function generateDistributionData(mean: number, std: number, prefix: string) {
  const data = [];
  const range = std * 4;
  const step = range / 50;
  for (let x = mean - range; x <= mean + range; x += step) {
    const z = (x - mean) / std;
    const y = Math.exp(-0.5 * z * z) / (std * Math.sqrt(2 * Math.PI));
    data.push({ x, [prefix]: y });
  }
  return data;
}
```

#### Confidence Level Styling

| Level | Color Token | Icon |
|-------|-------------|------|
| High | `confidence-high` | ✅ CheckCircle2 |
| Medium | `confidence-medium` | ℹ️ Info |
| Low | `confidence-low` | ⚠️ AlertTriangle |

---

### CausalAnalysisCard

**Location:** `src/components/carf/CausalAnalysisCard.tsx`

**Purpose:** Displays causal effect estimates with refutation tests and confounder analysis.

#### Props Interface

```typescript
interface CausalAnalysisCardProps {
  result: CausalAnalysisResult;
  isVisible: boolean;
}
```

#### Data Structure

```typescript
interface CausalAnalysisResult {
  effect: number;                // Point estimate
  unit: string;                  // e.g., "million USD"
  pValue: number;
  confidenceInterval: [number, number];
  description: string;
  refutationsPassed: number;
  refutationsTotal: number;
  refutationDetails: Array<{
    name: string;
    passed: boolean;
    pValue: number;
  }>;
  confoundersControlled: Array<{
    name: string;
    controlled: boolean;
  }>;
  evidenceBase: string;
  metaAnalysis: boolean;
  studies: number;
}
```

#### Visual Layout

```
┌───────────────────────────────────────────────────────────┐
│ 🧪 Causal Analysis Results        [4/5 Refutations Passed]│
├───────────────────────────────────────────────────────────┤
│                                                           │
│             ┌─────────────────────────────┐               │
│             │   CAUSAL EFFECT ESTIMATE    │               │
│             │         +18.5               │               │
│             │       million USD           │               │
│             │    p-value: 0.0023          │               │
│             └─────────────────────────────┘               │
│                                                           │
│ 95% Confidence Interval                                   │
│ [12.3]━━━━━━━━━━━│━━━━━━━━━━[24.7]                         │
│                  ↑                                        │
│             point estimate                                │
│                                                           │
│ [Description text about the causal relationship...]       │
│                                                           │
│ ┌─────────────────────────────────────────────────────┐   │
│ │ 🧫 Refutation Tests                    4/5 passed ▼ │   │
│ ├─────────────────────────────────────────────────────┤   │
│ │ ✅ Placebo Treatment       p=0.823                   │   │
│ │ ✅ Random Common Cause     p=0.912                   │   │
│ │ ✅ Data Subset             p=0.876                   │   │
│ │ ✅ Unobserved Confounder   p=0.654                   │   │
│ │ ❌ Bootstrap Refute        p=0.043                   │   │
│ └─────────────────────────────────────────────────────┘   │
│                                                           │
│ ┌─────────────────────────────────────────────────────┐   │
│ │ Confounders Controlled                     3/4    ▼ │   │
│ └─────────────────────────────────────────────────────┘   │
│                                                           │
│ ┌─────────────────────────────────────────────────────┐   │
│ │ 📚 Evidence based on historical investment data     │   │
│ │    Meta-analysis: Yes · Studies: 12                 │   │
│ └─────────────────────────────────────────────────────┘   │
└───────────────────────────────────────────────────────────┘
```

---

### GuardianPanel

**Location:** `src/components/carf/GuardianPanel.tsx`

**Purpose:** Policy gate for human-in-the-loop approval with action recommendation.

#### Props Interface

```typescript
interface GuardianPanelProps {
  decision: GuardianDecision;
  isVisible: boolean;
  onApprove?: () => void;
  onReject?: (reason: string) => void;
  onRequestClarification?: () => void;
}
```

#### Data Structure

```typescript
interface GuardianDecision {
  overallStatus: 'pass' | 'fail' | 'pending';
  proposedAction: {
    type: string;
    target: string;
    amount: number;
    unit: string;
    expectedEffect: string;
  };
  policies: Array<{
    id: string;
    name: string;
    description: string;
    status: PolicyStatus;
    version: string;
    details?: string;
  }>;
  requiresHumanApproval: boolean;
}
```

#### Visual Layout

```
┌───────────────────────────────────────────────────────────┐
│ 🛡️ Guardian Policy Check                          [PASS] │
├───────────────────────────────────────────────────────────┤
│ ┌─────────────────────────────────────────────────────┐   │
│ │ 🎯 PROPOSED ACTION                                  │   │
│ │    Increase Investment                              │   │
│ │    Marketing Budget - Q3 Campaign                   │   │
│ │                                                     │   │
│ │    Amount            Expected Effect                │   │
│ │    2.5M USD          ⚡ +12% revenue uplift         │   │
│ └─────────────────────────────────────────────────────┘   │
│                                                           │
│ ✅ 4 passed  ❌ 0 failed  ⏳ 1 pending                    │
│                                                           │
│ ┌──────────────────────────────────────────────────────┐  │
│ │ ✅ Budget Threshold         v2.1                   ▼ │  │
│ │    Amount within approved limits                     │  │
│ └──────────────────────────────────────────────────────┘  │
│ ┌──────────────────────────────────────────────────────┐  │
│ │ ✅ Risk Assessment          v1.3                   ▼ │  │
│ │    Risk level acceptable                             │  │
│ └──────────────────────────────────────────────────────┘  │
│ ┌──────────────────────────────────────────────────────┐  │
│ │ ⏳ Final Approval           v1.0                   ▼ │  │
│ │    Awaiting stakeholder sign-off                     │  │
│ └──────────────────────────────────────────────────────┘  │
│                                                           │
│ ┌─────────────────────────────────────────────────────┐   │
│ │ 🛡️ Human-in-the-loop required.                      │   │
│ │    This action requires your explicit approval.      │   │
│ └─────────────────────────────────────────────────────┘   │
│                                                           │
│ ─────────────────────────────────────────────────────────  │
│ [    ✅ Approve    ] [💬 Clarify] [    ❌ Reject    ]     │
│                                                           │
│ ┌─────────────────────────────────────────────────────┐   │
│ │ Please provide a reason for rejection...            │   │ (shown on reject)
│ └─────────────────────────────────────────────────────┘   │
│ [   Confirm Rejection   ] [Cancel]                        │
└───────────────────────────────────────────────────────────┘
```

#### Status Configuration

```typescript
const statusConfig = {
  pass: {
    icon: <CheckCircle2 className="h-4 w-4" />,
    color: 'text-status-success',
    bgColor: 'bg-status-success/10',
    label: 'PASS',
  },
  fail: {
    icon: <XCircle className="h-4 w-4" />,
    color: 'text-status-error',
    bgColor: 'bg-status-error/10',
    label: 'FAIL',
  },
  pending: {
    icon: <Clock className="h-4 w-4" />,
    color: 'text-status-pending',
    bgColor: 'bg-status-pending/10',
    label: 'PENDING',
  },
};
```

---

### ExecutionTrace

**Location:** `src/components/carf/ExecutionTrace.tsx`

**Purpose:** Timeline view of analysis execution steps with expandable details and export functionality.

#### Props Interface

```typescript
interface ExecutionTraceProps {
  trace: ExecutionTraceType;
  isVisible: boolean;
}
```

#### Data Structure

```typescript
interface ExecutionTrace {
  receiptId: string;
  sessionId: string;
  totalDuration: number;  // ms
  langsmithUrl: string;
  steps: ExecutionStep[];
}

interface ExecutionStep {
  id: string;
  node: string;           // Step name
  status: 'success' | 'warning' | 'error' | 'pending';
  duration: number;       // ms
  timestamp: string;      // ISO date
  inputs?: Record<string, any>;
  outputs?: Record<string, any>;
}
```

#### Visual Layout

```
┌───────────────────────────────────────────────────────────┐
│ 📊 Execution Trace                              [2.34s]   │
├───────────────────────────────────────────────────────────┤
│ Receipt ID                                                │
│ rcp_abc123def456...                              [📋]    │
│                                                           │
│ ✅ 5  ⚠️ 1  ❌ 0   6 steps total                          │
│                                                           │
│  ●─ QueryParser                            120ms    ▼    │
│  │    └─ Step details...                                  │
│  │                                                        │
│  ●─ CynefinRouter                          340ms    ▼    │
│  │                                                        │
│  ●─ CausalAnalyst                          890ms    ▼    │
│  │                                                        │
│  ●─ BayesianUpdater                        450ms    ▼    │
│  │                                                        │
│  ⚠─ Guardian                               380ms    ▼    │
│  │                                                        │
│  ●─ ResponseFormatter                      160ms    ▼    │
│                                                           │
│ ─────────────────────────────────────────────────────────  │
│ [   📥 Export JSON   ] [   🔗 View in LangSmith   ]      │
│                                                           │
│ Session: sess_demo_abc123                                 │
└───────────────────────────────────────────────────────────┘
```

#### StepItem Component

```typescript
function StepItem({ step, isLast }: { step: ExecutionStep; isLast: boolean }) {
  // Timeline line (except for last item)
  // Status icon with colored background
  // Step name and duration
  // Collapsible details with inputs/outputs as JSON
}
```

---

## View Mode Components

### DeveloperDebugView

**Location:** `src/components/carf/DeveloperDebugView.tsx`

**Purpose:** Technical deep-dive showing raw JSON data, performance metrics, and system state.

#### Key Features

- **Raw JSON Viewer** — Full scenario data as formatted JSON
- **Performance Metrics** — Execution time, step durations
- **System State** — Current simulation parameters
- **Copy/Export** — Quick access to data for debugging

---

### ExecutiveSummaryView

**Location:** `src/components/carf/ExecutiveSummaryView.tsx`

**Purpose:** High-level KPI dashboard with simplified approve/reject workflow.

#### Key Features

- **Key Metrics Cards** — Effect size, confidence, risk level
- **Recommendation Summary** — Plain-language action description
- **Quick Actions** — Simplified approval buttons
- **Trend Indicators** — Visual status of analysis health

---

## Control Components

### SimulationControls

**Location:** `src/components/carf/SimulationControls.tsx`

**Purpose:** Parameter adjustment for dynamic simulation mode.

#### Props Interface

```typescript
interface SimulationControlsProps {
  params: SimulationParams;
  onChange: (params: SimulationParams) => void;
  onReset: () => void;
  disabled: boolean;
}
```

#### Parameters

| Parameter | Type | Range | Default | Purpose |
|-----------|------|-------|---------|---------|
| `investmentMultiplier` | number | 0.5 - 2.0 | 1.0 | Scale investment amounts |
| `confidenceThreshold` | number | 0.5 - 0.99 | 0.95 | Minimum confidence level |
| `uncertaintyTolerance` | number | 0.1 - 0.5 | 0.3 | Acceptable uncertainty |
| `policyStrictness` | 'low' \| 'medium' \| 'high' | — | 'medium' | Policy enforcement level |

---

## Data Flow

```
┌─────────────────────────────────────────────────────────────────────┐
│                            Index.tsx                                 │
│                                                                      │
│   ┌──────────────────┐    ┌─────────────────────────────────┐       │
│   │  User Input       │───▶│       carfService.ts            │       │
│   │  (QueryInput)     │    │                                 │       │
│   └──────────────────┘    │  runAnalysis(request, onProgress)│       │
│                            │         │                        │       │
│                            │         ▼                        │       │
│   ┌──────────────────┐    │  ┌─────────────────────────┐    │       │
│   │  State Updates    │◀──│  │  Mock Data / API Call   │    │       │
│   │                   │    │  └─────────────────────────┘    │       │
│   │  - currentStep    │    │                                 │       │
│   │  - scenario       │    │  Returns: { scenario,          │       │
│   │  - isProcessing   │    │            executionTimeMs }    │       │
│   └──────────────────┘    └─────────────────────────────────┘       │
│           │                                                          │
│           ▼                                                          │
│   ┌───────────────────────────────────────────────────────────┐     │
│   │                   Component Props Flow                      │     │
│   │                                                             │     │
│   │   CynefinRouter ◀── scenario.cynefin                       │     │
│   │   CausalDAG     ◀── scenario.dag                           │     │
│   │   BayesianPanel ◀── scenario.beliefStates                  │     │
│   │   CausalAnalysis◀── scenario.causalResult                  │     │
│   │   GuardianPanel ◀── scenario.guardian                      │     │
│   │   ExecutionTrace◀── scenario.trace                         │     │
│   └───────────────────────────────────────────────────────────┘     │
└─────────────────────────────────────────────────────────────────────┘
```

---

## Design System Tokens

### Color Tokens (HSL)

| Token | Purpose | Example Value |
|-------|---------|---------------|
| `--primary` | Brand color, CTAs | `262 83% 58%` |
| `--accent` | Highlights | `280 85% 65%` |
| `--background` | Page background | `260 15% 8%` |
| `--card` | Card backgrounds | `260 15% 12%` |
| `--muted-foreground` | Secondary text | `260 5% 60%` |

### Semantic Status Colors

| Token | Color | Use Case |
|-------|-------|----------|
| `--status-success` | Green | Pass, completed, approved |
| `--status-warning` | Amber | Pending, caution |
| `--status-error` | Red | Fail, rejected, error |
| `--status-pending` | Blue | In progress, waiting |

### Cynefin Domain Colors

| Domain | Token | Typical Color |
|--------|-------|---------------|
| Clear | `--cynefin-clear` | Green |
| Complicated | `--cynefin-complicated` | Blue |
| Complex | `--cynefin-complex` | Purple |
| Chaotic | `--cynefin-chaotic` | Red |

### Confidence Level Colors

| Level | Token | Color |
|-------|-------|-------|
| High | `--confidence-high` | Green |
| Medium | `--confidence-medium` | Amber |
| Low | `--confidence-low` | Red |

---

## Animation Patterns

### Entry Animations

```css
.animate-fade-in {
  animation: fade-in 0.3s ease-out forwards;
}

@keyframes fade-in {
  from {
    opacity: 0;
    transform: translateY(8px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
```

### Loading States

```css
.animate-pulse {
  animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

.animate-spin {
  animation: spin 1s linear infinite;
}
```

### Step Reveal Timing

```typescript
const stepDelays = [400, 600, 1200, 800, 500];  // ms per step
```

| Step | Delay | Total Elapsed |
|------|-------|---------------|
| 1 (Cynefin) | 400ms | 400ms |
| 2 (DAG) | 600ms | 1000ms |
| 3 (Bayesian) | 1200ms | 2200ms |
| 4 (Guardian) | 800ms | 3000ms |
| 5 (Trace) | 500ms | 3500ms |

---

## Usage Example

```tsx
import { useState } from 'react';
import { CynefinRouter } from '@/components/carf/CynefinRouter';
import { getScenario } from '@/data/mockData';

function MyComponent() {
  const [isVisible, setIsVisible] = useState(false);
  const scenario = getScenario('s3ae');

  return (
    <CynefinRouter
      classification={scenario.cynefin}
      isVisible={isVisible}
    />
  );
}
```

---

## File Structure

```
src/
├── components/
│   └── carf/
│       ├── DashboardHeader.tsx
│       ├── QueryInput.tsx
│       ├── CynefinRouter.tsx
│       ├── CausalDAG.tsx
│       ├── BayesianPanel.tsx
│       ├── CausalAnalysisCard.tsx
│       ├── GuardianPanel.tsx
│       ├── ExecutionTrace.tsx
│       ├── DeveloperDebugView.tsx
│       ├── ExecutiveSummaryView.tsx
│       └── SimulationControls.tsx
├── data/
│   └── mockData.ts
├── services/
│   └── carfService.ts
└── pages/
    └── Index.tsx
```

---

*Generated for CARF Epistemic Cockpit v1.0.0*
