'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { ArrowLeft, Search, Flame, Minus, Plus, Trash2, ShoppingCart, Loader2, Lock } from 'lucide-react';
import { cn } from '@/lib/utils';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { ProductDetailSheet } from './product-detail-sheet';
import { CartSheet } from './cart-sheet';
import { Card } from '@/components/ui/card';
import { PaymentSheet } from './payment-sheet';
import { VipClubSheet } from './vip-club-sheet';
import { useToast } from '@/hooks/use-toast';
import gsap from 'gsap';
import { SearchSheet } from './search-sheet';
import { useCart } from '@/firebase';

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
    { id: 'item-4', name: 'Hawaiian Pizza - 10 inches', description: 'Homemade dough, pizza sauce, mozzarella, ham,...', price: 32.00, category: 'Pizza', image: getImageUrl('pizza-hawaiian'), isCustomisable: true, options: { title: 'Crust', required: true, items: ['Regular', 'Thin', 'Stuffed'] } },
    { id: 'item-5', name: 'Soft Drink', description: 'Choose your favorite flavor.', price: 3.00, category: 'Drinks', image: getImageUrl('soft-drink'), isCustomisable: true, options: { title: 'Flavor', required: true, items: ['Coke', 'Diet Coke', 'Sprite', 'Fanta'] } },
    { id: 'item-6', name: 'Bottled Water', description: 'Still or sparkling water.', price: 2.50, category: 'Drinks', image: getImageUrl('bottled-water'), isCustomisable: false },
    { id: 'item-7', name: 'Red Velvet Cupcake', description: 'A rich and moist cupcake with a hint of cocoa, topped with cream cheese frosting.', price: 15.00, category: 'Desserts', image: getImageUrl('red-velvet-cupcake'), isCustomisable: false },
    { id: 'item-8', name: 'French Fries', description: 'Crispy golden french fries.', price: 10.00, category: 'Sides', image: getImageUrl('french-fries'), isCustomisable: false },
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

const PaymentRedirectContent = ({ totalAmount }: { totalAmount: number }) => (
    <div className="fixed inset-0 z-50 flex flex-col min-h-screen w-full max-w-md mx-auto bg-[#F7F9FB] justify-center items-center text-center p-8">
      <div className="space-y-6">
        <div className="relative w-24 h-24 mx-auto">
          <div className="absolute inset-0 border-4 border-gray-200 rounded-full"></div>
          <Loader2 className="w-full h-full text-blue-500 animate-spin" style={{ animationDuration: '1.5s' }} />
        </div>
        <div className="space-y-1">
          <h2 className="text-2xl font-bold text-gray-800">Redirecting to Payment</h2>
          <p className="text-gray-500">Please wait a moment...</p>
        </div>

        <div className="w-full max-w-sm mx-auto bg-white rounded-2xl p-5 space-y-4 border border-gray-200/80 shadow-sm">
          <div className="flex justify-between items-center text-left">
            <span className="text-sm text-gray-500">Amount</span>
            <span className="text-lg font-bold text-gray-800 font-mono">AED {totalAmount.toFixed(2)}</span>
          </div>
          <div className="border-t border-dashed border-gray-200" />
          <div className="flex items-center gap-3 text-left">
            <div className="h-10 w-10 rounded-full bg-blue-50 flex items-center justify-center border border-blue-200">
                <Loader2 className="h-5 w-5 text-blue-500 animate-spin"/>
            </div>
            <div>
                <p className="font-semibold text-gray-800">Connecting to payment gateway</p>
                <p className="text-sm text-gray-500">Network International</p>
            </div>
          </div>
        </div>
      </div>

      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-2 text-sm text-gray-400">
          <Lock className="h-4 w-4" />
          <span>Secure payment</span>
      </div>
    </div>
);


export default function MobileMenuPage() {
  const router = useRouter();
  const { toast } = useToast();
  const { cart, addToCart, incrementItem, decrementItem } = useCart();
  
  const sections = useMemo(() => {
    return menuData.categories;
  }, []);
  
  const [activeTab, setActiveTab] = useState(sections[0] || '');
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [isCartAnimating, setIsCartAnimating] = useState(false);
  const [isCartSheetOpen, setIsCartSheetOpen] = useState(false);
  const [isPaymentSheetOpen, setIsPaymentSheetOpen] = useState(false);
  const [isVipSheetOpen, setIsVipSheetOpen] = useState(false);
  const [selectedTip, setSelectedTip] = useState<number | 'custom' | null>(4);
  const [isRedirecting, setIsRedirecting] = useState(false);
  const [isVip, setIsVip] = useState(false);
  const [isSignupAndPay, setIsSignupAndPay] = useState(false);
  const [isSearchSheetOpen, setIsSearchSheetOpen] = useState(false);

  useEffect(() => {
    setIsVip(localStorage.getItem('isVip') === 'true');
  }, []);
  
  const sectionRefs = useRef<{[key: string]: HTMLElement | null}>({});
  const tabRefs = useRef<{[key: string]: HTMLButtonElement | null}>({});
  const isTabClickScrolling = useRef(false);
  
  const prevCartTotalRef = useRef(0);
  
  const cartItemsForSheet = useMemo(() => {
    return Object.entries(cart)
      .map(([id, quantity]) => {
        const item = menuData.items.find(i => i.id === id);
        return item ? { item, quantity } : null;
      })
      .filter((i): i is { item: MenuItem; quantity: number } => i !== null);
  }, [cart]);

  const subtotal = useMemo(() => cartItemsForSheet.reduce((sum, { item, quantity }) => sum + item.price * quantity, 0), [cartItemsForSheet]);
  const tax = useMemo(() => subtotal * 0.05, [subtotal]);
  const serviceCharge = useMemo(() => subtotal * 0.10, [subtotal]);
  const tipAmount = typeof selectedTip === 'number' ? selectedTip : 0;
  const total = subtotal + tax + serviceCharge + tipAmount;
  
  const totalItemsInCart = useMemo(() => {
    return Object.values(cart).reduce((sum, quantity) => sum + quantity, 0);
  }, [cart]);
  
  useEffect(() => {
    if (totalItemsInCart > prevCartTotalRef.current) {
        setIsCartAnimating(true);
    }
    prevCartTotalRef.current = totalItemsInCart;
  }, [totalItemsInCart]);

  useEffect(() => {
    if (isCartAnimating) {
        const timer = setTimeout(() => setIsCartAnimating(false), 500); // Corresponds to animation duration
        return () => clearTimeout(timer);
    }
  }, [isCartAnimating]);

  const observerRef = useRef<IntersectionObserver | null>(null);

  useEffect(() => {
    if (observerRef.current) {
      observerRef.current.disconnect();
    }
  
    observerRef.current = new IntersectionObserver(
      (entries) => {
        if (isTabClickScrolling.current) return;
        
        const visibleEntries = entries.filter((entry) => entry.isIntersecting);
        if (visibleEntries.length > 0) {
          const topEntry = visibleEntries.reduce((prev, current) => {
            return prev.boundingClientRect.top < current.boundingClientRect.top ? prev : current;
          });
          setActiveTab(topEntry.target.id);
        }
      },
      {
        rootMargin: "-120px 0px -40% 0px",
        threshold: 0,
      }
    );
  
    const currentObserver = observerRef.current;
    const currentRefs = sectionRefs.current;
    Object.values(currentRefs).forEach(ref => {
      if (ref) currentObserver.observe(ref);
    });
  
    return () => {
      currentObserver.disconnect();
    };
  }, []); // Re-run only once on mount
  
  useEffect(() => {
    if (isTabClickScrolling.current) return;
    
    const activeTabElement = tabRefs.current[activeTab];
    if (activeTabElement) {
      activeTabElement.scrollIntoView({
        behavior: 'smooth',
        inline: 'center',
        block: 'nearest'
      });
    }
  }, [activeTab]);

  const handleTabClick = (tab: string) => {
    isTabClickScrolling.current = true;
    setActiveTab(tab);
    const element = sectionRefs.current[tab];
    if (element) {
        const header = document.querySelector('header');
        const headerHeight = header ? header.offsetHeight : 0;
        const elementPosition = element.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.scrollY - headerHeight;

        window.scrollTo({
            top: offsetPosition,
            behavior: 'smooth'
        });

        setTimeout(() => {
            isTabClickScrolling.current = false;
        }, 1000); 
    } else {
        isTabClickScrolling.current = false;
    }
  };
  
  const handleAddToCart = (item: MenuItem, quantity: number) => {
    const cartIcon = document.getElementById('floating-cart-icon');
    if (cartIcon) {
        cartIcon.classList.remove('animate-in', 'zoom-in-95');
        void cartIcon.offsetWidth; // Trigger reflow
        cartIcon.classList.add('animate-in', 'zoom-in-95');
    }
    addToCart(item.id, quantity);
  };

  const handleIncrement = (itemId: string) => {
    incrementItem(itemId);
  };
  
  const handleDecrement = (itemId: string) => {
    decrementItem(itemId);
  };

  const handleAddClick = (item: MenuItem) => {
    setSelectedItem(item);
    setIsSheetOpen(true);
  };

  const handleCheckout = () => {
    setIsCartSheetOpen(false);
    // Add a small delay to allow the cart sheet to animate out before the payment sheet animates in
    setTimeout(() => {
        setIsPaymentSheetOpen(true);
    }, 300);
  };

  const handleBackToCart = () => {
    setIsPaymentSheetOpen(false);
    setIsCartSheetOpen(true);
  };

  const handleInitiateVipSignup = () => {
    setIsPaymentSheetOpen(false);
    if (isVip) {
      setIsRedirecting(true);
      setTimeout(() => {
        router.push(`/mobile/menu/checkout?total=${total}`);
      }, 1500);
    } else {
      setIsVipSheetOpen(true);
    }
  };

  const handleVipSignupAndPay = () => {
    setIsVipSheetOpen(false);
    setIsSignupAndPay(true);
  };
  
  useEffect(() => {
    if (isSignupAndPay) {
      toast({
        title: "You're In!",
        description: "You're now part of our VIP Dining circle.",
      });

      localStorage.setItem('isVip', 'true');
      setIsVip(true);

      const timer = setTimeout(() => {
        setIsRedirecting(true);
        const redirectTimer = setTimeout(() => {
          router.push(`/mobile/menu/checkout?total=${total}`);
        }, 1500);
        return () => clearTimeout(redirectTimer);
      }, 3000);

      return () => {
        clearTimeout(timer);
      };
    }
  }, [isSignupAndPay, router, total, toast]);

  const handleBecomeVip = () => {
    setIsCartSheetOpen(false);
    setTimeout(() => {
      setIsVipSheetOpen(true);
    }, 300);
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
            <Button size="icon" variant="ghost" onClick={() => setIsSearchSheetOpen(true)}>
              <Search className="h-6 w-6 text-gray-800" />
            </Button>
          </div>

          {/* Category Tabs */}
          <ScrollArea className="w-full whitespace-nowrap">
            <div className="flex items-center space-x-1 border-b">
              {sections.map((cat) => (
                <button
                  key={cat}
                  ref={(el) => (tabRefs.current[cat] = el)}
                  onClick={() => handleTabClick(cat)}
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
          {sections.map(section => {
              const itemsForSection = menuData.items.filter(item => item.category === section);
              return (
                  <div 
                    key={section} 
                    id={section}
                    ref={(el) => (sectionRefs.current[section] = el)}
                  >
                      <h2 className="text-2xl font-bold text-gray-900 mb-4">{section}</h2>
                      <div className="space-y-4">
                          {itemsForSection.length > 0 ? (
                            itemsForSection.map(item => (
                              <MenuItemCard 
                                key={item.id} 
                                item={item} 
                                onAdd={() => handleAddClick(item)}
                                quantity={cart[item.id] || 0}
                                onIncrement={handleIncrement}
                                onDecrement={handleDecrement}
                              />
                            ))
                          ) : (
                            <Card className="flex flex-col items-center justify-center p-8 text-center text-muted-foreground bg-white rounded-2xl shadow-sm border border-gray-100/80">
                                <p className="font-semibold">No items available in this category yet.</p>
                                <p className="text-sm mt-1">Please check back later!</p>
                            </Card>
                          )}
                      </div>
                  </div>
              );
          })}
        </main>

        {totalItemsInCart > 0 && (
          <div id="floating-cart-icon" className="fixed bottom-24 right-6 z-20 animate-in fade-in zoom-in-95">
            <button onClick={() => setIsCartSheetOpen(true)}>
              <div className="relative">
                <div
                  className={cn(
                    "rounded-full w-16 h-16 bg-red-500 hover:bg-red-600 shadow-lg flex items-center justify-center",
                    isCartAnimating && "animate-pulse-once"
                  )}
                >
                  <ShoppingCart className="h-8 w-8 text-white" />
                </div>
                <Badge className="absolute -top-1 -right-1 w-6 h-6 flex items-center justify-center bg-gray-800 text-white rounded-full border-2 border-red-500">
                  {totalItemsInCart}
                </Badge>
              </div>
            </button>
          </div>
        )}
      </div>
      {isRedirecting && <PaymentRedirectContent totalAmount={total} />}
      <ProductDetailSheet 
        product={selectedItem}
        isOpen={isSheetOpen}
        onOpenChange={setIsSheetOpen}
        onAddToCart={(quantity) => selectedItem && handleAddToCart(selectedItem, quantity)}
      />
      <CartSheet
        isOpen={isCartSheetOpen}
        onOpenChange={setIsCartSheetOpen}
        cartItems={cartItemsForSheet}
        onIncrement={handleIncrement}
        onDecrement={handleDecrement}
        onRemove={handleDecrement}
        onCheckout={handleCheckout}
        onBecomeVip={handleBecomeVip}
      />
      <PaymentSheet
        isOpen={isPaymentSheetOpen}
        onOpenChange={setIsPaymentSheetOpen}
        subtotal={subtotal}
        tax={tax}
        serviceCharge={serviceCharge}
        onBack={handleBackToCart}
        onPayNow={handleInitiateVipSignup}
        selectedTip={selectedTip}
        onTipChange={setSelectedTip}
      />
      <SearchSheet 
        isOpen={isSearchSheetOpen}
        onOpenChange={setIsSearchSheetOpen}
      />
      {!isVip && (
        <VipClubSheet
          isOpen={isVipSheetOpen}
          onOpenChange={setIsVipSheetOpen}
          onSignup={handleVipSignupAndPay}
        />
      )}
    </>
  );
}
