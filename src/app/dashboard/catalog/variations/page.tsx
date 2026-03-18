'use client';

import { useState } from 'react';
import { DashboardHeader } from "@/components/dashboard/header";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { PlusCircle, MoreVertical, Edit, Trash } from 'lucide-react';
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
import type { VariationGroup } from './types';
import { VariationGroupSheet } from './variation-group-sheet';
import { useToast } from '@/hooks/use-toast';

export default function VariationsPage() {
  const [variationGroups, setVariationGroups] = useState<VariationGroup[]>(mockDataStore.variationGroups.sort((a, b) => a.sortOrder - b.sortOrder));
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [editingGroup, setEditingGroup] = useState<VariationGroup | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<VariationGroup | null>(null);
  const { toast } = useToast();

  const handleAdd = () => {
    setEditingGroup(null);
    setIsSheetOpen(true);
  };

  const handleEdit = (group: VariationGroup) => {
    setEditingGroup(group);
    setIsSheetOpen(true);
  };

  const handleDelete = () => {
    if (!deleteTarget) return;
    setVariationGroups(groups => groups.filter(g => g.id !== deleteTarget.id));
    toast({
      variant: 'destructive',
      title: 'Group Deleted',
      description: `The "${deleteTarget.name}" variation group has been removed.`,
    });
    setDeleteTarget(null);
  };

  const handleSave = (data: VariationGroup) => {
    // Sort options within the group
    data.options.sort((a, b) => a.sortOrder - b.sortOrder);
    
    setVariationGroups(groups => {
      const index = groups.findIndex(g => g.id === data.id);
      let newGroups;
      if (index > -1) {
        newGroups = [...groups];
        newGroups[index] = data;
      } else {
        newGroups = [data, ...groups];
      }
      // Sort groups by their sortOrder
      return newGroups.sort((a,b) => a.sortOrder - b.sortOrder);
    });
  };

  return (
    <>
      <DashboardHeader />
      <main className="p-4 sm:p-6 lg:p-8 space-y-6">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold">Product Variations</h1>
            <p className="text-muted-foreground">
              Create and manage reusable sets of options for your products.
            </p>
          </div>
          <Button onClick={handleAdd}>
            <PlusCircle className="mr-2 h-4 w-4" />
            Add Variation Group
          </Button>
        </div>
        
        {variationGroups.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {variationGroups.map(group => (
              <Card key={group.id}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <CardTitle>{group.name}</CardTitle>
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
                  <CardDescription className="flex flex-wrap gap-2 items-center">
                    <span>{group.options.length} options</span>
                    {group.multiple && <Badge variant="outline">Multiple</Badge>}
                    {group.required && <Badge variant="outline">Required</Badge>}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {group.options.slice(0, 7).map(option => (
                      <Badge key={option.id} variant="secondary">{option.value}</Badge>
                    ))}
                    {group.options.length > 7 && (
                      <Badge variant="outline">+{group.options.length - 7} more</Badge>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="text-center py-20">
            <CardHeader>
                <CardTitle className="text-2xl">No Variation Groups Found</CardTitle>
                <CardDescription>
                    Get started by creating your first group of product options.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <Button onClick={handleAdd}>
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Create Variation Group
                </Button>
            </CardContent>
          </Card>
        )}
      </main>

      <VariationGroupSheet 
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
                      This action cannot be undone. This will permanently delete the <strong>{deleteTarget?.name}</strong> variation group.
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
