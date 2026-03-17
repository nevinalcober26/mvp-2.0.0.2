'use client';

import { useState } from 'react';
import { DashboardHeader } from "@/components/dashboard/header";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { PlusCircle, MoreVertical, Edit, Trash, Package } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
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
import { mockDataStore } from '@/lib/mock-data-store';
import type { ComboGroup } from './types';
import { ComboGroupSheet } from './combo-group-sheet';
import { useToast } from '@/hooks/use-toast';

export default function ComboGroupsPage() {
  const [comboGroups, setComboGroups] = useState<ComboGroup[]>(mockDataStore.comboGroups);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [editingGroup, setEditingGroup] = useState<ComboGroup | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<ComboGroup | null>(null);
  const { toast } = useToast();

  const getProductById = (id: string) => mockDataStore.products.find(p => p.id === id);

  const handleAdd = () => {
    setEditingGroup(null);
    setIsSheetOpen(true);
  };

  const handleEdit = (group: ComboGroup) => {
    setEditingGroup(group);
    setIsSheetOpen(true);
  };

  const handleDelete = () => {
    if (!deleteTarget) return;
    setComboGroups(groups => groups.filter(g => g.id !== deleteTarget.id));
    toast({
      variant: 'destructive',
      title: 'Combo Deleted',
      description: `The "${deleteTarget.name}" combo group has been removed.`,
    });
    setDeleteTarget(null);
  };

  const handleSave = (data: ComboGroup) => {
    setComboGroups(groups => {
      const index = groups.findIndex(g => g.id === data.id);
      if (index > -1) {
        const newGroups = [...groups];
        newGroups[index] = data;
        return newGroups;
      }
      return [data, ...groups];
    });
  };

  return (
    <>
      <DashboardHeader />
      <main className="p-4 sm:p-6 lg:p-8 space-y-6">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold">Combo Groups</h1>
            <p className="text-muted-foreground">
              Create and manage product bundles and special meal deals.
            </p>
          </div>
          <Button onClick={handleAdd}>
            <PlusCircle className="mr-2 h-4 w-4" />
            Add Combo Group
          </Button>
        </div>
        
        {comboGroups.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {comboGroups.map(group => (
              <Card key={group.id} className="flex flex-col">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div className="space-y-1">
                      <CardTitle>{group.name}</CardTitle>
                      <CardDescription className="text-primary font-bold text-lg">${group.price.toFixed(2)}</CardDescription>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8 -mt-2 -mr-2">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onSelect={() => handleEdit(group)}>
                          <Edit className="mr-2 h-4 w-4" /> Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem onSelect={() => setDeleteTarget(group)} className="text-destructive">
                          <Trash className="mr-2 h-4 w-4" /> Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                   <CardDescription>
                    {group.description}
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex-grow">
                  <h4 className="text-sm font-semibold mb-2 text-muted-foreground flex items-center gap-2"><Package className="h-4 w-4"/> Items in Combo</h4>
                  <div className="flex flex-wrap gap-2">
                    {group.productIds.slice(0, 5).map(productId => {
                      const product = getProductById(productId);
                      return product ? <Badge key={productId} variant="secondary">{product.name}</Badge> : null;
                    })}
                    {group.productIds.length > 5 && (
                      <Badge variant="outline">+{group.productIds.length - 5} more</Badge>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="text-center py-20">
            <CardHeader>
                <CardTitle className="text-2xl">No Combo Groups Found</CardTitle>
                <CardDescription>
                    Create your first combo deal to bundle products together.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <Button onClick={handleAdd}>
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Create Combo Group
                </Button>
            </CardContent>
          </Card>
        )}
      </main>

      <ComboGroupSheet 
        open={isSheetOpen}
        onOpenChange={setIsSheetOpen}
        group={editingGroup}
        onSave={handleSave}
      />
      
      <AlertDialog open={!!deleteTarget} onOpenChange={() => setDeleteTarget(null)}>
          <AlertDialogContent>
              <AlertDialogHeader>
                  <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                      This action cannot be undone. This will permanently delete the <strong>{deleteTarget?.name}</strong> combo group.
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
