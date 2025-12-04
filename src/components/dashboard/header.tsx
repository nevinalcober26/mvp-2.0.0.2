'use client';
import Image from 'next/image';
import {
  Bell,
  Search,
  User,
  CreditCard,
  LogOut,
  Settings,
  LayoutGrid,
  ChevronDown,
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

const userAvatar = PlaceHolderImages.find((img) => img.id === 'user-avatar');

export function DashboardHeader() {
  return (
    <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b bg-card px-4 sm:px-6 lg:px-8">
      <div className="md:hidden">
        <SidebarTrigger />
      </div>

      <div className="flex-1 flex justify-end">
        <div className="relative w-full max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search menus, orders..."
            className="w-full rounded-lg bg-secondary pl-10"
          />
        </div>
      </div>
      <div className="flex items-center gap-4">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="gap-2">
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

        <Button variant="ghost" size="icon" className="rounded-full">
          <LayoutGrid className="h-5 w-5" />
          <span className="sr-only">Toggle apps</span>
        </Button>
        <div className="relative">
          <Button variant="ghost" size="icon" className="rounded-full">
            <Bell className="h-5 w-5" />
            <span className="sr-only">Toggle notifications</span>
          </Button>
          <div className="absolute top-1 right-1 h-2 w-2 rounded-full bg-red-500" />
        </div>
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
            <DropdownMenuItem>
              <LogOut className="mr-2 h-4 w-4" />
              <span>Log out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
