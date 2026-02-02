'use client';

import { Lightbulb, RefreshCw, Wand, X } from 'lucide-react';
import React, { useState, useCallback, useRef, useEffect } from 'react';
import { summarizeData } from '@/ai/flows/summarize-data-flow';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

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

  // Split summary into two parts for rendering
  const summaryParts = summary.split('\n');
  const mainSummary = summaryParts[0] || '';
  const secondarySummary = summaryParts[1] || '';

  const renderContent = () => {
    switch (status) {
      case 'loading':
        return (
          <>
            <div className="flex-shrink-0">
              <div className="flex items-center justify-center h-10 w-10 rounded-lg bg-blue-100">
                <Lightbulb className="h-6 w-6 text-blue-500" />
              </div>
            </div>
            <div className="flex-grow">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">AI is analyzing...</p>
              <p className="text-sm text-foreground/90">Please wait while we generate insights from your data.</p>
            </div>
          </>
        );
      case 'success':
        return (
          <>
            <div className="flex-shrink-0">
                <div className="flex items-center justify-center h-10 w-10 rounded-lg bg-green-50">
                    <Wand className="h-6 w-6 text-teal-500" />
                </div>
            </div>
            <div className="flex-grow">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">AI ANALYSIS</p>
                <p className="text-sm text-foreground/90">
                    <span className="font-bold">Summary: </span>
                    {renderSummaryWithBold(mainSummary)}
                </p>
                {secondarySummary && <p className="text-xs text-muted-foreground mt-2">{secondarySummary}</p>}
            </div>
          </>
        );
      case 'error':
        return (
            <>
                <div className="flex-shrink-0">
                    <div className="flex items-center justify-center h-10 w-10 rounded-lg bg-red-100">
                        <Lightbulb className="h-6 w-6 text-red-500" />
                    </div>
                </div>
                <div className="flex-grow">
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">AI Error</p>
                    <p className="text-sm text-red-700">{error}</p>
                </div>
                <Button variant="ghost" size="sm" className="shrink-0 self-start" onClick={generateSummary} disabled={status === 'loading'}>
                    Try Again
                </Button>
            </>
        );
      case 'idle':
      default:
        return (
          <>
            <div className="flex-shrink-0">
                <div className="flex items-center justify-center h-10 w-10 rounded-lg bg-blue-100">
                    <Lightbulb className="h-6 w-6 text-blue-500" />
                </div>
            </div>
            <div className="flex-grow">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">AI Summary</p>
                <p className="text-sm text-foreground/90">Get an AI-powered summary of the data below.</p>
            </div>
            <Button size="sm" onClick={generateSummary} disabled={status === 'loading'} className="bg-blue-600 text-white hover:bg-blue-700 disabled:bg-blue-400 self-center">
              <Wand className="mr-2 h-4 w-4" />
              Generate
            </Button>
          </>
        );
    }
  };

  return (
    <div className="animated-gradient-border relative rounded-lg">
      <div className="relative z-10 flex items-start gap-4 rounded-lg bg-gradient-to-r from-background to-accent/20 p-4">
        {renderContent()}
        <Button variant="ghost" size="icon" className="h-7 w-7 absolute top-2 right-2 rounded-full bg-card/50 hover:bg-card/80" onClick={() => setIsVisible(false)}>
          <X className="h-4 w-4 text-muted-foreground" />
        </Button>
      </div>
    </div>
  );
}
