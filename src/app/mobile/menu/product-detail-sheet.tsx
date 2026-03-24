'use client';

import { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import { Sheet, SheetContent, SheetClose, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { X, Edit, Minus, Plus, Check } from 'lucide-react';
import gsap from 'gsap';
import { cn } from '@/lib/utils';

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
}

interface ProductDetailSheetProps {
  product: Product | null;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ProductDetailSheet({ product, isOpen, onOpenChange }: ProductDetailSheetProps) {
  const [quantity, setQuantity] = useState(1);
  const [specialRequest, setSpecialRequest] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const sheetContentRef = useRef<HTMLDivElement>(null);

  // Reset state when the sheet is opened
  useEffect(() => {
    if (isOpen) {
      setIsAdding(false);
      setQuantity(1);
      setSpecialRequest('');
      // Reset GSAP styles in case they were left from a previous animation
      if (sheetContentRef.current) {
        gsap.set(sheetContentRef.current, { clearProps: "all" });
        const sheetChildren = Array.from(sheetContentRef.current.children);
        gsap.set(sheetChildren, { clearProps: "all" });
      }
    }
  }, [isOpen]);
  
  if (!product) return null;

  const handleAddToCart = () => {
    if (isAdding) return;

    setIsAdding(true);
    
    const cartIcon = document.getElementById('floating-cart-icon');
    const sheetElement = sheetContentRef.current;

    if (cartIcon && sheetElement) {
        const cartRect = cartIcon.getBoundingClientRect();
        
        // Hide the sheet's content to make the container animation cleaner
        const sheetChildren = Array.from(sheetElement.children);
        gsap.to(sheetChildren, { opacity: 0, duration: 0.2 });

        gsap.to(sheetElement, {
            left: cartRect.left + cartRect.width / 2,
            top: cartRect.top + cartRect.height / 2,
            width: '50px',
            height: '50px',
            borderRadius: '50%',
            scale: 0.1,
            xPercent: -50,
            yPercent: -50,
            opacity: 0.5,
            duration: 0.7,
            ease: 'power2.in',
            onComplete: () => {
                // Shake the cart icon
                gsap.fromTo(cartIcon, 
                    { scale: 1.2, rotate: -10 }, 
                    { scale: 1, rotate: 0, duration: 0.6, ease: 'elastic.out(1, 0.3)' }
                );
                
                // Programmatically close the sheet
                onOpenChange(false);
            }
        });

    } else {
        // Fallback if elements not found
        setTimeout(() => {
            onOpenChange(false);
        }, 500);
    }
  }

  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      <SheetContent ref={sheetContentRef} side="bottom" className="w-full max-w-md mx-auto p-0 rounded-t-3xl border-0">
        <SheetHeader className="sr-only">
            <SheetTitle>Product: {product.name}</SheetTitle>
            <SheetDescription>
                Add special requests and select quantity for {product.name}.
            </SheetDescription>
        </SheetHeader>
        <div className="relative">
          <div className="relative h-56 w-full">
            <Image
              src={product.image}
              alt={product.name}
              fill
              className="object-cover rounded-t-3xl"
            />
          </div>
          <SheetClose asChild>
            <Button
              size="icon"
              className="absolute top-4 right-4 h-8 w-8 rounded-full bg-black/50 text-white hover:bg-black/70"
            >
              <X className="h-5 w-5" />
            </Button>
          </SheetClose>
        </div>

        <div className="p-6 space-y-4 bg-white">
          <h2 className="text-2xl font-bold text-gray-800">{product.name}</h2>
          <p className="text-gray-500 text-sm">{product.description}</p>
          <p className="text-2xl font-bold text-gray-900">
            AED {product.price.toFixed(2)} <span className="text-sm font-normal text-gray-400">(Base Price)</span>
          </p>

          <div className="p-4 bg-gray-50 rounded-xl">
            <div className="flex items-center gap-2 mb-2">
              <Edit className="h-4 w-4 text-gray-500" />
              <h3 className="font-semibold text-gray-800">Special requests</h3>
            </div>
            <p className="text-xs text-gray-500 mb-3">
              We&apos;ll pass your special request to the restaurant, and they&apos;ll do their best to follow it. However, a refund isn&apos;t available if they can&apos;t.
            </p>
            <div className="relative">
                <Textarea
                    placeholder="For example: less spicy, no sugar, etc."
                    className="bg-white"
                    maxLength={150}
                    value={specialRequest}
                    onChange={(e) => setSpecialRequest(e.target.value)}
                />
                <span className="absolute bottom-2 right-2 text-xs text-gray-400">
                    {specialRequest.length}/150
                </span>
            </div>
          </div>
        </div>
        
        <div className="sticky bottom-0 bg-white p-4 border-t shadow-[0_-4px_12px_rgba(0,0,0,0.05)]">
            <div className="flex items-center gap-4">
                <div className="flex items-center justify-between rounded-lg p-1 border w-32">
                    <Button size="icon" variant="ghost" className="h-9 w-9 text-gray-700" onClick={() => setQuantity(q => Math.max(1, q - 1))} disabled={isAdding}>
                        <Minus className="h-5 w-5" />
                    </Button>
                    <span className="font-bold text-lg text-gray-800">{quantity}</span>
                    <Button size="icon" variant="ghost" className="h-9 w-9 text-gray-700" onClick={() => setQuantity(q => q + 1)} disabled={isAdding}>
                        <Plus className="h-5 w-5" />
                    </Button>
                </div>
                <Button 
                    className="flex-1 h-12 bg-teal-500 hover:bg-teal-600 text-white font-bold text-base" 
                    onClick={handleAddToCart}
                    disabled={isAdding}
                >
                  {isAdding ? <Check className="h-5 w-5" /> : `Add • AED ${(product.price * quantity).toFixed(2)}`}
                </Button>
            </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
