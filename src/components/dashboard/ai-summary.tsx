'use client';

import { Wand, RefreshCw, X, AlertTriangle } from 'lucide-react';
import React, { useState, useCallback, useRef, useEffect } from 'react';
import { summarizeData } from '@/ai/flows/summarize-data-flow';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

interface AiSummaryProps {
  data: any[];
  context: string;
}

export function AiSummary({ data, context }: AiSummaryProps) {
  const [summary, setSummary] = useState('');
  const [error, setError] = useState('');
  const [status, setStatus] = useState<
    'idle' | 'loading' | 'success' | 'error'
  >('idle');
  const [isVisible, setIsVisible] = useState(true);
  const isLoadingRef = useRef(false);

  const generateSummary = useCallback(() => {
    if (isLoadingRef.current) return;

    if (data.length > 0) {
      isLoadingRef.current = true;
      setStatus('loading');
      setError('');
      setSummary('');
      // To prevent excessively large API requests, we'll slice the data.
      // 50 records should be enough for a meaningful summary.
      const dataString = JSON.stringify(data.slice(0, 50));

      summarizeData({ data: dataString, context })
        .then((result) => {
          setSummary(result.summary);
          setStatus('success');
        })
        .catch((err) => {
          console.error('AI Summary Error:', err);
          if (
            err.message &&
            (err.message.includes('429') ||
              err.message.includes('Too Many Requests'))
          ) {
            setSummary(
              `AI analysis limit reached. Displaying basic summary: Found **${data.length} items** for **${context}**.`
            );
            setStatus('success');
            setError('');
          } else {
            setError(
              `Could not generate summary. The AI may be temporarily unavailable.`
            );
            setStatus('error');
          }
        })
        .finally(() => {
          isLoadingRef.current = false;
        });
    } else {
      // If there's no data, reset to idle state.
      setStatus('idle');
      setSummary('');
      setError('');
    }
  }, [data, context]);

  // Trigger summary generation when data changes.
  useEffect(() => {
    generateSummary();
  }, [generateSummary]);

  const renderSummaryWithBold = (text: string) => {
    if (!text) return null;
    const parts = text.split(/(\*\*.*?\*\*)/g);
    return parts.map((part, index) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return (
          <strong key={index} className="font-semibold text-primary-foreground">
            {part.slice(2, -2)}
          </strong>
        );
      }
      return part;
    });
  };

  // Do not render the component if it's been closed or if there's no data to show.
  if (!isVisible || status === 'idle') {
    return null;
  }

  const summaryParts = summary.split('\n');
  const mainSummary = summaryParts[0] || '';
  const secondarySummary = summaryParts[1] || '';

  const renderContent = () => {
    switch (status) {
      case 'loading':
        return (
          <div className="flex-grow flex items-center gap-4">
            <RefreshCw className="h-5 w-5 text-teal-600 animate-spin" />
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                AI is analyzing...
              </p>
              <p className="text-sm text-foreground/90">
                Please wait while we generate insights.
              </p>
            </div>
          </div>
        );
      case 'error':
        return (
          <div className="flex-grow flex items-center gap-4">
            <AlertTriangle className="h-5 w-5 text-destructive" />
            <div>
              <p className="text-xs font-semibold text-destructive uppercase tracking-wider">
                AI Error
              </p>
              <p className="text-sm text-foreground/90">{error}</p>
            </div>
          </div>
        );
      case 'success':
      default:
        return (
          <div className="flex-grow">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">
              AI ANALYSIS
            </p>
            <p className="text-sm text-foreground/90">
              <span className="font-bold">Summary: </span>
              {renderSummaryWithBold(mainSummary)}
            </p>
            {secondarySummary && (
              <p className="text-xs text-muted-foreground mt-2">
                {secondarySummary}
              </p>
            )}
          </div>
        );
    }
  };

  return (
    <div className="animated-gradient-border relative rounded-lg bg-gradient-to-r from-teal-50/60 to-blue-100/60 p-6 shadow-sm">
      <div className="relative z-10 flex items-start gap-4">
        <div className="flex-shrink-0">
          <div className="flex items-center justify-center h-10 w-10 rounded-lg bg-white/50">
            <Wand className="h-6 w-6 text-teal-500" />
          </div>
        </div>
        {renderContent()}
        <div className="flex items-start gap-2">
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 shrink-0 rounded-full bg-white/50 hover:bg-white/80"
            onClick={generateSummary}
            disabled={status === 'loading'}
          >
            <RefreshCw
              className={cn(
                'h-4 w-4 text-muted-foreground',
                status === 'loading' && 'animate-spin'
              )}
            />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 shrink-0 rounded-full bg-white/50 hover:bg-white/80"
            onClick={() => setIsVisible(false)}
          >
            <X className="h-4 w-4 text-muted-foreground" />
          </Button>
        </div>
      </div>
    </div>
  );
}
