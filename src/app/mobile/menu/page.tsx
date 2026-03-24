'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { ArrowLeft, Search, Flame, Minus, Plus, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { ProductDetailSheet } from './product-detail-sheet';

// Helper to find image URL by ID
const getImageUrl = (id: string) => {
  const image = PlaceHolderImages.find(img => img.id === id);
  return image?.imageUrl || 'https://picsum.photos/seed/placeholder/400/400';
};

// Mock Data - Adjusted to match design
const menuData = {
  categories: ['Bestsellers', 'Pizza', 'Sides', 'Desserts', 'Drinks'],
  items: [
    { id: 'item-1', name: 'Pizza Margherita - 12 inches', description: 'Homemade dough, homemade pizza sauce, shredded mozzarella cheese, and shredded cheddar cheese.', price: 36.00, category: 'Bestsellers', image: getImageUrl('pizza-margherita'), isCustomisable: false },
    { id: 'item-2', name: 'Chicken Alfredo Pizza - 12 inches', description: 'Homemade dough, white sauce base, marinated...', price: 48.00, category: 'Bestsellers', image: getImageUrl('pizza-alfredo'), isCustomisable: true },
    { id: 'item-3', name: 'Pizza Margherita - 10 inches', description: 'Homemade dough, homemade pizza sauce, shredded mozzarella cheese, and shredded cheddar cheese.', price: 27.00, category: 'Pizza', image: getImageUrl('pizza-margherita'), isCustomisable: false },
    { id: 'item-4', name: 'Hawaiian Pizza - 10 inches', description: 'Homemade dough, pizza sauce, mozzarella, ham,...', price: 32.00, category: 'Pizza', image: getImageUrl('pizza-hawaiian'), isCustomisable: true },
    { id: 'item-5', name: 'Soft Drink', description: 'Choose your favorite flavor.', price: 3.00, category: 'Drinks', image: getImageUrl('soft-drink'), isCustomisable: true, options: { title: 'Flavor', required: true, items: ['Coke', 'Diet Coke', 'Sprite', 'Fanta'] } },
    { id: 'item-6', name: 'Bottled Water', description: 'Still or sparkling water.', price: 2.50, category: 'Drinks', image: getImageUrl('bottled-water'), isCustomisable: false },
  ]
};

type MenuItem = typeof menuData.items[0];

const MenuItemCard = ({ 
  item, 
  onAdd,
  quantity,
  onIncrement,
  onDecrement,
}: { 
  item: MenuItem; 
  onAdd: (item: MenuItem) => void; 
  quantity: number;
  onIncrement: (itemId: string) => void;
  onDecrement: (itemId: string) => void;
}) => {

  const handleAddClick = () => {
    onAdd(item);
  };

  if (quantity > 0) {
    return (
      <div className="flex items-start p-3 bg-white rounded-2xl shadow-sm border border-gray-100/80">
        <div className="flex-1 pr-3">
          <h3 className="font-bold text-gray-800 leading-snug">{item.name}</h3>
          <p className="text-sm text-gray-500 mt-1 line-clamp-2">{item.description}</p>
          <div className="flex items-center mt-3">
            <span className="font-extrabold text-gray-900 text-lg">AED {(item.price * quantity).toFixed(2)}</span>
          </div>
        </div>
        <div className="relative w-28 h-28 flex-shrink-0">
          <Image src={item.image} alt={item.name} fill className="object-cover rounded-xl" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent rounded-xl" />
          <div className="absolute bottom-2 right-2 left-2 flex flex-col items-center">
            <div className="flex items-center justify-around w-full h-9 rounded-lg bg-white font-bold text-sm shadow-md">
              <Button size="icon" variant="ghost" className="h-full rounded-l-lg text-red-500" onClick={() => onDecrement(item.id)}>
                {quantity === 1 ? <Trash2 className="h-5 w-5" /> : <Minus className="h-5 w-5" />}
              </Button>
              <span className="font-bold text-lg text-gray-800">{quantity}</span>
              <Button size="icon" variant="ghost" className="h-full rounded-r-lg text-teal-500" onClick={() => onIncrement(item.id)}>
                <Plus className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-start p-3 bg-white rounded-2xl shadow-sm border border-gray-100/80">
      <div className="flex-1 pr-3">
        <h3 className="font-bold text-gray-800 leading-snug">{item.name}</h3>
        <p className="text-sm text-gray-500 mt-1 line-clamp-2">{item.description}</p>
        <div className="flex items-center mt-3">
          <span className="font-extrabold text-gray-900 text-lg">AED {item.price.toFixed(2)}</span>
        </div>
      </div>
      <div className="relative w-28 h-28 flex-shrink-0">
        <Image src={item.image} alt={item.name} fill className="object-cover rounded-xl" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent rounded-xl" />
        <div className="absolute bottom-2 right-2 left-2 flex flex-col items-center">
            <Button 
                className="w-full h-9 rounded-lg bg-teal-500 text-white font-bold text-sm shadow-md hover:bg-teal-600"
                onClick={handleAddClick}
            >
                Add
            </Button>
           {item.isCustomisable && (
               <p className="text-center text-white text-[10px] font-semibold mt-1">Customisable</p>
           )}
        </div>
      </div>
    </div>
  );
};


export default function MobileMenuPage() {
  const [activeTab, setActiveTab] = useState('Bestsellers');
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [cart, setCart] = useState<Record<string, number>>({});
  
  const sections = ['Bestsellers', 'Pizza', 'Drinks'];

  const handleAddToCart = (item: MenuItem, quantity: number) => {
    setCart(prevCart => ({
      ...prevCart,
      [item.id]: (prevCart[item.id] || 0) + quantity
    }));
  };

  const handleIncrement = (itemId: string) => {
    setCart(prevCart => ({
      ...prevCart,
      [itemId]: (prevCart[itemId] || 0) + 1
    }));
  };
  
  const handleDecrement = (itemId: string) => {
    setCart(prevCart => {
      const newQuantity = (prevCart[itemId] || 0) - 1;
      if (newQuantity <= 0) {
        const { [itemId]: _, ...rest } = prevCart;
        return rest;
      }
      return {
        ...prevCart,
        [itemId]: newQuantity
      };
    });
  };

  const handleAddClick = (item: MenuItem) => {
    if (item.isCustomisable) {
      setSelectedItem(item);
      setIsSheetOpen(true);
    } else {
      handleIncrement(item.id);
    }
  };

  return (
    <>
      <div className="bg-[#F7F9FB] min-h-screen">
        {/* Header */}
        <header className="sticky top-0 z-20 bg-white/80 backdrop-blur-lg p-4 pb-0">
          <div className="flex items-center justify-between mb-4">
            <Link href="/mobile/welcome" className="p-2 -ml-2">
              <ArrowLeft className="h-6 w-6 text-gray-800" />
            </Link>
            <div className="text-center">
              <h1 className="text-xl font-bold text-gray-900">Drinks</h1>
              <p className="text-sm text-teal-600 font-medium">2 items</p>
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
                    "flex items-center gap-1.5 whitespace-nowrap px-4 py-3 text-sm font-bold transition-colors relative",
                    activeTab === cat
                      ? "text-teal-600"
                      : "text-gray-500 hover:text-gray-800"
                  )}
                >
                  {cat === 'Bestsellers' && <Flame className="h-4 w-4 text-red-500" />}
                  {cat}
                  {activeTab === cat && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-teal-500 rounded-full" />}
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
                          <MenuItemCard 
                            key={item.id} 
                            item={item} 
                            onAdd={handleAddClick}
                            quantity={cart[item.id] || 0}
                            onIncrement={handleIncrement}
                            onDecrement={handleDecrement}
                          />
                      ))}
                  </div>
              </div>
          ))}
        </main>
      </div>
      <ProductDetailSheet 
        product={selectedItem}
        isOpen={isSheetOpen}
        onOpenChange={setIsSheetOpen}
        onAddToCart={(quantity) => selectedItem && handleAddToCart(selectedItem, quantity)}
      />
    </>
  );
}
