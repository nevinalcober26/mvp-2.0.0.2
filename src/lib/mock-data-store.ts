'use client';

import type { Product, Variation } from '@/app/dashboard/products/types';
import type { Customer, Visit, Payment as CustomerPayment } from '@/app/dashboard/customer/list/types';
import type { Order, OrderItem, Payment as OrderPayment } from '@/app/dashboard/orders/types';
import { format, subDays, subHours, endOfDay, setHours, setMinutes, subMinutes, formatDistanceToNow } from 'date-fns';
import type { Column } from '@/app/dashboard/categories/types';

export const mockComboGroups = ['Lunch Special', 'Family Deal', 'Dinner for Two', 'Breakfast Combo'];

// --- Product Generation ---
const productNames = [
    'Classic Cheeseburger', 'Truffle Fries', 'Seasonal Berry Crumble', 'Artisanal Pizza',
    'Fresh Garden Salad', 'Spicy Chicken Wings', 'Avocado Toast', 'Margherita Pizza',
    'Ribeye Steak', 'Chocolate Lava Cake', 'Classic Pancakes', 'Orange Juice',
    'Espresso', 'Latte', 'Cheesecake'
];
const categories = ['Burgers', 'Sides', 'Desserts', 'Mains', 'Salads', 'Breakfast', 'Beverages'];
const productStatuses: Product['status'][] = ['Active', 'Draft', 'Archived', 'Out of Stock'];
const branches: ('Ras Al Khaimah' | 'Dubai Mall')[] = ['Ras Al Khaimah', 'Dubai Mall'];

const generateMockProducts = (count: number): Product[] => {
    const products: Product[] = [];
    for (let i = 0; i < count; i++) {
        const name = productNames[i % productNames.length];
        const status = productStatuses[i % productStatuses.length];
        const price = Math.floor(Math.random() * 30) + 5;
        const variations: Variation[] | undefined = i % 5 === 0 ? [
            { id: `var_${i}_1`, value: 'Small', matrix: `S-${i}`, price: price * 0.8, visible: true, hidden: false, categoryPage: true, productPage: true },
            { id: `var_${i}_2`, value: 'Large', matrix: `L-${i}`, price: price * 1.2, visible: true, hidden: false, categoryPage: true, productPage: true }
        ] : undefined;

        products.push({
            id: `prod_${i}`,
            name: `${name} ${i < productNames.length ? '' : `#${Math.floor(i / productNames.length)}`}`,
            category: categories[i % categories.length],
            branch: branches[i % branches.length],
            price,
            stock: status === 'Out of Stock' ? 0 : Math.floor(Math.random() * 100),
            status,
            mainImage: i % 3 !== 0 ? `https://picsum.photos/seed/prod${i}/100/100` : undefined,
            description: 'A detailed description of the product goes here, including ingredients and preparation methods.',
            smallDescription: 'A short and catchy description for the product.',
            discountedPrice: status === 'Active' && i % 4 === 0 ? price * 0.8 : undefined,
            variations
        });
    }
    return products;
};

// --- Customer and Order Generation (interlinked) ---
const firstNames = ['John', 'Jane', 'Alex', 'Emily', 'Chris', 'Katie', 'Michael', 'Sarah', 'David', 'Laura'];
const lastNames = ['Smith', 'Doe', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez'];
const staffNames = ['Alex', 'Maria', 'John', 'Sarah', 'David', 'Frank M.'];
const comments = ['Customer requested extra napkins.', 'Allergy alert: No nuts.', 'Birthday celebration at the table.', null, 'Guest is in a hurry.'];

const generateRelatedMockData = (customerCount: number, orderCount: number, products: Product[]) => {
    const customers: Customer[] = [];
    const orders: Order[] = [];

    // Generate Customers
    for (let i = 0; i < customerCount; i++) {
        const name = `${firstNames[i % firstNames.length]} ${lastNames[i % lastNames.length]}`;
        customers.push({
            id: `cust_${i}`,
            name,
            email: `${name.replace(' ', '.').toLowerCase()}@example.com`,
            phone: `555-01${String(i).padStart(2, '0')}`,
            lastVisit: '', // Will be calculated later
            totalVisits: 0,
            totalSpent: 0,
            avgBillValue: 0,
            visits: [],
        });
    }

    // Generate Orders and associate with Customers
    for (let i = 0; i < orderCount; i++) {
        const hasCustomer = i % 4 !== 0;
        const customer = hasCustomer ? customers[i % customers.length] : undefined;

        const orderItemsCount = Math.floor(Math.random() * 3) + 1;
        const currentItems: OrderItem[] = Array.from({ length: orderItemsCount }, () => {
            const item = products[Math.floor(Math.random() * products.length)];
            return {
                id: `${item.id}-${i}`,
                name: item.name,
                quantity: Math.floor(Math.random() * 2) + 1,
                price: item.price,
                category: item.category,
            };
        });

        const totalAmount = currentItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
        
        let orderTimestamp: number, paymentState: Order['paymentState'], orderStatus: Order['orderStatus'];
        let paidAmount = 0;
        
        const isRecentOutstanding = i % 5 === 0 && Math.random() > 0.5; // ~10% of orders are recent and outstanding
        
        if (isRecentOutstanding) {
            orderTimestamp = subMinutes(new Date(), Math.floor(Math.random() * 180) + 5).getTime();
            orderStatus = 'Open';
            if (Math.random() > 0.4) {
                paymentState = 'Partial';
                paidAmount = totalAmount * (Math.random() * 0.6 + 0.1);
            } else {
                paymentState = 'Unpaid';
                paidAmount = 0;
            }
        } else {
            orderTimestamp = subDays(endOfDay(new Date()), Math.floor(Math.random() * 30) + 1).getTime();
            paidAmount = totalAmount;

            const finalStatuses: Order['orderStatus'][] = ['Completed', 'Paid'];
            if (i % 10 === 0) finalStatuses.push('Cancelled');
            if (i % 15 === 0) finalStatuses.push('Refunded');
            orderStatus = finalStatuses[Math.floor(Math.random() * finalStatuses.length)];

            if (orderStatus === 'Cancelled') {
                paymentState = 'Voided';
                paidAmount = 0;
            } else if (orderStatus === 'Refunded') {
                paymentState = 'Returned';
            } else {
                paymentState = 'Fully Paid';
            }
        }

        const randomDate = new Date(orderTimestamp);
        
        const customerPayments: CustomerPayment[] = [];
        // Split about 1/3 of fully paid orders.
        const shouldSplit = paidAmount > 0 && paymentState === 'Fully Paid' && i % 3 === 0;

        if (paidAmount > 0) {
            if (shouldSplit) {
                const numPayers = Math.floor(Math.random() * 2) + 2; // 2-3 payers
                const basePayment = parseFloat((paidAmount / numPayers).toFixed(2));
                const totalTip = parseFloat((paidAmount * (Math.random() * 0.1 + 0.1)).toFixed(2));
                const baseTip = parseFloat((totalTip / numPayers).toFixed(2));
                let accumulatedPayment = 0;
                let accumulatedTip = 0;

                for (let j = 0; j < numPayers; j++) {
                    const isLastPayer = j === numPayers - 1;
                    
                    const paymentAmount = isLastPayer ? paidAmount - accumulatedPayment : basePayment;
                    const tipAmount = isLastPayer ? totalTip - accumulatedTip : baseTip;

                    accumulatedPayment += paymentAmount;
                    accumulatedTip += tipAmount;

                    customerPayments.push({
                        id: `txn_${12345 + i}_${j}`,
                        amount: paymentAmount,
                        tip: tipAmount,
                        method: j % 2 === 0 ? 'Credit Card' : 'Online',
                        status: 'Paid',
                        date: format(subMinutes(randomDate, Math.random() * 5), 'PPpp'),
                    });
                }
            } else {
                // Not split
                const tip = paidAmount * (Math.random() > 0.5 ? 0.1 : 0.15);
                 if (paidAmount > 0.01) {
                    customerPayments.push({
                        id: `txn_${12345 + i}`,
                        amount: paidAmount,
                        tip: tip,
                        method: i % 3 === 0 ? 'Cash' : 'Credit Card',
                        status: 'Paid',
                        date: format(subHours(randomDate, Math.random() > 0.5 ? 0 : 1), 'PPpp'),
                    });
                 }
            }
        }
        
        const orderPayments: OrderPayment[] = customerPayments.map((p, index) => ({
            method: p.method,
            amount: p.amount.toFixed(2),
            date: p.date,
            transactionId: p.id,
            guestName: customer?.name || `Guest ${index + 1}`,
            tip: p.tip
        }));
        
        const order: Order = {
            orderId: `#${3210 + i}`,
            branch: branches[i % branches.length],
            table: `T${(i % 24) + 1}`,
            orderType: i % 2 === 0 ? 'Post-Paid' : 'Prepaid',
            orderStatus,
            paymentState,
            totalAmount,
            paidAmount,
            items: currentItems,
            orderDate: randomDate.toLocaleString('en-US', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }),
            orderTimestamp: randomDate.getTime(),
            payments: orderPayments,
            splitType: customerPayments.length > 1 ? (i % 2 === 0 ? 'equally' : 'byItem') : undefined,
            customer: customer ? { name: customer.name, email: customer.email, phone: customer.phone } : undefined,
            staffName: staffNames[i % staffNames.length],
            orderComments: comments[i % comments.length] || undefined,
        };
        orders.push(order);

        if (customer) {
            customer.totalVisits += 1;
            customer.totalSpent += totalAmount;
            
            const visit: Visit = {
              orderId: order.orderId,
              date: format(randomDate, 'PP'),
              type: i % 2 === 0 ? 'Dine-in' : 'Takeaway',
              paymentStatus: order.paymentState === 'Fully Paid' ? 'Paid' : order.paymentState === 'Partial' ? 'Partial' : 'Unpaid',
              tip: customerPayments.reduce((acc, p) => acc + p.tip, 0),
              isSplit: order.splitType !== undefined,
              total: order.totalAmount,
              payments: customerPayments,
            };
            customer.visits.push(visit);
        }
    }
    
    // Final pass on customers to calculate derived fields
    for (const customer of customers) {
        if (customer.totalVisits > 0) {
            customer.avgBillValue = customer.totalSpent / customer.totalVisits;
            customer.visits.sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime());
            if (customer.visits.length > 0) {
                customer.lastVisit = customer.visits[0].date;
            } else {
                 customer.lastVisit = 'N/A';
            }
        }
    }

    return { customers, orders };
};

class MockDataStore {
    public products: Product[];
    public customers: Customer[];
    public orders: Order[];
    public categories: Column[];

    constructor() {
        this.products = generateMockProducts(30);
        const { customers, orders } = generateRelatedMockData(45, 124, this.products);
        this.customers = customers;
        this.orders = orders;
        this.categories = [
          {
            id: 'food',
            name: 'Food',
            items: [
              {
                id: 'appetizers',
                name: 'Appetizers',
                children: [
                  { id: 'soups', name: 'Soups', children: [] },
                  { id: 'salads', name: 'Salads', children: [] },
                ],
              },
              {
                id: 'main-courses',
                name: 'Main Courses',
                children: [
                  { id: 'pizza', name: 'Pizza', children: [] },
                  { id: 'pasta', name: 'Pasta', children: [] },
                  { id: 'burgers', name: 'Burgers', children: [] },
                ],
              },
              {
                id: 'desserts',
                name: 'Desserts',
                children: [
                    { id: 'cakes', name: 'Cakes', children: [] },
                    { id: 'ice-cream', name: 'Ice Cream', children: [] },
                ],
              },
            ],
          },
          {
            id: 'beverages',
            name: 'Beverages',
            items: [
              {
                id: 'hot-drinks',
                name: 'Hot Drinks',
                children: [
                  { id: 'coffee', name: 'Coffee', children: [] },
                  { id: 'tea', name: 'Tea', children: [] },
                ],
              },
              {
                id: 'cold-drinks',
                name: 'Cold Drinks',
                children: [
                  { id: 'juices', name: 'Juices', children: [] },
                  { id: 'soft-drinks', name: 'Soft Drinks', children: [] },
                ],
              },
              { id: 'mocktails', name: 'Mocktails', children: [] },
            ],
          },
          {
            id: 'specials',
            name: 'Special Offers',
            items: [
                { id: 'daily-specials', name: 'Daily Specials', children: [] },
                { id: 'combo-meals', name: 'Combo Meals', children: [] },
            ],
          },
          {
            id: 'breakfast',
            name: 'Breakfast',
            items: [
                { id: 'pancakes-waffles', name: 'Pancakes & Waffles', children: [] },
                { id: 'omelettes', name: 'Omelettes', children: [] },
                { id: 'healthy-bowls', name: 'Healthy Bowls', children: [] },
            ]
          }
        ];
    }
}

export const mockDataStore = new MockDataStore();
