'use client';
import {
  PieChart,
  BarChart,
  Box,
  LayoutGrid,
  Percent,
  Ticket,
  Clock,
  QrCode,
  MessageSquare,
  Palette,
  Languages,
  FileText,
  LifeBuoy,
  ChevronDown,
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
} from '@/components/ui/sidebar';
import Image from 'next/image';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { Button } from '../ui/button';
import { usePathname } from 'next/navigation';

const userAvatar = PlaceHolderImages.find((img) => img.id === 'user-avatar');

export const EMenuIcon = () => (
  <svg
    width="32"
    height="24"
    viewBox="0 0 32 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M2 4H22"
      stroke="#18B4A6"
      strokeWidth="3"
      strokeLinecap="round"
    />
    <path
      d="M2 12H30"
      stroke="#18B4A6"
      strokeWidth="3"
      strokeLinecap="round"
    />
    <path
      d="M10.0002 20.0002H30.0002"
      stroke="#18B4A6"
      strokeWidth="3"
      strokeLinecap="round"
    />
    <path
      d="M10 4L10 2.98023e-08"
      stroke="#18B4A6"
      strokeWidth="3"
      strokeLinecap="round"
    />
    <path
      d="M22 12V8"
      stroke="#18B4A6"
      strokeWidth="3"
      strokeLinecap="round"
    />
    <path
      d="M10 24V16"
      stroke="#18B4A6"
      strokeWidth="3"
      strokeLinecap="round"
    />
  </svg>
);

const eMenuLogo = (
  <div className="flex items-center gap-2">
    <EMenuIcon />
    <span className="text-lg font-bold">eMenu</span>
  </div>
);

export function AppSidebar() {
  const pathname = usePathname();
  return (
    <Sidebar variant="sidebar" collapsible="icon" className="border-r">
      <SidebarHeader className="p-4 justify-between">
        {eMenuLogo}
        <SidebarTrigger />
      </SidebarHeader>

      <SidebarContent className="p-0">
        <SidebarGroup>
          <SidebarGroupLabel>Overview</SidebarGroupLabel>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton href="/dashboard" isActive={pathname.startsWith('/dashboard') && !pathname.includes('categories')} tooltip="Dashboard">
                <PieChart />
                <span>Dashboard</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton href="#" tooltip="Reports">
                <BarChart />
                <span>Reports</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroup>
        <SidebarSeparator />
        <SidebarGroup>
          <SidebarGroupLabel>Catalog</SidebarGroupLabel>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton href="#" tooltip="Products">
                <Box />
                <span>Products</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton href="/dashboard/categories" isActive={pathname.startsWith('/dashboard/categories')} tooltip="Categories">
                <LayoutGrid />
                <span>Categories</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroup>
        <SidebarSeparator />
        <SidebarGroup>
          <SidebarGroupLabel>Marketing</SidebarGroupLabel>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton href="#" tooltip="Promotions">
                <Percent />
                <span>Promotions</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton href="#" tooltip="Coupons">
                <Ticket />
                <span>Coupons</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroup>
        <SidebarSeparator />
        <SidebarGroup>
          <SidebarGroupLabel>Operations</SidebarGroupLabel>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton href="#" tooltip="Opening Hours">
                <Clock />
                <span>Opening Hours</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton href="#" tooltip="QR Code">
                <QrCode />
                <span>QR Code</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton href="#" tooltip="Feedback Forms">
                <MessageSquare />
                <span>Feedback Forms</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroup>
        <SidebarSeparator />
        <SidebarGroup>
          <SidebarGroupLabel>Settings</SidebarGroupLabel>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton href="#" tooltip="Appearance">
                <Palette />
                <span>Appearance</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton href="#" tooltip="Localization">
                <Languages />
                <span>Localization</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton href="#" tooltip="Taxes">
                <FileText />
                <span>Taxes</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroup>
        <SidebarSeparator />
        <SidebarGroup>
          <SidebarGroupLabel>Help</SidebarGroupLabel>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton href="#" tooltip="Documentation">
                <LifeBuoy />
                <span>Documentation</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-2">
        <Button
          variant="ghost"
          className="flex h-auto w-full items-center justify-between gap-2 bg-gray-800 p-2 text-left text-white hover:bg-gray-700 hover:text-white"
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
            <div className="flex flex-col">
              <span className="text-sm font-medium">Resto Name 1</span>
              <span className="text-xs text-gray-400">john@domain.com</span>
            </div>
          </div>
          <ChevronDown className="h-4 w-4 shrink-0" />
        </Button>
      </SidebarFooter>
    </Sidebar>
  );
}
