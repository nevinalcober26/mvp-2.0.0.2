'use client';

import type { Order, OrderItem } from './types';

export const generateMockOrders = (count: number): Order[] => {
  const statuses: Order['orderStatus'][] = [
    'Paid',
    'Open',
    'Draft',
    'Cancelled',
    'Refunded',
  ];
  const paymentStates: Order['paymentState'][] = [
    'Fully Paid',
    'Partial',
    'Unpaid',
  ];
  const branches: Order['branch'][] = ['Ras Al Khaimah', 'Dubai Mall'];
  const staffNames = ['Alex', 'Maria', 'John', 'Sarah', 'David'];
  const customerNames = ['Alice', 'Bob', 'Charlie', 'Diana', 'Eve', 'Frank', 'Grace', 'Henry'];
  const comments = [
    'Customer requested extra napkins.',
    'Allergy alert: No nuts.',
    'Birthday celebration at the table.',
    null,
    'Guest is in a hurry.',
  ];

  const menuItems = [
    { id: '1', name: 'Classic Pancakes', price: 12.5, category: 'Breakfast' },
    { id: '2', name: 'Orange Juice', price: 5.0, category: 'Beverages' },
    { id: '3', name: 'Espresso', price: 3.5, category: 'Beverages' },
    { id: '4', name: 'Avocado Toast', price: 15.0, category: 'Breakfast' },
    { id: '5', name: 'Latte', price: 5.5, category: 'Beverages' },
    { id: '6', name: 'Ribeye Steak', price: 45.0, category: 'Mains' },
    { id: '7', name: 'Margherita Pizza', price: 20.0, category: 'Mains' },
    { id: '8', name: 'Cheesecake', price: 8.9, category: 'Desserts' },
  ];

  const orders: Order[] = [];
  for (let i = 0; i < count; i++) {
    const orderStatus = statuses[i % statuses.length];
    const orderType = i % 2 === 0 ? 'Post-Paid' : 'Prepaid';
    const staffName = staffNames[i % staffNames.length];

    let paymentState = paymentStates[i % paymentStates.length];
    if (orderStatus === 'Paid') paymentState = 'Fully Paid';
    if (
      orderStatus === 'Cancelled' ||
      orderStatus === 'Draft' ||
      orderStatus === 'Refunded'
    )
      paymentState = 'Unpaid';
    if (orderStatus === 'Open' && paymentState === 'Fully Paid')
      paymentState = 'Partial';

    const orderItemsCount = Math.floor(Math.random() * 3) + 1;
    const currentItems: OrderItem[] = Array.from({ length: orderItemsCount }, (_, j) => {
      const item = menuItems[Math.floor(Math.random() * menuItems.length)];
      return {
        id: `${item.id}-${i}-${j}`,
        name: item.name,
        quantity: Math.floor(Math.random() * 2) + 1,
        price: item.price,
        category: item.category,
      };
    });

    const totalAmount = currentItems.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );
    
    let paidAmount = 0;
    const payments: Order['payments'] = [];
    let splitType: Order['splitType'] | undefined = undefined;

    if (paymentState === 'Fully Paid') {
      paidAmount = totalAmount;
       payments.push({
        method: orderType === 'Post-Paid' ? 'Credit Card' : (i % 3 === 0 ? 'Cash' : 'Credit Card'),
        amount: paidAmount.toFixed(2),
        date: new Date(Date.now() - i * 3600000 + 120000).toLocaleString(),
        transactionId: `txn_${12345 + i}`,
        guestName: 'Guest 1',
      });
    } else if (paymentState === 'Partial') {
      splitType = i % 2 === 0 ? 'equally' : 'byItem';
      const numSplits = Math.floor(Math.random() * 2) + 2; // 2 or 3 splits
      let totalPaid = totalAmount * (Math.random() * 0.5 + 0.2); // Pay 20% to 70%
      paidAmount = totalPaid;
      let remainingToDistribute = totalPaid;

      for (let j = 0; j < numSplits; j++) {
        let splitAmount: number;
        if (j === numSplits - 1) {
          splitAmount = remainingToDistribute;
        } else {
          splitAmount = remainingToDistribute / (numSplits - j) * (Math.random() * 0.5 + 0.5);
        }
        
        splitAmount = Math.max(0, splitAmount);
        remainingToDistribute -= splitAmount;

        let methodForSplit: 'Credit Card' | 'Cash';
        if (orderType === 'Post-Paid') {
            methodForSplit = 'Credit Card';
        } else {
            methodForSplit = j % 2 === 0 ? 'Credit Card' : 'Cash';
        }


        if (splitAmount > 0.01) {
          payments.push({
            method: methodForSplit,
            amount: splitAmount.toFixed(2),
            date: new Date(Date.now() - i * 3600000 + 120000 + j * 10000).toLocaleString(),
            transactionId: `txn_${12345 + i}_${j}`,
            guestName: `Guest ${j + 1}`,
          });
        }
      }
      // Due to floating point math, ensure paidAmount is the sum of actual splits
      paidAmount = payments.reduce((sum, p) => sum + parseFloat(p.amount), 0);
    }
    
    if (orderStatus === 'Refunded') {
      paidAmount = totalAmount;
    }

    const orderTimestamp = Date.now() - i * 3600000;
    const orderDate = new Date(orderTimestamp);
    const customerName = customerNames[i % customerNames.length];

    orders.push({
      orderId: `#${3210 + i}`,
      branch: branches[i % branches.length],
      table: `T${(i % 24) + 1}`,
      orderType,
      orderStatus,
      paymentState,
      totalAmount,
      paidAmount,
      staffName,
      orderDate: orderDate.toLocaleString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }),
      orderTimestamp,
      items: currentItems,
      payments,
      splitType,
      customer: {
        name: customerName,
        email: `${customerName.toLowerCase().replace(' ', '.')}@example.com`,
        phone: `555-01${String(i).padStart(2, '0')}`,
      },
      orderComments: comments[i % comments.length] || undefined,
    });
  }
  return orders;
};
