'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetClose, SheetFooter } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { X, Minus, Plus, Trash2, ChevronRight, Edit, ShoppingBasket, Gift } from 'lucide-react';
import { PlaceHolderImages } from '@/lib/placeholder-images';

// Duplicating type to avoid circular dependency issues
type MenuItem = {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  isCustomisable?: boolean;
  options?: any;
};

// Helper to find image URL by ID, also duplicated
const getImageUrl = (id: string) => {
  const image = PlaceHolderImages.find(img => img.id === id);
  return image?.imageUrl || 'https://picsum.photos/seed/placeholder/400/400';
};

const upsellItems = [
    { id: 'garlic-bread', name: 'Garlic Bread Sticks', price: 8.00, image: getImageUrl('garlic-bread') },
    { id: 'lava-cake', name: 'Chocolate Lava...', price: 10.50, image: getImageUrl('lava-cake') },
];

interface CartSheetProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  cartItems: { item: MenuItem; quantity: number }[];
  onIncrement: (itemId: string) => void;
  onDecrement: (itemId: string) => void;
  onRemove: (itemId: string) => void;
}

export function CartSheet({ isOpen, onOpenChange, cartItems, onIncrement, onDecrement, onRemove }: CartSheetProps) {
  const subtotal = cartItems.reduce((sum, { item, quantity }) => sum + item.price * quantity, 0);
  const tax = subtotal * 0.05;
  const serviceCharge = subtotal * 0.10;
  
  const totalItemCount = cartItems.reduce((sum, { quantity }) => sum + quantity, 0);
  const giftIcon = PlaceHolderImages.find(img => img.id === 'gift-icon');

  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="w-full max-w-md mx-auto p-0 rounded-t-3xl border-0 bg-white flex flex-col max-h-[90vh]">
        <SheetHeader className="p-4 pt-5 border-b border-gray-200/80 bg-white rounded-t-3xl sticky top-0 z-10 shrink-0">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-teal-100 flex items-center justify-center">
                        <ShoppingBasket className="h-6 w-6 text-teal-600" />
                    </div>
                    <div>
                        <SheetTitle className="text-xl font-bold text-gray-800">Your basket</SheetTitle>
                        <SheetDescription className="text-sm text-gray-500">{totalItemCount} item{totalItemCount !== 1 ? 's' : ''}</SheetDescription>
                    </div>
                </div>
                 <div className="flex items-center gap-2">
                    <Button variant="link" className="text-teal-600 font-bold p-0 h-auto">+ Add more items</Button>
                    <SheetClose asChild>
                      <Button size="icon" variant="ghost" className="h-8 w-8 rounded-full text-gray-500">
                        <X className="h-5 w-5" />
                      </Button>
                    </SheetClose>
                 </div>
            </div>
        </SheetHeader>
        
        <div className="flex-1 overflow-y-auto bg-[#F7F9FB]">
            <div className="p-4 space-y-6">
                {/* Cart Items */}
                <div className="space-y-4">
                    {cartItems.map(({ item, quantity }) => (
                        <div key={item.id} className="flex items-center p-3 bg-white rounded-2xl shadow-sm border border-gray-100/80">
                            <Image src={item.image} alt={item.name} width={64} height={64} className="object-cover rounded-xl w-16 h-16" />
                            <div className="flex-1 px-4">
                                <h4 className="font-bold text-gray-800 text-sm leading-snug line-clamp-2">{item.name}</h4>
                                <p className="font-extrabold text-teal-600 text-base mt-1">AED {(item.price * quantity).toFixed(2)}</p>
                            </div>
                            <div className="flex items-center justify-between rounded-lg border w-28 h-10">
                                <Button size="icon" variant="ghost" className="h-full rounded-l-lg text-red-500" onClick={() => onDecrement(item.id)}>
                                    {quantity === 1 ? <Trash2 className="h-4 w-4" /> : <Minus className="h-4 w-4" />}
                                </Button>
                                <span className="font-bold text-base text-gray-800">{quantity}</span>
                                <Button size="icon" variant="ghost" className="h-full rounded-r-lg text-teal-500" onClick={() => onIncrement(item.id)}>
                                    <Plus className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                    ))}
                </div>

                {/* You might also like */}
                <div className="space-y-4 pt-4">
                    <h3 className="font-bold text-lg text-gray-800">You might also like</h3>
                    <div className="grid grid-cols-2 gap-4">
                        {upsellItems.map(item => (
                            <div key={item.id} className="bg-white rounded-2xl shadow-sm border border-gray-100/80 p-3 space-y-2">
                                <div className="flex items-start gap-2">
                                    <Image src={item.image} alt={item.name} width={40} height={40} className="rounded-md object-cover" data-ai-hint="gourmet food" />
                                    <h4 className="font-bold text-sm text-gray-800 leading-snug line-clamp-2 flex-1">{item.name}</h4>
                                </div>
                                <div className="flex items-center justify-between pt-2">
                                    <p className="font-extrabold text-teal-600">AED {item.price.toFixed(2)}</p>
                                    <Button size="icon" className="h-7 w-7 rounded-full bg-teal-500 text-white shadow-md hover:bg-teal-600">
                                        <Plus className="h-5 w-5" />
                                    </Button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="flex items-center justify-between p-4 bg-white rounded-2xl border">
                    <div className="flex items-center gap-3">
                        <Edit className="h-5 w-5 text-gray-500"/>
                        <div>
                            <p className="font-bold text-gray-800">Add a Note</p>
                            <p className="text-xs text-gray-500">Any special requests?</p>
                        </div>
                    </div>
                    <ChevronRight className="h-5 w-5 text-gray-400" />
                </div>

                <div className="flex items-center bg-white rounded-2xl border p-2 pl-4">
                    <Input placeholder="Enter discount code" className="border-0 shadow-none focus-visible:ring-0 flex-1 p-0 h-10" />
                    <Button className="bg-transparent text-teal-600 font-bold hover:bg-teal-50">Apply</Button>
                </div>
            </div>
        </div>
        
        <SheetFooter className="p-4 bg-white border-t border-gray-200/80 shadow-[0_-4px_12px_rgba(0,0,0,0.05)] space-y-4 flex-col items-stretch w-full shrink-0">
            <div className="p-4 bg-white rounded-2xl border space-y-3">
                <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-600">Subtotal</span>
                    <span className="font-semibold text-gray-800">AED {subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-600">Tax (5%)</span>
                    <span className="font-semibold text-gray-800">AED {tax.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-600">Service Charge (10%)</span>
                    <span className="font-semibold text-gray-800">AED {serviceCharge.toFixed(2)}</span>
                </div>
            </div>

            <div className="flex items-center justify-between p-3 bg-gradient-to-r from-yellow-100 to-amber-200 rounded-2xl border border-yellow-300/50">
                <div className="flex items-center gap-3">
                    <div className="relative">
                        <Gift className="h-10 w-10 text-yellow-600 opacity-20"/>
                        {giftIcon && <Image src={giftIcon.imageUrl} alt={giftIcon.description} width={24} height={24} className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" data-ai-hint={giftIcon.imageHint} />}
                    </div>
                    <div>
                        <p className="font-extrabold text-yellow-900 uppercase">Unlock VIP Perks</p>
                        <p className="text-xs text-yellow-800 font-medium">Join VIP for extra perks</p>
                    </div>
                </div>
                <Button className="rounded-full h-8 px-4 bg-yellow-400 text-yellow-900 font-bold text-xs hover:bg-yellow-500 shadow-md">Become a VIP</Button>
                <button className="self-start -mt-1 -mr-1">
                    <X className="h-4 w-4 text-yellow-900/50"/>
                </button>
            </div>

            <Button className="w-full h-14 rounded-2xl text-lg font-bold bg-teal-500 hover:bg-teal-600 shadow-lg shadow-teal-500/20">
                Proceed to Checkout
            </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
