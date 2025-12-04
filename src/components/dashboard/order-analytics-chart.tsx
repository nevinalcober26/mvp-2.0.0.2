'use client';

import React, { useState, useEffect } from 'react';
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  XAxis,
  YAxis,
} from 'recharts';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ChartContainer } from '@/components/ui/chart';

const generateChartData = () => [
  { date: 'Mon', orders: Math.floor(Math.random() * 25) + 30 },
  { date: 'Tue', orders: Math.floor(Math.random() * 25) + 35 },
  { date: 'Wed', orders: Math.floor(Math.random() * 25) + 32 },
  { date: 'Thu', orders: Math.floor(Math.random() * 25) + 45 },
  { date: 'Fri', orders: Math.floor(Math.random() * 25) + 40 },
  { date: 'Sat', orders: Math.floor(Math.random() * 25) + 55 },
  { date: 'Sun', orders: Math.floor(Math.random() * 25) + 50 },
];

const chartConfig = {
  orders: {
    label: 'Orders',
    color: 'hsl(var(--chart-1))',
  },
};

export function OrderAnalyticsChart() {
  const [data, setData] = useState<any[]>([]);

  useEffect(() => {
    setData(generateChartData());
  }, []);

  return (
    <Card>
      <CardHeader className="flex flex-row items-start justify-between">
        <div>
          <CardTitle>Order Analytics</CardTitle>
          <CardDescription>
            A list of the most recent open and in-progress tickets.
          </CardDescription>
        </div>
        <Select defaultValue="7">
          <SelectTrigger className="w-auto gap-2">
            <SelectValue placeholder="Last 7 Days" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7">Last 7 Days</SelectItem>
            <SelectItem value="30">Last 30 Days</SelectItem>
            <SelectItem value="90">Last 90 Days</SelectItem>
          </SelectContent>
        </Select>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[300px] w-full">
          <AreaChart
            data={data}
            margin={{ top: 5, right: 20, left: -10, bottom: 0 }}
          >
            <defs>
              <linearGradient id="colorOrders" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor="hsl(var(--chart-1))"
                  stopOpacity={0.4}
                />
                <stop
                  offset="95%"
                  stopColor="hsl(var(--chart-1))"
                  stopOpacity={0}
                />
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} strokeDasharray="3 3" />
            <XAxis
              dataKey="date"
              stroke="hsl(var(--muted-foreground))"
              fontSize={12}
              tickLine={false}
              axisLine={{ stroke: 'hsl(var(--border))' }}
            />
            <YAxis
              stroke="hsl(var(--muted-foreground))"
              fontSize={12}
              tickLine={false}
              axisLine={false}
              domain={[0, 'dataMax + 10']}
              tickFormatter={(value) => `${value}`}
            />
            <Area
              type="monotone"
              dataKey="orders"
              stroke="hsl(var(--chart-1))"
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#colorOrders)"
            />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
