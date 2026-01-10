import { cn } from '@/lib/utils';
import { CausalAnalysisResult } from '@/data/mockData';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { FlaskConical, CheckCircle2, XCircle, ChevronDown, BookOpen, Beaker } from 'lucide-react';
import { useState } from 'react';

interface CausalAnalysisCardProps {
  result: CausalAnalysisResult;
  isVisible: boolean;
}

export function CausalAnalysisCard({ result, isVisible }: CausalAnalysisCardProps) {
  const [showRefutations, setShowRefutations] = useState(false);
  const [showConfounders, setShowConfounders] = useState(false);

  if (!isVisible) return null;

  const allRefutationsPassed = result.refutationsPassed === result.refutationsTotal;

  return (
    <Card className="animate-fade-in">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <FlaskConical className="h-4 w-4 text-muted-foreground" />
            Causal Analysis Results
          </CardTitle>
          <Badge
            variant={allRefutationsPassed ? 'default' : 'destructive'}
            className={cn(
              "text-xs",
              allRefutationsPassed && "bg-status-success"
            )}
          >
            {result.refutationsPassed}/{result.refutationsTotal} Refutations Passed
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Main Effect Estimate */}
        <div className="text-center py-4 bg-gradient-to-br from-primary/5 to-accent/5 rounded-lg border border-border/50">
          <p className="text-xs text-muted-foreground mb-1">Causal Effect Estimate</p>
          <p className="text-3xl font-bold text-primary font-mono">
            {result.effect > 0 ? '+' : ''}{result.effect}
          </p>
          <p className="text-sm text-muted-foreground">{result.unit}</p>
          <p className="text-xs text-muted-foreground mt-2">
            p-value: <span className="font-mono">{result.pValue.toFixed(4)}</span>
          </p>
        </div>

        {/* Confidence Interval */}
        <div className="space-y-2">
          <p className="text-xs text-muted-foreground">95% Confidence Interval</p>
          <div className="relative h-8 bg-secondary rounded-lg overflow-hidden">
            {/* CI Bar */}
            <div
              className="absolute h-full bg-primary/30"
              style={{
                left: `${((result.confidenceInterval[0] - result.effect * 1.5) / (result.effect * 3)) * 100 + 50}%`,
                width: `${((result.confidenceInterval[1] - result.confidenceInterval[0]) / (result.effect * 3)) * 100}%`,
              }}
            />
            {/* Point estimate */}
            <div
              className="absolute top-1/2 -translate-y-1/2 w-1 h-4 bg-primary rounded-full"
              style={{
                left: `50%`,
              }}
            />
            {/* Labels */}
            <span className="absolute left-2 top-1/2 -translate-y-1/2 text-xs font-mono">
              {result.confidenceInterval[0]}
            </span>
            <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs font-mono">
              {result.confidenceInterval[1]}
            </span>
          </div>
        </div>

        {/* Description */}
        <p className="text-sm text-foreground leading-relaxed">
          {result.description}
        </p>

        {/* Refutation Tests */}
        <Collapsible open={showRefutations} onOpenChange={setShowRefutations}>
          <CollapsibleTrigger className="flex items-center justify-between w-full p-3 bg-secondary/50 rounded-lg hover:bg-secondary/70 transition-colors">
            <div className="flex items-center gap-2">
              <Beaker className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Refutation Tests</span>
            </div>
            <div className="flex items-center gap-2">
              <span className={cn(
                "text-xs font-medium",
                allRefutationsPassed ? "text-status-success" : "text-status-warning"
              )}>
                {result.refutationsPassed}/{result.refutationsTotal} passed
              </span>
              <ChevronDown className={cn("h-4 w-4 transition-transform", showRefutations && "rotate-180")} />
            </div>
          </CollapsibleTrigger>
          <CollapsibleContent className="pt-2 space-y-2">
            {result.refutationDetails.map((test, i) => (
              <div
                key={i}
                className={cn(
                  "flex items-center justify-between p-2 rounded-md text-xs",
                  test.passed ? "bg-status-success/10" : "bg-status-error/10"
                )}
              >
                <div className="flex items-center gap-2">
                  {test.passed ? (
                    <CheckCircle2 className="h-3.5 w-3.5 text-status-success" />
                  ) : (
                    <XCircle className="h-3.5 w-3.5 text-status-error" />
                  )}
                  <span>{test.name}</span>
                </div>
                <span className="font-mono text-muted-foreground">
                  p={test.pValue.toFixed(3)}
                </span>
              </div>
            ))}
          </CollapsibleContent>
        </Collapsible>

        {/* Confounders Controlled */}
        <Collapsible open={showConfounders} onOpenChange={setShowConfounders}>
          <CollapsibleTrigger className="flex items-center justify-between w-full p-3 bg-secondary/50 rounded-lg hover:bg-secondary/70 transition-colors">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">Confounders Controlled</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground">
                {result.confoundersControlled.filter(c => c.controlled).length}/{result.confoundersControlled.length}
              </span>
              <ChevronDown className={cn("h-4 w-4 transition-transform", showConfounders && "rotate-180")} />
            </div>
          </CollapsibleTrigger>
          <CollapsibleContent className="pt-2 space-y-1">
            {result.confoundersControlled.map((conf, i) => (
              <div
                key={i}
                className="flex items-center gap-2 text-xs py-1"
              >
                {conf.controlled ? (
                  <CheckCircle2 className="h-3.5 w-3.5 text-status-success" />
                ) : (
                  <XCircle className="h-3.5 w-3.5 text-status-warning" />
                )}
                <span className={cn(!conf.controlled && "text-muted-foreground")}>
                  {conf.name}
                </span>
              </div>
            ))}
          </CollapsibleContent>
        </Collapsible>

        {/* Evidence Base */}
        <div className="flex items-center gap-3 p-3 bg-secondary/30 rounded-lg border border-border/50">
          <BookOpen className="h-4 w-4 text-muted-foreground shrink-0" />
          <div className="text-xs">
            <p className="text-foreground">{result.evidenceBase}</p>
            <p className="text-muted-foreground mt-0.5">
              Meta-analysis: {result.metaAnalysis ? 'Yes' : 'No'} · Studies: {result.studies}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
