
'use client';
import {
  PieChart,
  Settings,
  Briefcase,
  ClipboardList,
  Plug,
  Plus,
  Minus,
  LayoutDashboard,
  Search,
  Rocket,
  CircleHelp,
  HelpCircle,
  ChevronDown,
  MapPin,
  PlusCircle,
  QrCode,
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
  SidebarMenuSub,
  SidebarMenuSubItem,
} from '@/components/ui/sidebar';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useState, useMemo, useEffect } from 'react';
import NextLink from 'next/link';
import { cn } from '@/lib/utils';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuPortal,
} from '@/components/ui/dropdown-menu';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

const branches = [
  { id: '1', name: "Ras Al Khaimah", type: 'Boutique Café' },
  { id: '2', name: "Dubai Mall", type: 'Signature Store' },
  { id: '3', name: "Al Ain", type: 'Boutique Café' },
  { id: '4', name: "Abu Dhabi", type: 'Boutique Café' },
  { id: '5', name: "Sharjah", type: 'Boutique Café' },
  { id: '6', name: "Ajman", type: 'Boutique Café' },
];

export const EMenuIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    version="1.0"
    viewBox="0 0 1896 592"
    width="240"
    height="76"
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
      d="M859.5 296.5c0 38.5.1 54.1.2 34.7.2-19.5.2-51 0-70-.1-19.1-.2-3.2-.2 35.3m158 0c0 38.5.1 54.1.2 34.7.2-19.5.2-51 0-70-.1-19.1-.2-3.2-.2 35.3m205.8-41.8c.4.3 1 .3 1.4 0 .3-.4 0-.7-.7-.7s-1 .3-.7.7m72.1 35.3c0 19 .2 26.7.3 17.2.2-9.4.2-25 0-34.5-.1-9.4-.3-1.7-.3 17.3m-35.4-24.5c1.3 1.4 2.6 2.5 2.8 2.5.3 0-.5-1.1-1.8-2.5s-2.6-2.5-2.8-2.5c-.3 0 .5 1.1 1.8 2.5m-436 .8c0 .2 1.5 1.6 3.3 3.3l3.2 2.9-2.9-3.3c-2.8-3-3.6-3.7-3.6-2.9m225.4 2.9-1.9 2.3 2.3-1.9c2.1-1.8 2.7-2.6 1.9-2.6-.2 0-1.2 1-2.3 2.2m-264.1 12.5c.9.2 2.3.2 3 0 .6-.3-.1-.5-1.8-.5-1.6 0-2.2.2-1.2.5m303 0c.9.2 2.5.2 3.5 0 .9-.3.1-.5-1.8-.5s-2.7.2-1.7.5m184.8 14.9c0 1.1.3 1.4.6.6.3-.7.2-1.6-.1-1.9-.3-.4-.6.2-.5 1.3M1145 301c0 .7.3 1 .7.7.3-.4.3-1 0-1.4-.4-.3-.7 0-.7.7m-110.9 6.6c0 1.1.3 1.4.6.6.3-.7.2-1.6-.1-1.9-.3-.4-.6.2-.5 1.3m0 7c0 1.1.3 1.4.6.6.3-.7.2-1.6-.1-1.9-.3-.4-.6.2-.5 1.3M731 321c0 .7.3 1 .7.7.3-.4.3-1 0-1.4-.4-.3-.7 0-.7.7m108 9c0 .7.3 1 .7.7.3-.4.3-1 0-1.4-.4-.3-.7 0-.7.7m496.5 3c1 1.1 2 2 2.3 2s-.3-.9-1.3-2-2-2-2.3-2 .3.9 1.3 2m-565 1c.3.5.8 1 1.1 1s.2-.5-.1-1c-.3-.6-.8-1-1.1-1s-.2.4.1 1m28.4.7c-1.3 1.6-1.2 1.7.4.4s2.1-2.1 1.3-2.1c-.2 0-1 .8-1.7 1.7m550.9 4c.6.2 1.8.2 2.5 0 .6-.3.1-.5-1.3-.5s-1.9.2-1.2.5m-257.5 1c.4.3 1 .3 1.4 0 .3-.4 0-.7-.7-.7s-1 .3-.7.7m-266.4 13-2.4 2.8 2.8-2.4c1.5-1.4 2.7-2.6 2.7-2.8 0-.8-.8-.1-3.1 2.4m-80.9-1.3c0 .2.8 1 1.8 1.7 1.5 1.3 1.6 1.2.3-.4s-2.1-2.1-2.1-1.3m622.4 4.8-2.9 3.3 3.3-2.9c3-2.8 3.7-3.6 2.9-3.6-.2 0-1.6 1.5-3.3 3.2m-314.9-1.2c.3.5.8 1 1.1 1s.2-.5-.1-1c-.3-.6-.8-1-1.1-1s-.2.4.1 1m284.3 12.7c1.2.2 3 .2 4 0 .9-.3-.1-.5-2.3-.4-2.2 0-3 .2-1.7.4"
    />
    <path
      fillOpacity=".8"
      d="M869.8 227.7c5.6.2 14.8.2 20.5 0 5.6-.1 1-.3-10.3-.3s-15.9.2-10.2.3m118 0c5.7.2 14.7.2 20 0 5.3-.1.7-.3-10.3-.3s-15.4.2-9.7.3m-206.5 27c.4.3 1 .3 1.4 0 .3-.4 0-.7-.7-.7s-1 .3-.7.7m10 0c.4.3 1 .3 1.4 0 .3-.4 0-.7-.7-.7s-1 .3-.7.7m294 0c.4.3 1 .3 1.4 0 .3-.4 0-.7-.7-.7s-1 .3-.7.7m9 0c.4.3 1 .3 1.4 0 .3-.4 0-.7-.7-.7s-1 .3-.7.7m311.2 56.3c0 30.5.1 43 .2 27.7.2-15.2.2-40.2 0-55.5-.1-15.2-.2-2.7-.2 27.8m-148-47c.3.5.8 1 1.1 1s.2-.5-.1-1c-.3-.6-.8-1-1.1-1s-.2.4.1 1m-434 3c.3.5.8 1 1.1 1s.2-.5-.1-1c-.3-.6-.8-1-1.1-1s-.2.4.1 1m226.4 2.7-2.4 2.8 2.8-2.4c1.5-1.4 2.7-2.6 2.7-2.8 0-.8-.8-.1-3.1 2.4m211.6-1.7c.3.5.8 1 1.1 1s.2-.5-.1-1c-.3-.6-.8-1-1.1-1s-.2.4.1 1m-132 1c.3.5.8 1 1.1 1s.2-.5-.1-1c-.3-.6-.8-1-1.1-1s-.2.4.1 1m-301 3c.3.5.8 1 1.1 1s.2-.5-.1-1c-.3-.6-.8-1-1.1-1s-.2.4.1 1m275 13c.3.5.8 1 1.1 1s.2-.5-.1-1c-.3-.6-.8-1-1.1-1s-.2.4.1 1m168.5 8c0 .7.3 1 .7.7.3-.4.3-1 0-1.4-.4-.3-.7 0-.7.7m-496.7 7.7c5.9.2 15.5.2 21.5 0 5.9-.1 1-.3-10.8-.3s-16.7.2-10.7.3m304 0c5.9.2 15.5.2 21.5 0 5.9-.1 1-.3-10.8-.3s-16.7.2-10.7.3M841 305c0 .7.3 1 .7.7.3-.4.3-1 0-1.4-.4-.3-.7 0-.7.7m-109.8 6c0 1.9.2 2.7.5 1.7.2-.9.2-2.5 0-3.5-.3-.9-.5-.1-.5 1.8m109.8 2c0 .7.3 1 .7.7.3-.4.3-1 0-1.4-.4-.3-.7 0-.7.7m-76.3 5.7c-.5.7 29.1.7 63.3 0 7.4-.1-3.7-.4-24.7-.5s-38.4.1-38.6.5m323.1 0c10.5.2 27.9.2 38.5 0 10.5-.1 1.9-.2-19.3-.2s-29.8.1-19.2.2M1296 327c0 .7.3 1 .7.7.3-.4.3-1 0-1.4-.4-.3-.7 0-.7.7m-223.5 6c.3.5.8 1 1.1 1s.2-.5-.1-1c-.3-.6-.8-1-1.1-1s-.2.4.1 1m261.5-.6c0 .2.8 1 1.8 1.7 1.5 1.3 1.6 1.2.3-.4s-2.1-2.1-2.1-1.3m-535.1 3.3c-1.3 1.6-1.2 1.7.4.4.9-.7 1.7-1.5 1.7-1.7 0-.8-.8-.3-2.1 1.3m276.6.3c.3.5.8 1 1.1 1s.2-.5-.1-1c-.3-.6-.8-1-1.1-1s-.2.4.1 1m-250.1 16.2-2.9 3.3 3.3-2.9c1.7-1.7 3.2-3.1 3.2-3.3 0-.8-.8-.3-2.1 1.3m-78.4.3c1.3 1.4 2.6 2.5 2.8 2.5c-.3 0 .5 1.1 1.8 2.5s2.6 2.5 2.8 2.5c.3 0-.5-1.1-1.8-2.5m622.4.7c-.4.7-.3.8.4.4 1.2-.7 1.6-1.6.8-1.6-.3 0-.8.5-1.2 1.2m-315.9 1.8c.3.5.8 1 1.1 1s.2-.5-.1-1c-.3-.6-.8-1-1.1-1s-.2.4.1 1"
    />
    <path
      fillOpacity=".6"
      d="M1229.3 254.7c.9.2 2.3.2 3 0 .6-.3-.1-.5-1.8-.5-1.6 0-2.2.2-1.2.5m-28.9 11.5c-.4.7-.3.8.4.4 1.2-.7 1.6-1.6.8-1.6-.3 0-.8.5-1.2 1.2m16.9 16.5c.4.3 1 .3 1.4 0 .3-.4 0-.7-.7-.7s-1 .3-.7.7m-323.8 41.8c0 23.1.1 32.4.2 20.7.2-11.7.2-30.6 0-42-.1-11.4-.2-1.8-.2 21.3m89.3-40.8c-.2.5-.1 19.2.2 41.8l.5 41 .3-41.8c.1-22.9 0-41.7-.2-41.7-.3 0-.6.3-.8.7m122.7 3.3c.3.5.8 1 1.1 1s.2-.5-.1-1c-.3-.6-.8-1-1.1-1s-.2.4.1 1M807 299c0 .7.3 1 .7.7.3-.4.3-1 0-1.4-.4-.3-.7 0-.7.7m432 2c0 .7.3 1 .7.7.3-.4.3-1 0-1.4-.4-.3-.7 0-.7.7m-398 1c0 .7.3 1 .7.7.3-.4.3-1 0-1.4-.4-.3-.7 0-.7.7m-110 3c0 .7.3 1 .7.7.3-.4.3-1 0-1.4-.4-.3-.7 0-.7.7m414.2 3.5c0 1.6.2 2.2.5 1.2.2-.9.2-2.3 0-3-.3-.6-.5.1-.5 1.8M1329 319c0 .7.3 1 .7.7.3-.4.3-1 0-1.4-.4-.3-.7 0-.7.7m-294 1c0 .7.3 1 .7.7.3-.4.3-1 0-1.4-.4-.3-.7 0-.7.7m-222.8 9.7c4.8.2 12.9.2 18 0 5.1-.1 1.2-.3-8.7-.3s-14.1.2-9.3.3m303.6 0c5 .2 13.4.2 18.5 0 5-.1.9-.3-9.3-.3s-14.3.2-9.2.3m-330 38c.6.2 1.8.2 2.5 0 .6-.3.1-.5-1.3-.5s-1.9.2-1.2.5m304 0c.7.3 1.6.2 1.9-.1.4-.3-.2-.6-1.3-.5-1.1 0-1.4.3-.6.6"
    />
    <path d="M860 297v69h33v-42.2c0-23.2.4-41.8.8-41.2.5.5 7.8 19.5 16.3 42.1l15.4 41.3h26.3l14.7-39.8c8.2-21.8 15.4-40.8 16.1-42.2 1.1-2.1 1.3 4.3 1.4 39.7V366h33V228h-39.5l-18.9 47.3c-10.4 25.9-19.1 47.4-19.3 47.7-.8.9-2.4-2.9-20.9-48.7L899.7 228H860zm-82.2-41.9c-22.6 3-40.1 18.9-44.7 40.7-1.5 7.4-1.3 23.5.4 31 4.6 19.4 20 34.7 39.2 38.7 28.1 6 54.9-6.7 64.3-30.4l2-5.1h-17.9c-17.1 0-18 .1-18.6 2-1.8 5.5-12.4 9.5-21.2 7.9-9.2-1.8-15-8-16.7-18.2l-.7-3.7h76.8l.6-4.6c.7-6.4-.8-18-3.2-24.8-5.6-15.9-19-28.2-34.9-32-8-2-17.5-2.6-25.4-1.5m18 27.5c5.1 2.1 10 7.1 11.2 11.4 2.1 7.5 3.5 7-20.5 7-20.9 0-21.5-.1-21.5-2 0-3 2.7-9.1 5.3-11.9 5.3-5.7 17.5-7.9 25.5-4.5m285.7-27.5c-27.2 4-44 22.7-46.1 51.4-1.5 21.2 7 40.5 22.4 50.9 8.8 5.9 17.4 8.7 28.9 9.4 17.6.9 32-4.2 42.9-15.3 5.6-5.7 12.4-16.8 12.4-20.2 0-1-3.5-1.3-17.2-1.3h-17.3l-2.8 3.5c-3.9 4.9-8 6.7-15.2 6.7-11.7 0-19.2-6.5-21.1-18.1l-.7-4.1h77.3v-8.5c0-10.8-1.4-17.3-5.6-26.1-3.9-8.3-10.4-15.9-17.4-20.4-10.1-6.5-27.3-9.9-40.5-7.9m18.3 27.4c6.9 3 11.2 8.6 11.2 15v3.5h-21.5c-11.8 0-21.5-.4-21.5-.8 0-.5.7-2.9 1.5-5.4 1.8-5.1 6.5-10.4 11-12.4 4.1-1.8 14.8-1.7 19.3.1m119.9-26.5c-5.8 1.5-13.5 5.7-18.3 10.2l-4.4 4.1V256h-33v110h33v-32.8c0-20.9.4-34.1 1.1-36.7 1.5-5.5 8.2-12 13.9-13.5 5-1.3 12.8-.7 17 1.5 4 2.1 8.7 7.9 9.9 12.2.7 2.3 1.1 16.8 1.1 36.5V366h33v-35.3c0-45.9-1.2-51.7-12.7-63.8-7.7-8.1-14.9-11.1-27.3-11.5-5.2-.2-11.2.1-13.3.6m76.5 37.7c.3 36.4.4 38 2.7 44.3 1.2 3.6 3.7 8.7 5.4 11.4 12.9 20.3 44.9 23.3 63 5.8l4.7-4.6V366h33V256h-33v33.8c0 33.1 0 33.9-2.2 38.2-1.3 2.4-4 5.8-6.1 7.4-3.7 2.9-4.4 3.1-12.6 3.1-7.9 0-9.2-.3-12.9-2.8-2.3-1.5-5.2-4.6-6.4-7-2.2-4.1-2.3-5-2.6-38.5l-.3-34.2h-33z" />
    <path
      fillOpacity=".4"
      d="M1126.5 266c.3.5.8 1 1.1 1s.2-.5-.1-1c-.3-.6-.8-1-1.1-1s-.2.4.1 1m-380.6 3.7-3.4 3.8 3.8-3.4c3.4-3.3 4.2-4.1 3.4-4.1-.2 0-1.9 1.7-3.8 3.7m452.5-1.5c-.4.7-.3.8.4.4 1.2-.7 1.6-1.6.8-1.6-.3 0-.8.5-1.2 1.2m167 65c-.4.7-.3.8.4.4 1.2-.7 1.6-1.6.8-1.6-.3 0-.8.5-1.2 1.2"
    />
    <path
      fillOpacity=".7"
      d="M1219.3 282.7c.4.3 1 .3 1.4 0 .3-.4 0-.7-.7-.7s-1 .3-.7.7M731 307c0 .7.3 1 .7.7.3-.4.3-1 0-1.4-.4-.3-.7 0-.7.7m0 8c0 .7.3 1 .7.7.3-.4.3-1 0-1.4-.4-.3-.7 0-.7.7m110 0c0 .7.3 1 .7.7.3-.4.3-1 0-1.4-.4-.3-.7 0-.7.7"
    />
    <path
      fillOpacity=".2"
      d="M1197.3 262.5c0 3.8.2 5.3.4 3.2.2-2 .2-5.2 0-7-.2-1.7-.4-.1-.4 3.8m76.1 69.5c0 19 .2 26.7.3 17.2.2-9.4.2-25 0-34.5-.1-9.4-.3-1.7-.3 17.3m-76 4c0 16.8.2 23.6.3 15.2.2-8.3.2-22.1 0-30.5-.1-8.3-.3-1.5-.3 15.3m-163.2-25c0 1.4.2 1.9.5 1.2.2-.6.2-1.8 0-2.5-.3-.6-.5-.1-.5 1.3m313.1 27.7c.4.3 1 .3 1.4 0 .3-.4 0-.7-.7-.7s-1 .3-.7.7m-568 29c.4.3 1 .3 1.4 0 .3-.4 0-.7-.7-.7s-1 .3-.7.7"
    />
    <path
      fillOpacity=".5"
      d="M1098.3 254.7c.4.3 1 .3 1.4 0 .3-.4 0-.7-.7-.7s-1 .3-.7.7m135 0c.4.3 1 .3 1.4 0 .3-.4 0-.7-.7-.7s-1 .3-.7.7m-69.8 56.3c0 30.5.1 43 .2 27.7.2-15.2.2-40.2 0-55.5-.1-15.2-.2-2.7-.2 27.8m165.9-24c0 17.3.2 24.4.3 15.7.2-8.6.2-22.8 0-31.5-.1-8.6-.3-1.5-.3 15.8m-559 .2c-.4.7-.3.8.4.4s1.2-.9 1.2-1.2c0-.8-.9-.4-1.6.8m462.1.8c1 1.1 2 2 2.3 2s-.3-.9-1.3-2-2-2-2.3-2 .3.9 1.3 2m-35.5 14c0 .7.3 1 .7.7.3-.4.3-1 0-1.4-.4-.3-.7 0-.7.7m-52 3c0 .7.3 1 .7.7.3-.4.3-1 0-1.4-.4-.3-.7 0-.7.7m.1 7.6c0 1.1.3 1.4.6.6.3-.7.2-1.6-.1-1.9-.3-.4-.6.2-.5 1.3M731 318c0 .7.3 1 .7.7.3-.4.3-1 0-1.4-.4-.3-.7 0-.7.7m337 2c0 .7.3 1 .7.7.3-.4.3-1 0-1.4-.4-.3-.7 0-.7.7m-129.6 2.2c-.4.7-.3.8.4.4s1.2-.9 1.2-1.2c0-.8-.9-.4-1.6.8m193 28c-.4.7-.3.8.4.4s1.2-.9 1.2-1.2c0-.8-.9-.4-1.6.8m-5 5c-.4.7-.3.8.4.4 1.2-.7 1.6-1.6.8-1.6-.3 0-.8.5-1.2 1.2m182.1.8c1 1.1 2 2 2.3 2s-.3-.9-1.3-2-2-2-2.3-2 .3.9 1.3 2m-525.7 11.7c.7.3 1.6.2 1.9-.1.4-.3-.2-.6-1.3-.5-1.1 0-1.4.3-.6.6m6.5 0c.4.3 1 .3 1.4 0 .3-.4 0-.7-.7-.7s-1 .3-.7.7m297.5 0c.7.3 1.6.2 1.9-.1.4-.3-.2-.6-1.3-.5-1.1 0-1.4.3-.6.6m6 0c.7.3 1.6.2 1.9-.1.4-.3-.2-.6-1.3-.5-1.1 0-1.4.3-.6.6"
    />
    <path
      fillOpacity=".3"
      d="M776.3 254.7c.4.3 1 .3 1.4 0 .3-.4 0-.7-.7-.7s-1 .3-.7.7m396 1c4.8.2 12.5.2 17 0 4.5-.1.6-.3-8.8-.3-9.3 0-13 .2-8.2.3m132 0c4.8.2 12.5.2 17 0 4.5-.1.6-.3-8.8-.3-9.3 0-13 .2-8.2.3m76 0c4.8.2 12.6.2 17.5 0 4.8-.1.8-.3-8.8-.3s-13.6.2-8.7.3m-598 26c.4.3 1 .3 1.4 0 .3-.4 0-.7-.7-.7s-1 .3-.7.7m19.2 5.3c.3.5.8 1 1.1 1s.2-.5-.1-1c-.3-.6-.8-1-1.1-1s-.2.4.1 1m343.5 16c0 .7.3 1 .7.7.3-.4.3-1 0-1.4-.4-.3-.7 0-.7.7m52.1 1.6c0 1.1.3 1.4.6.6.3-.7.2-1.6-.1-1.9-.3-.4-.6.2-.5 1.3m42.3 29.9c0 17.6.2 24.7.3 15.7.2-9 .2-23.4 0-32-.1-8.6-.3-1.3-.3 16.3m-137 .7c-.4.7-.3.8.4.4s1.2-.9 1.2-1.2c0-.8-.9-.4-1.6.8m-53.4 16.2c0 .2.8 1 1.8 1.7 1.5 1.3 1.6 1.2.3-.4s-2.1-2.1-2.1-1.3m-256.7 16.3c.4.3 1 .3 1.4 0 .3-.4 0-.7-.7-.7s-1 .3-.7.7m292 0c.4.3 1 .3 1.4 0 .3-.4 0-.7-.7-.7s-1 .3-.7.7m11 0c.4.3 1 .3 1.4 0 .3-.4 0-.7-.7-.7s-1 .3-.7.7"
    />
    <path
      fillOpacity=".9"
      d="M1259.5 266c.3.5.8 1 1.1 1s.2-.5-.1-1c-.3-.6-.8-1-1.1-1s-.2.4.1 1M825 268.4c0 .2.8 1 1.8 1.7 1.5 1.3 1.6 1.2.3-.4s-2.1-2.1-2.1-1.3m541.9 87.3c-1.3 1.6-1.2 1.7.4.4s2.1-2.1 1.3-2.1c-.2 0-1 .8-1.7 1.7"
    />
    <path
      fill="teal"
      fillOpacity=".8"
      d="M484.3 275.7c5.9.2 15.5.2 21.5 0 5.9-.1 1-.3-10.8-.3s-16.7.2-10.7.3m96.5 0c21 .2 55.4.2 76.5 0 21-.1 3.8-.2-38.3-.2s-59.3.1-38.2.2m-96.5 52c5.9.2 15.5.2 21.5 0 5.9-.1 1-.3-10.8-.3s-16.7.2-10.7.3m77.5 0c10.5.2 27.9.2 38.5 0 10.5-.1 1.9-.2-19.3-.2s-29.8.1-19.2.2"
    />
  </svg>
);

interface SidebarItem {
  label: string;
  id: string;
  path?: string;
  icon: any;
  items?: { label: string; path: string }[];
}

const OVERVIEW: SidebarItem[] = [
  { label: 'Dashboard', id: 'dashboard', path: '/dashboard', icon: PieChart },
];

const MANAGEMENT: SidebarItem[] = [
  { 
    label: 'Settings', 
    id: 'settings', 
    icon: Settings, 
    items: [
      { label: 'Manage Restaurant', path: '/dashboard/categories' }
    ] 
  },
  { 
    label: 'Operations', 
    id: 'operations', 
    icon: Briefcase, 
    items: [
      { label: 'QR Code', path: '/dashboard/operations/qr-code' }
    ] 
  },
  { 
    label: 'Orders', 
    id: 'orders', 
    icon: ClipboardList, 
    items: [
      { label: 'All Orders', path: '/dashboard/orders' }
    ] 
  },
];

const CONNECTIONS: SidebarItem[] = [
  { 
    label: 'Integration', 
    id: 'integration', 
    icon: Plug, 
    items: [
      { label: 'POS', path: '/dashboard/integration/pos' },
      { label: 'Payment Gateway', path: '/dashboard/integration/payment-gateway' },
    ] 
  },
];

export function AppSidebar() {
  const pathname = usePathname();
  const [searchTerm, setSearchTerm] = useState('');
  const [activeMenus, setActiveMenu] = useState<string[]>([]);
  const [isBranchSwitcherOpen, setIsBranchSwitcherOpen] = useState(false);
  const [isBranchSearching, setIsBranchSearching] = useState(false);
  const [branchSearchQuery, setBranchSearchQuery] = useState('');

  useEffect(() => {
    const allGroups = [...MANAGEMENT, ...CONNECTIONS];
    const currentGroup = allGroups.find(group => 
      group.items?.some(sub => pathname.startsWith(sub.path))
    );
    if (currentGroup) {
      setActiveMenu([currentGroup.id]);
    }
  }, [pathname]);

  const handleMenuToggle = (menu: string) => {
    setActiveMenu((prev) => 
      prev.includes(menu) ? [] : [menu]
    );
  };

  const filteredBranches = useMemo(() => {
    return branches.filter((branch) =>
      branch.name.toLowerCase().includes(branchSearchQuery.toLowerCase()) ||
      branch.type.toLowerCase().includes(branchSearchQuery.toLowerCase())
    );
  }, [branchSearchQuery]);

  const renderSidebarItem = (item: SidebarItem) => {
    const isExpanded = activeMenus.includes(item.id);
    const hasSubItems = item.items && item.items.length > 0;
    const isActiveGroup = hasSubItems && item.items.some(sub => pathname.startsWith(sub.path));

    return (
      <SidebarMenuItem key={item.id}>
        {hasSubItems ? (
          <Collapsible
            open={isExpanded}
            onOpenChange={() => handleMenuToggle(item.id)}
          >
            <CollapsibleTrigger asChild>
              <SidebarMenuButton
                isActive={isActiveGroup}
                className={cn(
                  "w-full transition-colors",
                  isActiveGroup && "bg-sidebar-primary text-primary font-semibold"
                )}
              >
                <div className="flex w-full items-center justify-between">
                  <div className="flex items-center gap-2">
                    <item.icon className={cn("h-4 w-4", isActiveGroup && "text-primary")} />
                    <span className="group-data-[collapsible=icon]:hidden">
                      {item.label}
                    </span>
                  </div>
                  <div className="h-5 w-5 border flex items-center justify-center rounded-sm bg-background/50 group-data-[collapsible=icon]:hidden">
                    {isExpanded ? (
                      <Minus className="h-3 w-3" />
                    ) : (
                      <Plus className="h-3 w-3" />
                    )}
                  </div>
                </div>
              </SidebarMenuButton>
            </CollapsibleTrigger>
            <CollapsibleContent className="animate-collapsible">
              <SidebarMenuSub className="relative ml-6 border-l pl-0">
                {item.items?.map((subItem) => {
                  const isActive = pathname.startsWith(subItem.path);
                  return (
                    <SidebarMenuSubItem key={subItem.label} className="flex items-center">
                      <div className="relative flex items-center w-full h-9">
                        <div className={cn(
                          "absolute left-[-1.5px] top-1/2 -translate-y-1/2 w-[3px] h-3 rounded-full transition-colors",
                          isActive ? "bg-primary" : "bg-transparent"
                        )} />
                        <NextLink 
                          href={subItem.path} 
                          className={cn(
                            "flex-1 px-6 text-sm transition-colors",
                            isActive ? "text-primary font-semibold" : "text-muted-foreground hover:text-foreground"
                          )}
                        >
                          {subItem.label}
                        </NextLink>
                      </div>
                    </SidebarMenuSubItem>
                  );
                })}
              </SidebarMenuSub>
            </CollapsibleContent>
          </Collapsible>
        ) : (
          <SidebarMenuButton
            asChild
            isActive={pathname === item.path}
            tooltip={item.label}
          >
            <NextLink href={item.path || '#'}>
              <item.icon />
              <span className="group-data-[collapsible=icon]:hidden">
                {item.label}
              </span>
            </NextLink>
          </SidebarMenuButton>
        )}
      </SidebarMenuItem>
    );
  };

  return (
    <>
      <div 
        className={cn(
          "fixed inset-0 z-[45] bg-black/40 backdrop-blur-sm transition-opacity duration-300 ease-in-out pointer-events-none",
          isBranchSwitcherOpen ? "opacity-100" : "opacity-0"
        )} 
      />

      <Sidebar variant="sidebar" collapsible="icon" className="border-r">
        <SidebarHeader className="relative flex h-auto flex-col items-center justify-center gap-4 p-4 pb-2">
          <div className="flex w-full items-center justify-center">
            <div className="group-data-[collapsible=icon]:hidden">
              <EMenuIcon />
            </div>
            <div className="hidden group-data-[collapsible=icon]:block">
              <LayoutDashboard className="h-6 w-6" />
            </div>
          </div>

          <div className="relative w-full group-data-[collapsible=icon]:hidden">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search menu..."
              className="h-9 w-full rounded-lg bg-secondary pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </SidebarHeader>

        <SidebarContent className="p-0 pb-4">
          <SidebarGroup id="sidebar-nav">
            <SidebarGroupLabel className="group-data-[collapsible=icon]:hidden uppercase tracking-wider text-[10px] font-bold">
              Overview
            </SidebarGroupLabel>
            <SidebarMenu>
              {OVERVIEW.map(renderSidebarItem)}
            </SidebarMenu>
          </SidebarGroup>

          <SidebarSeparator className="mx-4 my-4 group-data-[collapsible=icon]:hidden opacity-50" />

          <SidebarGroup>
            <SidebarGroupLabel className="group-data-[collapsible=icon]:hidden uppercase tracking-wider text-[10px] font-bold">
              Management
            </SidebarGroupLabel>
            <SidebarMenu>
              {MANAGEMENT.map(renderSidebarItem)}
            </SidebarMenu>
          </SidebarGroup>

          <SidebarSeparator className="mx-4 my-4 group-data-[collapsible=icon]:hidden opacity-50" />

          <SidebarGroup>
            <SidebarGroupLabel className="group-data-[collapsible=icon]:hidden uppercase tracking-wider text-[10px] font-bold">
              Connections
            </SidebarGroupLabel>
            <SidebarMenu>
              {CONNECTIONS.map(renderSidebarItem)}
            </SidebarMenu>
          </SidebarGroup>
        </SidebarContent>

        <SidebarFooter className="flex flex-col gap-2 p-4 bg-[#0a1414] rounded-tl-[24px] rounded-tr-[24px] relative z-[50]">
          <div className="group-data-[collapsible=icon]:hidden" id="branch-switcher">
            <DropdownMenu 
              open={isBranchSwitcherOpen} 
              onOpenChange={(open) => {
                setIsBranchSwitcherOpen(open);
                if (!open) {
                  setIsBranchSearching(false);
                  setBranchSearchQuery('');
                }
              }}
            >
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="flex h-auto w-full items-center justify-between gap-2 rounded-xl bg-[#142424] p-3 text-left text-white hover:bg-[#1a2e2e] border border-white/5 transition-all shadow-xl"
                >
                  <div className="flex items-center gap-3">
                    <TooltipProvider>
                      <Tooltip delayDuration={100}>
                        <TooltipTrigger asChild>
                          <div className="relative shrink-0 cursor-pointer">
                            <div 
                              className="h-11 w-11 rounded-full p-[2px] flex items-center justify-center transition-transform hover:scale-105"
                              style={{ background: 'conic-gradient(from 0deg, #18B4A6, #4ade80, #facc15, #fb923c, #18B4A6)' }}
                            >
                              <div className="h-full w-full rounded-full bg-[#142424] p-[1.5px] flex items-center justify-center overflow-hidden">
                                <Image
                                  src="https://picsum.photos/seed/brand/100/100"
                                  width={40}
                                  height={40}
                                  alt="Brand logo"
                                  className="rounded-full object-cover grayscale brightness-110"
                                />
                              </div>
                            </div>
                            <span className="absolute -top-0.5 -right-0.5 flex h-3.5 w-3.5">
                              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                              <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-green-500 border-2 border-[#142424]"></span>
                            </span>
                          </div>
                        </TooltipTrigger>
                        <TooltipContent side="right" className="bg-[#18B4A6] text-white border-0 font-bold text-xs px-3 py-1.5 rounded-lg shadow-xl">
                          Check the live menu
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                    <div className="flex flex-col overflow-hidden">
                      <span className="truncate text-[11px] font-black uppercase tracking-[0.18em] text-[#18B4A6]">
                        BLOOMSBURY&apos;S
                      </span>
                      <h4 className="truncate text-[17px] font-black text-white tracking-tight leading-tight">
                        Ras Al Khaimah
                      </h4>
                    </div>
                  </div>
                  <ChevronDown className={cn("h-4 w-4 text-white/40 transition-transform duration-200", isBranchSwitcherOpen && "rotate-180")} />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuPortal>
                <DropdownMenuContent
                  align="start"
                  side="top"
                  className="mb-4 w-[280px] border-gray-200 bg-white text-gray-900 p-0 overflow-hidden shadow-2xl rounded-2xl animate-in slide-in-from-bottom-2 duration-300"
                >
                  <div 
                    className="p-5 border-b bg-gray-50/50 flex items-center justify-between min-h-[73px]"
                    onMouseLeave={() => {
                      setIsBranchSearching(false);
                      setBranchSearchQuery('');
                    }}
                  >
                    {!isBranchSearching ? (
                      <>
                        <DropdownMenuLabel className="p-0 text-xl font-black tracking-tight text-gray-900">Select a Branch</DropdownMenuLabel>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8 rounded-full hover:bg-gray-200 transition-colors"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            setIsBranchSearching(true);
                          }}
                        >
                          <Search className="h-4 w-4 text-gray-500" />
                        </Button>
                      </>
                    ) : (
                      <div className="flex items-center w-full gap-2 animate-in fade-in slide-in-from-right-2 duration-300">
                        <Search className="h-4 w-4 text-gray-400 shrink-0" />
                        <Input
                          autoFocus
                          placeholder="Search branches..."
                          value={branchSearchQuery}
                          onChange={(e) => setBranchSearchQuery(e.target.value)}
                          className="h-9 border-0 bg-transparent p-0 shadow-none focus-visible:ring-0 text-gray-900 placeholder:text-gray-400 font-bold"
                        />
                      </div>
                    )}
                  </div>
                  
                  <ScrollArea className="h-[220px]">
                    <div className="p-2">
                      {filteredBranches.length > 0 ? (
                        filteredBranches.map((branch) => (
                          <DropdownMenuItem 
                            key={branch.id} 
                            className={cn(
                              "cursor-pointer focus:bg-primary/5 p-3 rounded-xl flex items-center justify-between transition-all group mb-1",
                              branch.name === "Ras Al Khaimah" ? "bg-primary/5 border border-primary/10" : "border border-transparent"
                            )}
                          >
                            <div className="flex flex-col min-w-0">
                              <span className="font-bold text-sm text-gray-900 truncate group-hover:text-primary transition-colors">{branch.name}</span>
                              <span className="text-[10px] uppercase font-bold tracking-wider text-gray-400 truncate">{branch.type}</span>
                            </div>
                            {branch.name === "Ras Al Khaimah" && (
                              <div className="h-2 w-2 rounded-full bg-primary shadow-[0_0_8px_rgba(24,180,166,0.5)]" />
                            )}
                          </DropdownMenuItem>
                        ))
                      ) : (
                        <div className="p-8 text-center text-sm text-muted-foreground">
                          No branches found matching &quot;{branchSearchQuery}&quot;
                        </div>
                      )}
                    </div>
                  </ScrollArea>

                  <div className="p-2 bg-gray-50/80 border-t">
                    <DropdownMenuItem asChild className="cursor-pointer focus:bg-white p-3 rounded-xl flex items-center gap-3 text-primary font-black text-sm border border-transparent hover:border-primary/20 transition-all">
                      <NextLink href="/dashboard/categories/new">
                        <PlusCircle className="h-5 w-5" />
                        <span>Add New Branch</span>
                      </NextLink>
                    </DropdownMenuItem>
                  </div>
                </DropdownMenuContent>
              </DropdownMenuPortal>
            </DropdownMenu>
          </div>
          <div className="hidden group-data-[collapsible=icon]:block">
            <NextLink href="#">
              <div className="relative">
                <div 
                  className="h-9 w-9 rounded-full p-[1.5px] flex items-center justify-center"
                  style={{ background: 'conic-gradient(from 0deg, #18B4A6, #4ade80, #facc15, #fb923c, #18B4A6)' }}
                >
                  <div className="h-full w-full rounded-full bg-[#142424] flex items-center justify-center overflow-hidden">
                    <Image
                      src="https://picsum.photos/seed/brand/100/100"
                      width={32}
                      height={32}
                      alt="Restaurant logo"
                      className="rounded-full object-cover"
                    />
                  </div>
                </div>
                <span className="absolute -top-0.5 -right-0.5 flex h-2 w-2">
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500 border border-gray-800"></span>
                </span>
              </div>
            </NextLink>
          </div>

          <div className="group-data-[collapsible=icon]:hidden mt-2 border-t border-white/5 pt-2">
            <SidebarMenu className="px-0">
              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  tooltip="Quickstart"
                  size="sm"
                  className="h-9 justify-start text-white/70 hover:text-white hover:bg-white/5 font-medium transition-colors"
                >
                  <NextLink href="#">
                    <Rocket className="h-4 w-4 mr-3 text-primary" />
                    <span className="group-data-[collapsible=icon]:hidden">
                      Quickstart
                    </span>
                  </NextLink>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  tooltip="Help"
                  size="sm"
                  className="h-9 justify-start text-white/70 hover:text-white hover:bg-white/5 font-medium transition-colors"
                >
                  <NextLink href="#">
                    <CircleHelp className="h-4 w-4 mr-3 text-primary" />
                    <span className="group-data-[collapsible=icon]:hidden">
                      Help Center
                    </span>
                  </NextLink>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </div>
        </SidebarFooter>
      </Sidebar>
    </>
  );
}
