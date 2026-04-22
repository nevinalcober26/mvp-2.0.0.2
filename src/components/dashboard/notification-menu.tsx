'use client';

import React, { useState } from 'react';
import {
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { 
  ShoppingCart, 
  Star, 
  AlertTriangle, 
  BarChart, 
  Check, 
  QrCode, 
  Search, 
  ChevronDown, 
  ChevronUp, 
  Clock, 
  Utensils, 
  Bell 
} from 'lucide-react';
import { Badge } from '../ui/badge';
import { Switch } from '../ui/switch';
import { Label } from '../ui/label';
import { Input } from '../ui/input';
import { cn } from '@/lib/utils';
import { ScrollArea } from '@/components/ui/scroll-area';

type NotificationType = 'new-order' | 'order-served' | 'table-scan' | 'review' | 'low-stock' | 'sales-summary';

interface NotificationItem {
  id: string;
  type: NotificationType;
  title: string;
  subtitle: string;
  time: string;
  read: boolean;
  expanded?: boolean;
  details?: {
    table?: string;
    orderType?: string;
    totalAmount?: string;
    paymentType?: string;
    items?: { name: string; quantity: number; price: string }[];
    specialInstructions?: string;
  };
}

const INITIAL_NOTIFICATIONS: NotificationItem[] = [
  {
    id: '1',
    type: 'new-order',
    title: 'New QR Menu Order! from Table #12',
    subtitle: 'Order #QR-8472 via Mobile QR Scan.',
    time: 'Just now',
    read: false,
    expanded: true,
    details: {
      table: 'Table #12',
      orderType: 'Dine-In (QR Menu)',
      totalAmount: '$52.50',
      paymentType: '{ Payment Type }',
      items: [
        { name: 'Margherita Pizza', quantity: 2, price: '$28.00' },
        { name: 'Caesar Salad', quantity: 1, price: '$12.50' },
        { name: 'Lemonade', quantity: 2, price: '$8.00' },
        { name: 'Tiramisu', quantity: 1, price: '$4.00' },
      ],
      specialInstructions: '"Extra cheese on pizzas, no onions in salad"',
    },
  },
  {
    id: '2',
    type: 'new-order',
    title: 'New QR Menu Order! from Table #7',
    subtitle: 'Order #QR-8473 via Mobile QR Scan.',
    time: '2 min ago',
    read: false,
    expanded: false,
  },
  {
    id: '3',
    type: 'order-served',
    title: 'Order Served: Table #8',
    subtitle: 'Order #QR-8470 delivered to customer.',
    time: '10 min ago',
    read: true,
  },
  {
    id: '4',
    type: 'table-scan',
    title: 'New Table Scan',
    subtitle: 'Table #15 accessed QR menu - browsing items.',
    time: '1 hour ago',
    read: true,
  },
  {
    id: '5',
    type: 'review',
    title: 'New 5-Star Review',
    subtitle: '"The service was incredible, Sarah was great!"',
    time: '2 hours ago',
    read: true,
  },
  {
    id: '6',
    type: 'low-stock',
    title: 'Low Stock: Chicken Breast',
    subtitle: 'Inventory levels dropping below 5kg threshold.',
    time: '3 hours ago',
    read: true,
  },
];

export function NotificationMenu() {
  const [notifications, setNotifications] = useState<NotificationItem[]>(INITIAL_NOTIFICATIONS);
  const [activeTab, setActiveTab] = useState<'all' | 'new' | 'updates'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [unreadOnly, setUnreadOnly] = useState(false);

  const toggleExpand = (id: string) => {
    setNotifications(prev => prev.map(n => 
      n.id === id ? { ...n, expanded: !n.expanded } : n
    ));
  };

  const filteredNotifications = notifications.filter(n => {
    const matchesTab = activeTab === 'all' || (activeTab === 'new' && !n.read) || (activeTab === 'updates' && n.type !== 'new-order');
    const matchesSearch = n.title.toLowerCase().includes(searchQuery.toLowerCase()) || n.subtitle.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesUnread = !unreadOnly || !n.read;
    return matchesTab && matchesSearch && matchesUnread;
  });

  const getIcon = (type: NotificationType) => {
    switch (type) {
      case 'new-order': return <Utensils className="h-4 w-4 text-teal-600" />;
      case 'order-served': return <Check className="h-4 w-4 text-green-600" />;
      case 'table-scan': return <QrCode className="h-4 w-4 text-blue-600" />;
      case 'review': return <Star className="h-4 w-4 text-yellow-600" fill="currentColor" />;
      case 'low-stock': return <AlertTriangle className="h-4 w-4 text-orange-600" />;
      case 'sales-summary': return <BarChart className="h-4 w-4 text-indigo-600" />;
    }
  };

  const getIconBg = (type: NotificationType) => {
    switch (type) {
      case 'new-order': return 'bg-teal-50';
      case 'order-served': return 'bg-green-50';
      case 'table-scan': return 'bg-blue-50';
      case 'review': return 'bg-yellow-50';
      case 'low-stock': return 'bg-orange-50';
      case 'sales-summary': return 'bg-indigo-50';
    }
  };

  return (
    <SheetContent className="sm:max-w-xl w-full p-0 flex flex-col bg-white border-l shadow-2xl">
      <div className="p-6 border-b bg-white shrink-0">
        <SheetHeader className="text-left mb-6">
          <SheetTitle className="text-xl font-bold text-gray-900">Notifications</SheetTitle>
        </SheetHeader>

        <div className="flex items-center gap-6 border-b mb-4">
          {['all', 'new', 'updates'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab as any)}
              className={cn(
                "pb-3 text-sm font-bold capitalize transition-all relative px-1",
                activeTab === tab ? "text-[#18B4A6]" : "text-gray-400 hover:text-gray-600"
              )}
            >
              {tab}
              {activeTab === tab && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#18B4A6] rounded-full" />}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input 
              placeholder="Search notifications..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-10 pl-10 bg-muted/30 border-0 rounded-xl focus-visible:ring-1 focus-visible:ring-primary/20"
            />
          </div>
          <div className="flex items-center gap-2">
            <Label htmlFor="unread-toggle" className="text-xs font-bold text-gray-400 uppercase tracking-wider">Unread only</Label>
            <Switch 
              id="unread-toggle" 
              checked={unreadOnly} 
              onCheckedChange={setUnreadOnly}
              className="data-[state=checked]:bg-[#18B4A6]" 
            />
          </div>
        </div>
      </div>

      <ScrollArea className="flex-1 bg-[#F7F9FB]">
        <div className="p-4 space-y-4 pb-20">
          {filteredNotifications.length > 0 ? (
            filteredNotifications.map((n) => (
              <div key={n.id} className="group transition-all">
                <div className="flex items-start gap-4">
                  <div className={cn("h-10 w-10 rounded-xl flex items-center justify-center shrink-0 shadow-sm", getIconBg(n.type))}>
                    {getIcon(n.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div className="space-y-0.5">
                        <h4 className="text-sm font-bold text-gray-900 leading-tight pr-8">{n.title}</h4>
                        <p className="text-xs text-gray-500 font-medium">{n.subtitle}</p>
                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mt-1">{n.time}</p>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        {!n.read && <div className="h-2 w-2 rounded-full bg-red-500 shadow-sm" />}
                        <button 
                          onClick={() => toggleExpand(n.id)}
                          className="h-8 w-8 rounded-full hover:bg-gray-100 flex items-center justify-center text-gray-300 group-hover:text-gray-600 transition-colors"
                        >
                          {n.expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                        </button>
                      </div>
                    </div>

                    {n.expanded && n.details && (
                      <div className="mt-4 animate-in fade-in slide-in-from-top-2 duration-300 space-y-4">
                        <div className="p-3 bg-orange-50 rounded-xl border border-orange-100 flex items-center gap-3">
                           <Clock className="h-4 w-4 text-orange-600" />
                           <p className="text-xs font-bold text-orange-900">Customer is waiting at table - prioritize preparation</p>
                        </div>
                        
                        <div className="p-5 bg-white rounded-2xl border border-gray-100 shadow-sm space-y-6">
                           <div className="grid grid-cols-2 gap-y-4">
                              <div className="space-y-1">
                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Table:</p>
                                <p className="text-sm font-bold text-gray-900">{n.details.table}</p>
                              </div>
                              <div className="space-y-1">
                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Order Type:</p>
                                <p className="text-sm font-bold text-gray-900">{n.details.orderType}</p>
                              </div>
                              <div className="space-y-1">
                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Total Amount:</p>
                                <p className="text-sm font-bold text-gray-900">{n.details.totalAmount}</p>
                              </div>
                              <div className="space-y-1">
                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Payment:</p>
                                <p className="text-sm font-bold text-gray-900">{n.details.paymentType}</p>
                              </div>
                           </div>

                           <div className="border-t border-dashed pt-4">
                              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3">Order Items:</p>
                              <div className="space-y-2">
                                {n.details.items?.map((item, i) => (
                                  <div key={i} className="flex justify-between items-center text-sm font-medium">
                                    <span className="text-gray-700">{item.quantity}x {item.name}</span>
                                    <span className="text-gray-900 font-bold font-mono">{item.price}</span>
                                  </div>
                                ))}
                              </div>
                           </div>

                           {n.details.specialInstructions && (
                             <div className="border-t border-dashed pt-4">
                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Special Instructions:</p>
                                <p className="text-sm italic text-gray-500">{n.details.specialInstructions}</p>
                             </div>
                           )}
                        </div>

                        <div className="flex gap-3">
                           <Button className="flex-1 h-11 bg-[#18B4A6] hover:bg-[#149d94] text-white font-bold rounded-xl shadow-lg shadow-teal-500/10">
                              Accept & Prepare
                           </Button>
                           <Button variant="outline" className="flex-1 h-11 bg-teal-50 hover:bg-teal-100 border-0 text-[#18B4A6] font-bold rounded-xl">
                              View Full Order
                           </Button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                <div className="h-px bg-gray-100/50 mt-4 mx-4 last:hidden" />
              </div>
            ))
          ) : (
            <div className="flex flex-col items-center justify-center py-20 text-center space-y-6">
              <div className="relative">
                <div className="h-24 w-24 rounded-full bg-muted/50 flex items-center justify-center">
                  <Bell className="h-12 w-12 text-gray-300" />
                </div>
                <div className="absolute -top-1 -right-1 h-8 w-8 rounded-full bg-white flex items-center justify-center shadow-sm border border-border/50">
                  <div className="h-4 w-4 rounded-full bg-teal-100 flex items-center justify-center">
                    <div className="h-2 w-2 rounded-full bg-teal-500" />
                  </div>
                </div>
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-bold text-gray-900">No new notifications</h3>
                <p className="text-sm text-gray-400 font-medium max-w-[240px] leading-relaxed">
                  You're all caught up! We'll let you know when something new comes up.
                </p>
              </div>
            </div>
          )}
        </div>
      </ScrollArea>
    </SheetContent>
  );
}
