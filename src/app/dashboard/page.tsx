
'use client'; // This page now needs to be a client component for state and effects

import { useState, useEffect } from 'react';
import {
  LayoutGrid,
  Package,
  FileText,
  ShoppingCart,
} from 'lucide-react';
import { DashboardHeader } from '@/components/dashboard/header';
import { LatestUpdates } from '@/components/dashboard/latest-updates';
import { MenuItemsTable } from '@/components/dashboard/menu-items-table';
import { OrderAnalyticsChart } from '@/components/dashboard/order-analytics-chart';
import { RecentActivityHeader } from '@/components/dashboard/recent-activity-header';
import { StatCards, type StatCardData } from '@/components/dashboard/stat-cards';
import { WelcomeBanner } from '@/components/dashboard/welcome-banner';
import { InventoryAlerts } from '@/components/dashboard/inventory-alerts';
import { PerformanceSummary } from '@/components/dashboard/performance-summary';
import { PopularItems } from '@/components/dashboard/popular-items';
import { DashboardPageSkeleton } from '@/components/dashboard/skeletons';


const initialStatCards: StatCardData[] = [
  {
    title: 'Total Categories',
    value: '26',
    change: '+4.5%',
    changeDescription: 'vs last month',
    icon: LayoutGrid,
    color: 'orange',
    tooltipText: 'The total number of product categories in your menu.',
  },
  {
    title: 'Active Products',
    value: '120',
    change: '+12%',
    changeDescription: 'New items added',
    icon: Package,
    color: 'pink',
    tooltipText: 'The number of products currently available for sale.',
  },
  {
    title: 'Published Pages',
    value: '8',
    changeDescription: 'Updated 2 days ago',
    icon: FileText,
    color: 'green',
    tooltipText: 'The number of static pages (e.g., About Us) that are live.',
  },
  {
    title: "Today's Orders",
    value: '45',
    change: '+8.2%',
    changeDescription: 'vs yesterday',
    icon: ShoppingCart,
    color: 'teal',
    tooltipText: 'The total number of orders placed so far today.',
  },
];

const generateChartData = () => [
  { date: 'Mon', sales: Math.floor(Math.random() * 500) + 3000 },
  { date: 'Tue', sales: Math.floor(Math.random() * 500) + 3500 },
  { date: 'Wed', sales: Math.floor(Math.random() * 500) + 3200 },
  { date: 'Thu', sales: Math.floor(Math.random() * 500) + 4500 },
  { date: 'Fri', sales: Math.floor(Math.random() * 500) + 4000 },
  { date: 'Sat', sales: Math.floor(Math.random() * 500) + 5500 },
  { date: 'Sun', sales: Math.floor(Math.random() * 500) + 5000 },
];

export default function DashboardPage() {
  const [statCardsData, setStatCardsData] = useState(initialStatCards);
  const [chartData, setChartData] = useState(generateChartData);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {

    const handleBranchChange = () => {
      setIsLoading(true);
      setIsLoading(false);
    };

    window.addEventListener('branch-changed', handleBranchChange);

    const interval = setInterval(() => {
      // Simulate real-time updates for Stat Cards
      setStatCardsData(prevData => prevData.map(card => {
        if (card.title === "Today's Orders") {
          const newValue = parseInt(card.value, 10) + Math.floor(Math.random() * 3);
          return { ...card, value: newValue.toString() };
        }
        return card;
      }));
      
      // Simulate real-time updates for Chart
      setChartData(prevData => {
        const newData = [...prevData];
        // new Date().getDay() returns 0 for Sun, 1 for Mon, etc.
        // We adjust so Monday is 0.
        const dayIndex = (new Date().getDay() + 6) % 7;
        
        if(dayIndex >= 0 && dayIndex < 7) {
            newData[dayIndex].sales += Math.floor(Math.random() * 200);
        }
        return newData;
      });

    }, 3000); // Update every 3 seconds

    return () => {
      clearInterval(interval);
      window.removeEventListener('branch-changed', handleBranchChange);
    };
  }, []);

  if (isLoading) {
    return <DashboardPageSkeleton />;
  }

  return (
    <>
      <DashboardHeader />
      <main className="p-4 sm:p-6 lg:p-8 space-y-6">
        <div id="welcome-banner">
          <WelcomeBanner statCards={statCardsData} chartData={chartData} />
        </div>
        <div id="stat-cards">
          <StatCards cards={statCardsData} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <OrderAnalyticsChart data={chartData} />
            <MenuItemsTable />
          </div>
          <div className="space-y-6" id="popular-items">
            <PopularItems />
          </div>
        </div>
        
        <div id="recent-activity">
          <RecentActivityHeader />
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
            <div className="lg:col-span-2">
              <LatestUpdates />
            </div>
            <div className="space-y-6">
              <InventoryAlerts />
              <PerformanceSummary />
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
