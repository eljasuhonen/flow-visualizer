import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { SimulationParams, defaultSimulationParams } from '@/services/carfService';
import { SlidersHorizontal, RotateCcw } from 'lucide-react';

interface SimulationControlsProps {
  params: SimulationParams;
  onChange: (params: SimulationParams) => void;
  onReset: () => void;
  disabled?: boolean;
}

export function SimulationControls({ params, onChange, onReset, disabled }: SimulationControlsProps) {
  const updateParam = <K extends keyof SimulationParams>(key: K, value: SimulationParams[K]) => {
    onChange({ ...params, [key]: value });
  };

  return (
    <Card className="border-dashed border-primary/30 bg-primary/5">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <SlidersHorizontal className="h-4 w-4 text-primary" />
          Simulation Controls
          <Button
            variant="ghost"
            size="sm"
            className="ml-auto h-6 px-2 text-xs"
            onClick={onReset}
            disabled={disabled}
          >
            <RotateCcw className="h-3 w-3 mr-1" />
            Reset
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Investment Multiplier */}
        <div className="space-y-2">
          <div className="flex justify-between">
            <Label className="text-xs">Investment Multiplier</Label>
            <span className="text-xs font-mono text-muted-foreground">
              {params.investmentMultiplier.toFixed(2)}x
            </span>
          </div>
          <Slider
            value={[params.investmentMultiplier]}
            onValueChange={([v]) => updateParam('investmentMultiplier', v)}
            min={0.5}
            max={2.0}
            step={0.1}
            disabled={disabled}
            className="cursor-pointer"
          />
          <div className="flex justify-between text-[10px] text-muted-foreground">
            <span>0.5x</span>
            <span>2.0x</span>
          </div>
        </div>

        {/* Confidence Threshold */}
        <div className="space-y-2">
          <div className="flex justify-between">
            <Label className="text-xs">Confidence Threshold</Label>
            <span className="text-xs font-mono text-muted-foreground">
              {(params.confidenceThreshold * 100).toFixed(0)}%
            </span>
          </div>
          <Slider
            value={[params.confidenceThreshold]}
            onValueChange={([v]) => updateParam('confidenceThreshold', v)}
            min={0.5}
            max={1.0}
            step={0.05}
            disabled={disabled}
            className="cursor-pointer"
          />
          <div className="flex justify-between text-[10px] text-muted-foreground">
            <span>50%</span>
            <span>100%</span>
          </div>
        </div>

        {/* Uncertainty Tolerance */}
        <div className="space-y-2">
          <div className="flex justify-between">
            <Label className="text-xs">Uncertainty Tolerance</Label>
            <span className="text-xs font-mono text-muted-foreground">
              {(params.uncertaintyTolerance * 100).toFixed(0)}%
            </span>
          </div>
          <Slider
            value={[params.uncertaintyTolerance]}
            onValueChange={([v]) => updateParam('uncertaintyTolerance', v)}
            min={0}
            max={1.0}
            step={0.05}
            disabled={disabled}
            className="cursor-pointer"
          />
          <div className="flex justify-between text-[10px] text-muted-foreground">
            <span>Low</span>
            <span>High</span>
          </div>
        </div>

        {/* Policy Strictness */}
        <div className="space-y-2">
          <Label className="text-xs">Policy Strictness</Label>
          <Select
            value={params.policyStrictness}
            onValueChange={(v) => updateParam('policyStrictness', v as SimulationParams['policyStrictness'])}
            disabled={disabled}
          >
            <SelectTrigger className="h-8 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="relaxed" className="text-xs">
                <span className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-status-success" />
                  Relaxed
                </span>
              </SelectItem>
              <SelectItem value="standard" className="text-xs">
                <span className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-status-warning" />
                  Standard
                </span>
              </SelectItem>
              <SelectItem value="strict" className="text-xs">
                <span className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-status-error" />
                  Strict
                </span>
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardContent>
    </Card>
  );
}
