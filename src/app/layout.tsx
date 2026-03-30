import type { Metadata } from 'next';
import './globals.css';
import { Toaster } from '@/components/ui/toaster';
import { cn } from '@/lib/utils';
import { FirebaseClientProvider, CartProvider, OrderProvider } from '@/firebase';

export const metadata: Metadata = {
  title: 'eMenu Digital Hub',
  description: 'The central hub for managing your eMenu.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=PT+Sans:ital,wght@0,400;0,700;1,400;1,700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body
        className={cn('font-body antialiased', 'min-h-screen bg-background font-sans')}
        suppressHydrationWarning
      >
        <FirebaseClientProvider>
          <CartProvider>
            <OrderProvider>
              {children}
              <Toaster />
            </OrderProvider>
          </CartProvider>
        </FirebaseClientProvider>
      </body>
    </html>
  );
}
