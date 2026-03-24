import { Menu, ShoppingBag, ShoppingCart } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export default function MobileMenuLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative min-h-screen w-full max-w-md mx-auto bg-white font-sans">
      <div className="pb-28">{children}</div>

      {/* Floating Cart Button */}
      <div className="absolute bottom-20 right-6 z-20">
        <Link href="#">
            <div className="relative">
                <Button
                    size="icon"
                    className="rounded-full w-16 h-16 bg-red-500 hover:bg-red-600 shadow-lg"
                >
                    <ShoppingCart className="h-8 w-8" />
                </Button>
                <Badge className="absolute -top-1 -right-1 w-6 h-6 flex items-center justify-center bg-gray-800 text-white rounded-full border-2 border-red-500">
                    1
                </Badge>
            </div>
        </Link>
      </div>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md bg-[#F7F9FB] border-t border-gray-200/80">
        <div className="flex justify-around items-center h-20">
          <Link href="/mobile/menu" className="flex flex-col items-center gap-1 text-primary">
            <Menu className="h-6 w-6" />
            <span className="text-xs font-bold">Menu</span>
          </Link>
          <Link href="#" className="flex flex-col items-center gap-1 text-gray-500">
            <ShoppingBag className="h-6 w-6" />
            <span className="text-xs font-bold">Orders</span>
          </Link>
        </div>
      </nav>
    </div>
  );
}
