import { useState, useMemo } from 'react';
import { cn } from '@/lib/utils';
import { CausalDAG as CausalDAGType, DAGNode, DAGEdge } from '@/data/mockData';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { GitBranch, ZoomIn, ZoomOut, Maximize2, Eye, EyeOff } from 'lucide-react';

interface CausalDAGProps {
  dag: CausalDAGType;
  isVisible: boolean;
  onNodeClick?: (node: DAGNode) => void;
}

const nodeTypeConfig = {
  variable: { shape: 'circle', fill: 'hsl(var(--chart-1))', label: 'Variable' },
  confounder: { shape: 'diamond', fill: 'hsl(var(--chart-4))', label: 'Confounder' },
  intervention: { shape: 'hexagon', fill: 'hsl(var(--chart-2))', label: 'Intervention' },
  outcome: { shape: 'circle', fill: 'hsl(var(--chart-3))', label: 'Outcome' },
};

function NodeShape({ node, isSelected, onClick }: { node: DAGNode; isSelected: boolean; onClick: () => void }) {
  const config = nodeTypeConfig[node.type];
  const size = node.type === 'outcome' || node.type === 'intervention' ? 50 : 40;

  const renderShape = () => {
    if (node.type === 'confounder') {
      return (
        <polygon
          points={`${size/2},0 ${size},${size/2} ${size/2},${size} 0,${size/2}`}
          fill={config.fill}
            stroke={isSelected ? 'hsl(var(--primary))' : 'hsl(var(--border))'}
            strokeWidth={isSelected ? 3 : 1.5}
            className="transition-all duration-200 cursor-pointer hover:opacity-80"
          onClick={onClick}
        />
      );
    }
    
    switch (node.type) {
      case 'intervention':
        // Hexagon
        const hex = [];
        for (let i = 0; i < 6; i++) {
          const angle = (Math.PI / 3) * i - Math.PI / 6;
          hex.push(`${size/2 + (size/2) * Math.cos(angle)},${size/2 + (size/2) * Math.sin(angle)}`);
        }
        return (
          <polygon
            points={hex.join(' ')}
            fill={config.fill}
            stroke={isSelected ? 'hsl(var(--primary))' : 'hsl(var(--border))'}
            strokeWidth={isSelected ? 3 : 1.5}
            className="transition-all duration-200 cursor-pointer hover:opacity-80"
            onClick={onClick}
          />
        );
      default:
        return (
          <circle
            cx={size/2}
            cy={size/2}
            r={size/2 - 2}
            fill={node.type === 'outcome' ? config.fill : config.fill}
            stroke={isSelected ? 'hsl(var(--primary))' : 'hsl(var(--border))'}
            strokeWidth={isSelected ? 3 : 1.5}
            className="transition-all duration-200 cursor-pointer hover:opacity-80"
            onClick={onClick}
          />
        );
    }
  };

  return (
    <g transform={`translate(${node.x - size/2}, ${node.y - size/2})`}>
      {renderShape()}
      {/* Label */}
      <text
        x={size/2}
        y={size + 16}
        textAnchor="middle"
        className="text-[10px] fill-foreground font-medium pointer-events-none"
      >
        {node.label.length > 18 ? node.label.slice(0, 15) + '...' : node.label}
      </text>
      {/* Value badge */}
      {node.value !== undefined && (
        <text
          x={size/2}
          y={size/2 + 4}
          textAnchor="middle"
          className="text-[9px] fill-white font-bold pointer-events-none"
        >
          {node.value}{node.unit ? node.unit.slice(0, 3) : ''}
        </text>
      )}
    </g>
  );
}

function EdgeLine({ edge, nodes, showConfounders }: { edge: DAGEdge; nodes: DAGNode[]; showConfounders: boolean }) {
  const source = nodes.find(n => n.id === edge.source);
  const target = nodes.find(n => n.id === edge.target);

  if (!source || !target) return null;

  const dx = target.x - source.x;
  const dy = target.y - source.y;
  const length = Math.sqrt(dx * dx + dy * dy);
  const unitX = dx / length;
  const unitY = dy / length;

  // Offset from node centers
  const startX = source.x + unitX * 25;
  const startY = source.y + unitY * 25;
  const endX = target.x - unitX * 30;
  const endY = target.y - unitY * 30;

  const strokeWidth = Math.max(1, Math.min(4, Math.abs(edge.effectSize) * 5));
  const strokeColor = edge.validated ? 'hsl(var(--chart-1))' : 'hsl(var(--muted-foreground))';
  const strokeDash = edge.validated ? 'none' : '4 2';

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <g className="cursor-pointer">
          <line
            x1={startX}
            y1={startY}
            x2={endX}
            y2={endY}
            stroke={strokeColor}
            strokeWidth={strokeWidth}
            strokeDasharray={strokeDash}
            markerEnd="url(#arrowhead)"
            className="transition-all duration-200 hover:opacity-70"
          />
          {/* Effect size label */}
          <text
            x={(startX + endX) / 2}
            y={(startY + endY) / 2 - 8}
            textAnchor="middle"
            className="text-[9px] fill-muted-foreground font-mono"
          >
            {edge.effectSize > 0 ? '+' : ''}{edge.effectSize.toFixed(2)}
          </text>
        </g>
      </TooltipTrigger>
      <TooltipContent side="top" className="max-w-xs">
        <div className="space-y-1">
          <p className="font-medium">Effect: {edge.effectSize.toFixed(3)}</p>
          <p className="text-xs text-muted-foreground">p-value: {edge.pValue.toFixed(4)}</p>
          <p className="text-xs">
            Validated: {edge.validated ? (
              <span className="text-status-success">Yes ✓</span>
            ) : (
              <span className="text-status-warning">Pending</span>
            )}
          </p>
          {edge.confounders && edge.confounders.length > 0 && showConfounders && (
            <p className="text-xs text-muted-foreground">
              Confounders: {edge.confounders.join(', ')}
            </p>
          )}
        </div>
      </TooltipContent>
    </Tooltip>
  );
}

export function CausalDAG({ dag, isVisible, onNodeClick }: CausalDAGProps) {
  const [selectedNode, setSelectedNode] = useState<string | null>(null);
  const [showConfounders, setShowConfounders] = useState(true);
  const [showBackdoorPaths, setShowBackdoorPaths] = useState(false);
  const [zoom, setZoom] = useState(1);

  const handleNodeClick = (node: DAGNode) => {
    setSelectedNode(node.id === selectedNode ? null : node.id);
    onNodeClick?.(node);
  };

  // Calculate viewBox based on node positions
  const viewBox = useMemo(() => {
    if (!dag.nodes.length) return '0 0 800 400';
    const padding = 80;
    const minX = Math.min(...dag.nodes.map(n => n.x)) - padding;
    const maxX = Math.max(...dag.nodes.map(n => n.x)) + padding;
    const minY = Math.min(...dag.nodes.map(n => n.y)) - padding;
    const maxY = Math.max(...dag.nodes.map(n => n.y)) + padding + 30;
    return `${minX} ${minY} ${maxX - minX} ${maxY - minY}`;
  }, [dag.nodes]);

  if (!isVisible) return null;

  return (
    <Card className="animate-fade-in">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <GitBranch className="h-4 w-4 text-muted-foreground" />
            Causal DAG
          </CardTitle>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setZoom(z => Math.max(0.5, z - 0.1))}>
              <ZoomOut className="h-3.5 w-3.5" />
            </Button>
            <span className="text-xs font-mono w-12 text-center">{(zoom * 100).toFixed(0)}%</span>
            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setZoom(z => Math.min(2, z + 0.1))}>
              <ZoomIn className="h-3.5 w-3.5" />
            </Button>
            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setZoom(1)}>
              <Maximize2 className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Controls */}
        <div className="flex items-center gap-6 text-xs">
          <div className="flex items-center gap-2">
            <Switch
              id="confounders"
              checked={showConfounders}
              onCheckedChange={setShowConfounders}
              className="scale-75"
            />
            <Label htmlFor="confounders" className="text-xs cursor-pointer">Show Confounders</Label>
          </div>
          <div className="flex items-center gap-2">
            <Switch
              id="backdoor"
              checked={showBackdoorPaths}
              onCheckedChange={setShowBackdoorPaths}
              className="scale-75"
            />
            <Label htmlFor="backdoor" className="text-xs cursor-pointer">Highlight Backdoor Paths</Label>
          </div>
        </div>

        {/* SVG Graph */}
        <div className="relative border border-border/50 rounded-lg bg-muted/30 overflow-hidden">
          <svg
            viewBox={viewBox}
            className="w-full h-[300px]"
            style={{ transform: `scale(${zoom})`, transformOrigin: 'center' }}
          >
            <defs>
              <marker
                id="arrowhead"
                markerWidth="10"
                markerHeight="7"
                refX="9"
                refY="3.5"
                orient="auto"
              >
                <polygon
                  points="0 0, 10 3.5, 0 7"
                  fill="hsl(var(--muted-foreground))"
                />
              </marker>
            </defs>

            {/* Edges */}
            {dag.edges.map(edge => (
              <EdgeLine
                key={edge.id}
                edge={edge}
                nodes={dag.nodes}
                showConfounders={showConfounders}
              />
            ))}

            {/* Nodes */}
            {dag.nodes.map(node => (
              (!showConfounders && node.type === 'confounder') ? null : (
                <NodeShape
                  key={node.id}
                  node={node}
                  isSelected={selectedNode === node.id}
                  onClick={() => handleNodeClick(node)}
                />
              )
            ))}
          </svg>

          {/* Minimap indicator */}
          <div className="absolute bottom-2 right-2 text-xs text-muted-foreground bg-background/80 px-2 py-1 rounded">
            {dag.nodes.length} nodes · {dag.edges.length} edges
          </div>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap gap-4 text-xs">
          {Object.entries(nodeTypeConfig).map(([type, config]) => (
            <div key={type} className="flex items-center gap-1.5">
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: config.fill }}
              />
              <span className="text-muted-foreground capitalize">{config.label}</span>
            </div>
          ))}
          <div className="flex items-center gap-1.5">
            <div className="w-4 h-0.5 bg-chart-1" />
            <span className="text-muted-foreground">Validated</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-4 h-0.5 bg-muted-foreground border-dashed border-t-2 border-muted-foreground" style={{ borderStyle: 'dashed' }} />
            <span className="text-muted-foreground">Pending</span>
          </div>
        </div>

        {/* Backdoor paths info */}
        {showBackdoorPaths && dag.backdoorPaths.length > 0 && (
          <div className="p-3 bg-status-warning/10 border border-status-warning/30 rounded-lg">
            <p className="text-xs font-medium text-status-warning mb-2">Backdoor Paths Detected</p>
            <ul className="space-y-1">
              {dag.backdoorPaths.map((path, i) => (
                <li key={i} className="text-xs text-muted-foreground font-mono">
                  {path.join(' → ')}
                </li>
              ))}
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
