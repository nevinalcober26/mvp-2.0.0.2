'use client';

import { useState, useMemo } from 'react';
import { DashboardHeader } from "@/components/dashboard/header";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { PlusCircle, Edit, Trash, Image as ImageIcon, List, LayoutGrid, MoreVertical } from 'lucide-react';
import Image from 'next/image';
import { useToast } from '@/hooks/use-toast';
import type { Property } from './types';
import { PropertySheet } from './property-sheet';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

const initialPropertiesData: Omit<Property, 'id'>[] = [
  { name: 'Algae', imageUrl: null },
  { name: 'Celery', imageUrl: null },
  { name: 'Cocoa', imageUrl: 'https://picsum.photos/seed/cocoa/100' },
  { name: 'Dairy', imageUrl: 'https://picsum.photos/seed/dairy/100' },
  { name: 'Egg', imageUrl: 'https://picsum.photos/seed/egg/100' },
  { name: 'Fish', imageUrl: 'https://picsum.photos/seed/fish/100' },
  { name: 'Gluten', imageUrl: null },
  { name: 'Legume', imageUrl: null },
  { name: 'Milk', imageUrl: 'https://picsum.photos/seed/milk/100' },
  { name: 'Mushroom', imageUrl: 'https://picsum.photos/seed/mushroom/100' },
  { name: 'Nuts', imageUrl: 'https://picsum.photos/seed/nuts/100' },
  { name: 'Seeds', imageUrl: 'https://picsum.photos/seed/seeds/100' },
  { name: 'Shellfish', imageUrl: 'https://picsum.photos/seed/shellfish/100' },
  { name: 'Soy', imageUrl: 'https://picsum.photos/seed/soy/100' },
  { name: 'Vegan', imageUrl: 'https://picsum.photos/seed/vegan/100' },
  { name: 'Vegetarian', imageUrl: 'https://picsum.photos/seed/vegetarian/100' },
  { name: 'Spicy', imageUrl: 'https://picsum.photos/seed/spicy/100' },
  { name: 'Halal', imageUrl: null },
].sort((a,b) => a.name.localeCompare(b.name));

const initialProperties: Property[] = initialPropertiesData.map((p, i) => ({
  id: `prop_${i + 1}`,
  ...p,
}));


export default function PropertiesPage() {
    const [properties, setProperties] = useState<Property[]>(initialProperties);
    const [isSheetOpen, setIsSheetOpen] = useState(false);
    const [editingProperty, setEditingProperty] = useState<Property | null>(null);
    const [deleteTarget, setDeleteTarget] = useState<Property | null>(null);
    const { toast } = useToast();

    const [view, setView] = useState<'list' | 'grid'>('list');
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = view === 'list' ? 10 : 8;

    const paginatedProperties = useMemo(() => {
        const startIndex = (currentPage - 1) * itemsPerPage;
        return properties.slice(startIndex, startIndex + itemsPerPage);
    }, [properties, currentPage, itemsPerPage]);

    const totalPages = Math.ceil(properties.length / itemsPerPage);

    const handleAdd = () => {
        setEditingProperty(null);
        setIsSheetOpen(true);
    }
    
    const handleEdit = (prop: Property) => {
        setEditingProperty(prop);
        setIsSheetOpen(true);
    }
    
    const handleDelete = () => {
        if (!deleteTarget) return;
        setProperties(props => props.filter(p => p.id !== deleteTarget.id));
        toast({
          variant: 'destructive',
          title: 'Property Deleted',
          description: `The "${deleteTarget.name}" property has been removed.`,
        });
        setDeleteTarget(null);
    }
    
    const handleSave = (data: Property) => {
        setProperties(props => {
            const index = props.findIndex(p => p.id === data.id);
            if (index > -1) {
                const newProps = [...props];
                newProps[index] = data;
                return newProps;
            }
            return [data, ...props].sort((a,b) => a.name.localeCompare(b.name));
        });
    }

    return (
        <>
            <DashboardHeader />
            <main className="p-4 sm:p-6 lg:p-8 space-y-6">
                <div className="flex items-start justify-between">
                  <div>
                    <h1 className="text-2xl font-bold">Product Properties</h1>
                    <p className="text-muted-foreground">
                        Manage special tags for your products, like allergens or dietary needs, each with its own icon.
                    </p>
                  </div>
                  <Button onClick={handleAdd}>
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Add Property
                  </Button>
                </div>

                <Card>
                    <CardHeader>
                        <div className="flex justify-between items-center">
                            <div>
                                <CardTitle>All Properties</CardTitle>
                                <CardDescription>
                                    A list of all available properties in your restaurant.
                                </CardDescription>
                            </div>
                             <div className="flex items-center gap-2">
                                <Button variant={view === 'list' ? 'default' : 'outline'} size="icon" onClick={() => setView('list')}>
                                    <List className="h-4 w-4" />
                                </Button>
                                <Button variant={view === 'grid' ? 'default' : 'outline'} size="icon" onClick={() => setView('grid')}>
                                    <LayoutGrid className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="min-h-[400px]">
                        {view === 'list' ? (
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead className="w-[80px]">Icon</TableHead>
                                        <TableHead>Property Name</TableHead>
                                        <TableHead className="text-right w-[150px]">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {paginatedProperties.length > 0 ? (
                                        paginatedProperties.map(prop => (
                                            <TableRow key={prop.id}>
                                                <TableCell>
                                                    <div className="w-12 h-12 rounded-md bg-muted flex items-center justify-center border overflow-hidden">
                                                        {prop.imageUrl ? (
                                                            <Image src={prop.imageUrl} alt={prop.name} width={48} height={48} className="object-contain" />
                                                        ) : (
                                                            <ImageIcon className="h-6 w-6 text-muted-foreground" />
                                                        )}
                                                    </div>
                                                </TableCell>
                                                <TableCell className="font-medium text-base">{prop.name}</TableCell>
                                                <TableCell className="text-right">
                                                    <TooltipProvider>
                                                      <div className="flex gap-1 justify-end">
                                                          <Tooltip>
                                                              <TooltipTrigger asChild>
                                                                  <Button variant="ghost" size="icon" onClick={() => handleEdit(prop)}>
                                                                      <Edit className="h-4 w-4" />
                                                                  </Button>
                                                              </TooltipTrigger>
                                                              <TooltipContent>Edit Property</TooltipContent>
                                                          </Tooltip>
                                                          <Tooltip>
                                                              <TooltipTrigger asChild>
                                                                  <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-destructive hover:bg-destructive/5" onClick={() => setDeleteTarget(prop)}>
                                                                      <Trash className="h-4 w-4" />
                                                                  </Button>
                                                              </TooltipTrigger>
                                                              <TooltipContent>Delete Property</TooltipContent>
                                                          </Tooltip>
                                                      </div>
                                                    </TooltipProvider>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    ) : (
                                        <TableRow>
                                            <TableCell colSpan={3} className="h-24 text-center">
                                                No properties found. Get started by adding a new one.
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        ) : (
                            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                                {paginatedProperties.map(prop => (
                                    <Card key={prop.id} className="group relative transition-all hover:shadow-lg border hover:border-primary/50">
                                        <CardContent className="flex flex-col items-center justify-center p-6 gap-4 aspect-square">
                                            <div className="w-[100px] h-[100px] rounded-lg bg-muted flex items-center justify-center border overflow-hidden transition-transform group-hover:scale-105">
                                                {prop.imageUrl ? (
                                                    <Image src={prop.imageUrl} alt={prop.name} width={100} height={100} className="object-contain" />
                                                ) : (
                                                    <ImageIcon className="h-10 w-10 text-muted-foreground" />
                                                )}
                                            </div>
                                            <p className="font-semibold text-center">{prop.name}</p>
                                        </CardContent>
                                        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" size="icon" className="h-8 w-8">
                                                        <MoreVertical className="h-4 w-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    <DropdownMenuItem onSelect={() => handleEdit(prop)}>
                                                        <Edit className="mr-2 h-4 w-4" /> Edit
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem onSelect={() => setDeleteTarget(prop)} className="text-destructive">
                                                        <Trash className="mr-2 h-4 w-4" /> Delete
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </div>
                                    </Card>
                                ))}
                            </div>
                        )}
                    </CardContent>
                     <CardFooter className="flex items-center justify-between">
                        <div className="text-xs text-muted-foreground">
                            Showing <strong>{properties.length === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1}</strong> to <strong>{Math.min(currentPage * itemsPerPage, properties.length)}</strong> of <strong>{properties.length}</strong> properties
                        </div>
                        <div className="flex items-center space-x-2">
                            <Button variant="outline" size="sm" onClick={() => setCurrentPage(p => Math.max(p - 1, 1))} disabled={currentPage === 1}>
                                Previous
                            </Button>
                            <Button variant="outline" size="sm" onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))} disabled={currentPage === totalPages}>
                                Next
                            </Button>
                        </div>
                    </CardFooter>
                </Card>
            </main>
            
            <PropertySheet
                open={isSheetOpen}
                onOpenChange={setIsSheetOpen}
                property={editingProperty}
                onSave={handleSave}
            />
            
            <AlertDialog open={!!deleteTarget} onOpenChange={() => setDeleteTarget(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete the <strong>{deleteTarget?.name}</strong> property.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDelete} className="bg-destructive hover:bg-destructive/90">Delete</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
}
