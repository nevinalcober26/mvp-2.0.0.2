'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { ArrowLeft, Search, Flame, Minus, Plus, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';

// Mock Data
const menuData = {
  categories: ['Bestsellers', 'Pizza', 'Sides', 'Desserts', 'Drinks'],
  items: [
    { id: 'item-1', name: 'Pizza Margherita - 12 inches', description: 'Homemade dough, homemade pizza sauce,...', price: 36.00, category: 'Bestsellers', image: 'https://picsum.photos/seed/margherita/400/400', isCustomisable: false },
    { id: 'item-2', name: 'Chicken Alfredo Pizza - 12 inches', description: 'Homemade dough, white sauce base, marinated...', price: 48.00, category: 'Bestsellers', image: 'https://picsum.photos/seed/alfredo/400/400', isCustomisable: true },
    { id: 'item-3', name: 'Pizza Margherita - 10 inches', description: 'Homemade dough, homemade pizza sauce,...', price: 27.00, category: 'Pizza', image: 'https://picsum.photos/seed/margherita2/400/400', isCustomisable: false },
    { id: 'item-4', name: 'Hawaiian Pizza - 10 inches', description: 'Homemade dough, pizza sauce, mozzarella, ham,...', price: 32.00, category: 'Pizza', image: 'https://picsum.photos/seed/hawaiian/400/400', isCustomisable: true },
    { id: 'item-5', name: 'Soft Drink', description: 'Choose your favorite flavor.', price: 3.00, category: 'Drinks', image: 'https://picsum.photos/seed/soda/400/400', isCustomisable: true },
    { id: 'item-6', name: 'Bottled Water', description: 'Still or sparkling water.', price: 2.50, category: 'Drinks', image: 'https://picsum.photos/seed/water/400/400', isCustomisable: false },
  ]
};

const MenuItemCard = ({ item }: { item: typeof menuData.items[0] }) => {
  const [quantity, setQuantity] = useState(item.id === 'item-1' ? 1 : 0);

  return (
    <Card className="flex items-start p-3 overflow-hidden rounded-2xl shadow-sm border border-gray-100/80 bg-white">
      <div className="flex-1 pr-4">
        <h3 className="font-bold text-gray-800 leading-snug">{item.name}</h3>
        <p className="text-sm text-gray-500 mt-1">{item.description}</p>
        <p className="mt-3 text-lg font-bold text-gray-900">
          AED {item.price.toFixed(2)}
        </p>
      </div>
      <div className="relative w-28 h-28 flex-shrink-0">
        <Image src={item.image} alt={item.name} fill className="object-cover rounded-xl" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent rounded-xl" />
        <div className="absolute bottom-2 right-2 left-2">
            {quantity === 0 ? (
                 <Button 
                    className="w-full h-9 rounded-lg bg-primary/90 text-white font-bold text-sm shadow-md"
                    onClick={() => setQuantity(1)}
                >
                    Add
                </Button>
            ) : (
                <div className="flex items-center justify-between bg-white/90 rounded-lg p-1 shadow-md backdrop-blur-sm">
                    <Button size="icon" variant="ghost" className="h-7 w-7 rounded-md" onClick={() => setQuantity(q => Math.max(0, q - 1))}>
                        {quantity === 1 ? <Trash2 className="h-4 w-4 text-red-500"/> : <Minus className="h-4 w-4" />}
                    </Button>
                    <span className="font-bold text-lg text-gray-800">{quantity}</span>
                    <Button size="icon" variant="ghost" className="h-7 w-7 rounded-md" onClick={() => setQuantity(q => q + 1)}>
                        <Plus className="h-4 w-4" />
                    </Button>
                </div>
            )}
           {item.isCustomisable && (
               <p className="text-center text-white text-[10px] font-semibold mt-1">Customisable</p>
           )}
        </div>
      </div>
    </Card>
  );
};


export default function MobileMenuPage() {
  const [activeTab, setActiveTab] = useState('Drinks');
  
  const sections = menuData.categories.filter(cat => menuData.items.some(item => item.category === cat));

  return (
    <div className="bg-[#F7F9FB] min-h-screen">
      {/* Header */}
      <header className="sticky top-0 z-20 bg-[#F7F9FB]/80 backdrop-blur-lg p-4 pb-0">
        <div className="flex items-center justify-between mb-4">
          <Link href="/mobile/welcome" className="p-2 -ml-2">
            <ArrowLeft className="h-6 w-6 text-gray-800" />
          </Link>
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900">Drinks</h1>
            <p className="text-sm text-gray-500 font-medium">2 items</p>
          </div>
          <Button size="icon" variant="ghost">
            <Search className="h-6 w-6 text-gray-800" />
          </Button>
        </div>

        {/* Category Tabs */}
        <ScrollArea className="w-full whitespace-nowrap">
          <div className="flex items-center space-x-1 border-b">
            {menuData.categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveTab(cat)}
                className={cn(
                  "flex items-center gap-1.5 whitespace-nowrap px-4 py-3 text-sm font-bold transition-colors",
                  activeTab === cat
                    ? "text-primary border-b-2 border-primary"
                    : "text-gray-500 hover:text-gray-800"
                )}
              >
                {cat === 'Bestsellers' && <Flame className="h-4 w-4 text-red-500" />}
                {cat}
              </button>
            ))}
          </div>
          <ScrollBar orientation="horizontal" className="hidden" />
        </ScrollArea>
      </header>
      
      {/* Menu Items */}
      <main className="p-4 space-y-8">
        {sections.map(section => (
            <div key={section}>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">{section}</h2>
                <div className="space-y-4">
                    {menuData.items.filter(item => item.category === section).map(item => (
                        <MenuItemCard key={item.id} item={item} />
                    ))}
                </div>
            </div>
        ))}
      </main>
    </div>
  );
}
