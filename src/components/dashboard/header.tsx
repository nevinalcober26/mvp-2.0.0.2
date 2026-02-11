'use client';
import Image from 'next/image';
import React, { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import {
  Bell,
  Search,
  User,
  CreditCard,
  LogOut,
  Settings,
  LayoutGrid,
  ChevronDown,
  Store,
  MapPin,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { SidebarTrigger } from '../ui/sidebar';
import { PosSyncStatus } from './pos-sync-status';
import { Skeleton } from '@/components/ui/skeleton';
import { AppSwitcher } from './app-switcher';
import { NotificationMenu } from './notification-menu';
import { cn } from '@/lib/utils';

const userAvatar = PlaceHolderImages.find((img) => img.id === 'user-avatar');

export function DashboardHeader() {
  const router = useRouter();
  const [isClient, setIsClient] = useState(false);
  const [placeholder, setPlaceholder] = useState('Search menus, orders...');
  const placeholderTexts = useMemo(
    () => ['Search menus...', 'Search orders...', 'Search customers...'],
    []
  );

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (!isClient) return;

    let textIndex = 0;
    let charIndex = 0;
    let isDeleting = false;
    let typeTimeout: NodeJS.Timeout;
    let cursorTimeout: NodeJS.Timeout;
    let showCursor = true;

    const type = () => {
      const currentText = placeholderTexts[textIndex];
      let textToShow;
      if (isDeleting) {
        textToShow = currentText.substring(0, charIndex - 1);
        charIndex--;
      } else {
        textToShow = currentText.substring(0, charIndex + 1);
        charIndex++;
      }
      // Use a functional update to get the latest state of the cursor
      setPlaceholder(textToShow + (showCursor ? '|' : ''));

      if (!isDeleting && charIndex === currentText.length) {
        isDeleting = true;
        typeTimeout = setTimeout(type, 2000); // Pause at end
      } else if (isDeleting && charIndex === 0) {
        isDeleting = false;
        textIndex = (textIndex + 1) % placeholderTexts.length;
        typeTimeout = setTimeout(type, 500); // Pause before typing new text
      } else {
        const typingSpeed = isDeleting ? 75 : 120;
        typeTimeout = setTimeout(type, typingSpeed);
      }
    };

    const blink = () => {
      showCursor = !showCursor;
      setPlaceholder((p) => {
        const baseText = p.endsWith('|') ? p.slice(0, -1) : p;
        return baseText + (showCursor ? '|' : '');
      });
      cursorTimeout = setTimeout(blink, 500);
    };

    const startTimeout = setTimeout(() => {
      // Clear initial placeholder before starting animation
      setPlaceholder('');
      type();
      blink();
    }, 1000);

    return () => {
      clearTimeout(startTimeout);
      clearTimeout(typeTimeout);
      clearTimeout(cursorTimeout);
    };
  }, [isClient, placeholderTexts]);

  const handleLogout = () => {
    localStorage.removeItem('isLoggedIn');
    router.push('/');
  };

  if (!isClient) {
    return (
      <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-card px-4 sm:px-6 lg:px-8">
        <div className="md:hidden">
          <Skeleton className="h-7 w-7" />
        </div>
        <div className="flex-1 flex items-center justify-start gap-4">
          <div className="hidden md:block">
            <Skeleton className="h-7 w-7" />
          </div>
          <Skeleton className="h-9 w-full max-w-md rounded-lg" />
          <Skeleton className="h-9 w-36 rounded-lg" />
        </div>
        <div className="flex items-center gap-4">
          <Skeleton className="h-9 w-28 rounded-md" />
          <Skeleton className="h-10 w-10 rounded-full" />
          <Skeleton className="h-10 w-10 rounded-full" />
          <Skeleton className="h-10 w-10 rounded-full" />
        </div>
      </header>
    );
  }

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-card px-4 sm:px-6 lg:px-8">
      <div className="md:hidden">
        <SidebarTrigger />
      </div>

      <div className="flex-1 flex items-center justify-start gap-4">
        <div className="hidden md:block">
          <SidebarTrigger />
        </div>
        <div className="relative w-full max-w-md hidden sm:block">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder={placeholder}
            className="w-full rounded-lg bg-background pl-10"
          />
        </div>
        
        {/* Branch Identifier - Global contextual pill */}
        <div className="flex items-center gap-2.5 px-3 py-1.5 rounded-full bg-primary/5 border border-primary/10 text-primary shadow-sm hidden lg:flex hover:bg-primary/10 transition-colors cursor-default">
          <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground">
            <Store className="h-3.5 w-3.5" />
          </div>
          <div className="flex flex-col -space-y-0.5">
            <span className="text-[9px] font-black uppercase tracking-tighter opacity-70">Active Branch</span>
            <span className="text-xs font-bold whitespace-nowrap">Bloomsbury's - Ras Al Khaimah</span>
          </div>
        </div>

        <div className="hidden xl:block">
          <PosSyncStatus />
        </div>
      </div>
      
      <div className="flex items-center gap-4">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="gap-2 text-xs font-semibold hidden md:flex">
              English (EN)
              <ChevronDown className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem>English (EN)</DropdownMenuItem>
            <DropdownMenuItem>Spanish (ES)</DropdownMenuItem>
            <DropdownMenuItem>French (FR)</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="rounded-full">
              <LayoutGrid className="h-5 w-5" />
              <span className="sr-only">Toggle apps</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="end"
            className="p-0 border-0 bg-transparent shadow-lg"
          >
            <AppSwitcher />
          </DropdownMenuContent>
        </DropdownMenu>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="rounded-full relative">
              <Bell className="h-5 w-5" />
              <span className="sr-only">Toggle notifications</span>
              <div className="absolute top-2 right-2 h-2 w-2 rounded-full bg-red-500" />
            </Button>
          </DropdownMenuTrigger>
          <NotificationMenu />
        </DropdownMenu>
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="rounded-full">
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
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>My Account</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <User className="mr-2 h-4 w-4" />
              <span>Profile</span>
            </DropdownMenuItem>
            <DropdownMenuItem>
              <CreditCard className="mr-2 h-4 w-4" />
              <span>Billing</span>
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Settings className="mr-2 h-4 w-4" />
              <span>Settings</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout}>
              <LogOut className="mr-2 h-4 w-4" />
              <span>Log out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
