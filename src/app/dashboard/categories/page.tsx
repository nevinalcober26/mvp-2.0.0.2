'use client';
import React, { useState } from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import {
  Eye,
  GripVertical,
  Plus,
  Trash2,
  Pencil,
  ArrowUpDown,
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { DashboardHeader } from '@/components/dashboard/header';

const categoriesData = [
  { id: 1, sortOrder: 1, name: 'Menu', parent: '-' },
  { id: 2, sortOrder: 2, name: 'Special Offer', parent: '-' },
  { id: 3, sortOrder: 3, name: 'About Us', parent: '-' },
  { id: 4, sortOrder: 4, name: 'Contact Us', parent: '-' },
  { id: 5, sortOrder: 5, name: 'Feedback Form', parent: '-' },
  { id: 6, sortOrder: 6, name: 'Food', parent: 'Menu' },
  { id: 7, sortOrder: 7, name: 'Beverages', parent: 'Menu' },
  { id: 11, sortOrder: 11, name: 'Breakfast', parent: 'Food' },
  { id: 12, sortOrder: 12, name: 'Pancakes & French Toast', parent: 'Food' },
  { id: 13, sortOrder: 13, name: 'Keto & Vegan', parent: 'Food' },
  { id: 15, sortOrder: 15, name: 'Appetizers', parent: 'Food' },
  { id: 16, sortOrder: 16, name: 'Soups', parent: 'Food' },
  { id: 17, sortOrder: 17, name: 'Salads', parent: 'Food' },
  { id: 18, sortOrder: 18, name: 'Warm Bowls', parent: 'Food' },
  { id: 19, sortOrder: 19, name: 'Poke Bowls', parent: 'Food' },
];

export default function CategoriesPage() {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredCategories = categoriesData.filter((category) =>
    category.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <>
      <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b bg-card px-4 sm:px-6 lg:px-8 justify-between">
        <h1 className="text-xl font-semibold flex items-center gap-2">
          List of Categories
          <Badge variant="destructive">BLOOMSBURY'S (RAS AL KHAIMAH)</Badge>
        </h1>
        <div className="flex items-center gap-4">
          <Button variant="outline">PUBLISH</Button>
          <Select defaultValue="en">
            <SelectTrigger className="w-auto">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="en">English (EN)</SelectItem>
              <SelectItem value="es">Spanish (ES)</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </header>

      <main className="p-4 sm:p-6 lg:p-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Categories</CardTitle>
            <Button className="bg-purple-600 text-white hover:bg-purple-700">
              <Plus className="h-4 w-4 mr-2" />
              CREATE CATEGORY
            </Button>
          </CardHeader>
          <CardContent>
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center gap-2">
                <span>Show</span>
                <Select defaultValue="25">
                  <SelectTrigger className="w-20">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="10">10</SelectItem>
                    <SelectItem value="25">25</SelectItem>
                    <SelectItem value="50">50</SelectItem>
                    <SelectItem value="100">100</SelectItem>
                  </SelectContent>
                </Select>
                <span>entries</span>
              </div>
              <div className="flex items-center gap-2">
                <span>Search:</span>
                <Input
                  type="search"
                  className="w-auto"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-24">
                    <Button variant="ghost" size="sm">
                      Sort Order <ArrowUpDown className="h-4 w-4 ml-2" />
                    </Button>
                  </TableHead>
                  <TableHead>
                    <Button variant="ghost" size="sm">
                      Name <ArrowUpDown className="h-4 w-4 ml-2" />
                    </Button>
                  </TableHead>
                  <TableHead>
                    <Button variant="ghost" size="sm">
                      Parent <ArrowUpDown className="h-4 w-4 ml-2" />
                    </Button>
                  </TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCategories.map((category) => (
                  <TableRow key={category.id}>
                    <TableCell className="flex items-center gap-2">
                      <GripVertical className="h-5 w-5 text-muted-foreground cursor-grab" />
                      {category.sortOrder}
                    </TableCell>
                    <TableCell className="font-medium">{category.name}</TableCell>
                    <TableCell>{category.parent}</TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="icon" className="text-blue-600 hover:text-blue-700">
                        <Eye className="h-5 w-5" />
                      </Button>
                      <Button variant="ghost" size="icon" className="text-green-600 hover:text-green-700">
                        <Pencil className="h-5 w-5" />
                      </Button>
                      <Button variant="ghost" size="icon" className="text-red-600 hover:text-red-700">
                        <Trash2 className="h-5 w-5" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </main>
    </>
  );
}
