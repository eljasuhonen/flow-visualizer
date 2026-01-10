import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Scenario, ExecutionStep } from '@/data/mockData';
import { cn } from '@/lib/utils';
import { 
  Code, 
  Network, 
  Timer, 
  Bug, 
  Copy, 
  Check, 
  ChevronRight,
  Database,
  Cpu,
  ArrowRight
} from 'lucide-react';

interface DeveloperDebugViewProps {
  scenario: Scenario | null;
  isVisible: boolean;
  executionTimeMs?: number;
}

export function DeveloperDebugView({ scenario, isVisible, executionTimeMs }: DeveloperDebugViewProps) {
  const [copied, setCopied] = useState<string | null>(null);
  const [selectedNode, setSelectedNode] = useState<string | null>(null);

  if (!isVisible || !scenario) {
    return (
      <div className="flex items-center justify-center min-h-[600px] border border-dashed border-border/50 rounded-lg bg-muted/10">
        <div className="text-center space-y-2">
          <Code className="h-10 w-10 text-muted-foreground mx-auto opacity-50" />
          <p className="text-sm text-muted-foreground">Run an analysis to see debug data</p>
        </div>
      </div>
    );
  }

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopied(key);
    setTimeout(() => setCopied(null), 2000);
  };

  const formatJson = (obj: unknown) => JSON.stringify(obj, null, 2);

  // Calculate execution graph
  const executionNodes = scenario.trace.steps.map((step, i) => ({
    ...step,
    index: i,
    parentIndex: i > 0 ? i - 1 : null,
  }));

  return (
    <div className="space-y-4 animate-fade-in">
      {/* Performance Summary Bar */}
      <Card className="bg-gradient-to-r from-card to-muted/30">
        <CardContent className="p-4">
          <div className="grid grid-cols-4 gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <Timer className="h-4 w-4 text-primary" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Total Time</p>
                <p className="text-lg font-mono font-bold">{executionTimeMs || scenario.trace.totalDuration}ms</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-cynefin-complicated/10">
                <Cpu className="h-4 w-4 text-cynefin-complicated" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Nodes Processed</p>
                <p className="text-lg font-mono font-bold">{scenario.dag.nodes.length}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-cynefin-complex/10">
                <Network className="h-4 w-4 text-cynefin-complex" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Edges Analyzed</p>
                <p className="text-lg font-mono font-bold">{scenario.dag.edges.length}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-status-success/10">
                <Database className="h-4 w-4 text-status-success" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Policies Checked</p>
                <p className="text-lg font-mono font-bold">{scenario.guardian.policies.length}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Debug Tabs */}
      <Tabs defaultValue="trace" className="w-full">
        <TabsList className="w-full grid grid-cols-4 mb-4">
          <TabsTrigger value="trace" className="text-xs">
            <Bug className="h-3 w-3 mr-1" />
            Execution Trace
          </TabsTrigger>
          <TabsTrigger value="dag" className="text-xs">
            <Network className="h-3 w-3 mr-1" />
            DAG Structure
          </TabsTrigger>
          <TabsTrigger value="state" className="text-xs">
            <Database className="h-3 w-3 mr-1" />
            State Snapshots
          </TabsTrigger>
          <TabsTrigger value="raw" className="text-xs">
            <Code className="h-3 w-3 mr-1" />
            Raw JSON
          </TabsTrigger>
        </TabsList>

        {/* Execution Trace Tab */}
        <TabsContent value="trace" className="space-y-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <Bug className="h-4 w-4" />
                Execution Flow
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="relative">
                {/* Execution Graph */}
                <div className="flex flex-col gap-2">
                  {executionNodes.map((node, i) => (
                    <div 
                      key={node.id}
                      className={cn(
                        "relative pl-8 py-3 rounded-lg border transition-all cursor-pointer",
                        selectedNode === node.id 
                          ? "border-primary bg-primary/5" 
                          : "border-border/50 hover:border-border hover:bg-muted/30"
                      )}
                      onClick={() => setSelectedNode(selectedNode === node.id ? null : node.id)}
                    >
                      {/* Timeline dot */}
                      <div className={cn(
                        "absolute left-3 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full",
                        node.status === 'success' ? "bg-status-success" : "bg-status-error"
                      )} />
                      
                      {/* Connector line */}
                      {i < executionNodes.length - 1 && (
                        <div className="absolute left-[14px] top-[calc(50%+8px)] w-0.5 h-[calc(100%-4px)] bg-border" />
                      )}

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <span className="font-mono text-sm font-medium">{node.node}</span>
                          <Badge variant="outline" className="text-[10px]">
                            {node.duration}ms
                          </Badge>
                        </div>
                        <ChevronRight className={cn(
                          "h-4 w-4 text-muted-foreground transition-transform",
                          selectedNode === node.id && "rotate-90"
                        )} />
                      </div>

                      {/* Expanded Details */}
                      {selectedNode === node.id && (
                        <div className="mt-3 pt-3 border-t border-border/50 animate-fade-in">
                          <div className="space-y-2">
                            <div className="flex items-center gap-2 text-xs">
                              <span className="text-muted-foreground">Node ID:</span>
                              <code className="font-mono bg-muted px-1 rounded">{node.id}</code>
                            </div>
                            {node.subSteps && (
                              <div className="space-y-1">
                                <span className="text-xs text-muted-foreground">Sub-steps:</span>
                                <div className="flex flex-wrap gap-1 mt-1">
                                  {node.subSteps.map((sub, j) => (
                                    <Badge key={j} variant="secondary" className="text-[10px]">
                                      {sub.node}
                                    </Badge>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* DAG Structure Tab */}
        <TabsContent value="dag" className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Nodes ({scenario.dag.nodes.length})</CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[300px]">
                  <div className="space-y-2">
                    {scenario.dag.nodes.map(node => (
                      <div 
                        key={node.id}
                        className="p-2 rounded border border-border/50 bg-muted/20"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-mono text-xs">{node.id}</span>
                          <Badge 
                            variant="outline" 
                            className={cn(
                              "text-[10px]",
                              node.type === 'intervention' && "border-cynefin-complicated text-cynefin-complicated",
                              node.type === 'confounder' && "border-cynefin-complex text-cynefin-complex",
                              node.type === 'outcome' && "border-status-success text-status-success"
                            )}
                          >
                            {node.type}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">{node.label}</p>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Edges ({scenario.dag.edges.length})</CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[300px]">
                  <div className="space-y-2">
                    {scenario.dag.edges.map((edge, i) => (
                      <div 
                        key={i}
                        className="p-2 rounded border border-border/50 bg-muted/20"
                      >
                        <div className="flex items-center gap-2 font-mono text-xs">
                          <span>{edge.source}</span>
                          <ArrowRight className="h-3 w-3 text-muted-foreground" />
                          <span>{edge.target}</span>
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-[10px] text-muted-foreground">
                            Effect: {edge.effectSize}
                          </span>
                          {edge.validated && (
                            <Check className="h-3 w-3 text-status-success" />
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* State Snapshots Tab */}
        <TabsContent value="state" className="space-y-4">
          <div className="grid grid-cols-3 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Cynefin State</CardTitle>
              </CardHeader>
              <CardContent>
                <pre className="text-[10px] font-mono bg-muted/50 p-2 rounded overflow-auto max-h-[200px]">
                  {formatJson(scenario.cynefin)}
                </pre>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Belief States</CardTitle>
              </CardHeader>
              <CardContent>
                <pre className="text-[10px] font-mono bg-muted/50 p-2 rounded overflow-auto max-h-[200px]">
                  {formatJson(scenario.beliefStates)}
                </pre>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Guardian State</CardTitle>
              </CardHeader>
              <CardContent>
                <pre className="text-[10px] font-mono bg-muted/50 p-2 rounded overflow-auto max-h-[200px]">
                  {formatJson(scenario.guardian)}
                </pre>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Raw JSON Tab */}
        <TabsContent value="raw">
          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm">Full Scenario JSON</CardTitle>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-7 text-xs"
                  onClick={() => copyToClipboard(formatJson(scenario), 'full')}
                >
                  {copied === 'full' ? (
                    <>
                      <Check className="h-3 w-3 mr-1" />
                      Copied
                    </>
                  ) : (
                    <>
                      <Copy className="h-3 w-3 mr-1" />
                      Copy
                    </>
                  )}
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[400px]">
                <pre className="text-[10px] font-mono bg-muted/50 p-3 rounded">
                  {formatJson(scenario)}
                </pre>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
