'use client';

import { Lightbulb, RefreshCw, Wand } from 'lucide-react';
import React, { useState, useCallback, useRef } from 'react';
import { summarizeData } from '@/ai/flows/summarize-data-flow';
import { Button } from '@/components/ui/button';

interface AiSummaryProps {
  data: any[];
  context: string;
}

export function AiSummary({ data, context }: AiSummaryProps) {
  const [summary, setSummary] = useState('');
  const [error, setError] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const isLoadingRef = useRef(false);

  const generateSummary = useCallback(() => {
    if (isLoadingRef.current) return;

    if (data.length > 0) {
      isLoadingRef.current = true;
      setStatus('loading');
      setError('');
      setSummary('');
      const dataString = JSON.stringify(data.slice(0, 20)); // Limit data for performance
      
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

  const renderSummaryWithBold = (text: string) => {
    if (!text) return null;
    // Split by the bold delimiter, keeping the delimiters
    const parts = text.split(/(\*\*.*?\*\*)/g);
    return parts.map((part, index) => {
      // If the part is wrapped in **, render it as a strong tag
      if (part.startsWith('**') && part.endsWith('**')) {
        return (
          <strong key={index} className="font-semibold text-blue-900">
            {part.slice(2, -2)}
          </strong>
        );
      }
      // Otherwise, render it as plain text
      return part;
    });
  };

  const renderContent = () => {
    switch (status) {
      case 'loading':
        return (
          <>
            <Lightbulb className="h-5 w-5 flex-shrink-0 text-blue-500 mt-0.5" />
            <div className="flex-grow">
              <p className="font-semibold text-blue-900">AI is analyzing your data</p>
              <div className="flex items-center gap-1.5 mt-1">
                <span className="h-1.5 w-1.5 rounded-full bg-blue-400 animate-pulse [animation-delay:-0.3s]"></span>
                <span className="h-1.5 w-1.5 rounded-full bg-blue-400 animate-pulse [animation-delay:-0.15s]"></span>
                <span className="h-1.5 w-1.5 rounded-full bg-blue-400 animate-pulse"></span>
              </div>
            </div>
          </>
        );
      case 'success':
        return (
          <>
            <Lightbulb className="h-5 w-5 flex-shrink-0 text-blue-500 mt-0.5" />
            <p className="flex-grow">
              <strong className="font-semibold text-blue-900">AI Summary:</strong>{' '}
              {renderSummaryWithBold(summary)}
            </p>
            <Button variant="ghost" size="icon" className="h-7 w-7 text-blue-600 hover:text-blue-800 shrink-0" onClick={generateSummary} disabled={status === 'loading'}>
              <RefreshCw className="h-4 w-4" />
              <span className="sr-only">Regenerate summary</span>
            </Button>
          </>
        );
      case 'error':
        return (
            <>
                <Lightbulb className="h-5 w-5 flex-shrink-0 text-red-500 mt-0.5" />
                <p className="flex-grow text-red-900">
                    <strong className="font-semibold">AI Error:</strong>{' '}
                    {error}
                </p>
                <Button variant="ghost" size="sm" className="shrink-0" onClick={generateSummary} disabled={status === 'loading'}>
                    Try Again
                </Button>
            </>
        );
      case 'idle':
      default:
        return (
          <>
            <Lightbulb className="h-5 w-5 flex-shrink-0 text-blue-500" />
            <p className="flex-grow font-medium text-blue-900/90">
              Get an AI-powered summary of the data below.
            </p>
            <Button size="sm" onClick={generateSummary} disabled={status === 'loading'} className="bg-blue-600 text-white hover:bg-blue-700 disabled:bg-blue-400">
              <Wand className="mr-2 h-4 w-4" />
              Generate Summary
            </Button>
          </>
        );
    }
  };
  
  let containerClasses = "flex items-center gap-4 rounded-lg p-4 text-sm border shadow-sm transition-colors";
  switch (status) {
    case 'success':
    case 'loading':
    case 'idle':
        containerClasses += " bg-gradient-to-r from-blue-50 to-indigo-100 text-blue-900/90 border-blue-200/50";
        break;
    case 'error':
        containerClasses += " bg-red-50 border-red-200";
        break;
  }


  return (
    <div className={containerClasses}>
      {renderContent()}
    </div>
  );
}
