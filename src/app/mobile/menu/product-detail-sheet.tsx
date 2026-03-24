'use client';

import { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import { Sheet, SheetContent, SheetClose, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { X, Edit, Minus, Plus, Check } from 'lucide-react';
import gsap from 'gsap';
import { cn } from '@/lib/utils';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';

interface ProductOption {
  title: string;
  required: boolean;
  items: string[];
}

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  isCustomisable?: boolean;
  options?: ProductOption;
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
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isHeaderShrunk, setIsHeaderShrunk] = useState(false);
  
  const sheetContentRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      // Reset state when sheet opens
      setIsAdding(false);
      setQuantity(1);
      setSpecialRequest('');
      setIsHeaderShrunk(false);
      if (product?.isCustomisable && product.options?.items.length) {
        setSelectedOption(product.options.items[0]);
      } else {
        setSelectedOption(null);
      }
      // Reset GSAP styles
      if (sheetContentRef.current) {
        gsap.set(sheetContentRef.current, { clearProps: "all" });
      }
      if(scrollContainerRef.current) {
          scrollContainerRef.current.scrollTop = 0;
      }
    }
  }, [isOpen, product]);

  const handleScroll = () => {
    if (scrollContainerRef.current) {
      const { scrollTop } = scrollContainerRef.current;
      setIsHeaderShrunk(scrollTop > 150); // Shrink after scrolling 150px
    }
  };

  if (!product) return null;

  const handleAddToCart = () => {
    if (isAdding) return;
    setIsAdding(true);
    
    const cartIcon = document.getElementById('floating-cart-icon');
    const sheetElement = sheetContentRef.current;

    if (cartIcon && sheetElement) {
        gsap.to(sheetElement, {
            duration: 0.25,
            scale: 0.1,
            opacity: 0,
            borderRadius: '50%',
            x: cartIcon.getBoundingClientRect().left - sheetElement.getBoundingClientRect().left + (cartIcon.offsetWidth / 2) - (sheetElement.offsetWidth / 2),
            y: cartIcon.getBoundingClientRect().top - sheetElement.getBoundingClientRect().top + (cartIcon.offsetHeight / 2) - (sheetElement.offsetHeight / 2),
            ease: 'power2.in',
            onComplete: () => {
                gsap.fromTo(cartIcon, 
                    { scale: 1.2, rotate: -10 }, 
                    { scale: 1, rotate: 0, duration: 0.6, ease: 'elastic.out(1, 0.3)' }
                );
                onOpenChange(false);
            }
        });
    } else {
        setTimeout(() => {
            onOpenChange(false);
        }, 500);
    }
  }

  const totalPrice = product.price * quantity;
  const isAddToCartDisabled = isAdding || (product.isCustomisable && product.options?.required && !selectedOption);
  const addToCartText = isAdding 
    ? <Check className="h-5 w-5" /> 
    : isAddToCartDisabled && product.isCustomisable
    ? `Make 1 required selection - Add AED ${totalPrice.toFixed(2)}`
    : `Add • AED ${totalPrice.toFixed(2)}`;

  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      <SheetContent ref={sheetContentRef} side="bottom" className="w-full max-w-md mx-auto p-0 rounded-t-3xl border-0 bg-white overflow-hidden flex flex-col max-h-[90vh]">
        <SheetHeader className="sr-only">
            <SheetTitle>Product: {product.name}</SheetTitle>
            <SheetDescription>
                Customize and add your item to the cart.
            </SheetDescription>
        </SheetHeader>

        {/* --- Sticky Shrinkable Header --- */}
        <div className={cn(
            "sticky top-0 z-20 flex items-center justify-between p-4 bg-white border-b shadow-sm transition-opacity duration-300",
            isHeaderShrunk ? "opacity-100" : "opacity-0 pointer-events-none"
        )}>
            <div className="flex items-center gap-3">
                <Image src={product.image} alt={product.name} width={40} height={40} className="rounded-lg object-cover" />
                <h2 className="font-bold text-lg">{product.name}</h2>
            </div>
            <SheetClose asChild>
                <Button size="icon" className="h-8 w-8 rounded-full bg-gray-100 hover:bg-gray-200">
                    <X className="h-5 w-5 text-gray-600" />
                </Button>
            </SheetClose>
        </div>

        {/* --- Main Scrollable Content --- */}
        <div ref={scrollContainerRef} onScroll={handleScroll} className="flex-1 overflow-y-auto">
          {/* Large Image Header */}
          <div className="relative h-56 w-full">
            <Image
              src={product.image}
              alt={product.name}
              fill
              className="object-cover"
            />
            <SheetClose asChild>
              <Button
                size="icon"
                className={cn(
                    "absolute top-4 right-4 h-8 w-8 rounded-full bg-black/50 text-white hover:bg-black/70 transition-opacity",
                    isHeaderShrunk && "opacity-0"
                )}
              >
                <X className="h-5 w-5" />
              </Button>
            </SheetClose>
          </div>

          <div className={cn("bg-white transition-transform duration-300", isHeaderShrunk ? "-translate-y-16" : "translate-y-0")}>
            
            {product.isCustomisable ? (
                // Layout for customizable items
                <div className="space-y-4">
                    <div className="p-6 pb-2 space-y-2">
                        <div className="flex justify-between items-start">
                             <div className='flex-1'>
                                <h2 className="text-2xl font-bold text-gray-800">{product.name}</h2>
                                <p className="text-gray-500 mt-1">{product.description}</p>
                            </div>
                            <div className="w-20 h-20 relative flex-shrink-0 ml-4">
                                <Image src={product.image} alt={product.name} fill className="object-cover rounded-xl" />
                            </div>
                        </div>
                        <p className="text-xl font-bold text-gray-900 pt-2">
                            AED {product.price.toFixed(2)}
                            <span className="text-base text-gray-500 font-normal ml-1">(Base Price)</span>
                        </p>
                    </div>

                    <div className="bg-gray-50/70 px-6 py-4 space-y-4 border-y">
                        {product.options && (
                             <Card className="shadow-sm bg-white rounded-2xl">
                                <CardHeader className="pb-4">
                                    <div className="flex items-center justify-between">
                                        <h3 className="font-bold text-lg text-gray-800">{product.options.title}</h3>
                                    </div>
                                    <p className="text-sm text-gray-500">Select one option <span className="text-red-500 font-semibold">(Required)</span></p>
                                </CardHeader>
                                <CardContent>
                                    <RadioGroup value={selectedOption ?? ''} onValueChange={setSelectedOption}>
                                        <div className="space-y-4">
                                            {product.options.items.map((item) => (
                                            <div key={item} className="flex items-center justify-between border-b last:border-b-0 border-dashed pb-4 last:pb-0">
                                                <Label htmlFor={`opt-${item}`} className="text-base font-medium text-gray-700 flex-1 cursor-pointer">{item}</Label>
                                                <RadioGroupItem value={item} id={`opt-${item}`} className="h-5 w-5 text-teal-500 border-gray-300 data-[state=checked]:border-teal-500" />
                                            </div>
                                            ))}
                                        </div>
                                    </RadioGroup>
                                </CardContent>
                            </Card>
                        )}
                        <Card className="shadow-sm bg-white rounded-2xl">
                           <CardHeader className="pb-3">
                               <div className="flex items-center gap-2">
                                   <Edit className="h-4 w-4 text-gray-500" />
                                   <h3 className="font-semibold text-gray-800">Special requests</h3>
                               </div>
                           </CardHeader>
                           <CardContent className="space-y-3">
                                <p className="text-xs text-gray-500">
                                   We&apos;ll pass your special request to the restaurant, and they&apos;ll do their best to follow it. However, a refund isn&apos;t available if they can&apos;t.
                               </p>
                               <div className="relative">
                                   <Textarea
                                       placeholder="For example: less spicy, no sugar, etc."
                                       className="bg-gray-50"
                                       maxLength={150}
                                       value={specialRequest}
                                       onChange={(e) => setSpecialRequest(e.target.value)}
                                   />
                                   <span className="absolute bottom-2 right-2 text-xs text-gray-400">
                                       {specialRequest.length}/150
                                   </span>
                               </div>
                           </CardContent>
                        </Card>
                    </div>

                </div>
            ) : (
                // Layout for standard items
                <div className="p-6 pt-4 space-y-6">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-800">{product.name}</h2>
                        <p className="text-gray-500 mt-1">{product.description}</p>
                        <p className="text-2xl font-bold text-gray-900 mt-2">
                            AED {product.price.toFixed(2)}
                        </p>
                    </div>

                     <Card className="shadow-sm bg-white rounded-2xl">
                       <CardHeader className="pb-3">
                           <div className="flex items-center gap-2">
                               <Edit className="h-4 w-4 text-gray-500" />
                               <h3 className="font-semibold text-gray-800">Special requests</h3>
                           </div>
                       </CardHeader>
                       <CardContent className="space-y-3">
                            <p className="text-xs text-gray-500">
                               We&apos;ll pass your special request to the restaurant, and they&apos;ll do their best to follow it. However, a refund isn&apos;t available if they can&apos;t.
                           </p>
                           <div className="relative">
                               <Textarea
                                   placeholder="For example: less spicy, no sugar, etc."
                                   className="bg-gray-50"
                                   maxLength={150}
                                   value={specialRequest}
                                   onChange={(e) => setSpecialRequest(e.target.value)}
                               />
                               <span className="absolute bottom-2 right-2 text-xs text-gray-400">
                                   {specialRequest.length}/150
                               </span>
                           </div>
                       </CardContent>
                    </Card>
                </div>
            )}
          </div>
        </div>
        
        {/* --- Footer with Stepper and Add to Cart --- */}
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
                    className={cn(
                        "flex-1 h-12 text-white font-bold text-base transition-colors",
                        isAddToCartDisabled ? "bg-gray-300" : "bg-teal-500 hover:bg-teal-600"
                    )}
                    onClick={handleAddToCart}
                    disabled={isAddToCartDisabled}
                >
                    {addToCartText}
                </Button>
            </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
