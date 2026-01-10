import { cn } from '@/lib/utils';
import { ExecutionTrace as ExecutionTraceType, ExecutionStep } from '@/data/mockData';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import {
  Activity,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Clock,
  ChevronDown,
  Copy,
  ExternalLink,
  Download,
} from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

interface ExecutionTraceProps {
  trace: ExecutionTraceType;
  isVisible: boolean;
}

const statusConfig = {
  success: {
    icon: <CheckCircle2 className="h-4 w-4" />,
    color: 'text-status-success',
    bgColor: 'bg-status-success',
    lineColor: 'bg-status-success',
  },
  warning: {
    icon: <AlertTriangle className="h-4 w-4" />,
    color: 'text-status-warning',
    bgColor: 'bg-status-warning',
    lineColor: 'bg-status-warning',
  },
  error: {
    icon: <XCircle className="h-4 w-4" />,
    color: 'text-status-error',
    bgColor: 'bg-status-error',
    lineColor: 'bg-status-error',
  },
  pending: {
    icon: <Clock className="h-4 w-4" />,
    color: 'text-status-pending',
    bgColor: 'bg-status-pending',
    lineColor: 'bg-status-pending',
  },
};

function StepItem({ step, isLast }: { step: ExecutionStep; isLast: boolean }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const config = statusConfig[step.status];

  return (
    <div className="relative">
      {/* Timeline line */}
      {!isLast && (
        <div
          className={cn(
            "absolute left-[11px] top-8 w-0.5 h-[calc(100%-16px)]",
            config.lineColor,
            "opacity-30"
          )}
        />
      )}

      <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
        <CollapsibleTrigger className="flex items-start gap-3 w-full text-left group">
          {/* Status icon */}
          <div
            className={cn(
              "mt-0.5 p-1 rounded-full",
              config.bgColor,
              "text-white shrink-0"
            )}
          >
            {config.icon}
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-2">
              <p className="font-medium text-sm truncate">{step.node}</p>
              <div className="flex items-center gap-2 shrink-0">
                <span className="text-xs font-mono text-muted-foreground">
                  {step.duration}ms
                </span>
                <ChevronDown
                  className={cn(
                    "h-3.5 w-3.5 text-muted-foreground transition-transform",
                    isExpanded && "rotate-180"
                  )}
                />
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">
              {new Date(step.timestamp).toLocaleTimeString()}
            </p>
          </div>
        </CollapsibleTrigger>

        <CollapsibleContent className="ml-9 mt-2 mb-4">
          <div className="p-3 bg-secondary/50 rounded-lg text-xs space-y-2">
            <div>
              <p className="text-muted-foreground mb-1">Step ID</p>
              <p className="font-mono">{step.id}</p>
            </div>
            {step.inputs && Object.keys(step.inputs).length > 0 && (
              <div>
                <p className="text-muted-foreground mb-1">Inputs</p>
                <pre className="font-mono text-[10px] bg-background/50 p-2 rounded overflow-x-auto">
                  {JSON.stringify(step.inputs, null, 2)}
                </pre>
              </div>
            )}
            {step.outputs && Object.keys(step.outputs).length > 0 && (
              <div>
                <p className="text-muted-foreground mb-1">Outputs</p>
                <pre className="font-mono text-[10px] bg-background/50 p-2 rounded overflow-x-auto">
                  {JSON.stringify(step.outputs, null, 2)}
                </pre>
              </div>
            )}
          </div>
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
}

export function ExecutionTrace({ trace, isVisible }: ExecutionTraceProps) {
  if (!isVisible) return null;

  const copyReceiptId = () => {
    navigator.clipboard.writeText(trace.receiptId);
    toast.success('Receipt ID copied to clipboard');
  };

  const downloadTrace = () => {
    const blob = new Blob([JSON.stringify(trace, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `trace_${trace.receiptId}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Trace downloaded');
  };

  const successSteps = trace.steps.filter(s => s.status === 'success').length;
  const warningSteps = trace.steps.filter(s => s.status === 'warning').length;
  const errorSteps = trace.steps.filter(s => s.status === 'error').length;

  return (
    <Card className="animate-fade-in">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Activity className="h-4 w-4 text-muted-foreground" />
            Execution Trace
          </CardTitle>
          <Badge variant="secondary" className="font-mono text-xs">
            {(trace.totalDuration / 1000).toFixed(2)}s
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Receipt ID */}
        <div className="flex items-center justify-between p-3 bg-secondary/50 rounded-lg">
          <div>
            <p className="text-xs text-muted-foreground">Receipt ID</p>
            <p className="font-mono text-xs mt-0.5 truncate max-w-[180px]">
              {trace.receiptId}
            </p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 shrink-0"
            onClick={copyReceiptId}
          >
            <Copy className="h-3.5 w-3.5" />
          </Button>
        </div>

        {/* Step Summary */}
        <div className="flex items-center gap-3 text-xs">
          <div className="flex items-center gap-1.5 text-status-success">
            <CheckCircle2 className="h-3.5 w-3.5" />
            <span>{successSteps}</span>
          </div>
          {warningSteps > 0 && (
            <div className="flex items-center gap-1.5 text-status-warning">
              <AlertTriangle className="h-3.5 w-3.5" />
              <span>{warningSteps}</span>
            </div>
          )}
          {errorSteps > 0 && (
            <div className="flex items-center gap-1.5 text-status-error">
              <XCircle className="h-3.5 w-3.5" />
              <span>{errorSteps}</span>
            </div>
          )}
          <span className="text-muted-foreground">
            {trace.steps.length} steps total
          </span>
        </div>

        {/* Timeline */}
        <div className="space-y-1">
          {trace.steps.map((step, index) => (
            <StepItem
              key={step.id}
              step={step}
              isLast={index === trace.steps.length - 1}
            />
          ))}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 pt-2 border-t border-border/50">
          <Button
            variant="outline"
            size="sm"
            className="flex-1 gap-2 text-xs"
            onClick={downloadTrace}
          >
            <Download className="h-3.5 w-3.5" />
            Export JSON
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="flex-1 gap-2 text-xs"
            asChild
          >
            <a href={trace.langsmithUrl} target="_blank" rel="noopener noreferrer">
              <ExternalLink className="h-3.5 w-3.5" />
              View in LangSmith
            </a>
          </Button>
        </div>

        {/* Session Info */}
        <div className="text-xs text-muted-foreground pt-2 border-t border-border/50">
          <p>Session: <span className="font-mono">{trace.sessionId}</span></p>
        </div>
      </CardContent>
    </Card>
  );
}
