'use client';

import type { Product, Variation } from '@/app/dashboard/products/types';
import type { Customer, Visit, Payment as CustomerPayment } from '@/app/dashboard/customer/list/types';
import type { Order, OrderItem, Payment as OrderPayment, StaffReference } from '@/app/dashboard/orders/types';
import { format, subDays, subHours, endOfDay, setHours, setMinutes, subMinutes, formatDistanceToNow } from 'date-fns';
import type { Column, Item } from '@/app/dashboard/categories/types';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import type { VariationGroup } from '@/app/dashboard/catalog/variations/types';
import type { ComboGroup } from '@/app/dashboard/catalog/combo-groups/types';

export const mockComboGroupNames = ['Lunch Special', 'Family Deal', 'Dinner for Two', 'Breakfast Combo'];

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
  },
  {
    id: 'group_5',
    name: 'Burger Toppings',
    sortOrder: 4,
    multiple: true,
    required: false,
    options: [
        { id: 'opt_5_1', value: 'Extra Cheese', sortOrder: 0, regularPrice: 2.00 },
        { id: 'opt_5_2', value: 'Bacon', sortOrder: 1, regularPrice: 3.50 },
        { id: 'opt_5_3', value: 'Sautéed Mushrooms', sortOrder: 2, regularPrice: 1.50 },
        { id: 'opt_5_4', value: 'Caramelized Onions', sortOrder: 3, regularPrice: 1.00 },
    ]
  },
  {
    id: 'group_6',
    name: 'Salad Dressing',
    sortOrder: 5,
    multiple: false,
    required: true,
    options: [
        { id: 'opt_6_1', value: 'Ranch', sortOrder: 0 },
        { id: 'opt_6_2', value: 'Italian Vinaigrette', sortOrder: 1 },
        { id: 'opt_6_3', value: 'Caesar', sortOrder: 2 },
        { id: 'opt_6_4', value: 'Balsamic', sortOrder: 3 },
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

const productDescriptions: Record<string, { description: string; smallDescription: string }> = {
    'Classic Cheeseburger': {
        description: 'A succulent beef patty topped with melted cheddar, crisp lettuce, ripe tomatoes, and our signature sauce, all nestled in a toasted brioche bun.',
        smallDescription: 'Juicy, cheesy, classic perfection.'
    },
    'Truffle Fries': {
        description: 'Crispy golden fries tossed in aromatic truffle oil, generously sprinkled with grated Parmesan and fresh parsley.',
        smallDescription: 'Crispy fries with a truffle twist.'
    },
    'Seasonal Berry Crumble': {
        description: 'A warm and comforting dessert featuring a medley of seasonal berries baked under a sweet, crunchy oat topping.',
        smallDescription: 'Warm, fruity, and comforting.'
    },
    'Artisanal Pizza': {
        description: 'Hand-stretched dough with a rich tomato base, creamy mozzarella, fresh basil, and a drizzle of extra-virgin olive oil.',
        smallDescription: 'Authentic Italian pizza simplicity.'
    },
    'Fresh Garden Salad': {
        description: 'A refreshing mix of crisp lettuce, cherry tomatoes, cucumbers, and bell peppers, tossed in a light vinaigrette dressing.',
        smallDescription: 'Crisp, fresh, and healthy.'
    },
    'Spicy Chicken Wings': {
        description: 'Crispy, juicy chicken wings coated in a fiery and tangy buffalo sauce, served with a cool blue cheese dip.',
        smallDescription: 'Fiery, tangy, and addictive.'
    },
    'Avocado Toast': {
        description: 'Creamy mashed avocado on a thick slice of toasted sourdough, topped with chili flakes and a squeeze of lime.',
        smallDescription: 'Creamy avocado on toasted sourdough.'
    },
    'Margherita Pizza': {
        description: 'The classic pizza with a simple yet delicious combination of San Marzano tomatoes, fresh mozzarella, basil, and olive oil.',
        smallDescription: 'The timeless Italian classic.'
    },
    'Ribeye Steak': {
        description: 'A perfectly seared 10oz Ribeye steak, cooked to your liking and served with a side of roasted garlic mashed potatoes.',
        smallDescription: 'Juicy, tender, and full of flavor.'
    },
    'Lava Cake': {
        description: 'A decadent chocolate cake with a molten chocolate center, served warm with a scoop of vanilla ice cream.',
        smallDescription: 'A chocolate lover\'s dream.'
    },
    'Classic Pancakes': {
        description: 'A stack of fluffy buttermilk pancakes served with a pat of butter and a generous drizzle of maple syrup.',
        smallDescription: 'Fluffy pancakes with maple syrup.'
    },
    'Orange Juice': {
        description: 'Freshly squeezed orange juice, packed with vitamins and a burst of citrus flavor.',
        smallDescription: 'Freshly squeezed sunshine.'
    },
    'Espresso': {
        description: 'A rich and intense shot of freshly brewed espresso, the perfect pick-me-up.',
        smallDescription: 'A rich and intense coffee shot.'
    },
    'Latte': {
        description: 'A smooth and creamy coffee made with a shot of espresso and steamed milk, topped with a light layer of foam.',
        smallDescription: 'Smooth, creamy, and satisfying.'
    },
    'Cheesecake': {
        description: 'A rich and creamy New York-style cheesecake with a graham cracker crust, served plain or with a berry coulis.',
        smallDescription: 'Rich, creamy, and decadent.'
    },
    'Mushroom Swiss Burger': {
        description: 'Our signature beef patty topped with sautéed mushrooms, melted Swiss cheese, and a creamy garlic aioli on a brioche bun.',
        smallDescription: 'Earthy mushrooms & melted Swiss.'
    },
    'Onion Rings': {
        description: 'Thick-cut onion rings, beer-battered and fried to a perfect golden brown. Served with a tangy dipping sauce.',
        smallDescription: 'Crispy, golden, and delicious.'
    },
    'Calamari Fritti': {
        description: 'Tender calamari, lightly breaded and fried until crisp. Served with marinara and a lemon wedge.',
        smallDescription: 'Crispy calamari with marinara.'
    },
    'Chicken Caesar Salad': {
        description: 'Crisp romaine lettuce, grilled chicken breast, house-made croutons, and Parmesan cheese, all tossed in our classic Caesar dressing.',
        smallDescription: 'A classic salad with grilled chicken.'
    },
    'Pepperoni Pizza': {
        description: 'A crowd-pleaser featuring a generous layer of spicy pepperoni and mozzarella cheese over our signature tomato sauce.',
        smallDescription: 'Spicy pepperoni & mozzarella.'
    },
    'Four Cheese Pizza': {
        description: 'A cheese lover\'s dream with a blend of mozzarella, Parmesan, ricotta, and gorgonzola cheeses.',
        smallDescription: 'A decadent blend of four cheeses.'
    },
    'Fettuccine Alfredo': {
        description: 'Rich and creamy Parmesan sauce tossed with fettuccine pasta. A timeless classic.',
        smallDescription: 'Creamy, cheesy pasta perfection.'
    },
    'Lobster Ravioli': {
        description: 'Delicate pasta pillows filled with succulent lobster meat, served in a light, creamy tomato sauce.',
        smallDescription: 'Luxurious lobster-filled pasta.'
    },
    'Grilled Salmon': {
        description: 'A perfectly grilled salmon fillet seasoned with herbs and lemon, served with asparagus and quinoa.',
        smallDescription: 'Healthy and delicious grilled salmon.'
    },
    'Filet Mignon': {
        description: 'An 8oz center-cut filet mignon, exceptionally tender and cooked to your preference. Served with a red wine reduction.',
        smallDescription: 'The most tender cut of beef.'
    },
    'Apple Pie': {
        description: 'A classic American dessert. Flaky crust filled with warm, spiced apples, served a la mode.',
        smallDescription: 'Warm, spiced apples in a flaky crust.'
    },
    'Brownie Sundae': {
        description: 'A warm, fudgy brownie topped with vanilla ice cream, hot fudge, whipped cream, and a cherry.',
        smallDescription: 'A warm brownie with all the fixings.'
    },
    'Iced Tea': {
        description: 'Freshly brewed black tea, sweetened and served over ice. A refreshing classic.',
        smallDescription: 'Cool and refreshing iced tea.'
    },
    'Mojito (Non-alcoholic)': {
        description: 'A refreshing mix of muddled mint, fresh lime juice, and a hint of sweetness, topped with soda water.',
        smallDescription: 'A minty and refreshing mocktail.'
    },
    'Strawberry Smoothie': {
        description: 'A creamy and delicious smoothie made with fresh strawberries, yogurt, and a touch of honey.',
        smallDescription: 'Creamy, fruity, and delicious.'
    }
};

// --- Product Generation ---
const productNames = [
    'Classic Cheeseburger', 'Truffle Fries', 'Seasonal Berry Crumble', 'Artisanal Pizza',
    'Fresh Garden Salad', 'Spicy Chicken Wings', 'Avocado Toast', 'Margherita Pizza',
    'Ribeye Steak', 'Lava Cake', 'Classic Pancakes', 'Orange Juice',
    'Espresso', 'Latte', 'Cheesecake',
    'Mushroom Swiss Burger', 'Onion Rings', 'Calamari Fritti', 'Chicken Caesar Salad',
    'Pepperoni Pizza', 'Four Cheese Pizza', 'Fettuccine Alfredo', 'Lobster Ravioli',
    'Grilled Salmon', 'Filet Mignon', 'Apple Pie', 'Brownie Sundae',
    'Iced Tea', 'Mojito (Non-alcoholic)', 'Strawberry Smoothie'
];
const categories = ['Burgers', 'Sides', 'Desserts', 'Mains', 'Salads', 'Breakfast', 'Beverages', 'Pizza', 'Pasta', 'Steaks'];
const productStatuses: Product['status'][] = ['Active', 'Draft', 'Archived', 'Out of Stock'];

const generateMockProducts = (count: number): Product[] => {
    const products: Product[] = [];
    const branchNames = mockBranches.map(b => b.name);
    for (let i = 0; i < count; i++) {
        const name = productNames[i % productNames.length];
        const status = productStatuses[i % productStatuses.length];
        const price = parseFloat((10 + (i * 1.75 % 25)).toFixed(2));
        const stock = status === 'Out of Stock' ? 0 : 10 + (i * 7 % 90);

        const variations: Variation[] | undefined = i % 5 === 0 ? [
            { id: `var_${i}_1`, value: 'Small', matrix: `S-${i}`, priceMode: 'override', priceValue: price * 0.8, hidden: false, categoryPage: true, productPage: true },
            { id: `var_${i}_2`, value: 'Large', matrix: `L-${i}`, priceMode: 'override', priceValue: price * 1.2, hidden: false, categoryPage: true, productPage: true }
        ] : undefined;
        
        const imageId = name.toLowerCase().replace(/ /g, '-');
        const image = PlaceHolderImages.find(p => p.id === imageId);

        const descriptionDetails = productDescriptions[name] || {
            description: 'A delicious dish prepared with the finest ingredients by our expert chefs.',
            smallDescription: 'A true delight for your taste buds.'
        };

        products.push({
            id: `prod_${i}`,
            name: `${name} ${i < productNames.length ? '' : `#${Math.floor(i / productNames.length)}`}`.trim(),
            category: categories[i % categories.length],
            branch: branchNames[i % branchNames.length],
            price,
            stock,
            status,
            mainImage: image?.imageUrl || `https://picsum.photos/seed/${name.replace(/\s+/g, '-').toLowerCase()}/400/400`,
            description: descriptionDetails.description,
            smallDescription: descriptionDetails.smallDescription,
            discountedPrice: status === 'Active' && i % 4 === 0 ? parseFloat((price * 0.8).toFixed(2)) : undefined,
            variations
        });
    }
    return products;
};

export const mockProducts: Product[] = generateMockProducts(50);

// A simple pseudo-random generator for deterministic "randomness"
const createSeededRandom = (seed: number) => () => {
    let t = seed += 0x6D2B79F5;
    t = Math.imul(t ^ t >>> 15, t | 1);
    t ^= t + Math.imul(t ^ t >>> 7, t | 61);
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
};

// --- Customer and Order Generation (interlinked) ---
const firstNames = ['John', 'Jane', 'Alex', 'Emily', 'Chris', 'Katie', 'Michael', 'Sarah', 'David', 'Laura'];
const lastNames = ['Smith', 'Doe', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez'];
const staffNames = ['Alex', 'Maria', 'John', 'Sarah', 'David', 'Frank M.', 'Emily', 'Jessica', 'Michael', 'Chris', 'Olivia', 'James', 'Sophia', 'Liam', 'Isabella'];
const comments = ['Customer requested extra napkins.', 'Allergy alert: No nuts.', 'Birthday celebration at the table.', null, 'Guest is in a hurry.'];

const generateRelatedMockData = (customerCount: number, orderCount: number, products: Product[]) => {
    const customers: Customer[] = [];
    const orders: Order[] = [];
    const branchNames = mockBranches.map(b => b.name);
    
    const seed = 12345;
    const random = createSeededRandom(seed);
    const baseDate = new Date(2024, 5, 20, 14, 0, 0);

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

        const orderItemsCount = Math.floor(random() * 4) + 2; // 2-5 items
        const currentItems: OrderItem[] = Array.from({ length: orderItemsCount }, (_, k) => {
            const item = products[Math.floor(random() * products.length)];
            return {
                id: `${item.id}-${i}-${k}`,
                name: item.name,
                quantity: Math.floor(random() * 2) + 1,
                price: item.price,
                category: item.category,
            };
        });

        const totalAmount = currentItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
        
        let orderTimestamp: number, paymentState: Order['paymentState'], orderStatus: Order['orderStatus'];
        let paidAmount = 0;
        
        const isRecentOutstanding = i % 5 === 0 && random() > 0.5;
        
        if (isRecentOutstanding) {
            orderTimestamp = subMinutes(baseDate, Math.floor(random() * 180) + 5).getTime();
            orderStatus = 'Open';
            if (random() > 0.4) {
                paymentState = 'Partial';
                paidAmount = totalAmount * (random() * 0.6 + 0.1);
            } else {
                paymentState = 'Unpaid';
                paidAmount = 0;
            }
        } else {
            orderTimestamp = subDays(endOfDay(baseDate), Math.floor(random() * 30) + 1).getTime();
            paidAmount = totalAmount;

            const finalStatuses: Order['orderStatus'][] = ['Completed', 'Paid'];
            if (i % 10 === 0) finalStatuses.push('Cancelled');
            if (i % 15 === 0) finalStatuses.push('Refunded');
            orderStatus = finalStatuses[Math.floor(random() * finalStatuses.length)];

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
            splitType = i % 8 === 0 ? 'byItem' : 'equally';
        }

        if (isSplit) {
            orderStatus = 'Completed';
            paymentState = 'Fully Paid';
            paidAmount = totalAmount;

            if (splitType === 'byItem') {
                const itemsToPay = [...currentItems];
                let guestIndex = 0;
                let payersCount = Math.floor(random() * 5) + 2; 
                
                if (itemsToPay.length < payersCount) payersCount = itemsToPay.length;
                if (payersCount < 2 && itemsToPay.length > 1) payersCount = 2;

                while(itemsToPay.length > 0 && guestIndex < payersCount) {
                    const isLastPayer = guestIndex === payersCount - 1;
                    let itemsForThisPayer: OrderItem[];

                    if (isLastPayer) {
                        itemsForThisPayer = [...itemsToPay];
                        itemsToPay.length = 0;
                    } else {
                        const itemsCountForPayer = Math.max(1, Math.floor(random() * (itemsToPay.length - (payersCount - guestIndex -1) ) ));
                        itemsForThisPayer = itemsToPay.splice(0, itemsCountForPayer);
                    }

                    if(itemsForThisPayer.length === 0) continue;

                    const paymentAmount = itemsForThisPayer.reduce((sum, item) => sum + (item.price * item.quantity), 0);
                    const tip = paymentAmount * (random() * 0.1 + 0.05);

                    customerPayments.push({
                        id: `txn_${12345 + i}_${guestIndex}`,
                        amount: paymentAmount,
                        tip: parseFloat(tip.toFixed(2)),
                        method: 'Credit Card',
                        status: 'Paid',
                        date: format(subMinutes(randomDate, random() * 5), 'PPpp'),
                        items: itemsForThisPayer.map(it => ({ name: it.name, quantity: it.quantity })),
                    });
                    guestIndex++;
                }

            } else { // 'equally'
                const numPayers = Math.floor(random() * 5) + 2;
                const totalTip = parseFloat((totalAmount * (random() * 0.1 + 0.1)).toFixed(2));
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
                        date: format(subMinutes(randomDate, random() * 5), 'PPpp'),
                    });
                }
            }
        } else if (paidAmount > 0) {
            const tip = paymentState === 'Fully Paid' ? paidAmount * (random() > 0.5 ? 0.1 : 0.15) : 0;
            customerPayments.push({
                id: `txn_${12345 + i}`,
                amount: paidAmount,
                tip: tip,
                method: i % 3 === 0 ? 'Cash' : 'Credit Card',
                status: 'Paid',
                date: format(subHours(randomDate, random() > 0.5 ? 0 : 1), 'PPpp'),
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
                total_sale_amount: random() * 5000 + 1000,
                order_count: Math.floor(random() * 50) + 10,
                total_tip_amount: random() * 500,
                currency: 'AED',
                start_date: format(subDays(baseDate, 7), 'yyyy-MM-dd'),
                end_date: format(baseDate, 'yyyy-MM-dd'),
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

const relatedData = generateRelatedMockData(75, 250, mockProducts);
export const mockCustomers: Customer[] = relatedData.customers;
export const mockOrders: Order[] = relatedData.orders;

export const mockCategories: Column[] = [
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

export const mockComboGroups: ComboGroup[] = [
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
    {
        id: 'combo_4',
        name: 'Pizza & Wings Deal',
        description: 'The perfect pair for game night.',
        price: 45.00,
        productIds: ['prod_7', 'prod_5'],
    },
    {
        id: 'combo_5',
        name: 'Healthy Choice',
        description: 'A light and refreshing meal.',
        price: 22.50,
        productIds: ['prod_4', 'prod_11'],
    },
];
