'use client';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MoreHorizontal, PlusCircle } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';
import { useEffect, useState } from 'react';

const menuItems = [
  {
    name: 'Classic Cheeseburger',
    category: 'Burgers',
    price: 12.99,
    stock: 45,
    status: 'Active',
  },
  {
    name: 'Truffle Fries',
    category: 'Sides',
    price: 7.5,
    stock: 120,
    status: 'Active',
  },
  {
    name: 'Seasonal Berry Crumble',
    category: 'Desserts',
    price: 9.0,
    stock: 0,
    status: 'Out of Stock',
  },
  {
    name: 'Artisanal Pizza',
    category: 'Mains',
    price: 18.5,
    stock: 23,
    status: 'Active',
  },
  {
    name: 'Fresh Garden Salad',
    category: 'Salads',
    price: 10.25,
    stock: 30,
    status: 'Low Stock',
  },
];

import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';

// ... (keep the same imports and menuItems array)

export function MenuItemsTable() {
  const [isClient, setIsClient] = useState(false);
  const [activeCategory, setActiveCategory] = useState('All');

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) {
    return null;
  }

  const categories = ['All', ...Array.from(new Set(menuItems.map(item => item.category)))];

  const filteredItems = activeCategory === 'All' 
    ? menuItems 
    : menuItems.filter(item => item.category === activeCategory);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Menu Management</CardTitle>
          <CardDescription>Add, edit, and categorize products.</CardDescription>
        </div>
        <Button size="sm">
          <PlusCircle className="h-4 w-4 mr-2" />
          Add Product
        </Button>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="All" value={activeCategory} onValueChange={setActiveCategory} className="w-full mb-4">
          <TabsList className="flex flex-wrap h-auto mb-4 bg-muted/50 p-1">
            {categories.map(cat => (
              <TabsTrigger key={cat} value={cat} className="flex-1 min-w-[100px]">{cat}</TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
        <div className="relative w-full overflow-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Product</TableHead>
                <TableHead>Category</TableHead>
                <TableHead className="text-right">Price</TableHead>
                <TableHead className="text-right">Stock</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>
                  <span className="sr-only">Actions</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredItems.map((item) => (
                <TableRow key={item.name}>
                  <TableCell className="font-medium">{item.name}</TableCell>
                  <TableCell>{item.category}</TableCell>
                  <TableCell className="text-right">
                    ${item.price.toFixed(2)}
                  </TableCell>
                  <TableCell className="text-right">{item.stock}</TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        item.status === 'Active'
                          ? 'default'
                          : item.status === 'Out of Stock'
                          ? 'destructive'
                          : 'secondary'
                      }
                      className={
                        item.status === 'Active'
                          ? 'bg-green-100 text-green-800'
                          : ''
                      }
                    >
                      {item.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button aria-haspopup="true" size="icon" variant="ghost">
                          <MoreHorizontal className="h-4 w-4" />
                          <span className="sr-only">Toggle menu</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>Edit</DropdownMenuItem>
                        <DropdownMenuItem>Archive</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
