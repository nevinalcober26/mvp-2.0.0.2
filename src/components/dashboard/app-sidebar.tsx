'use client';
import {
  PieChart,
  BarChart,
  Settings,
  ClipboardList,
  LayoutDashboard,
  BookOpen,
  Briefcase,
  Plug,
  SlidersHorizontal,
  Plus,
  Minus,
} from 'lucide-react';
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarSeparator,
  SidebarTrigger,
  SidebarMenuSub,
  SidebarMenuSubItem,
  SidebarMenuSubButton,
} from '@/components/ui/sidebar';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import Image from 'next/image';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { Button } from '../ui/button';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import NextLink from 'next/link';
import { cn } from '@/lib/utils';
import { TooltipContent } from '../ui/tooltip';

const userAvatar = PlaceHolderImages.find((img) => img.id === 'user-avatar');

export const EMenuIcon = () => (
  <svg
    version="1.0"
    viewBox="0 0 1896 592"
    width="150"
    height="47"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      fill="teal"
      d="M474 167v19h42v-38h-42zm69 0v19h310v-38H543zm-69 89.5V275h42v-37h-42zm69 0V275h152v-37H543zm-69 90V365h42v-37h-42zm69 0V365h76v-37h-76z"
    />
    <path
      fill="teal"
      fillOpacity=".6"
      d="M516.4 167c0 10.7.2 15.1.3 9.7.2-5.3.2-14.1 0-19.5-.1-5.3-.3-.9-.3 9.8m0 89.5c0 10.4.2 14.6.3 9.2.2-5.4.2-13.9 0-19-.1-5.1-.3-.7-.3 9.8m0 90c0 10.4.2 14.6.3 9.2.2-5.4.2-13.9 0-19-.1-5.1-.3-.7-.3 9.8"
    />
    <path
      fill="teal"
      fillOpacity=".7"
      d="M542.4 167c0 10.7.2 15.1.3 9.7.2-5.3.2-14.1 0-19.5-.1-5.3-.3-.9-.3 9.8m0 89.5c0 10.4.2 14.6.3 9.2.2-5.4.2-13.9 0-19-.1-5.1-.3-.7-.3 9.8m153 0c0 10.4.2 14.6.3 9.2.2-5.4.2-13.9 0-19-.1-5.1-.3-.7-.3 9.8m-153 90c0 10.4.2 14.6.3 9.2.2-5.4.2-13.9 0-19-.1-5.1-.3-.7-.3 9.8"
    />
    <path
      fillOpacity=".5"
      d="M853.4 167c0 10.7.2 15.1.3 9.7.2-5.3.2-14.1 0-19.5-.1-5.3-.3-.9-.3 9.8m-369.1 70.7c5.9.2 15.5.2 21.5 0 5.9-.1 1-.3-10.8-.3s-16.7.2-10.7.3m96.5 0c21 .2 55.4.2 76.5 0 21-.1 3.8-.2-38.3-.2s-59.3.1-38.2.2m-96.5 128c5.9.2 15.5.2 21.5 0 5.9-.1 1-.3-10.8-.3s-16.7.2-10.7.3m77.5 0c10.5.2 27.9.2 38.5 0 10.5-.1 1.9-.2-19.3-.2s-29.8.1-19.2.2"
    />
    <path
      fillOpacity=".3"
      d="M484.3 186.7c5.9.2 15.5.2 21.5 0 5.9-.1 1-.3-10.8-.3s-16.7.2-10.7.3m136 0c42.7.2 112.7.2 155.5 0 42.7-.1 7.7-.2-77.8-.2s-120.5.1-77.7.2"
    />
    <path
      fillOpacity=".1"
      d="M859.5 296.5c0 38.5.1 54.1.2 34.7.2-19.5.2-51 0-70-.1-19.1-.2-3.2-.2 35.3m158 0c0 38.5.1 54.1.2 34.7.2-19.5.2-51 0-70-.1-19.1-.2-3.2-.2 35.3m205.8-41.8c.4.3 1 .3 1.4 0 .3-.4 0-.7-.7-.7s-1 .3-.7.7m72.1 35.3c0 19 .2 26.7.3 17.2.2-9.4.2-25 0-34.5-.1-9.4-.3-1.7-.3 17.3m-35.4-24.5c1.3 1.4 2.6 2.5 2.8 2.5.3 0-.5-1.1-1.8-2.5s-2.6-2.5-2.8-2.5c-.3 0 .5 1.1 1.8 2.5m-436 .8c0 .2 1.5 1.6 3.3 3.3l3.2 2.9-2.9-3.3c-2.8-3-3.6-3.7-3.6-2.9m225.4 2.9-1.9 2.3 2.3-1.9c2.1-1.8 2.7-2.6 1.9-2.6-.2 0-1.2 1-2.3 2.2m-264.1 12.5c.9.2 2.3.2 3 0 .6-.3-.1-.5-1.8-.5-1.6 0-2.2.2-1.2.5m303 0c.9.2 2.5.2 3.5 0 .9-.3.1-.5-1.8-.5s-2.7.2-1.7.5m184.8 14.9c0 1.1.3 1.4.6.6.3-.7.2-1.6-.1-1.9-.3-.4-.6.2-.5 1.3M1145 301c0 .7.3 1 .7.7.3-.4.3-1 0-1.4-.4-.3-.7 0-.7.7m-110.9 6.6c0 1.1.3 1.4.6.6.3-.7.2-1.6-.1-1.9-.3-.4-.6.2-.5 1.3m0 7c0 1.1.3 1.4.6.6.3-.7.2-1.6-.1-1.9-.3-.4-.6.2-.5 1.3M731 321c0 .7.3 1 .7.7.3-.4.3-1 0-1.4-.4-.3-.7 0-.7.7m108 9c0 .7.3 1 .7.7.3-.4.3-1 0-1.4-.4-.3-.7 0-.7.7m496.5 3c1 1.1 2 2 2.3 2s-.3-.9-1.3-2-2-2-2.3-2 .3.9 1.3 2m-565 1c.3.5.8 1 1.1 1s.2-.5-.1-1c-.3-.6-.8-1-1.1-1s-.2.4.1 1m28.4.7c-1.3 1.6-1.2 1.7.4.4s2.1-2.1 1.3-2.1c-.2 0-1 .8-1.7 1.7m550.9 4c.6.2 1.8.2 2.5 0 .6-.3.1-.5-1.3-.5s-1.9.2-1.2.5m-257.5 1c.4.3 1 .3 1.4 0 .3-.4 0-.7-.7-.7s-1 .3-.7.7m-266.4 13-2.4 2.8 2.8-2.4c1.5-1.4 2.7-2.6 2.7-2.8 0-.8-.8-.1-3.1 2.4m-80.9-1.3c0 .2.8 1 1.8 1.7 1.5 1.3 1.6 1.2.3-.4s-2.1-2.1-2.1-1.3m622.4 4.8-2.9 3.3 3.3-2.9c1.7-1.7 3.2-3.1 3.2-3.3 0-.8-.8-.1-3.6 2.9m-314.9-1.2c.3.5.8 1 1.1 1s.2-.5-.1-1c-.3-.6-.8-1-1.1-1s-.2.4.1 1m284.3 12.7c1.2.2 3 .2 4 0 .9-.3-.1-.5-2.3-.4-2.2 0-3 .2-1.7.4"
    />
    <path
      fillOpacity=".8"
      d="M869.8 227.7c5.6.2 14.8.2 20.5 0 5.6-.1 1-.3-10.3-.3s-15.9.2-10.2.3m118 0c5.7.2 14.7.2 20 0 5.3-.1.7-.3-10.3-.3s-15.4.2-9.7.3m-206.5 27c.4.3 1 .3 1.4 0 .3-.4 0-.7-.7-.7s-1 .3-.7.7m10 0c.4.3 1 .3 1.4 0 .3-.4 0-.7-.7-.7s-1 .3-.7.7m294 0c.4.3 1 .3 1.4 0 .3-.4 0-.7-.7-.7s-1 .3-.7.7m9 0c.4.3 1 .3 1.4 0 .3-.4 0-.7-.7-.7s-1 .3-.7.7m311.2 56.3c0 30.5.1 43 .2 27.7.2-15.2.2-40.2 0-55.5-.1-15.2-.2-2.7-.2 27.8m-148-47c.3.5.8 1 1.1 1s.2-.5-.1-1c-.3-.6-.8-1-1.1-1s-.2.4.1 1m-434 3c.3.5.8 1 1.1 1s.2-.5-.1-1c-.3-.6-.8-1-1.1-1s-.2.4.1 1m226.4 2.7-2.4 2.8 2.8-2.4c1.5-1.4 2.7-2.6 2.7-2.8 0-.8-.8-.1-3.1 2.4m211.6-1.7c.3.5.8 1 1.1 1s.2-.5-.1-1c-.3-.6-.8-1-1.1-1s-.2.4.1 1m-132 1c.3.5.8 1 1.1 1s.2-.5-.1-1c-.3-.6-.8-1-1.1-1s-.2.4.1 1m-301 3c.3.5.8 1 1.1 1s.2-.5-.1-1c-.3-.6-.8-1-1.1-1s-.2.4.1 1m275 13c.3.5.8 1 1.1 1s.2-.5-.1-1c-.3-.6-.8-1-1.1-1s-.2.4.1 1m168.5 8c0 .7.3 1 .7.7.3-.4.3-1 0-1.4-.4-.3-.7 0-.7.7m-496.7 7.7c5.9.2 15.5.2 21.5 0 5.9-.1 1-.3-10.8-.3s-16.7.2-10.7.3m304 0c5.9.2 15.5.2 21.5 0 5.9-.1 1-.3-10.8-.3s-16.7.2-10.7.3M841 305c0 .7.3 1 .7.7.3-.4.3-1 0-1.4-.4-.3-.7 0-.7.7m-109.8 6c0 1.9.2 2.7.5 1.7.2-.9.2-2.5 0-3.5-.3-.9-.5-.1-.5 1.8m109.8 2c0 .7.3 1 .7.7.3-.4.3-1 0-1.4-.4-.3-.7 0-.7.7m-76.3 5.7c-.5.7 29.1.7 63.3 0 7.4-.1-3.7-.4-24.7-.5s-38.4.1-38.6.5m323.1 0c10.5.2 27.9.2 38.5 0 10.5-.1 1.9-.2-19.3-.2s-29.8.1-19.2.2M1296 327c0 .7.3 1 .7.7.3-.4.3-1 0-1.4-.4-.3-.7 0-.7.7m-223.5 6c.3.5.8 1 1.1 1s.2-.5-.1-1c-.3-.6-.8-1-1.1-1s-.2.4.1 1m261.5-.6c0 .2.8 1 1.8 1.7 1.5 1.3 1.6 1.2.3-.4s-2.1-2.1-2.1-1.3m-535.1 3.3c-1.3 1.6-1.2 1.7.4.4.9-.7 1.7-1.5 1.7-1.7 0-.8-.8-.3-2.1 1.3m276.6.3c.3.5.8 1 1.1 1s.2-.5-.1-1c-.3-.6-.8-1-1.1-1s-.2.4.1 1m-250.1 16.2-2.9 3.3 3.3-2.9c1.7-1.7 3.2-3.1 3.2-3.3 0-.8-.8-.1-3.6 2.9m-78.4.3c1.3 1.4 2.6 2.5 2.8 2.5.3 0-.5-1.1-1.8-2.5s-2.6-2.5-2.8-2.5c-.3 0 .5 1.1 1.8 2.5m622.4.7c-.4.7-.3.8.4.4 1.2-.7 1.6-1.6.8-1.6-.3 0-.8.5-1.2 1.2m-315.9 1.8c.3.5.8 1 1.1 1s.2-.5-.1-1c-.3-.6-.8-1-1.1-1s-.2.4.1 1"
    />
    <path
      fill="teal"
      fillOpacity=".8"
      d="M484.3 275.7c5.9.2 15.5.2 21.5 0 5.9-.1 1-.3-10.8-.3s-16.7.2-10.7.3m96.5 0c21 .2 55.4.2 76.5 0 21-.1 3.8-.2-38.3-.2s-59.3.1-38.2.2m-96.5 52c5.9.2 15.5.2 21.5 0 5.9-.1 1-.3-10.8-.3s-16.7.2-10.7.3m77.5 0c10.5.2 27.9.2 38.5 0 10.5-.1 1.9-.2-19.3-.2s-29.8.1-19.2.2"
    />
  </svg>
);

const createTooltipContent = (
  title: string,
  items: { label: string; path: string }[]
) => (
  <div className="flex flex-col items-start p-1">
    <p className="font-bold px-2 py-1">{title}</p>
    <div className="flex flex-col items-start">
      {items.map((item) => (
        <NextLink
          key={item.label}
          href={item.path}
          className="w-full text-left rounded-sm px-2 py-1.5 hover:bg-gray-800"
          onClick={(e) => {
            if (item.path === '#') e.preventDefault();
          }}
        >
          {item.label}
        </NextLink>
      ))}
    </div>
  </div>
);

export function AppSidebar() {
  const pathname = usePathname();

  const getInitialOpenMenu = () => {
    if (pathname.startsWith('/dashboard/reports')) {
      return 'reports';
    }
    if (
      pathname.startsWith('/dashboard/products') ||
      pathname.startsWith('/dashboard/categories')
    ) {
      return 'catalog';
    }
    if (pathname.startsWith('/dashboard/tables')) {
      return 'operations';
    }
    if (pathname.startsWith('/dashboard/orders')) {
      return 'orders';
    }
    if (pathname.startsWith('/dashboard/settings')) {
      return 'settings';
    }
    if (pathname.startsWith('/dashboard/integrations')) {
      return 'integrations';
    }
    if (pathname.startsWith('/dashboard/system')) {
      return 'system';
    }
    return null;
  };

  const [activeMenu, setActiveMenu] = useState<string | null>(
    getInitialOpenMenu()
  );

  const handleMenuToggle = (menu: string) => {
    setActiveMenu((prev) => (prev === menu ? null : menu));
  };

  const reportsSubMenu = [
    { label: 'Payments', path: '/dashboard/reports/payments' },
    { label: 'Split Bills', path: '/dashboard/reports/split-bills' },
    { label: 'Outstanding', path: '/dashboard/reports/outstanding' },
    { label: 'Tips & Charges', path: '/dashboard/reports/tips-and-charges' },
    {
      label: 'Staff Performance',
      path: '/dashboard/reports/staff-performance',
    },
    { label: 'AI Insights', path: '/dashboard/reports/ai-insights' },
  ];
  const catalogSubMenu = [
    { label: 'Products', path: '/dashboard/products' },
    { label: 'Categories', path: '/dashboard/categories' },
    { label: 'Modifiers', path: '#' },
    { label: 'Promotions', path: '#' },
    { label: 'Coupons', path: '#' },
  ];
  const operationsSubMenu = [
    { label: 'Opening Hours', path: '#' },
    { label: 'QR Codes', path: '#' },
    { label: 'Table States', path: '/dashboard/tables' },
    { label: 'Feedback Forms', path: '#' },
  ];
  const ordersSubMenu = [
    { label: 'Order List', path: '/dashboard/orders' },
    { label: 'Status Monitor', path: '#' },
  ];
  const settingsSubMenu = [
    { label: 'Order Types', path: '#' },
    { label: 'Payment Models', path: '#' },
    { label: 'POS Mode', path: '#' },
    { label: 'Tips & Charges', path: '#' },
    { label: 'Pricing', path: '#' },
    { label: 'Taxes', path: '#' },
    { label: 'Discounts', path: '#' },
    { label: 'Rounding', path: '#' },
  ];
  const integrationsSubMenu = [
    { label: 'POS', path: '#' },
    { label: 'Gateway', path: '#' },
    { label: 'Webhooks', path: '#' },
  ];
  const systemSubMenu = [
    { label: 'Appearance', path: '#' },
    { label: 'Localization', path: '#' },
    { label: 'Roles', path: '#' },
    { label: 'Business Info', path: '#' },
  ];

  return (
    <Sidebar variant="sidebar" collapsible="icon" className="border-r">
      <SidebarHeader className="relative flex h-16 items-center justify-center p-4">
        <div className="group-data-[collapsible=icon]:hidden">
          <EMenuIcon />
        </div>
        <div className="hidden group-data-[collapsible=icon]:block">
          <LayoutDashboard className="h-6 w-6" />
        </div>
        <SidebarTrigger className="absolute right-4 top-1/2 -translate-y-1/2" />
      </SidebarHeader>

      <SidebarContent className="p-0">
        <SidebarGroup>
          <SidebarGroupLabel>Overview</SidebarGroupLabel>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton
                asChild
                isActive={pathname === '/dashboard'}
                tooltip="Dashboard"
              >
                <NextLink href="/dashboard">
                  <PieChart />
                  <span className="group-data-[collapsible=icon]:hidden">
                    Dashboard
                  </span>
                </NextLink>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <Collapsible
                open={activeMenu === 'reports'}
                onOpenChange={() => handleMenuToggle('reports')}
              >
                <CollapsibleTrigger asChild className="w-full">
                  <SidebarMenuButton
                    isActive={activeMenu === 'reports'}
                    tooltip={{
                      className: 'bg-gray-900 text-gray-200 border-gray-700 p-0',
                      children: createTooltipContent('Reports', reportsSubMenu),
                    }}
                    className="w-full"
                  >
                    <div className="flex w-full items-center justify-between">
                      <div className="flex items-center gap-2">
                        <BarChart />
                        <span className="group-data-[collapsible=icon]:hidden">
                          Reports
                        </span>
                      </div>
                      {activeMenu === 'reports' ? (
                        <Minus className="h-4 w-4 opacity-0 transition-opacity group-data-[collapsible=icon]:hidden group-hover/menu-item:opacity-100" />
                      ) : (
                        <Plus className="h-4 w-4 opacity-0 transition-opacity group-data-[collapsible=icon]:hidden group-hover/menu-item:opacity-100" />
                      )}
                    </div>
                  </SidebarMenuButton>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <SidebarMenuSub>
                    {reportsSubMenu.map((item) => (
                      <SidebarMenuSubItem key={item.path}>
                        <SidebarMenuSubButton
                          asChild
                          isActive={pathname.startsWith(item.path)}
                          onClick={(e) => {
                            if (item.path === '#') e.preventDefault();
                          }}
                        >
                          <NextLink href={item.path}>{item.label}</NextLink>
                        </SidebarMenuSubButton>
                      </SidebarMenuSubItem>
                    ))}
                  </SidebarMenuSub>
                </CollapsibleContent>
              </Collapsible>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroup>
        <SidebarSeparator />

        <SidebarGroup>
          <SidebarGroupLabel>Management</SidebarGroupLabel>
          <SidebarMenu>
            <SidebarMenuItem>
              <Collapsible
                open={activeMenu === 'catalog'}
                onOpenChange={() => handleMenuToggle('catalog')}
              >
                <CollapsibleTrigger asChild className="w-full">
                  <SidebarMenuButton
                    isActive={activeMenu === 'catalog'}
                    tooltip={{
                      className: 'bg-gray-900 text-gray-200 border-gray-700 p-0',
                      children: createTooltipContent('Catalog', catalogSubMenu),
                    }}
                    className="w-full"
                  >
                    <div className="flex w-full items-center justify-between">
                      <div className="flex items-center gap-2">
                        <BookOpen />
                        <span className="group-data-[collapsible=icon]:hidden">
                          Catalog
                        </span>
                      </div>
                      {activeMenu === 'catalog' ? (
                        <Minus className="h-4 w-4 opacity-0 transition-opacity group-data-[collapsible=icon]:hidden group-hover/menu-item:opacity-100" />
                      ) : (
                        <Plus className="h-4 w-4 opacity-0 transition-opacity group-data-[collapsible=icon]:hidden group-hover/menu-item:opacity-100" />
                      )}
                    </div>
                  </SidebarMenuButton>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <SidebarMenuSub>
                    {catalogSubMenu.map((item) => (
                      <SidebarMenuSubItem key={item.path}>
                        <SidebarMenuSubButton
                          asChild
                          isActive={pathname.startsWith(item.path)}
                          onClick={(e) => {
                            if (item.path === '#') e.preventDefault();
                          }}
                        >
                          <NextLink href={item.path}>{item.label}</NextLink>
                        </SidebarMenuSubButton>
                      </SidebarMenuSubItem>
                    ))}
                  </SidebarMenuSub>
                </CollapsibleContent>
              </Collapsible>
            </SidebarMenuItem>

            <SidebarMenuItem>
              <Collapsible
                open={activeMenu === 'operations'}
                onOpenChange={() => handleMenuToggle('operations')}
              >
                <CollapsibleTrigger asChild className="w-full">
                  <SidebarMenuButton
                    isActive={activeMenu === 'operations'}
                    tooltip={{
                      className: 'bg-gray-900 text-gray-200 border-gray-700 p-0',
                      children: createTooltipContent(
                        'Operations',
                        operationsSubMenu
                      ),
                    }}
                    className="w-full"
                  >
                    <div className="flex w-full items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Briefcase />
                        <span className="group-data-[collapsible=icon]:hidden">
                          Operations
                        </span>
                      </div>
                      {activeMenu === 'operations' ? (
                        <Minus className="h-4 w-4 opacity-0 transition-opacity group-data-[collapsible=icon]:hidden group-hover/menu-item:opacity-100" />
                      ) : (
                        <Plus className="h-4 w-4 opacity-0 transition-opacity group-data-[collapsible=icon]:hidden group-hover/menu-item:opacity-100" />
                      )}
                    </div>
                  </SidebarMenuButton>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <SidebarMenuSub>
                    {operationsSubMenu.map((item) => (
                      <SidebarMenuSubItem key={item.path}>
                        <SidebarMenuSubButton
                          asChild
                          isActive={pathname.startsWith(item.path)}
                          onClick={(e) => {
                            if (item.path === '#') e.preventDefault();
                          }}
                        >
                          <NextLink href={item.path}>{item.label}</NextLink>
                        </SidebarMenuSubButton>
                      </SidebarMenuSubItem>
                    ))}
                  </SidebarMenuSub>
                </CollapsibleContent>
              </Collapsible>
            </SidebarMenuItem>

            <SidebarMenuItem>
              <Collapsible
                open={activeMenu === 'orders'}
                onOpenChange={() => handleMenuToggle('orders')}
              >
                <CollapsibleTrigger asChild className="w-full">
                  <SidebarMenuButton
                    isActive={activeMenu === 'orders'}
                    tooltip={{
                      className: 'bg-gray-900 text-gray-200 border-gray-700 p-0',
                      children: createTooltipContent('Orders', ordersSubMenu),
                    }}
                    className="w-full"
                  >
                    <div className="flex w-full items-center justify-between">
                      <div className="flex items-center gap-2">
                        <ClipboardList />
                        <span className="group-data-[collapsible=icon]:hidden">
                          Orders
                        </span>
                      </div>
                      {activeMenu === 'orders' ? (
                        <Minus className="h-4 w-4 opacity-0 transition-opacity group-data-[collapsible=icon]:hidden group-hover/menu-item:opacity-100" />
                      ) : (
                        <Plus className="h-4 w-4 opacity-0 transition-opacity group-data-[collapsible=icon]:hidden group-hover/menu-item:opacity-100" />
                      )}
                    </div>
                  </SidebarMenuButton>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <SidebarMenuSub>
                    {ordersSubMenu.map((item) => (
                      <SidebarMenuSubItem key={item.path}>
                        <SidebarMenuSubButton
                          asChild
                          isActive={pathname.startsWith(item.path)}
                          onClick={(e) => {
                            if (item.path === '#') e.preventDefault();
                          }}
                        >
                          <NextLink href={item.path}>{item.label}</NextLink>
                        </SidebarMenuSubButton>
                      </SidebarMenuSubItem>
                    ))}
                  </SidebarMenuSub>
                </CollapsibleContent>
              </Collapsible>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroup>
        <SidebarSeparator />

        <SidebarGroup>
          <SidebarGroupLabel>Configuration</SidebarGroupLabel>
          <SidebarMenu>
            <SidebarMenuItem>
              <Collapsible
                open={activeMenu === 'settings'}
                onOpenChange={() => handleMenuToggle('settings')}
              >
                <CollapsibleTrigger asChild className="w-full">
                  <SidebarMenuButton
                    isActive={activeMenu === 'settings'}
                    tooltip={{
                      className: 'bg-gray-900 text-gray-200 border-gray-700 p-0',
                      children: createTooltipContent(
                        'Settings',
                        settingsSubMenu
                      ),
                    }}
                    className="w-full"
                  >
                    <div className="flex w-full items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Settings />
                        <span className="group-data-[collapsible=icon]:hidden">
                          Settings
                        </span>
                      </div>
                      {activeMenu === 'settings' ? (
                        <Minus className="h-4 w-4 opacity-0 transition-opacity group-data-[collapsible=icon]:hidden group-hover/menu-item:opacity-100" />
                      ) : (
                        <Plus className="h-4 w-4 opacity-0 transition-opacity group-data-[collapsible=icon]:hidden group-hover/menu-item:opacity-100" />
                      )}
                    </div>
                  </SidebarMenuButton>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <SidebarMenuSub>
                    {settingsSubMenu.map((item) => (
                      <SidebarMenuSubItem key={item.path}>
                        <SidebarMenuSubButton
                          asChild
                          isActive={pathname.startsWith(item.path)}
                          onClick={(e) => {
                            if (item.path === '#') e.preventDefault();
                          }}
                        >
                          <NextLink href={item.path}>{item.label}</NextLink>
                        </SidebarMenuSubButton>
                      </SidebarMenuSubItem>
                    ))}
                  </SidebarMenuSub>
                </CollapsibleContent>
              </Collapsible>
            </SidebarMenuItem>

            <SidebarMenuItem>
              <Collapsible
                open={activeMenu === 'integrations'}
                onOpenChange={() => handleMenuToggle('integrations')}
              >
                <CollapsibleTrigger asChild className="w-full">
                  <SidebarMenuButton
                    isActive={activeMenu === 'integrations'}
                    tooltip={{
                      className: 'bg-gray-900 text-gray-200 border-gray-700 p-0',
                      children: createTooltipContent(
                        'Integrations',
                        integrationsSubMenu
                      ),
                    }}
                    className="w-full"
                  >
                    <div className="flex w-full items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Plug />
                        <span className="group-data-[collapsible=icon]:hidden">
                          Integrations
                        </span>
                      </div>
                      {activeMenu === 'integrations' ? (
                        <Minus className="h-4 w-4 opacity-0 transition-opacity group-data-[collapsible=icon]:hidden group-hover/menu-item:opacity-100" />
                      ) : (
                        <Plus className="h-4 w-4 opacity-0 transition-opacity group-data-[collapsible=icon]:hidden group-hover/menu-item:opacity-100" />
                      )}
                    </div>
                  </SidebarMenuButton>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <SidebarMenuSub>
                    {integrationsSubMenu.map((item) => (
                      <SidebarMenuSubItem key={item.path}>
                        <SidebarMenuSubButton
                          asChild
                          isActive={pathname.startsWith(item.path)}
                          onClick={(e) => {
                            if (item.path === '#') e.preventDefault();
                          }}
                        >
                          <NextLink href={item.path}>{item.label}</NextLink>
                        </SidebarMenuSubButton>
                      </SidebarMenuSubItem>
                    ))}
                  </SidebarMenuSub>
                </CollapsibleContent>
              </Collapsible>
            </SidebarMenuItem>

            <SidebarMenuItem>
              <Collapsible
                open={activeMenu === 'system'}
                onOpenChange={() => handleMenuToggle('system')}
              >
                <CollapsibleTrigger asChild className="w-full">
                  <SidebarMenuButton
                    isActive={activeMenu === 'system'}
                    tooltip={{
                      className: 'bg-gray-900 text-gray-200 border-gray-700 p-0',
                      children: createTooltipContent('System', systemSubMenu),
                    }}
                    className="w-full"
                  >
                    <div className="flex w-full items-center justify-between">
                      <div className="flex items-center gap-2">
                        <SlidersHorizontal />
                        <span className="group-data-[collapsible=icon]:hidden">
                          System
                        </span>
                      </div>
                      {activeMenu === 'system' ? (
                        <Minus className="h-4 w-4 opacity-0 transition-opacity group-data-[collapsible=icon]:hidden group-hover/menu-item:opacity-100" />
                      ) : (
                        <Plus className="h-4 w-4 opacity-0 transition-opacity group-data-[collapsible=icon]:hidden group-hover/menu-item:opacity-100" />
                      )}
                    </div>
                  </SidebarMenuButton>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <SidebarMenuSub>
                    {systemSubMenu.map((item) => (
                      <SidebarMenuSubItem key={item.path}>
                        <SidebarMenuSubButton
                          asChild
                          isActive={pathname.startsWith(item.path)}
                          onClick={(e) => {
                            if (item.path === '#') e.preventDefault();
                          }}
                        >
                          <NextLink href={item.path}>{item.label}</NextLink>
                        </SidebarMenuSubButton>
                      </SidebarMenuSubItem>
                    ))}
                  </SidebarMenuSub>
                </CollapsibleContent>
              </Collapsible>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-2">
        <Button
          variant="ghost"
          className="flex h-auto w-full items-center justify-between gap-2 bg-gray-800 p-2 text-left text-white hover:bg-gray-700 hover:text-white group-data-[collapsible=icon]:w-auto group-data-[collapsible=icon]:justify-center"
        >
          <div className="flex items-center gap-2">
            {userAvatar && (
              <Image
                src={userAvatar.imageUrl}
                width={32}
                height={32}
                alt="User avatar"
                className="rounded-full"
                data-ai-hint={userAvatar.imageHint}
              />
            )}
            <div className="flex flex-col group-data-[collapsible=icon]:hidden">
              <span className="text-sm font-medium">Resto Name 1</span>
              <span className="text-xs text-gray-400">john@domain.com</span>
            </div>
          </div>
          <Plus className="h-4 w-4 group-data-[collapsible=icon]:hidden" />
        </Button>
      </SidebarFooter>
    </Sidebar>
  );
}
