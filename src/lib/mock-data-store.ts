'use client';

import type { Product, Variation } from '@/app/dashboard/products/types';
import type { Customer, Visit, Payment as CustomerPayment } from '@/app/dashboard/customer/list/types';
import type { Order, OrderItem, Payment as OrderPayment, StaffReference } from '@/app/dashboard/orders/types';
import { format, subDays, subHours, endOfDay, setHours, setMinutes, subMinutes, formatDistanceToNow } from 'date-fns';
import type { Column, Item } from '@/app/dashboard/categories/types';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import type { VariationGroup } from '@/app/dashboard/catalog/variations/types';
import type { ComboGroup } from '@/app/dashboard/catalog/combo-groups/types';

export const mockComboGroups = ['Lunch Special', 'Family Deal', 'Dinner for Two', 'Breakfast Combo'];

export const mockVariationGroups: VariationGroup[] = [
  {
    id: 'group_1',
    name: 'Size',
    sortOrder: 0,
    multiple: false,
    required: true,
    maxChoices: 1,
    options: [
      { id: 'opt_1_1', value: 'Small', sortOrder: 0 },
      { id: 'opt_1_2', value: 'Medium', sortOrder: 1 },
      { id: 'opt_1_3', value: 'Large', sortOrder: 2 },
    ],
  },
  {
    id: 'group_2',
    name: 'Color',
    sortOrder: 1,
    multiple: true,
    required: false,
    maxChoices: 2,
    options: [
      { id: 'opt_2_1', value: 'Red', sortOrder: 0 },
      { id: 'opt_2_2', value: 'Green', sortOrder: 1 },
      { id: 'opt_2_3', value: 'Blue', sortOrder: 2 },
      { id: 'opt_2_4', value: 'Black', sortOrder: 3 },
      { id: 'opt_2_5', value: 'White', sortOrder: 4 },
    ],
  },
  {
    id: 'group_3',
    name: 'Steak Doneness',
    sortOrder: 2,
    multiple: false,
    required: true,
    maxChoices: 1,
    options: [
      { id: 'opt_3_1', value: 'Rare', sortOrder: 0 },
      { id: 'opt_3_2', value: 'Medium Rare', sortOrder: 1 },
      { id: 'opt_3_3', value: 'Medium', sortOrder: 2 },
      { id: 'opt_3_4', value: 'Medium Well', sortOrder: 3 },
      { id: 'opt_3_5', value: 'Well Done', sortOrder: 4 },
    ],
  },
  {
    id: 'group_4',
    name: 'Spice Level',
    sortOrder: 3,
    multiple: false,
    required: false,
    maxChoices: 1,
    options: [
        { id: 'opt_4_1', value: 'Mild', sortOrder: 0 },
        { id: 'opt_4_2', value: 'Medium', sortOrder: 1 },
        { id: 'opt_4_3', value: 'Hot', sortOrder: 2 },
        { id: 'opt_4_4', value: 'Extra Hot', sortOrder: 3 },
    ]
  }
];

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
            { id: `var_${i}_1`, value: 'Small', matrix: `S-${i}`, priceMode: 'override', priceValue: price * 0.8, hidden: false, categoryPage: true, productPage: true },
            { id: `var_${i}_2`, value: 'Large', matrix: `L-${i}`, priceMode: 'override', priceValue: price * 1.2, hidden: false, categoryPage: true, productPage: true }
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

        const orderItemsCount = Math.floor(Math.random() * 4) + 2; // 2-5 items
        const currentItems: OrderItem[] = Array.from({ length: orderItemsCount }, (_, k) => {
            const item = products[Math.floor(Math.random() * products.length)];
            return {
                id: `${item.id}-${i}-${k}`,
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
        const isSplit = paidAmount > 0.01 && paymentState === 'Fully Paid' && i % 4 === 0 && currentItems.length >= 2;
        
        let splitType: 'byItem' | 'equally' | undefined = undefined;
        if (isSplit) {
            if (i % 8 === 0) { // Make it a simple 50/50 split for split orders
                splitType = 'byItem';
            } else {
                splitType = 'equally';
            }
        }

        if (isSplit) {
            orderStatus = 'Completed';
            paymentState = 'Fully Paid';
            paidAmount = totalAmount;

            if (splitType === 'byItem') {
                const itemsToPay = [...currentItems];
                let guestIndex = 0;
                let payersCount = Math.floor(Math.random() * 5) + 2; // 2, 3, 4, 5, or 6 payers
                
                if (itemsToPay.length < payersCount) {
                    payersCount = itemsToPay.length;
                }
                
                if (payersCount < 2 && itemsToPay.length > 1) {
                    payersCount = 2;
                }


                while(itemsToPay.length > 0 && guestIndex < payersCount) {
                    const isLastPayer = guestIndex === payersCount - 1;
                    let itemsForThisPayer: OrderItem[];

                    if (isLastPayer) {
                        itemsForThisPayer = [...itemsToPay];
                        itemsToPay.length = 0;
                    } else {
                        const itemsCountForPayer = Math.max(1, Math.floor(Math.random() * (itemsToPay.length - (payersCount - guestIndex -1) ) ));
                        itemsForThisPayer = itemsToPay.splice(0, itemsCountForPayer);
                    }

                    if(itemsForThisPayer.length === 0) continue;

                    const paymentAmount = itemsForThisPayer.reduce((sum, item) => sum + (item.price * item.quantity), 0);
                    const tip = paymentAmount * (Math.random() * 0.1 + 0.05);

                    customerPayments.push({
                        id: `txn_${12345 + i}_${guestIndex}`,
                        amount: paymentAmount,
                        tip: parseFloat(tip.toFixed(2)),
                        method: 'Credit Card',
                        status: 'Paid',
                        date: format(subMinutes(randomDate, Math.random() * 5), 'PPpp'),
                        items: itemsForThisPayer.map(it => ({ name: it.name, quantity: it.quantity })),
                    });
                    guestIndex++;
                }

            } else { // 'equally'
                const numPayers = Math.floor(Math.random() * 5) + 2; // 2-6 payers
                const totalTip = parseFloat((totalAmount * (Math.random() * 0.1 + 0.1)).toFixed(2));
                let remainingAmount = totalAmount;
                let remainingTip = totalTip;
                
                for (let j = 0; j < numPayers; j++) {
                    const isLastPayer = j === numPayers - 1;
                    let paymentAmount, tipAmount;
                    
                    if (isLastPayer) {
                        paymentAmount = remainingAmount;
                        tipAmount = remainingTip;
                    } else {
                        paymentAmount = parseFloat((totalAmount / numPayers).toFixed(2));
                        tipAmount = parseFloat((totalTip / numPayers).toFixed(2));
                        remainingAmount -= paymentAmount;
                        remainingTip -= tipAmount;
                    }

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
            const tip = paymentState === 'Fully Paid' ? paidAmount * (Math.random() > 0.5 ? 0.1 : 0.15) : 0;
            customerPayments.push({
                id: `txn_${12345 + i}`,
                amount: paidAmount,
                tip: tip,
                method: i % 3 === 0 ? 'Cash' : 'Credit Card',
                status: 'Paid',
                date: format(subHours(randomDate, Math.random() > 0.5 ? 0 : 1), 'PPpp'),
            });
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
    public variationGroups: VariationGroup[];
    public comboGroups: ComboGroup[];

    constructor() {
        this.branches = mockBranches;
        this.products = generateMockProducts(30);
        const { customers, orders } = generateRelatedMockData(45, 124, this.products);
        this.customers = customers;
        this.orders = orders;
        this.variationGroups = mockVariationGroups;
        this.comboGroups = [
             {
                id: 'combo_1',
                name: 'Lunch Special',
                description: 'A perfect combo for a quick and satisfying lunch.',
                price: 25.99,
                productIds: ['prod_0', 'prod_1', 'prod_11'],
            },
            {
                id: 'combo_2',
                name: 'Dinner for Two',
                description: 'Share a romantic dinner with our special selection.',
                price: 55.00,
                productIds: ['prod_8', 'prod_4', 'prod_9'],
            },
            {
                id: 'combo_3',
                name: 'Breakfast Power-Up',
                description: 'Start your day with energy.',
                price: 18.00,
                productIds: ['prod_6', 'prod_10', 'prod_12'],
            },
        ];
        this.categories = [
          {
            id: 'food',
            name: 'Food',
            description: 'All of our delicious food items.',
            status: 'Published',
            items: [
              {
                id: 'appetizers',
                name: 'Appetizers',
                description: 'Start your meal with a tasty bite.',
                cardShadow: false,
                status: 'Published',
                children: [
                  { id: 'soups', name: 'Soups', children: [], description: 'Warm and comforting soups.', status: 'Published' },
                  { id: 'salads', name: 'Salads', children: [], description: 'Fresh and healthy salads.', status: 'Published' },
                ],
              },
              {
                id: 'main-courses',
                name: 'Main Courses',
                description: 'The star of the show.',
                displayFullwidth: true,
                status: 'Published',
                children: [
                  { id: 'pizza', name: 'Pizza', children: [], status: 'Published' },
                  { id: 'pasta', name: 'Pasta', children: [], status: 'Published' },
                  { id: 'burgers', name: 'Burgers', children: [], status: 'Published' },
                ],
              },
              {
                id: 'desserts',
                name: 'Desserts',
                description: 'Sweet treats to end your meal.',
                status: 'Published',
                children: [
                    { id: 'cakes', name: 'Cakes', children: [], status: 'Published' },
                    { id: 'ice-cream', name: 'Ice Cream', children: [], status: 'Published' },
                ],
              },
            ],
          },
          {
            id: 'beverages',
            name: 'Beverages',
            description: 'Quench your thirst.',
            status: 'Published',
            items: [
              {
                id: 'hot-drinks',
                name: 'Hot Drinks',
                status: 'Published',
                children: [
                  { id: 'coffee', name: 'Coffee', children: [], status: 'Published' },
                  { id: 'tea', name: 'Tea', children: [], status: 'Published' },
                ],
              },
              {
                id: 'cold-drinks',
                name: 'Cold Drinks',
                status: 'Published',
                children: [
                  { id: 'juices', name: 'Juices', children: [], status: 'Published' },
                  { id: 'soft-drinks', name: 'Soft Drinks', children: [], status: 'Published' },
                ],
              },
              { id: 'mocktails', name: 'Mocktails', children: [], status: 'Published' },
            ],
          },
          {
            id: 'specials',
            name: 'Special Offers',
            description: 'Great deals for you.',
            status: 'Published',
            items: [
                { id: 'daily-specials', name: 'Daily Specials', children: [], status: 'Published' },
                { id: 'combo-meals', name: 'Combo Meals', children: [], status: 'Published' },
            ],
          },
          {
            id: 'breakfast',
            name: 'Breakfast',
            status: 'Published',
            items: [
                { id: 'pancakes-waffles', name: 'Pancakes & Waffles', children: [], status: 'Published' },
                { id: 'omelettes', name: 'Omelettes', children: [], status: 'Published' },
                { id: 'healthy-bowls', name: 'Healthy Bowls', children: [], status: 'Published' },
            ]
          }
        ];
    }
}

export const mockDataStore = new MockDataStore();
