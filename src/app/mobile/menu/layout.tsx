'use client';

import { Home, Receipt } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function MobileMenuLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const showNav = !pathname.startsWith('/mobile/menu/checkout') && !pathname.startsWith('/mobile/menu/payment-successful');

  return (
    <div className="relative min-h-screen w-full max-w-md mx-auto bg-white font-sans">
      <div className={showNav ? 'pb-28' : ''}>{children}</div>

      {/* Bottom Navigation */}
      {showNav && (
        <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md bg-[#F7F9FB] border-t border-gray-200/80">
          <div className="flex justify-around items-center h-20">
            <Link
              href="/mobile/menu"
              className="flex flex-col items-center gap-1 text-primary"
            >
              <Home className="h-6 w-6" />
              <span className="text-xs font-bold">Menu</span>
            </Link>
            <Link
              href="#"
              className="flex flex-col items-center gap-1 text-gray-500"
            >
              <Receipt className="h-6 w-6" />
              <span className="text-xs font-bold">Orders</span>
            </Link>
          </div>
        </nav>
      )}
    </div>
  );
}
