'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { Sun, Wand, RefreshCw } from 'lucide-react';
import { format } from 'date-fns';
import { summarizeData } from '@/ai/flows/summarize-data-flow';
import { cn } from '@/lib/utils';
import type { StatCardData } from './stat-cards';
import { Button } from '@/components/ui/button';

interface WelcomeBannerProps {
  statCards: StatCardData[];
  chartData: any[];
}

export function WelcomeBanner({ statCards, chartData }: WelcomeBannerProps) {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [summary, setSummary] = useState("Welcome back! Click the refresh button for an AI-powered summary of today's performance.");
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('success');
  const isLoadingRef = useRef(false);
  const lastSummarizedRef = useRef<string>('');

  useEffect(() => {
    const timerId = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timerId);
  }, []);

  const getGreeting = () => {
    const hour = currentTime.getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 18) return 'Good Afternoon';
    return 'Good Evening';
  };

  const generateSummary = useCallback((force = false) => {
    if (isLoadingRef.current) return;

    const combinedData = { stats: statCards, sales: chartData };
    const dataString = JSON.stringify(combinedData);

    if (!force && dataString === lastSummarizedRef.current) return;

    if (statCards.length > 0 && chartData.length > 0) {
      isLoadingRef.current = true;
      setStatus('loading');
      setSummary('');

      summarizeData({ data: dataString, context: "today's restaurant status" })
        .then((result) => {
          setSummary(result.summary);
          setStatus('success');
          lastSummarizedRef.current = dataString;
        })
        .catch((err) => {
          console.error('AI Banner Summary Error:', err);
          setSummary("There was an issue generating the AI summary. Please try again.");
          setStatus('error');
        })
        .finally(() => {
          isLoadingRef.current = false;
        });
    } else {
      setStatus('idle');
    }
  }, [statCards, chartData]);

  const renderSummaryWithBold = (text: string) => {
    if (!text) return null;
    const parts = text.split(/(\*\*.*?\*\*)/g);
    return parts.map((part, index) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return (
          <strong key={index} className="font-bold text-gray-800">
            {part.slice(2, -2)}
          </strong>
        );
      }
      return part;
    });
  };

  return (
    <div className="animated-gradient-border relative rounded-lg bg-gradient-to-r from-teal-50/60 to-blue-100/60 p-6 shadow-sm">
      <div className="relative z-10 flex flex-wrap items-start justify-between gap-4">
        <div className="flex-grow">
          <h2 className="text-2xl font-bold text-gray-800">
            {getGreeting()}, Marice! 😊
          </h2>
          <div className="mt-2 text-sm flex items-start gap-3">
            <Wand className="h-4 w-4 text-teal-600 flex-shrink-0 mt-0.5" />
            <div className="flex-grow">
              {status === 'loading' ? (
                <div className="flex items-center gap-2 text-gray-600">
                  <RefreshCw className="h-4 w-4 animate-spin" />
                  <span>AI is syncing your outlet metrics...</span>
                </div>
              ) : (
                <p className="max-w-md text-gray-600">
                  {renderSummaryWithBold(summary || "Welcome back to your dashboard. Ready for another great shift?")}
                </p>
              )}
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 shrink-0 rounded-full bg-white/50 hover:bg-white/80"
              onClick={() => generateSummary(true)}
              disabled={status === 'loading'}
            >
              <RefreshCw className={cn('h-4 w-4 text-muted-foreground', status === 'loading' && 'animate-spin')} />
            </Button>
          </div>
          <div className="mt-6 flex items-center">
            <div className="mr-4 h-2 w-2 rounded-full bg-teal-400"></div>
            <div className="flex items-baseline">
              <p className="text-6xl font-bold tracking-tighter text-gray-900">
                {format(currentTime, 'hh:mm')}
              </p>
              <p className="ml-2 text-2xl font-medium text-gray-500">
                {format(currentTime, 'a')}
              </p>
            </div>
          </div>
        </div>

        <div className="flex-shrink-0 text-right">
          <div className="flex items-center justify-end">
            <Sun className="h-16 w-16 text-yellow-400" />
            <p className="ml-2 text-6xl font-bold text-gray-900">24°C</p>
          </div>
          <p className="mt-1 font-semibold text-gray-700">Sunny</p>
          <p className="text-muted-foreground">Dubai</p>
          <p className="mt-2 text-sm text-muted-foreground">
            {format(new Date(), 'EEEE, MMMM dd, yyyy')}
          </p>
        </div>
      </div>
    </div>
  );
}
