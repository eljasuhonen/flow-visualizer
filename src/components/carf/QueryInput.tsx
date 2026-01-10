import { useState } from 'react';
import { Send, Sparkles, Paperclip } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface QueryInputProps {
  onSubmit: (query: string) => void;
  suggestedQueries: string[];
  isProcessing: boolean;
}

export function QueryInput({ onSubmit, suggestedQueries, isProcessing }: QueryInputProps) {
  const [query, setQuery] = useState('');

  const handleSubmit = () => {
    if (query.trim() && !isProcessing) {
      onSubmit(query.trim());
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="space-y-4">
      <div className="relative">
        <Textarea
          placeholder="Ask a question about your data..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={isProcessing}
          className={cn(
            "min-h-[120px] pr-24 resize-none",
            "bg-card border-border/50 focus:border-primary/50",
            "placeholder:text-muted-foreground/60"
          )}
        />
        <div className="absolute bottom-3 right-3 flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-muted-foreground hover:text-foreground"
            disabled={isProcessing}
          >
            <Paperclip className="h-4 w-4" />
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!query.trim() || isProcessing}
            size="sm"
            className="gap-2"
          >
            {isProcessing ? (
              <>
                <Sparkles className="h-4 w-4 animate-pulse" />
                Analyzing...
              </>
            ) : (
              <>
                <Send className="h-4 w-4" />
                Analyze
              </>
            )}
          </Button>
        </div>
      </div>

      {suggestedQueries.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs text-muted-foreground uppercase tracking-wider">Suggested queries</p>
          <div className="flex flex-wrap gap-2">
            {suggestedQueries.map((suggestion, index) => (
              <Badge
                key={index}
                variant="secondary"
                className={cn(
                  "cursor-pointer transition-colors",
                  "hover:bg-primary/10 hover:text-primary hover:border-primary/30",
                  isProcessing && "opacity-50 cursor-not-allowed"
                )}
                onClick={() => !isProcessing && setQuery(suggestion)}
              >
                {suggestion}
              </Badge>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
