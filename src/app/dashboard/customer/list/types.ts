'use client';
export type Payment = {
  id: string;
  amount: number;
  tip: number;
  method: 'Credit Card' | 'Cash' | 'Online';
  status: 'Paid' | 'Failed' | 'Refunded';
  date: string;
  items?: { name: string; quantity: number }[];
};

export type Visit = {
  orderId: string;
  date: string;
  type: 'Dine-in' | 'Takeaway';
  paymentStatus: 'Paid' | 'Partial' | 'Unpaid';
  tip: number;
  isSplit: boolean;
  total: number;
  payments: Payment[];
};

export type Customer = {
  id: string;
  name: string;
  email: string;
  phone: string;
  lastVisit: string;
  totalVisits: number;
  totalSpent: number;
  avgBillValue: number;
  visits: Visit[];
};
