import { useState } from 'react';
import { cn } from '@/lib/utils';
import { BayesianBeliefState, ConfidenceLevel } from '@/data/mockData';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Activity, TrendingUp, AlertTriangle, CheckCircle2, Info } from 'lucide-react';
import { Area, AreaChart, ResponsiveContainer, XAxis, YAxis, Tooltip, ReferenceLine } from 'recharts';

interface BayesianPanelProps {
  beliefStates: BayesianBeliefState[];
  isVisible: boolean;
}

const confidenceConfig: Record<ConfidenceLevel, { color: string; bgColor: string; icon: React.ReactNode; label: string }> = {
  high: {
    color: 'text-confidence-high',
    bgColor: 'bg-confidence-high',
    icon: <CheckCircle2 className="h-4 w-4" />,
    label: 'High Confidence',
  },
  medium: {
    color: 'text-confidence-medium',
    bgColor: 'bg-confidence-medium',
    icon: <Info className="h-4 w-4" />,
    label: 'Medium Confidence',
  },
  low: {
    color: 'text-confidence-low',
    bgColor: 'bg-confidence-low',
    icon: <AlertTriangle className="h-4 w-4" />,
    label: 'Low Confidence',
  },
};

// Generate normal distribution data for visualization
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

export function BayesianPanel({ beliefStates, isVisible }: BayesianPanelProps) {
  const [selectedVariable, setSelectedVariable] = useState(beliefStates[0]?.variable || '');
  
  const currentState = beliefStates.find(s => s.variable === selectedVariable) || beliefStates[0];
  
  if (!isVisible || !currentState) return null;

  const config = confidenceConfig[currentState.confidenceLevel];
  
  // Generate distribution data
  const priorData = generateDistributionData(currentState.priorMean, currentState.priorStd, 'prior');
  const posteriorData = generateDistributionData(currentState.posteriorMean, currentState.posteriorStd, 'posterior');
  
  // Combine data for overlay
  const combinedData = posteriorData.map((point, i) => ({
    x: point.x,
    posterior: point.posterior,
    prior: priorData[i]?.prior || 0,
  }));

  return (
    <Card className="animate-fade-in">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Activity className="h-4 w-4 text-muted-foreground" />
            Bayesian Belief State
          </CardTitle>
          {beliefStates.length > 1 && (
            <Select value={selectedVariable} onValueChange={setSelectedVariable}>
              <SelectTrigger className="w-[180px] h-8 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {beliefStates.map(state => (
                  <SelectItem key={state.variable} value={state.variable} className="text-xs">
                    {state.variable}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Distribution Chart */}
        <div className="h-[140px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={combinedData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="priorGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--muted-foreground))" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="hsl(var(--muted-foreground))" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="posteriorGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.5} />
                  <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis
                dataKey="x"
                tick={{ fontSize: 10 }}
                tickFormatter={(v) => v.toFixed(0)}
                stroke="hsl(var(--muted-foreground))"
                tickLine={false}
                axisLine={false}
              />
              <YAxis hide />
              <Tooltip
                content={({ active, payload }) => {
                  if (!active || !payload?.length) return null;
                  return (
                    <div className="bg-popover border border-border p-2 rounded-md shadow-lg text-xs">
                      <p className="font-mono">Value: {payload[0]?.payload?.x?.toFixed(2)}</p>
                    </div>
                  );
                }}
              />
              {/* Prior distribution (faded) */}
              <Area
                type="monotone"
                dataKey="prior"
                stroke="hsl(var(--muted-foreground))"
                strokeWidth={1}
                strokeDasharray="4 2"
                fill="url(#priorGradient)"
              />
              {/* Posterior distribution */}
              <Area
                type="monotone"
                dataKey="posterior"
                stroke="hsl(var(--primary))"
                strokeWidth={2}
                fill="url(#posteriorGradient)"
              />
              {/* Mean line */}
              <ReferenceLine
                x={currentState.posteriorMean}
                stroke="hsl(var(--primary))"
                strokeWidth={2}
                strokeDasharray="3 3"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-4 text-xs justify-center">
          <div className="flex items-center gap-1.5">
            <div className="w-4 h-0.5 bg-muted-foreground" style={{ borderTop: '2px dashed' }} />
            <span className="text-muted-foreground">Prior</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-4 h-0.5 bg-primary" />
            <span className="text-muted-foreground">Posterior</span>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-3">
          <div className="p-3 bg-secondary/50 rounded-lg">
            <p className="text-xs text-muted-foreground mb-1">Posterior Mean</p>
            <p className="text-lg font-bold font-mono">{currentState.posteriorMean.toFixed(2)}</p>
            <p className="text-xs text-muted-foreground">±{currentState.posteriorStd.toFixed(2)} std</p>
          </div>
          <div className="p-3 bg-secondary/50 rounded-lg">
            <p className="text-xs text-muted-foreground mb-1">95% CI</p>
            <p className="text-lg font-bold font-mono">
              [{(currentState.posteriorMean - 1.96 * currentState.posteriorStd).toFixed(0)},
               {(currentState.posteriorMean + 1.96 * currentState.posteriorStd).toFixed(0)}]
            </p>
          </div>
        </div>

        {/* Uncertainty Breakdown */}
        <div className="space-y-3">
          <p className="text-xs font-medium">Uncertainty Decomposition</p>
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <span className="text-xs text-muted-foreground w-20">Epistemic</span>
              <div className="flex-1 h-2 bg-secondary rounded-full overflow-hidden">
                <div
                  className="h-full bg-chart-1 transition-all duration-500"
                  style={{ width: `${currentState.epistemicUncertainty * 100}%` }}
                />
              </div>
              <span className="text-xs font-mono w-10 text-right">
                {(currentState.epistemicUncertainty * 100).toFixed(0)}%
              </span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-xs text-muted-foreground w-20">Aleatoric</span>
              <div className="flex-1 h-2 bg-secondary rounded-full overflow-hidden">
                <div
                  className="h-full bg-chart-3 transition-all duration-500"
                  style={{ width: `${currentState.aleatoricUncertainty * 100}%` }}
                />
              </div>
              <span className="text-xs font-mono w-10 text-right">
                {(currentState.aleatoricUncertainty * 100).toFixed(0)}%
              </span>
            </div>
            <div className="flex items-center gap-3 pt-1 border-t border-border/50">
              <span className="text-xs font-medium w-20">Total</span>
              <div className="flex-1 h-2 bg-secondary rounded-full overflow-hidden">
                <div
                  className={cn(
                    "h-full transition-all duration-500",
                    currentState.totalUncertainty > 0.5 ? "bg-status-error" :
                    currentState.totalUncertainty > 0.3 ? "bg-status-warning" : "bg-status-success"
                  )}
                  style={{ width: `${currentState.totalUncertainty * 100}%` }}
                />
              </div>
              <span className="text-xs font-mono w-10 text-right font-medium">
                {(currentState.totalUncertainty * 100).toFixed(0)}%
              </span>
            </div>
          </div>
        </div>

        {/* Confidence Badge */}
        <div className={cn(
          "flex items-center gap-3 p-3 rounded-lg",
          currentState.confidenceLevel === 'high' && "bg-confidence-high/10 border border-confidence-high/30",
          currentState.confidenceLevel === 'medium' && "bg-confidence-medium/10 border border-confidence-medium/30",
          currentState.confidenceLevel === 'low' && "bg-confidence-low/10 border border-confidence-low/30"
        )}>
          <div className={config.color}>{config.icon}</div>
          <div className="flex-1">
            <p className={cn("text-sm font-medium", config.color)}>{config.label}</p>
            <p className="text-xs text-muted-foreground">{currentState.interpretation}</p>
          </div>
        </div>

        {/* Observation History */}
        {currentState.observations.length > 0 && (
          <div className="pt-2 border-t border-border/50">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="h-3.5 w-3.5 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">Belief Evolution</span>
            </div>
            <div className="h-[60px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={currentState.observations} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
                  <Area
                    type="monotone"
                    dataKey="value"
                    stroke="hsl(var(--primary))"
                    fill="hsl(var(--primary) / 0.2)"
                    strokeWidth={2}
                  />
                  <XAxis
                    dataKey="time"
                    tick={{ fontSize: 9 }}
                    stroke="hsl(var(--muted-foreground))"
                    tickLine={false}
                    axisLine={false}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
