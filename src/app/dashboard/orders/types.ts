export type OrderItem = {
  id: string;
  name: string;
  quantity: number;
  price: number;
  category: string;
};

export type Payment = {
  method: string;
  amount: string;
  date: string;
  transactionId: string;
  guestName: string;
};

export type Customer = {
  name: string;
  email: string;
  phone: string;
}

export type Order = {
  orderId: string;
  branch: 'Ras Al Khaimah' | 'Dubai Mall';
  table: string;
  orderType: 'Post-Paid' | 'Prepaid';
  orderStatus: 'Draft' | 'Open' | 'Paid' | 'Cancelled' | 'Refunded';
  paymentState: 'Unpaid' | 'Partial' | 'Fully Paid';
  totalAmount: number;
  paidAmount: number;
  items: OrderItem[];
  orderDate: string;
  staffName: string;
  orderTimestamp: number;
  payments: Payment[];
  splitType?: 'equally' | 'byItem';
  customer: Customer;
  orderComments?: string;
};
