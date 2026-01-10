import { cn } from '@/lib/utils';
import { CynefinClassification, CynefinDomain } from '@/data/mockData';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ChevronDown, Brain, Compass, Route } from 'lucide-react';
import { useState } from 'react';

interface CynefinRouterProps {
  classification: CynefinClassification;
  isVisible: boolean;
}

const domainConfig: Record<CynefinDomain, { label: string; color: string; bgColor: string; description: string }> = {
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

export function CynefinRouter({ classification, isVisible }: CynefinRouterProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const config = domainConfig[classification.domain];

  if (!isVisible) return null;

  return (
    <Card className="animate-fade-in overflow-hidden">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Compass className="h-4 w-4 text-muted-foreground" />
            Cynefin Classification
          </CardTitle>
          <Badge className={cn(config.bgColor, 'text-white font-semibold')}>
            {config.label}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Domain Description */}
        <p className="text-sm text-muted-foreground">{config.description}</p>

        {/* Metrics Row */}
        <div className="grid grid-cols-2 gap-4">
          {/* Entropy Gauge */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">Signal Entropy</span>
              <span className="font-mono font-medium">{classification.entropy.toFixed(2)}</span>
            </div>
            <div className="relative h-2 bg-secondary rounded-full overflow-hidden">
              <div
                className={cn(
                  "absolute inset-y-0 left-0 rounded-full transition-all duration-500",
                  classification.entropy > 0.7 ? "bg-cynefin-chaotic" :
                  classification.entropy > 0.5 ? "bg-cynefin-complex" :
                  classification.entropy > 0.3 ? "bg-cynefin-complicated" : "bg-cynefin-clear"
                )}
                style={{ width: `${classification.entropy * 100}%` }}
              />
            </div>
          </div>

          {/* Confidence */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">Confidence</span>
              <span className="font-mono font-medium">{(classification.confidence * 100).toFixed(0)}%</span>
            </div>
            <Progress value={classification.confidence * 100} className="h-2" />
          </div>
        </div>

        {/* Solver Route */}
        <div className="flex items-center gap-2 p-3 bg-secondary/50 rounded-lg">
          <Route className="h-4 w-4 text-primary" />
          <span className="text-sm">
            Routed to: <span className="font-medium text-primary">{classification.solver}</span>
          </span>
        </div>

        {/* Expandable Domain Scores */}
        <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
          <CollapsibleTrigger className="flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground transition-colors w-full">
            <ChevronDown className={cn("h-3 w-3 transition-transform", isExpanded && "rotate-180")} />
            View domain scores
          </CollapsibleTrigger>
          <CollapsibleContent className="pt-3 space-y-2">
            {(Object.entries(classification.scores) as [CynefinDomain, number][]).map(([domain, score]) => (
              <div key={domain} className="flex items-center gap-3">
                <span className={cn("text-xs w-24 capitalize", domainConfig[domain].color)}>
                  {domain}
                </span>
                <div className="flex-1 h-2 bg-secondary rounded-full overflow-hidden">
                  <div
                    className={cn("h-full rounded-full transition-all duration-500", domainConfig[domain].bgColor)}
                    style={{ width: `${score * 100}%` }}
                  />
                </div>
                <span className="text-xs font-mono w-10 text-right">{(score * 100).toFixed(0)}%</span>
              </div>
            ))}
          </CollapsibleContent>
        </Collapsible>

        {/* Reasoning */}
        <div className="pt-2 border-t border-border/50">
          <div className="flex items-start gap-2">
            <Brain className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
            <p className="text-xs text-muted-foreground leading-relaxed">
              {classification.reasoning}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
