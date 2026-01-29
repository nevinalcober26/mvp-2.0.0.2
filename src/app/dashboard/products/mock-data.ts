'use client';
import type { Product } from './types';

const productNames = [
  'Classic Cheeseburger',
  'Truffle Fries',
  'Seasonal Berry Crumble',
  'Artisanal Pizza',
  'Fresh Garden Salad',
  'Spicy Chicken Wings',
  'Avocado Toast',
  'Margherita Pizza',
  'Ribeye Steak',
  'Chocolate Lava Cake',
];
const categories = ['Burgers', 'Sides', 'Desserts', 'Mains', 'Salads'];
const statuses: Product['status'][] = ['Active', 'Draft', 'Archived', 'Out of Stock'];

export const generateMockProducts = (count: number): Product[] => {
  const products: Product[] = [];
  for (let i = 0; i < count; i++) {
    const name = productNames[i % productNames.length];
    const status = statuses[i % statuses.length];
    const price = Math.floor(Math.random() * 30) + 5;
    products.push({
      id: `prod_${i}`,
      name: `${name} ${i < productNames.length ? '' : ` #${Math.floor(i / productNames.length)}`}`,
      category: categories[i % categories.length],
      price,
      stock: status === 'Out of Stock' ? 0 : Math.floor(Math.random() * 100),
      status,
      description:
        'A detailed description of the product goes here, including ingredients and preparation methods.',
      smallDescription: 'A short and catchy description for the product.',
      discountedPrice: status === 'Active' && i % 4 === 0 ? price * 0.8 : undefined,
    });
  }
  return products;
};
