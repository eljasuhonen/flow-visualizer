import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Scenario } from '@/data/mockData';
import { cn } from '@/lib/utils';
import { 
  TrendingUp, 
  TrendingDown,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  ArrowRight,
  Gauge,
  Shield,
  Target,
  BarChart3
} from 'lucide-react';

interface ExecutiveSummaryViewProps {
  scenario: Scenario | null;
  isVisible: boolean;
  onApprove: () => void;
  onReject: (reason: string) => void;
}

export function ExecutiveSummaryView({ scenario, isVisible, onApprove, onReject }: ExecutiveSummaryViewProps) {
  if (!isVisible || !scenario) {
    return (
      <div className="flex items-center justify-center min-h-[500px] border border-dashed border-border/50 rounded-lg bg-muted/10">
        <div className="text-center space-y-2">
          <BarChart3 className="h-10 w-10 text-muted-foreground mx-auto opacity-50" />
          <p className="text-sm text-muted-foreground">Run an analysis to see executive summary</p>
        </div>
      </div>
    );
  }

  const { cynefin, causalResult, guardian, beliefStates } = scenario;
  
  // Determine overall risk level
  const passedPolicies = guardian.policies.filter(p => p.status === 'pass').length;
  const totalPolicies = guardian.policies.length;
  const policyScore = (passedPolicies / totalPolicies) * 100;
  
  const avgConfidence = beliefStates.reduce((a, b) => a + (1 - b.epistemicUncertainty), 0) / beliefStates.length;
  
  const overallRisk = policyScore >= 80 && avgConfidence >= 0.7 
    ? 'low' 
    : policyScore >= 50 
      ? 'medium' 
      : 'high';

  const domainColors = {
    clear: 'bg-cynefin-clear',
    complicated: 'bg-cynefin-complicated',
    complex: 'bg-cynefin-complex',
    chaotic: 'bg-cynefin-chaotic',
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Hero Summary Card */}
      <Card className="bg-gradient-to-br from-card via-card to-primary/5 border-primary/20">
        <CardContent className="p-8">
          <div className="grid grid-cols-3 gap-8">
            {/* Left: Key Metric */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Target className="h-5 w-5 text-primary" />
                <span className="text-sm font-medium text-muted-foreground">Expected Impact</span>
              </div>
              <div className="space-y-1">
                <p className="text-4xl font-bold tracking-tight">{causalResult.effect} {causalResult.unit}</p>
                <p className="text-sm text-muted-foreground">
                  Confidence: {causalResult.confidenceInterval[0].toFixed(1)} to {causalResult.confidenceInterval[1].toFixed(1)}
                </p>
              </div>
              <div className="flex items-center gap-2">
                {causalResult.effect < 0 ? (
                  <TrendingDown className="h-5 w-5 text-status-success" />
                ) : (
                  <TrendingUp className="h-5 w-5 text-status-success" />
                )}
                <span className="text-sm text-status-success font-medium">
                  {causalResult.refutationsPassed === causalResult.refutationsTotal ? 'Validated' : 'Pending Validation'}
                </span>
              </div>
            </div>

            {/* Center: Domain & Confidence */}
            <div className="flex flex-col items-center justify-center border-x border-border/50 px-8">
              <Badge 
                className={cn(
                  "text-base px-4 py-2 mb-3",
                  domainColors[cynefin.domain]
                )}
              >
                {cynefin.domain.charAt(0).toUpperCase() + cynefin.domain.slice(1)} Domain
              </Badge>
              <div className="w-full max-w-[200px] space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">System Confidence</span>
                  <span className="font-mono">{(cynefin.confidence * 100).toFixed(0)}%</span>
                </div>
                <Progress 
                  value={cynefin.confidence * 100} 
                  className="h-2"
                />
              </div>
            </div>

            {/* Right: Risk Assessment */}
            <div className="flex flex-col items-end justify-center space-y-4">
              <div className="flex items-center gap-3">
                <Gauge className="h-5 w-5 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">Risk Level</span>
              </div>
              <div className={cn(
                "flex items-center gap-3 px-6 py-3 rounded-full",
                overallRisk === 'low' && "bg-status-success/10",
                overallRisk === 'medium' && "bg-status-warning/10",
                overallRisk === 'high' && "bg-status-error/10"
              )}>
                {overallRisk === 'low' && <CheckCircle2 className="h-6 w-6 text-status-success" />}
                {overallRisk === 'medium' && <AlertTriangle className="h-6 w-6 text-status-warning" />}
                {overallRisk === 'high' && <XCircle className="h-6 w-6 text-status-error" />}
                <span className={cn(
                  "text-xl font-bold uppercase tracking-wide",
                  overallRisk === 'low' && "text-status-success",
                  overallRisk === 'medium' && "text-status-warning",
                  overallRisk === 'high' && "text-status-error"
                )}>
                  {overallRisk}
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* KPI Cards Row */}
      <div className="grid grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-muted-foreground">Policy Compliance</span>
              <Shield className="h-4 w-4 text-muted-foreground" />
            </div>
            <p className="text-2xl font-bold">{passedPolicies}/{totalPolicies}</p>
            <Progress 
              value={policyScore} 
              className={cn(
                "h-1.5 mt-2",
                policyScore >= 80 ? "[&>div]:bg-status-success" : 
                policyScore >= 50 ? "[&>div]:bg-status-warning" : "[&>div]:bg-status-error"
              )}
            />
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-muted-foreground">Avg Confidence</span>
              <Target className="h-4 w-4 text-muted-foreground" />
            </div>
            <p className="text-2xl font-bold">{(avgConfidence * 100).toFixed(0)}%</p>
            <Progress 
              value={avgConfidence * 100} 
              className="h-1.5 mt-2"
            />
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-muted-foreground">Variables Analyzed</span>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </div>
            <p className="text-2xl font-bold">{beliefStates.length}</p>
            <p className="text-xs text-muted-foreground mt-1">Across causal graph</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-muted-foreground">Signal Entropy</span>
              <Gauge className="h-4 w-4 text-muted-foreground" />
            </div>
            <p className="text-2xl font-bold">{cynefin.entropy.toFixed(2)}</p>
            <p className="text-xs text-muted-foreground mt-1">
              {cynefin.entropy < 0.3 ? 'Low noise' : cynefin.entropy < 0.6 ? 'Moderate' : 'High noise'}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Proposed Action & Quick Decision */}
      <Card className="border-primary/30">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg flex items-center gap-2">
              <ArrowRight className="h-5 w-5 text-primary" />
              Proposed Action
            </CardTitle>
            <Badge variant="outline" className="text-xs">
              Requires Approval
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
            <div>
              <p className="font-semibold">{guardian.proposedAction.type}</p>
              <p className="text-sm text-muted-foreground">
                Target: {guardian.proposedAction.target} • 
                Amount: {guardian.proposedAction.amount}
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm text-muted-foreground">Expected Effect</p>
              <p className="font-semibold text-status-success">{guardian.proposedAction.expectedEffect}</p>
            </div>
          </div>

          <div className="flex gap-3">
            <Button 
              className="flex-1 h-12 text-base"
              onClick={onApprove}
              disabled={overallRisk === 'high'}
            >
              <CheckCircle2 className="h-5 w-5 mr-2" />
              Approve Action
            </Button>
            <Button 
              variant="outline"
              className="h-12 px-6"
              onClick={() => onReject('Executive review required')}
            >
              <XCircle className="h-5 w-5 mr-2" />
              Reject
            </Button>
          </div>

          {overallRisk === 'high' && (
            <p className="text-xs text-status-error text-center">
              ⚠️ High-risk actions require additional review before approval
            </p>
          )}
        </CardContent>
      </Card>

      {/* Quick Policy Summary */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">Policy Check Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-3">
            {guardian.policies.map((policy, i) => (
              <div 
                key={i}
                className={cn(
                  "flex items-center gap-2 p-2 rounded text-sm",
                  policy.status === 'pass' && "bg-status-success/10",
                  policy.status === 'fail' && "bg-status-error/10",
                  policy.status === 'pending' && "bg-status-warning/10"
                )}
              >
                {policy.status === 'pass' && <CheckCircle2 className="h-4 w-4 text-status-success flex-shrink-0" />}
                {policy.status === 'fail' && <XCircle className="h-4 w-4 text-status-error flex-shrink-0" />}
                {policy.status === 'pending' && <AlertTriangle className="h-4 w-4 text-status-warning flex-shrink-0" />}
                <span className="truncate">{policy.name}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
