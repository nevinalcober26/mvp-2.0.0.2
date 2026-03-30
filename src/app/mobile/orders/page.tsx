'use client';
import { useState } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Armchair, CalendarDays, Receipt } from 'lucide-react';
import { cn } from '@/lib/utils';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import Link from 'next/link';
import { useOrders } from '@/firebase';
import type { Order } from '@/app/dashboard/orders/types';
import { mockDataStore } from '@/lib/mock-data-store';

const getImageUrl = (id: string) => {
  const image = PlaceHolderImages.find(img => img.id === id);
  return image?.imageUrl || 'https://picsum.photos/seed/placeholder/100/100';
};

type OrderStatus = 'Preparing' | 'Served' | 'Completed' | 'All Orders';

const statusStyles: Record<string, { badge: string; border: string }> = {
  'Preparing': { badge: 'bg-yellow-100 text-yellow-800 border-yellow-200', border: 'border-l-4 border-yellow-400' },
  'Served': { badge: 'bg-green-100 text-green-800 border-green-200', border: 'border-l-4 border-green-400' },
  'Completed': { badge: 'bg-gray-100 text-gray-700 border-gray-200', border: 'border-l-4 border-gray-200' },
};

const OrderCard = ({ order }: { order: Order }) => {
  const { orderId, table, orderDate, items, totalAmount, orderStatus } = order;
  const style = statusStyles[orderStatus as string];
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <Link href={`/mobile/orders/${orderId.replace('#', '')}`} passHref>
      <Card className={cn('w-full rounded-2xl shadow-lg shadow-gray-200/50 border overflow-hidden cursor-pointer active:scale-[0.98] transition-transform', style?.border)}>
        <CardContent className="p-4 space-y-4">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="font-bold text-lg text-gray-900">Order {orderId}</h3>
              <div className="flex items-center gap-4 text-sm text-gray-500 mt-1">
                <span className="flex items-center gap-1.5"><Armchair className="h-4 w-4" /> Table {table}</span>
                <span className="flex items-center gap-1.5"><CalendarDays className="h-4 w-4" /> {orderDate}</span>
              </div>
            </div>
            {style && <Badge className={cn('font-bold', style.badge)}>{orderStatus}</Badge>}
          </div>
          
          {items.length > 0 && (
              <div className="flex items-center gap-2">
                  <div className="flex -space-x-4">
                      {items.slice(0,2).map(item => {
                          const product = mockDataStore.products.find(p => p.id === item.id);
                          const image = product?.mainImage || getImageUrl(item.id);
                          return <Image key={item.id} src={image} alt={item.name} width={40} height={40} className="rounded-full border-2 border-white object-cover" />
                      })}
                  </div>
                  {items.length > 2 && (
                      <div className="flex items-center justify-center h-10 w-10 rounded-full bg-gray-100 border-2 border-white text-xs font-bold text-gray-600">
                          +{items.length - 2}
                      </div>
                  )}
                  <span className="text-sm text-gray-600 ml-2">{itemCount} items</span>
              </div>
          )}

          <div className="flex justify-between items-end">
            {orderStatus === 'Completed' ? (
                <div className="w-full flex justify-between items-end">
                  <span className="text-2xl font-bold text-gray-900">${totalAmount.toFixed(2)}</span>
                  <Button variant="link" className="text-teal-600 font-bold p-0 border-b-2 border-dotted border-teal-600 rounded-none h-auto leading-none">Reorder</Button>
                </div>
            ) : (
                <div className="w-full flex justify-between items-end">
                  <div>
                      <p className="text-xs font-bold text-gray-400">TOTAL</p>
                      <span className="text-2xl font-bold text-gray-900">${totalAmount.toFixed(2)}</span>
                  </div>
                  <Button variant="outline" className="rounded-full font-bold text-teal-600 border-teal-500/50 bg-white">View Details &gt;</Button>
                </div>
            )}
          </div>
        </CardContent>
      </Card>
    </Link>
  );
};


export default function MobileOrdersPage() {
  const [activeFilter, setActiveFilter] = useState<OrderStatus>('All Orders');
  const { orders } = useOrders();
  const filters: OrderStatus[] = ['All Orders', 'Preparing', 'Served', 'Completed'];

  const filteredOrders = activeFilter === 'All Orders' 
    ? orders 
    : orders.filter(order => order.orderStatus === activeFilter);

  return (
    <div className="bg-[#F7F9FB] min-h-screen">
      <header className="sticky top-0 z-10 bg-white/80 backdrop-blur-lg p-4 pb-3">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Your Orders</h1>
        <div className="flex items-center space-x-2">
            {filters.map(filter => (
                <Button 
                    key={filter} 
                    onClick={() => setActiveFilter(filter)}
                    variant={activeFilter === filter ? 'default' : 'outline'}
                    className={cn(
                        "rounded-full font-bold",
                        activeFilter === filter 
                            ? 'bg-teal-500 text-white' 
                            : 'bg-white text-gray-700 border-gray-200'
                    )}
                >
                    {filter}
                </Button>
            ))}
        </div>
      </header>

      <main className="p-4 space-y-4">
        {filteredOrders.length > 0 ? (
          filteredOrders.map(order => (
            <OrderCard key={order.orderId} order={order} />
          ))
        ) : (
            <div className="text-center pt-20 flex flex-col items-center">
                <div className="inline-block bg-gray-200 p-5 rounded-full mb-6">
                <Receipt className="h-12 w-12 text-gray-400" />
                </div>
                <h2 className="text-xl font-bold text-gray-800">No Orders Yet</h2>
                <p className="mt-2 text-base text-gray-500 max-w-xs">Your past and current orders will appear here.</p>
                <Button asChild className="mt-6 bg-teal-500 hover:bg-teal-600 rounded-full px-6">
                    <Link href="/mobile/menu">Start Ordering</Link>
                </Button>
          </div>
        )}
      </main>
    </div>
  );
}
