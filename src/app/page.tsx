import { AppSidebar } from '@/components/dashboard/app-sidebar';
import { DashboardHeader } from '@/components/dashboard/header';
import { LatestUpdates } from '@/components/dashboard/latest-updates';
import { MenuItemsTable } from '@/components/dashboard/menu-items-table';
import { OrderAnalyticsChart } from '@/components/dashboard/order-analytics-chart';
import { RecentActivityHeader } from '@/components/dashboard/recent-activity-header';
import { StatCards } from '@/components/dashboard/stat-cards';
import { WelcomeBanner } from '@/components/dashboard/welcome-banner';
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import { InventoryAlerts } from '@/components/dashboard/inventory-alerts';
import { PerformanceSummary } from '@/components/dashboard/performance-summary';

export default function Home() {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <DashboardHeader />
        <main className="p-4 sm:p-6 lg:p-8 space-y-6">
          <WelcomeBanner />
          <StatCards />

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <OrderAnalyticsChart />
              <MenuItemsTable />
            </div>
            <div className="space-y-6">
              {/* Other components can go here if needed */}
            </div>
          </div>
          
          <RecentActivityHeader />
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <LatestUpdates />
            </div>
            <div className="space-y-6">
              <InventoryAlerts />
              <PerformanceSummary />
            </div>
          </div>
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
