import { cn } from '@/lib/utils';
import { scenarioList } from '@/data/mockData';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Bell, Settings, User, Hexagon, Moon, Sun } from 'lucide-react';
import { useState, useEffect } from 'react';

interface DashboardHeaderProps {
  selectedScenario: string;
  onScenarioChange: (id: string) => void;
  sessionId: string;
}

export function DashboardHeader({ selectedScenario, onScenarioChange, sessionId }: DashboardHeaderProps) {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const isDarkMode = document.documentElement.classList.contains('dark');
    setIsDark(isDarkMode);
  }, []);

  const toggleTheme = () => {
    document.documentElement.classList.toggle('dark');
    setIsDark(!isDark);
  };

  const currentScenario = scenarioList.find(s => s.id === selectedScenario);

  return (
    <header className="sticky top-0 z-50 glass-strong border-b border-border/50">
      <div className="flex items-center justify-between h-14 px-4 lg:px-6">
        {/* Logo & Title */}
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-gradient-to-br from-primary to-accent">
            <Hexagon className="h-5 w-5 text-white" />
          </div>
          <div className="hidden sm:block">
            <h1 className="text-lg font-bold text-gradient">CARF Epistemic Cockpit</h1>
          </div>
          <Badge variant="outline" className="hidden md:flex text-xs font-mono">
            v1.0.0
          </Badge>
        </div>

        {/* Center - Domain Selector */}
        <div className="flex items-center gap-3">
          <Select value={selectedScenario} onValueChange={onScenarioChange}>
            <SelectTrigger className="w-[200px] h-9">
              <SelectValue>
                <div className="flex items-center gap-2">
                  <span>{currentScenario?.icon}</span>
                  <span>{currentScenario?.name}</span>
                </div>
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              {scenarioList.map((scenario) => (
                <SelectItem key={scenario.id} value={scenario.id}>
                  <div className="flex items-center gap-2">
                    <span>{scenario.icon}</span>
                    <span>{scenario.name}</span>
                    <Badge variant="secondary" className="ml-2 text-[10px]">
                      {scenario.domain}
                    </Badge>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Session Indicator */}
          <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 bg-secondary/50 rounded-lg">
            <div className="w-2 h-2 rounded-full bg-status-success animate-pulse" />
            <span className="text-xs text-muted-foreground">Session:</span>
            <span className="text-xs font-mono">{sessionId.slice(0, 12)}...</span>
          </div>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            className="h-9 w-9"
            onClick={toggleTheme}
          >
            {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </Button>
          <Button variant="ghost" size="icon" className="h-9 w-9 relative">
            <Bell className="h-4 w-4" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-destructive rounded-full" />
          </Button>
          <Button variant="ghost" size="icon" className="h-9 w-9">
            <Settings className="h-4 w-4" />
          </Button>
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center ml-1">
            <User className="h-4 w-4 text-white" />
          </div>
        </div>
      </div>
    </header>
  );
}
