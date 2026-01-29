'use client';

import { Lightbulb } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { summarizeData } from '@/ai/flows/summarize-data-flow';
import { Skeleton } from '@/components/ui/skeleton';

interface AiSummaryProps {
  data: any[];
  context: string;
}

export function AiSummary({ data, context }: AiSummaryProps) {
  const [summary, setSummary] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (data.length > 0) {
      setIsLoading(true);
      const dataString = JSON.stringify(data.slice(0, 20)); // Limit data for performance
      summarizeData({ data: dataString, context })
        .then((result) => {
          setSummary(result.summary);
        })
        .catch((error) => {
          console.error('AI Summary Error:', error);
          setSummary(`Could not generate summary for ${context}.`);
        })
        .finally(() => {
          setIsLoading(false);
        });
    } else {
        setIsLoading(false);
        setSummary(`Not enough data to generate a summary for ${context}.`);
    }
  }, [data, context]);

  if (isLoading) {
    return (
      <div className="flex items-start gap-3 rounded-lg bg-blue-50 border border-blue-200 p-4 text-sm text-blue-800">
        <Lightbulb className="h-5 w-5 flex-shrink-0" />
        <div className="flex-grow space-y-2">
            <Skeleton className="h-4 w-3/4 bg-blue-200" />
            <Skeleton className="h-4 w-1/2 bg-blue-200" />
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-start gap-3 rounded-lg bg-blue-50 border border-blue-200 p-4 text-sm text-blue-800">
      <Lightbulb className="h-5 w-5 flex-shrink-0" />
      <p>
        <strong className="font-semibold">AI Summary:</strong> {summary}
      </p>
    </div>
  );
}
