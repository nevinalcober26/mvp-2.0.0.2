
'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { DashboardHeader } from '@/components/dashboard/header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardFooter } from '@/components/ui/card';
import {
  Plus,
  Search,
  SlidersHorizontal,
  Star,
  MapPin,
  Package,
  QrCode,
  MoreHorizontal,
  Settings,
  Edit,
  ChevronLeft,
  ChevronRight,
  Store,
  TrendingUp,
  Trash,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import { CategoriesPageSkeleton } from '@/components/dashboard/skeletons';
import { StatCards, type StatCardData } from '@/components/dashboard/stat-cards';
import { QuickSettingsSheet } from './quick-settings-sheet';
import { useToast } from '@/hooks/use-toast';
import { mockDataStore, type Branch } from '@/lib/mock-data-store';
import gsap from 'gsap';

const RestaurantCard = ({ 
  restaurant, 
  onQuickSettings,
  onEdit,
  isActive,
  onSelect
}: { 
  restaurant: Branch;
  onQuickSettings: (r: Branch) => void;
  onEdit: (r: Branch) => void;
  isActive: boolean;
  onSelect: (r: Branch) => void;
}) => (
  <Card 
    className={cn(
      "overflow-hidden group hover:shadow-xl transition-all duration-300 relative cursor-pointer",
      isActive ? "ring-2 ring-primary shadow-xl scale-[1.02]" : "hover:shadow-md"
    )}
    onClick={() => onSelect(restaurant)}
  >
    <div className="relative aspect-[16/9] w-full bg-muted overflow-hidden">
      {restaurant.image && restaurant.image !== "" ? (
        <Image
          src={restaurant.image}
          alt={restaurant.name}
          fill
          className="object-cover transition-transform group-hover:scale-105"
          data-ai-hint="boutique cafe"
        />
      ) : (
        <div className="w-full h-full flex items-center justify-center text-muted-foreground">
          <Store className="h-12 w-12 opacity-20" />
        </div>
      )}
      
      {/* GSAP Shine Sweep Overlay */}
      {isActive && (
        <div className="absolute inset-0 z-10 pointer-events-none overflow-hidden">
          <div 
            className="shine-sweep absolute top-0 -left-[100%] w-[40%] h-[200%] bg-gradient-to-r from-transparent via-white/40 to-transparent skew-x-[-30deg] -translate-y-1/4"
          />
        </div>
      )}

      <div className="absolute top-3 left-3 flex gap-2 z-20">
        {isActive ? (
          <Badge className="bg-[#FF75DF] text-white border-0 font-bold px-4 py-1 rounded-full shadow-lg animate-in fade-in zoom-in duration-300">
            Actively Selected
          </Badge>
        ) : (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button 
                className="h-8 w-8 rounded-full bg-black/40 text-white flex items-center justify-center hover:bg-black/60 backdrop-blur-sm transition-colors"
                onClick={(e) => e.stopPropagation()}
              >
                <MoreHorizontal className="h-4 w-4" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start">
              <DropdownMenuItem 
                className="text-destructive cursor-pointer"
                onClick={(e) => {
                  e.stopPropagation();
                }}
              >
                <Trash className="mr-2 h-4 w-4" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>
      <Badge
        className={cn(
          "absolute top-3 right-3 border-0 z-20",
          restaurant.status === 'Open' ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
        )}
      >
        {restaurant.status}
      </Badge>
    </div>
    <CardHeader className="p-5 pb-2 text-left">
      <div className="flex items-start justify-between">
        <div>
          <h3 className="text-lg font-bold leading-tight">{restaurant.name}</h3>
          <p className="text-sm text-muted-foreground">
            {restaurant.type} • {restaurant.location}
          </p>
        </div>
        <div className="flex items-center gap-1 bg-yellow-50 text-yellow-700 px-2 py-1 rounded text-sm font-bold">
          <Star className="h-3.5 w-3.5 fill-current" />
          {restaurant.rating}
        </div>
      </div>
    </CardHeader>
    <CardContent className="p-5 pt-2 space-y-3 text-left">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <MapPin className="h-4 w-4 shrink-0" />
        <span className="truncate">{restaurant.address}</span>
      </div>
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Package className="h-4 w-4 shrink-0" />
        <span>Active Menu Items: {restaurant.menuItems}</span>
      </div>
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <QrCode className="h-4 w-4 shrink-0" />
        <span>Scans Today: {restaurant.scansToday}</span>
      </div>
    </CardContent>
    <CardFooter className="p-5 pt-0 flex gap-2">
      <Button 
        variant="outline" 
        size="sm" 
        className="flex-1 font-semibold gap-2"
        onClick={(e) => {
          e.stopPropagation();
          onQuickSettings(restaurant);
        }}
      >
        <Settings className="h-4 w-4" />
        Settings
      </Button>
      <Button 
        size="sm" 
        className="flex-1 font-semibold gap-2 bg-primary hover:bg-primary/90 text-primary-foreground"
        onClick={(e) => {
          e.stopPropagation();
          onEdit(restaurant);
        }}
      >
        <Edit className="h-4 w-4" />
        Edit Branch
      </Button>
    </CardFooter>
  </Card>
);

export default function ManageRestaurantPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [selectedBranch, setSelectedBranch] = useState<Branch | null>(null);
  const [isQuickSettingsOpen, setIsQuickSettingsOpen] = useState(false);
  const [activeBranchId, setActiveBranchId] = useState<string>('1');

  useEffect(() => {
    const savedBranch = localStorage.getItem('activeBranch');
    if (savedBranch) {
      try {
        const branchData = JSON.parse(savedBranch);
        setActiveBranchId(branchData.id);
      } catch (e) {
        setActiveBranchId('1');
      }
    }
    
    const timer = 
      setIsLoading(false);
    

    const handleBranchChange = () => {
      // Sync local ID state
      const updatedBranch = localStorage.getItem('activeBranch');
      if (updatedBranch) {
        try {
          const branchData = JSON.parse(updatedBranch);
          setActiveBranchId(branchData.id);
        } catch (e) {}
      }
      
      setIsLoading(true);
      setIsLoading(false);
    };

    window.addEventListener('branch-changed', handleBranchChange);

    return () => {
      clearTimeout(timer);
      window.removeEventListener('branch-changed', handleBranchChange);
    };
  }, []);

  useEffect(() => {
    if (!isLoading && activeBranchId) {
      const sweepAnimation = () => {
        gsap.to('.shine-sweep', {
          left: '150%',
          duration: 1.2,
          ease: 'power2.inOut',
          delay: 2.5,
          repeat: -1,
          repeatDelay: 3,
          onStart: () => {
            gsap.set('.shine-sweep', { left: '-100%' });
          }
        });
      };
      sweepAnimation();
    }
    return () => {
      gsap.killTweensOf('.shine-sweep');
    };
  }, [isLoading, activeBranchId]);

  const handleOpenQuickSettings = (restaurant: Branch) => {
    setSelectedBranch(restaurant);
    setIsQuickSettingsOpen(true);
  };

  const handleEditBranch = (restaurant: Branch) => {
    router.push(`/dashboard/categories/edit/${restaurant.id}`);
  };

  const handleAddNewBranch = () => {
    router.push('/dashboard/categories/new');
  };

  const handleSelectBranch = (restaurant: Branch) => {
    if (activeBranchId === restaurant.id) return;
    
    localStorage.setItem('activeBranch', JSON.stringify({
      id: restaurant.id,
      name: restaurant.name.replace("Bloomsbury's - ", ""),
      type: restaurant.type
    }));

    window.dispatchEvent(new CustomEvent('branch-changed'));

    toast({
      title: "Context Updated",
      description: `Now managing: ${restaurant.name}`,
    });
  };

  const filteredRestaurants = useMemo(() => {
    return mockDataStore.branches.filter(r => 
      r.name.toLowerCase().includes(search.toLowerCase()) || 
      r.location.toLowerCase().includes(search.toLowerCase())
    );
  }, [search]);

  const kpiCards: StatCardData[] = useMemo(() => [
    {
      title: "Bloomsbury's Outlets",
      value: '18',
      change: '+2',
      changeDescription: 'new branches',
      icon: Store,
      color: 'orange',
      tooltipText: 'Total number of Bloomsbury\'s branches managed across the network.',
    },
    {
      title: 'Digital Orders',
      value: '1,284',
      change: '+8%',
      changeDescription: 'vs last month',
      icon: TrendingUp,
      color: 'green',
      tooltipText: 'Total volume of orders placed via digital menus today across all branches.',
    },
    {
      title: 'QR Menu Scans',
      value: '4,562',
      change: '+12%',
      changeDescription: 'vs yesterday',
      icon: QrCode,
      color: 'blue',
      tooltipText: 'Number of times digital menu QR codes were scanned across all branches.',
    },
    {
      title: 'Avg. Rating',
      value: '4.8',
      change: '+0.1',
      changeDescription: 'vs last month',
      icon: Star,
      color: 'purple',
      tooltipText: 'Average customer rating across all managed branches.',
    },
  ], []);

  if (isLoading) {
    return <CategoriesPageSkeleton view="gallery" />;
  }

  return (
    <>
      <DashboardHeader />
      <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 bg-muted/30">
        <div className="max-w-7xl mx-auto space-y-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="text-left">
              <h1 className="text-3xl font-extrabold tracking-tight text-foreground">Manage Branches</h1>
              <p className="text-muted-foreground mt-1">
                Overview and configuration for all Bloomsbury&apos;s outlets
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Button 
                className="gap-2 font-bold bg-primary hover:bg-primary/90 text-primary-foreground"
                onClick={handleAddNewBranch}
              >
                <Plus className="h-5 w-5" />
                Add New Branch
              </Button>
            </div>
          </div>

          <StatCards cards={kpiCards} />

          <div className="flex items-center gap-4 bg-background p-4 rounded-xl border shadow-sm">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search branch location or name"
                className="pl-10 border-0 bg-transparent focus-visible:ring-0 text-base"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <Button variant="outline" className="gap-2 font-semibold border-muted">
              <SlidersHorizontal className="h-4 w-4" />
              Sort
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredRestaurants.map((restaurant) => (
              <RestaurantCard 
                key={restaurant.id} 
                restaurant={restaurant} 
                isActive={activeBranchId === restaurant.id}
                onSelect={handleSelectBranch}
                onQuickSettings={handleOpenQuickSettings}
                onEdit={handleEditBranch}
              />
            ))}
          </div>

          <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 border-t">
            <p className="text-sm text-muted-foreground">
              Showing <strong>1 to {filteredRestaurants.length}</strong> of <strong>{mockDataStore.branches.length}</strong> branches
            </p>
            <div className="flex items-center gap-1">
              <Button variant="ghost" size="icon" className="h-9 w-9">
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button size="sm" className="h-9 w-9 bg-primary text-primary-foreground font-bold">1</Button>
              <Button variant="ghost" size="sm" className="h-9 w-9 font-medium">2</Button>
              <Button variant="ghost" size="sm" className="h-9 w-9 font-medium">3</Button>
              <Button variant="ghost" size="icon" className="h-9 w-9">
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </main>

      <QuickSettingsSheet 
        open={isQuickSettingsOpen} 
        onOpenChange={setIsQuickSettingsOpen}
        restaurant={selectedBranch ? { id: selectedBranch.id, name: selectedBranch.name, status: selectedBranch.status } : null}
      />
    </>
  );
}
