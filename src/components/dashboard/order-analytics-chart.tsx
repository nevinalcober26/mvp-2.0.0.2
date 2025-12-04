'use client';

import React, { useState, useEffect } from 'react';
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip } from 'recharts';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { ChartTooltipContent } from '@/components/ui/chart';

const generateChartData = () => [
  { date: 'Mon', orders: Math.floor(Math.random() * 200) + 50 },
  { date: 'Tue', orders: Math.floor(Math.random() * 200) + 50 },
  { date: 'Wed', orders: Math.floor(Math.random() * 200) + 50 },
  { date: 'Thu', orders: Math.floor(Math.random() * 200) + 50 },
  { date: 'Fri', orders: Math.floor(Math.random() * 200) + 50 },
  { date: 'Sat', orders: Math.floor(Math.random() * 200) + 50 },
  { date: 'Sun', orders: Math.floor(Math.random() * 200) + 50 },
];

export function OrderAnalyticsChart() {
  const [data, setData] = useState<any[]>([]);

  useEffect(() => {
    setData(generateChartData());
  }, []);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Order Analytics</CardTitle>
        <CardDescription>
          Showing total orders for the last 7 days.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data}>
              <XAxis
                dataKey="date"
                stroke="#888888"
                fontSize={12}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                stroke="#888888"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) => `${value}`}
              />
               <Tooltip
                cursor={{ fill: 'hsl(var(--accent))', radius: '0.25rem' }}
                content={<ChartTooltipContent />}
               />
              <Bar dataKey="orders" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
