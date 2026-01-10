import { useState } from 'react';
import { cn } from '@/lib/utils';
import { GuardianDecision, PolicyStatus } from '@/data/mockData';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import {
  Shield,
  CheckCircle2,
  XCircle,
  Clock,
  ChevronDown,
  ThumbsUp,
  ThumbsDown,
  MessageSquare,
  Target,
  Zap,
} from 'lucide-react';

interface GuardianPanelProps {
  decision: GuardianDecision;
  isVisible: boolean;
  onApprove?: () => void;
  onReject?: (reason: string) => void;
  onRequestClarification?: () => void;
}

const statusConfig: Record<PolicyStatus, { icon: React.ReactNode; color: string; bgColor: string; label: string }> = {
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

export function GuardianPanel({
  decision,
  isVisible,
  onApprove,
  onReject,
  onRequestClarification,
}: GuardianPanelProps) {
  const [showRejectionInput, setShowRejectionInput] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [expandedPolicy, setExpandedPolicy] = useState<string | null>(null);

  if (!isVisible) return null;

  const overallConfig = statusConfig[decision.overallStatus];
  const passedPolicies = decision.policies.filter(p => p.status === 'pass').length;
  const failedPolicies = decision.policies.filter(p => p.status === 'fail').length;
  const pendingPolicies = decision.policies.filter(p => p.status === 'pending').length;

  const canApprove = failedPolicies === 0 && pendingPolicies === 0;

  const handleReject = () => {
    if (rejectionReason.trim()) {
      onReject?.(rejectionReason);
      setRejectionReason('');
      setShowRejectionInput(false);
    }
  };

  return (
    <Card className="animate-fade-in">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Shield className="h-4 w-4 text-muted-foreground" />
            Guardian Policy Check
          </CardTitle>
          <Badge className={cn(overallConfig.bgColor, overallConfig.color, 'font-semibold')}>
            {overallConfig.label}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Proposed Action Card */}
        <div className="p-4 bg-gradient-to-br from-primary/5 to-accent/5 rounded-lg border border-border/50">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Target className="h-5 w-5 text-primary" />
            </div>
            <div className="flex-1">
              <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">
                Proposed Action
              </p>
              <p className="font-semibold text-foreground">
                {decision.proposedAction.type.replace(/_/g, ' ')}
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                {decision.proposedAction.target}
              </p>
              <div className="flex items-center gap-4 mt-3">
                <div>
                  <p className="text-xs text-muted-foreground">Amount</p>
                  <p className="text-lg font-bold font-mono">
                    {decision.proposedAction.amount} {decision.proposedAction.unit}
                  </p>
                </div>
                <div className="flex-1">
                  <p className="text-xs text-muted-foreground">Expected Effect</p>
                  <div className="flex items-center gap-1.5 text-sm text-primary">
                    <Zap className="h-3.5 w-3.5" />
                    {decision.proposedAction.expectedEffect}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Policy Summary */}
        <div className="flex items-center gap-4 text-xs">
          <div className="flex items-center gap-1.5 text-status-success">
            <CheckCircle2 className="h-3.5 w-3.5" />
            <span>{passedPolicies} passed</span>
          </div>
          {failedPolicies > 0 && (
            <div className="flex items-center gap-1.5 text-status-error">
              <XCircle className="h-3.5 w-3.5" />
              <span>{failedPolicies} failed</span>
            </div>
          )}
          {pendingPolicies > 0 && (
            <div className="flex items-center gap-1.5 text-status-pending">
              <Clock className="h-3.5 w-3.5" />
              <span>{pendingPolicies} pending</span>
            </div>
          )}
        </div>

        {/* Policy Checklist */}
        <div className="space-y-2">
          {decision.policies.map((policy) => {
            const config = statusConfig[policy.status];
            const isExpanded = expandedPolicy === policy.id;

            return (
              <Collapsible
                key={policy.id}
                open={isExpanded}
                onOpenChange={() => setExpandedPolicy(isExpanded ? null : policy.id)}
              >
                <CollapsibleTrigger
                  className={cn(
                    "flex items-center justify-between w-full p-3 rounded-lg transition-colors",
                    config.bgColor,
                    "hover:opacity-80"
                  )}
                >
                  <div className="flex items-center gap-3">
                    <div className={config.color}>{config.icon}</div>
                    <div className="text-left">
                      <p className="text-sm font-medium">{policy.name}</p>
                      <p className="text-xs text-muted-foreground">{policy.description}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground font-mono">v{policy.version}</span>
                    <ChevronDown className={cn("h-4 w-4 transition-transform", isExpanded && "rotate-180")} />
                  </div>
                </CollapsibleTrigger>
                <CollapsibleContent className="pt-2 px-3 pb-1">
                  {policy.details ? (
                    <p className="text-xs text-muted-foreground bg-secondary/50 p-2 rounded">
                      {policy.details}
                    </p>
                  ) : (
                    <p className="text-xs text-muted-foreground">
                      Policy version {policy.version} - No additional details available.
                    </p>
                  )}
                </CollapsibleContent>
              </Collapsible>
            );
          })}
        </div>

        {/* Human Approval Required Notice */}
        {decision.requiresHumanApproval && (
          <div className="p-3 bg-accent/10 border border-accent/30 rounded-lg flex items-center gap-3">
            <Shield className="h-5 w-5 text-accent shrink-0" />
            <p className="text-xs text-foreground">
              <span className="font-semibold">Human-in-the-loop required.</span>{' '}
              This action requires your explicit approval before execution.
            </p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="pt-2 border-t border-border/50 space-y-3">
          {!showRejectionInput ? (
            <div className="flex items-center gap-2">
              <Button
                onClick={onApprove}
                disabled={!canApprove}
                className="flex-1 gap-2 bg-status-success hover:bg-status-success/90"
              >
                <ThumbsUp className="h-4 w-4" />
                Approve
              </Button>
              <Button
                variant="outline"
                onClick={onRequestClarification}
                className="gap-2"
              >
                <MessageSquare className="h-4 w-4" />
                Clarify
              </Button>
              <Button
                variant="outline"
                onClick={() => setShowRejectionInput(true)}
                className="gap-2 border-status-error/50 text-status-error hover:bg-status-error/10"
              >
                <ThumbsDown className="h-4 w-4" />
                Reject
              </Button>
            </div>
          ) : (
            <div className="space-y-2">
              <Textarea
                placeholder="Please provide a reason for rejection..."
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                className="min-h-[80px] text-sm"
              />
              <div className="flex items-center gap-2">
                <Button
                  onClick={handleReject}
                  disabled={!rejectionReason.trim()}
                  variant="destructive"
                  className="flex-1"
                >
                  Confirm Rejection
                </Button>
                <Button
                  variant="ghost"
                  onClick={() => {
                    setShowRejectionInput(false);
                    setRejectionReason('');
                  }}
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
