'use client';

import { Wand, RefreshCw, X } from 'lucide-react';
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
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('success');
  const [isVisible, setIsVisible] = useState(true);
  const isLoadingRef = useRef(false);
  const { toast } = useToast();

  const generateSummary = useCallback(() => {
    if (isLoadingRef.current) return;

    if (data.length > 0) {
      isLoadingRef.current = true;
      setStatus('loading');
      setError('');
      setSummary('');
      const dataString = JSON.stringify(data.slice(0, 20));
      
      summarizeData({ data: dataString, context })
        .then((result) => {
          setSummary(result.summary);
          setStatus('success');
        })
        .catch((err) => {
          console.error('AI Summary Error:', err);
          if (err.message && (err.message.includes('429') || err.message.includes('Too Many Requests'))) {
            setError('You have exceeded the request limit. Please wait a moment before trying again.');
          } else {
            setError(`Could not generate summary. The AI may be temporarily unavailable.`);
          }
          setStatus('error');
        })
        .finally(() => {
            isLoadingRef.current = false;
        });
    } else {
        setError(`Not enough data to generate a summary for ${context}.`);
        setStatus('error');
        isLoadingRef.current = false;
    }
  }, [data, context]);
  
  const mockSummary = "The restaurant is facing severe operational inefficiencies, as over **75% of orders (12 out of 16)** are not fully paid, primarily due to a concerning number of cancelled and refunded orders along with several open and draft transactions.\nThis pattern indicates significant revenue leakage and potential issues in service delivery or payment management requiring immediate investigation.";

  useEffect(() => {
    setSummary(mockSummary);
  }, []);

  const renderSummaryWithBold = (text: string) => {
    if (!text) return null;
    const parts = text.split(/(\*\*.*?\*\*)/g);
    return parts.map((part, index) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return (
          <strong key={index} className="font-semibold text-red-600">
            {part.slice(2, -2)}
          </strong>
        );
      }
      return part;
    });
  };
  
  if (!isVisible) {
    return null;
  }

  const summaryParts = summary.split('\n');
  const mainSummary = summaryParts[0] || '';
  const secondarySummary = summaryParts[1] || '';

  const renderContent = () => {
    switch (status) {
      case 'loading':
        return (
          <div className="flex-grow">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">AI is analyzing...</p>
            <p className="text-sm text-foreground/90">Please wait while we generate insights from your data.</p>
          </div>
        );
      case 'error':
        return (
          <>
            <div className="flex-grow">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">AI Error</p>
                <p className="text-sm text-red-700">{error}</p>
            </div>
            <Button variant="ghost" size="sm" className="shrink-0 self-start" onClick={generateSummary} disabled={status === 'loading'}>
                Try Again
            </Button>
          </>
        );
      case 'success':
      default:
        return (
            <div className="flex-grow">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">AI ANALYSIS</p>
                <p className="text-sm text-foreground/90">
                    <span className="font-bold">Summary: </span>
                    {renderSummaryWithBold(mainSummary)}
                </p>
                {secondarySummary && <p className="text-xs text-muted-foreground mt-2">{secondarySummary}</p>}
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
        <Button variant="ghost" size="icon" className="h-7 w-7 shrink-0 rounded-full bg-white/50 hover:bg-white/80" onClick={() => setIsVisible(false)}>
          <X className="h-4 w-4 text-muted-foreground" />
        </Button>
      </div>
    </div>
  );
}
