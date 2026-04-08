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
  ChevronDown,
  PlusCircle,
  Loader2,
  BarChart,
  TrendingUp,
  Palette,
  Users,
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
import { mockBranches, type Branch } from '@/lib/mock-data-store';
import { useToast } from '@/hooks/use-toast';

export const EMenuIcon = () => (
  <svg width="122" height="39" viewBox="0 0 122 39" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="8.81641" y="0.482422" width="40.2279" height="4.95961" fill="#0CB5A8" />
    <rect x="8.81641" y="12.0547" width="19.8384" height="4.95961" fill="#0CB5A8" />
    <rect x="8.81641" y="23.6289" width="9.91922" height="4.95961" fill="#0CB5A8" />
    <rect y="23.6289" width="5.51067" height="4.95961" fill="#0CB5A8" />
    <rect y="12.0547" width="5.51067" height="4.95961" fill="#0CB5A8" />
    <rect y="0.482422" width="5.51067" height="4.95961" fill="#0CB5A8" />
    <path d="M47.5498 21.1168C47.5498 21.526 47.5243 21.9523 47.4731 22.3956H37.5756C37.6438 23.2822 37.9251 23.9642 38.4196 24.4416C38.9311 24.9019 39.5534 25.1321 40.2865 25.1321C41.3777 25.1321 42.1365 24.6717 42.5627 23.751H47.2174C46.9787 24.6888 46.5439 25.5328 45.913 26.283C45.2992 27.0332 44.5235 27.6214 43.5857 28.0476C42.648 28.4739 41.5994 28.687 40.44 28.687C39.0419 28.687 37.7972 28.3886 36.706 27.7919C35.6148 27.1951 34.7623 26.3426 34.1485 25.2344C33.5347 24.1261 33.2278 22.8303 33.2278 21.347C33.2278 19.8636 33.5262 18.5678 34.1229 17.4596C34.7367 16.3513 35.5892 15.4988 36.6805 14.9021C37.7717 14.3053 39.0248 14.0069 40.44 14.0069C41.821 14.0069 43.0486 14.2968 44.1228 14.8765C45.1969 15.4562 46.0324 16.2831 46.6291 17.3573C47.2429 18.4314 47.5498 19.6846 47.5498 21.1168ZM43.0742 19.9659C43.0742 19.2157 42.8185 18.619 42.307 18.1757C41.7955 17.7324 41.1561 17.5107 40.3888 17.5107C39.6557 17.5107 39.0334 17.7239 38.5219 18.1501C38.0274 18.5764 37.7205 19.1816 37.6012 19.9659H43.0742ZM70.1891 10.5287V28.4824H65.8158V17.7153L61.8005 28.4824H58.2712L54.2303 17.6898V28.4824H49.857V10.5287H55.0231L60.0614 22.9582L65.0486 10.5287H70.1891ZM86.7865 21.1168C86.7865 21.526 86.761 21.9523 86.7098 22.3956H76.8123C76.8805 23.2822 77.1618 23.9642 77.6563 24.4416C78.1678 24.9019 78.7901 25.1321 79.5232 25.1321C80.6144 25.1321 81.3732 24.6717 81.7994 23.751H86.4541C86.2154 24.6888 85.7806 25.5328 85.1497 26.283C84.5359 27.0332 83.7602 27.6214 82.8224 28.0476C81.8847 28.4739 80.8361 28.687 79.6767 28.687C78.2786 28.687 77.0339 28.3886 75.9427 27.7919C74.8515 27.1951 73.999 26.3426 73.3852 25.2344C72.7714 24.1261 72.4645 22.8303 72.4645 21.347C72.4645 19.8636 72.7629 18.5678 73.3597 17.4596C73.9735 16.3513 74.826 15.4988 75.9172 14.9021C77.0084 14.3053 78.2615 14.0069 79.6767 14.0069C81.0577 14.0069 82.2853 14.2968 83.3595 14.8765C84.4336 15.4562 85.2691 16.2831 85.8658 17.3573C86.4796 18.4314 86.7865 19.6846 86.7865 21.1168ZM82.3109 19.9659C82.3109 19.2157 82.0552 18.619 81.5437 18.1757C81.0322 17.7324 80.3928 17.5107 79.6255 17.5107C78.8924 17.5107 78.2701 17.7239 77.7586 18.1501C77.2641 18.5764 76.9572 19.1816 76.8379 19.9659H82.3109ZM97.7892 14.0581C99.4601 14.0581 100.79 14.6037 101.779 15.6949C102.785 16.7691 103.288 18.2524 103.288 20.145V28.4824H98.9401V20.7332C98.9401 19.7784 98.6929 19.0367 98.1984 18.5082C97.704 17.9796 97.039 17.7153 96.2036 17.7153C95.3681 17.7153 94.7032 17.9796 94.2087 18.5082C93.7143 19.0367 93.467 19.7784 93.467 20.7332V28.4824H89.0937V14.2115H93.467V16.1041C93.9103 15.4733 94.5071 14.9788 95.2573 14.6207C96.0075 14.2456 96.8515 14.0581 97.7892 14.0581ZM120.419 14.2115V28.4824H116.045V26.5387C115.602 27.1696 114.997 27.6811 114.23 28.0732C113.479 28.4483 112.644 28.6359 111.723 28.6359C110.632 28.6359 109.669 28.3972 108.833 27.9198C107.998 27.4253 107.35 26.7177 106.89 25.797C106.429 24.8763 106.199 23.7937 106.199 22.549V14.2115H110.547V21.9608C110.547 22.9156 110.794 23.6573 111.288 24.1858C111.783 24.7144 112.448 24.9786 113.283 24.9786C114.136 24.9786 114.809 24.7144 115.304 24.1858C115.798 23.6573 116.045 22.9156 116.045 21.9608V14.2115H120.419Z" fill="#111E3C" />
  </svg>
);

interface SidebarItem {
  label: string;
  id: string;
  path?: string;
  icon: any;
  items?: { label: string; path: string }[];
  tooltip?: string;
}

const OVERVIEW: SidebarItem[] = [
  { label: 'Dashboard', id: 'dashboard', path: '/dashboard', icon: PieChart },
  { label: 'Analytics', id: 'analytics', path: '/dashboard/reports/analytics', icon: BarChart },
  { 
    label: 'Reports', 
    id: 'reports', 
    icon: TrendingUp, 
    items: [
      { label: 'Order Report', path: '/dashboard/reports/payments' },
      { label: 'Split Bill Report', path: '/dashboard/reports/split-bills' },
      { label: 'Tips Report', path: '/dashboard/reports/tips-and-charges' },
      { label: 'Staff Performance', path: '/dashboard/reports/staff-performance' },
    ] 
  },
];

const MANAGEMENT: SidebarItem[] = [
  {
    label: 'Catalog',
    id: 'catalog',
    icon: Briefcase,
    items: [
        { label: 'Categories', path: '/dashboard/catalog/categories' },
        { label: 'Products', path: '/dashboard/products' },
        { label: 'Variations', path: '/dashboard/catalog/variations' },
        { label: 'Allergens', path: '/dashboard/catalog/properties' },
        { label: 'Combo Groups', path: '/dashboard/catalog/combo-groups' },
        { label: 'Nutrition', path: '/dashboard/catalog/nutrition' },
    ],
  },
  {
    label: 'Menu Builder',
    id: 'menu-builder',
    path: '/dashboard/menu-builder',
    icon: Palette,
    tooltip: 'Currently under construction',
  },
  {
    label: 'Operations',
    id: 'operations',
    icon: Briefcase,
    items: [{ label: 'QR Code', path: '/dashboard/operations/qr-code' }],
  },
  {
    label: 'Orders',
    id: 'orders',
    icon: ClipboardList,
    items: [{ label: 'All Orders', path: '/dashboard/orders' }],
  },
  {
    label: 'Settings',
    id: 'settings',
    icon: Settings,
    items: [{ label: 'Manage Restaurants', path: '/dashboard/categories' }],
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
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [activeMenus, setActiveMenu] = useState<string[]>([]);
  const [isBranchSwitcherOpen, setIsBranchSwitcherOpen] = useState(false);
  const [isBranchSearching, setIsBranchSearching] = useState(false);
  const [branchSearchQuery, setBranchSearchQuery] = useState('');
  const [activeBranch, setActiveBranch] = useState(mockBranches[0]);
  const [isBranchLoading, setIsBranchLoading] = useState(false);

  useEffect(() => {
    // Initial load from local storage
    const savedBranch = localStorage.getItem('activeBranch');
    if (savedBranch) {
      try {
        const branchData = JSON.parse(savedBranch);
        const match = mockBranches.find(b => b.id === branchData.id);
        if (match) setActiveBranch(match);
      } catch (e) {
        // Fallback to default
      }
    }

    // Sync when branch is changed from Manage Restaurant page
    const syncBranch = () => {
      setIsBranchLoading(true);
      const updatedBranch = localStorage.getItem('activeBranch');
      if (updatedBranch) {
        try {
          const branchData = JSON.parse(updatedBranch);
          const match = mockBranches.find(b => b.id === branchData.id);
          if (match) setActiveBranch(match);
        } catch (e) {}
      }
      setTimeout(() => setIsBranchLoading(false), 800);
    };

    window.addEventListener('branch-changed', syncBranch);
    return () => window.removeEventListener('branch-changed', syncBranch);
  }, []);

  useEffect(() => {
    const allGroups = [...OVERVIEW, ...MANAGEMENT, ...CONNECTIONS];
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

  const sortedAndFilteredBranches = useMemo(() => {
    const filtered = mockBranches.filter((branch) =>
      branch.name.toLowerCase().includes(branchSearchQuery.toLowerCase()) ||
      branch.type.toLowerCase().includes(branchSearchQuery.toLowerCase())
    );
    
    // Sort so the currently selected branch is always first
    return [...filtered].sort((a, b) => {
      if (a.id === activeBranch.id) return -1;
      if (b.id === activeBranch.id) return 1;
      return 0;
    });
  }, [branchSearchQuery, activeBranch.id]);

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
            tooltip={item.tooltip || item.label}
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
                  className={cn(
                    "flex h-auto w-full items-center justify-between gap-2 rounded-xl bg-[#142424] p-3 text-left text-white hover:bg-[#1a2e2e] border border-white/5 transition-all shadow-xl",
                    isBranchLoading && "animate-pulse"
                  )}
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
                                {isBranchLoading ? (
                                  <Loader2 className="h-5 w-5 text-[#18B4A6] animate-spin" />
                                ) : (
                                  <Image
                                    src="https://picsum.photos/seed/brand/100/100"
                                    width={40}
                                    height={40}
                                    alt="Brand logo"
                                    className="rounded-full object-cover grayscale brightness-110"
                                  />
                                )}
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
                        {isBranchLoading ? "Loading..." : activeBranch.name.replace("Bloomsbury's - ", "")}
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
                      {sortedAndFilteredBranches.length > 0 ? (
                        sortedAndFilteredBranches.map((branch) => (
                          <DropdownMenuItem 
                            key={branch.id} 
                            onClick={() => {
                              if (branch.id === activeBranch.id) {
                                setIsBranchSwitcherOpen(false);
                                return;
                              }

                              toast({
                                title: "Switching Outlet",
                                description: `Accessing data for ${branch.name.replace("Bloomsbury's - ", "")}...`,
                              });

                              setActiveBranch(branch);
                              setIsBranchSwitcherOpen(false);
                              localStorage.setItem('activeBranch', JSON.stringify({
                                id: branch.id,
                                name: branch.name.replace("Bloomsbury's - ", ""),
                                type: branch.type
                              }));
                              window.dispatchEvent(new CustomEvent('branch-changed'));
                            }}
                            className={cn(
                              "cursor-pointer focus:bg-primary/5 p-3 rounded-xl flex items-center justify-between transition-all group mb-1",
                              branch.id === activeBranch.id ? "bg-primary/5 border border-primary/10" : "border border-transparent"
                            )}
                          >
                            <div className="flex flex-col min-w-0">
                              <span className="font-bold text-sm text-gray-900 truncate group-hover:text-primary transition-colors">{branch.name}</span>
                              <span className="text-[10px] uppercase font-bold tracking-wider text-gray-400 truncate">{branch.type}</span>
                            </div>
                            {branch.id === activeBranch.id && (
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
                  tooltip="Help"
                  size="sm"
                  className="h-9 justify-start text-white/70 hover:text-white hover:bg-white/5 font-medium transition-colors"
                >
                  <NextLink href="#">
                    <CircleHelp className="h-4 w-4 mr-3 !text-[#18B4A6]" />
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
