'use client';

import type { Product, Variation } from '@/app/dashboard/products/types';
import type { Customer, Visit, Payment as CustomerPayment } from '@/app/dashboard/customer/list/types';
import type { Order, OrderItem, Payment as OrderPayment, StaffReference } from '@/app/dashboard/orders/types';
import { format, subDays, subHours, endOfDay, setHours, setMinutes, subMinutes, formatDistanceToNow } from 'date-fns';
import type { Column } from '@/app/dashboard/categories/types';
import { PlaceHolderImages } from '@/lib/placeholder-images';

export const mockComboGroups = ['Lunch Special', 'Family Deal', 'Dinner for Two', 'Breakfast Combo'];

// --- Branch/Restaurant Source of Truth ---
export interface Branch {
  id: string;
  name: string;
  image: string;
  status: 'Open' | 'Closed';
  rating: number;
  type: string;
  location: string;
  address: string;
  menuItems: number;
  scansToday: number;
}

const DEFAULT_RESTAURANT_IMAGE = 'https://picsum.photos/seed/bloomsbury/600/400';

export const mockBranches: Branch[] = [
  {
    id: '1',
    name: "Bloomsbury's - Ras Al Khaimah",
    image: PlaceHolderImages.find(img => img.id === 'restaurant-1')?.imageUrl || DEFAULT_RESTAURANT_IMAGE,
    status: 'Open',
    rating: 4.9,
    type: 'Boutique Café',
    location: 'RAK Mall',
    address: 'Level 1, RAK Mall, Ras Al Khaimah',
    menuItems: 142,
    scansToday: 284,
  },
  {
    id: '2',
    name: "Bloomsbury's - Dubai Mall",
    image: PlaceHolderImages.find(img => img.id === 'restaurant-2')?.imageUrl || DEFAULT_RESTAURANT_IMAGE,
    status: 'Open',
    rating: 4.8,
    type: 'Signature Store',
    location: 'Downtown',
    address: 'Lower Ground, Dubai Mall, Dubai',
    menuItems: 156,
    scansToday: 1240,
  },
  {
    id: '3',
    name: "Bloomsbury's - Al Ain",
    image: PlaceHolderImages.find(img => img.id === 'restaurant-3')?.imageUrl || DEFAULT_RESTAURANT_IMAGE,
    status: 'Open',
    rating: 4.7,
    type: 'Boutique Café',
    location: 'Al Ain Mall',
    address: 'Ground Floor, Al Ain Mall, Al Ain',
    menuItems: 98,
    scansToday: 412,
  },
  {
    id: '4',
    name: "Bloomsbury's - Abu Dhabi",
    image: PlaceHolderImages.find(img => img.id === 'restaurant-4')?.imageUrl || DEFAULT_RESTAURANT_IMAGE,
    status: 'Open',
    rating: 4.8,
    type: 'Boutique Café',
    location: 'Al Mushrif',
    address: 'Al Mushrif Mall, Abu Dhabi',
    menuItems: 110,
    scansToday: 650,
  },
  {
    id: '5',
    name: "Bloomsbury's - Sharjah",
    image: PlaceHolderImages.find(img => img.id === 'restaurant-5')?.imageUrl || DEFAULT_RESTAURANT_IMAGE,
    status: 'Open',
    rating: 4.6,
    type: 'Boutique Café',
    location: 'Zero 6 Mall',
    address: 'Zero 6 Mall, Sharjah',
    menuItems: 85,
    scansToday: 320,
  },
  {
    id: '6',
    name: "Bloomsbury's - Ajman",
    image: PlaceHolderImages.find(img => img.id === 'restaurant-6')?.imageUrl || DEFAULT_RESTAURANT_IMAGE,
    status: 'Closed',
    rating: 4.5,
    type: 'Boutique Café',
    location: 'City Centre',
    address: 'City Centre Ajman, Ajman',
    menuItems: 72,
    scansToday: 180,
  },
];

// --- Product Generation ---
const productNames = [
    'Classic Cheeseburger', 'Truffle Fries', 'Seasonal Berry Crumble', 'Artisanal Pizza',
    'Fresh Garden Salad', 'Spicy Chicken Wings', 'Avocado Toast', 'Margherita Pizza',
    'Ribeye Steak', 'Chocolate Lava Cake', 'Classic Pancakes', 'Orange Juice',
    'Espresso', 'Latte', 'Cheesecake'
];
const categories = ['Burgers', 'Sides', 'Desserts', 'Mains', 'Salads', 'Breakfast', 'Beverages'];
const productStatuses: Product['status'][] = ['Active', 'Draft', 'Archived', 'Out of Stock'];

const generateMockProducts = (count: number): Product[] => {
    const products: Product[] = [];
    const branchNames = mockBranches.map(b => b.name);
    for (let i = 0; i < count; i++) {
        const name = productNames[i % productNames.length];
        const status = productStatuses[i % productStatuses.length];
        const price = Math.floor(Math.random() * 30) + 5;
        const variations: Variation[] | undefined = i % 5 === 0 ? [
            { id: `var_${i}_1`, value: 'Small', matrix: `S-${i}`, price: price * 0.8, hidden: false, categoryPage: true, productPage: true },
            { id: `var_${i}_2`, value: 'Large', matrix: `L-${i}`, price: price * 1.2, hidden: false, categoryPage: true, productPage: true }
        ] : undefined;

        products.push({
            id: `prod_${i}`,
            name: `${name} ${i < productNames.length ? '' : `#${Math.floor(i / productNames.length)}`}`,
            category: categories[i % categories.length],
            branch: branchNames[i % branchNames.length],
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
const staffNames = ['Alex', 'Maria', 'John', 'Sarah', 'David', 'Frank M.', 'Emily', 'Jessica', 'Michael', 'Chris'];
const comments = ['Customer requested extra napkins.', 'Allergy alert: No nuts.', 'Birthday celebration at the table.', null, 'Guest is in a hurry.'];

const generateRelatedMockData = (customerCount: number, orderCount: number, products: Product[]) => {
    const customers: Customer[] = [];
    const orders: Order[] = [];
    const branchNames = mockBranches.map(b => b.name);

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
        const isSplit = paidAmount > 0 && paymentState === 'Fully Paid' && i % 3 === 0;
        const splitType = isSplit ? (i % 6 === 0 ? 'byItem' : 'equally') : undefined;

        if (isSplit) {
            if (splitType === 'byItem' && currentItems.length > 1) {
                // Item-based split logic
                const itemsToPay = [...currentItems];
                let guestIndex = 0;
                let finalPaidAmount = 0;

                while (itemsToPay.length > 0) {
                    const itemsForThisPayment: OrderItem[] = [];
                    let paymentAmount = 0;
                    const numItemsInPayment = Math.random() > 0.6 && itemsToPay.length > 1 ? 2 : 1;
                    
                    for (let k = 0; k < numItemsInPayment && itemsToPay.length > 0; k++) {
                        const item = itemsToPay.shift()!;
                        itemsForThisPayment.push(item);
                        paymentAmount += item.price * item.quantity;
                    }
                    
                    if (itemsForThisPayment.length > 0) {
                        finalPaidAmount += paymentAmount;
                        const tip = paymentAmount * (Math.random() * 0.1 + 0.1);
                        customerPayments.push({
                            id: `txn_${12345 + i}_${guestIndex}`,
                            amount: paymentAmount,
                            tip: parseFloat(tip.toFixed(2)),
                            method: guestIndex % 2 === 0 ? 'Credit Card' : 'Online',
                            status: 'Paid',
                            date: format(subMinutes(randomDate, Math.random() * 5), 'PPpp'),
                            items: itemsForThisPayment.map(it => ({name: it.name, quantity: it.quantity})),
                        });
                        guestIndex++;
                    }
                }
                // Ensure the order's paidAmount reflects the sum of itemized payments
                paidAmount = finalPaidAmount;

            } else { // 'equally' or fallback
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
            }
        } else if (paidAmount > 0) {
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
        
        const orderPayments: OrderPayment[] = customerPayments.map((p, index) => ({
            method: p.method,
            amount: p.amount.toFixed(2),
            date: p.date,
            transactionId: p.id,
            guestName: customer?.name || `Guest ${index + 1}`,
            tip: p.tip,
            items: p.items,
        }));
        
        const order: Order = {
            orderId: `#${3210 + i}`,
            branch: branchNames[i % branchNames.length],
            table: `T${(i % 24) + 1}`,
            orderType: i % 2 === 0 ? 'Post-Paid' : 'Prepaid',
            orderStatus,
            paymentState,
            totalAmount,
            paidAmount,
            items: currentItems,
            orderDate: randomDate.toLocaleString('en-US', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit', hour12: true }),
            orderTimestamp: randomDate.getTime(),
            payments: orderPayments,
            splitType: splitType,
            customer: customer ? { name: customer.name, email: customer.email, phone: customer.phone } : undefined,
            staffName: staffNames[i % staffNames.length],
            orderComments: comments[i % comments.length] || undefined,
            source: i % 3 === 0 ? 'POS' : 'App to App',
            staffReference: {
                employee_reference_code: `EMP-${staffNames[i % staffNames.length].replace(/[^A-Z]/g, '')}${100 + i}`,
                total_sale_amount: Math.random() * 5000 + 1000,
                order_count: Math.floor(Math.random() * 50) + 10,
                total_tip_amount: Math.random() * 500,
                currency: 'AED',
                start_date: format(subDays(new Date(), 7), 'yyyy-MM-dd'),
                end_date: format(new Date(), 'yyyy-MM-dd'),
            },
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
              tip: customerPayments.reduce((acc, p) => acc + (p.tip || 0), 0),
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
    public branches: Branch[];

    constructor() {
        this.branches = mockBranches;
        this.products = generateMockProducts(30);
        const { customers, orders } = generateRelatedMockData(45, 124, this.products);
        this.customers = customers;
        this.orders = orders;
        this.categories = [
          {
            id: 'food',
            name: 'Food',
            description: 'All of our delicious food items.',
            items: [
              {
                id: 'appetizers',
                name: 'Appetizers',
                description: 'Start your meal with a tasty bite.',
                cardShadow: false,
                children: [
                  { id: 'soups', name: 'Soups', children: [], description: 'Warm and comforting soups.' },
                  { id: 'salads', name: 'Salads', children: [], description: 'Fresh and healthy salads.' },
                ],
              },
              {
                id: 'main-courses',
                name: 'Main Courses',
                description: 'The star of the show.',
                displayFullwidth: true,
                children: [
                  { id: 'pizza', name: 'Pizza', children: [] },
                  { id: 'pasta', name: 'Pasta', children: [] },
                  { id: 'burgers', name: 'Burgers', children: [] },
                ],
              },
              {
                id: 'desserts',
                name: 'Desserts',
                description: 'Sweet treats to end your meal.',
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
            description: 'Quench your thirst.',
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
            description: 'Great deals for you.',
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
