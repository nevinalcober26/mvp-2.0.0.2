'use client';

import React, { useState, useEffect, useMemo, useRef } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { DashboardHeader } from '@/components/dashboard/header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardFooter } from '@/components/ui/card';
import {
  Plus,
  Download,
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
} from 'lucide-react';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { cn } from '@/lib/utils';
import { CategoriesPageSkeleton } from '@/components/dashboard/skeletons';
import { StatCards, type StatCardData } from '@/components/dashboard/stat-cards';
import { QuickSettingsSheet } from './quick-settings-sheet';
import gsap from 'gsap';

type RestaurantStatus = 'Open' | 'Closed';

interface Restaurant {
  id: string;
  name: string;
  image: string;
  status: RestaurantStatus;
  rating: number;
  type: string;
  location: string;
  address: string;
  menuItems: number;
  scansToday: number;
}

const DEFAULT_RESTAURANT_IMAGE = 'https://picsum.photos/seed/bloomsbury/600/400';

const mockRestaurants: Restaurant[] = [
  {
    id: '1',
    name: "Bloomsbury's - Ras Al Khaimah",
    image: PlaceHolderImages.find(img => img.id === 'restaurant-1')?.imageUrl || DEFAULT_RESTAURANT_IMAGE,
    status: 'Open',
    rating: 4.9,
    type: 'Boutique Café',
    location: 'RAK Mall',
    address: 'Level 1, RAK Mall, Ras Al Khaimah',
    menuItems: 142,
    scansToday: 284,
  },
  {
    id: '2',
    name: "Bloomsbury's - Dubai Mall",
    image: PlaceHolderImages.find(img => img.id === 'restaurant-2')?.imageUrl || DEFAULT_RESTAURANT_IMAGE,
    status: 'Open',
    rating: 4.8,
    type: 'Signature Store',
    location: 'Downtown',
    address: 'Lower Ground, Dubai Mall, Dubai',
    menuItems: 156,
    scansToday: 1240,
  },
  {
    id: '3',
    name: "Bloomsbury's - Al Ain",
    image: PlaceHolderImages.find(img => img.id === 'restaurant-3')?.imageUrl || DEFAULT_RESTAURANT_IMAGE,
    status: 'Open',
    rating: 4.7,
    type: 'Boutique Café',
    location: 'Al Ain Mall',
    address: 'Ground Floor, Al Ain Mall, Al Ain',
    menuItems: 98,
    scansToday: 412,
  },
  {
    id: '4',
    name: "Bloomsbury's - Abu Dhabi",
    image: PlaceHolderImages.find(img => img.id === 'restaurant-4')?.imageUrl || DEFAULT_RESTAURANT_IMAGE,
    status: 'Open',
    rating: 4.8,
    type: 'Boutique Café',
    location: 'Al Mushrif',
    address: 'Al Mushrif Mall, Abu Dhabi',
    menuItems: 110,
    scansToday: 650,
  },
  {
    id: '5',
    name: "Bloomsbury's - Sharjah",
    image: PlaceHolderImages.find(img => img.id === 'restaurant-5')?.imageUrl || DEFAULT_RESTAURANT_IMAGE,
    status: 'Open',
    rating: 4.6,
    type: 'Boutique Café',
    location: 'Zero 6 Mall',
    address: 'Zero 6 Mall, Sharjah',
    menuItems: 85,
    scansToday: 320,
  },
  {
    id: '6',
    name: "Bloomsbury's - Ajman",
    image: PlaceHolderImages.find(img => img.id === 'restaurant-6')?.imageUrl || DEFAULT_RESTAURANT_IMAGE,
    status: 'Closed',
    rating: 4.5,
    type: 'Boutique Café',
    location: 'City Centre',
    address: 'City Centre Ajman, Ajman',
    menuItems: 72,
    scansToday: 180,
  },
];

const RestaurantCard = ({ 
  restaurant, 
  onQuickSettings,
  onEdit,
  isActive,
  onSelect
}: { 
  restaurant: Restaurant;
  onQuickSettings: (r: Restaurant) => void;
  onEdit: (r: Restaurant) => void;
  isActive: boolean;
  onSelect: (id: string) => void;
}) => (
  <Card 
    className={cn(
      "overflow-hidden group hover:shadow-xl transition-all duration-300 relative cursor-pointer",
      isActive ? "ring-2 ring-[#18B4A6] shadow-xl scale-[1.02]" : "hover:shadow-md"
    )}
    onClick={() => onSelect(restaurant.id)}
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
      
      {/* Shine Sweep Overlay */}
      {isActive && (
        <div className="absolute inset-0 z-10 pointer-events-none overflow-hidden">
          <div 
            className="shine-sweep absolute top-0 -left-[100%] w-[40%] h-[200%] bg-gradient-to-r from-transparent via-white/40 to-transparent skew-x-[-30deg] -translate-y-1/4"
          />
        </div>
      )}

      <div className="absolute top-3 left-3 flex gap-2 z-20">
        {isActive ? (
          <Badge className="bg-[#18B4A6] text-white border-0 font-bold px-3 py-1 shadow-lg animate-in fade-in zoom-in duration-300">
            Actively Selected
          </Badge>
        ) : (
          <button className="h-8 w-8 rounded-full bg-black/40 text-white flex items-center justify-center hover:bg-black/60 backdrop-blur-sm transition-colors">
            <MoreHorizontal className="h-4 w-4" />
          </button>
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
    <CardHeader className="p-5 pb-2">
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
    <CardContent className="p-5 pt-2 space-y-3">
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
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedBranch, setSelectedBranch] = useState<Restaurant | null>(null);
  const [isQuickSettingsOpen, setIsQuickSettingsOpen] = useState(false);
  const [activeBranchId, setActiveBranchId] = useState<string>('1');

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

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);
    return () => clearTimeout(timer);
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

  const handleOpenQuickSettings = (restaurant: Restaurant) => {
    setSelectedBranch(restaurant);
    setIsQuickSettingsOpen(true);
  };

  const handleEditBranch = (restaurant: Restaurant) => {
    router.push(`/dashboard/categories/edit/${restaurant.id}`);
  };

  const handleAddNewBranch = () => {
    router.push('/dashboard/categories/new');
  };

  const handleSelectBranch = (id: string) => {
    setActiveBranchId(id);
  };

  if (isLoading) {
    return <CategoriesPageSkeleton view="gallery" />;
  }

  return (
    <>
      <DashboardHeader />
      <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 bg-muted/30">
        <div className="max-w-7xl mx-auto space-y-8">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-extrabold tracking-tight text-foreground text-left">Manage Branches</h1>
              <p className="text-muted-foreground mt-1 text-left">
                Overview and configuration for all Bloomsbury&apos;s outlets
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Button variant="outline" className="gap-2 font-semibold">
                <Download className="h-4 w-4" />
                Export Data
              </Button>
              <Button 
                className="gap-2 font-bold bg-primary hover:bg-primary/90 text-primary-foreground"
                onClick={handleAddNewBranch}
              >
                <Plus className="h-5 w-5" />
                Add New Branch
              </Button>
            </div>
          </div>

          {/* Stats Overview */}
          <StatCards cards={kpiCards} />

          {/* Filters and Search */}
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

          {/* Restaurants Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {mockRestaurants.map((restaurant) => (
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

          {/* Pagination */}
          <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 border-t">
            <p className="text-sm text-muted-foreground">
              Showing <strong>1 to 6</strong> of <strong>18</strong> branches
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
        restaurant={selectedBranch}
      />
    </>
  );
}