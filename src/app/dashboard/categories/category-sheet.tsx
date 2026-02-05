'use client';
import { useState, useEffect, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
  SheetClose,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Upload, Image as ImageIcon, ChevronRight } from 'lucide-react';
import { UniqueIdentifier } from '@dnd-kit/core';
import { getCategoryOptions } from './utils';
import type { Column, Item } from './types';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import Image from 'next/image';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';


const categorySchema = z.object({
  name: z.string().min(1, 'Category name is required'),
  description: z.string().optional(),
  parentId: z.string().default('none'),
  // display
  displayFullwidth: z.boolean().default(false),
  hiddenTitle: z.boolean().default(false),
  hiddenImage: z.boolean().default(false),
  cardShadow: z.boolean().default(true),
  viewFormat: z.string().optional(),
  // advanced
  hidden: z.boolean().default(false),
  disableLink: z.boolean().default(false),
  externalLink: z.string().url().optional().or(z.literal('')),
  promotions: z.string().optional(),
  sortOrder: z.coerce.number().optional(),
  // special
  enableSpecial: z.boolean().default(false),
  specialType: z.string().optional(),
  displaySeparate: z.boolean().default(false),
});

export type CategoryFormValues = z.infer<typeof categorySchema>;

interface CategorySheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  category: Column | Item | null;
  board: Column[];
  onUpdateCategory: (id: UniqueIdentifier, values: CategoryFormValues) => void;
}

const findItem = (
  items: Item[],
  itemId: UniqueIdentifier
): { item: Item | null; parentId: UniqueIdentifier | null } => {
  for (const item of items) {
    if (item.id === itemId) return { item, parentId: null };
    if (item.children) {
      const found = findItem(item.children, itemId);
      if (found.item) {
        if (found.parentId === null) {
          return { item: found.item, parentId: item.id };
        }
        return found;
      }
    }
  }
  return { item: null, parentId: null };
};

const findParent = (
  board: Column[],
  itemId: UniqueIdentifier
): UniqueIdentifier | null => {
  for (const column of board) {
    if (column.items.some((item) => item.id === itemId)) {
      return column.id;
    }
    for (const item of column.items) {
      const { item: foundItem, parentId } = findItem(item.children || [], itemId);
      if (foundItem) {
        return parentId ?? item.id;
      }
    }
  }
  return null;
};

export function CategorySheet({
  open,
  onOpenChange,
  category,
  board,
  onUpdateCategory,
}: CategorySheetProps) {
  const form = useForm<CategoryFormValues>({
    resolver: zodResolver(categorySchema),
    mode: 'onChange',
  });

  useEffect(() => {
    if (open && category) {
      const parentId = 'items' in category ? 'none' : findParent(board, category.id);
      form.reset({
        name: category.name || '',
        description: category.description || '',
        parentId: parentId ? parentId.toString() : 'none',
        displayFullwidth: category.displayFullwidth || false,
        hiddenTitle: category.hiddenTitle || false,
        hiddenImage: category.hiddenImage || false,
        cardShadow: category.cardShadow ?? true,
        viewFormat: category.viewFormat || 'grid_with_images',
        hidden: category.hidden || false,
        disableLink: category.disableLink || false,
        externalLink: category.externalLink || '',
        promotions: category.promotions || 'none',
        sortOrder: category.sortOrder || 0,
        enableSpecial: category.enableSpecial || false,
        displaySeparate: category.displaySeparate || false,
        specialType: category.specialType || undefined,
      });
    }
  }, [open, category, board, form]);

  const categoryOptions = useMemo(() => category ? getCategoryOptions(
    board,
    'items' in category ? undefined : category.id
  ) : [], [category, board]);

  const onSubmit = (data: CategoryFormValues) => {
    if (category) {
      onUpdateCategory(category.id, data);
    }
    onOpenChange(false);
  };
  
  const disableLink = form.watch('disableLink');
  const enableSpecial = form.watch('enableSpecial');

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-2xl w-full p-0">
        {category && (
            <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col h-full">
                <SheetHeader className="p-6 border-b">
                  <SheetTitle className="text-xl">Update Category</SheetTitle>
                  <SheetDescription>
                    Edit the details for your category. Advanced settings are optional.
                  </SheetDescription>
                </SheetHeader>
                <ScrollArea className="flex-grow p-6">
                    <div className="space-y-6">
                         <Card>
                            <CardHeader>
                                <CardTitle>General Information</CardTitle>
                                <CardDescription>The most important details for your category.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4 pt-6">
                                <FormField control={form.control} name="name" render={({ field }) => (<FormItem><FormLabel>Category Name*</FormLabel><FormControl><Input {...field} placeholder="e.g., Desserts" /></FormControl><FormMessage /></FormItem>)} />
                                <FormField control={form.control} name="parentId" render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Parent Category</FormLabel>
                                        <Select onValueChange={field.onChange} value={field.value}><FormControl><SelectTrigger><SelectValue placeholder="Select a parent category" /></SelectTrigger></FormControl>
                                            <SelectContent>
                                                <SelectItem value="none">None (Top-level Column)</SelectItem>
                                                {categoryOptions.map((option) => (<SelectItem key={option.value} value={option.value}><span style={{ paddingLeft: `${option.depth * 1.5}rem` }}>{option.depth > 0 && '↳ '}{option.label}</span></SelectItem>))}
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )} />
                                <FormField control={form.control} name="description" render={({ field }) => (<FormItem><FormLabel>Description</FormLabel><FormControl><Textarea {...field} rows={3} placeholder="A short, helpful description for this category." /></FormControl><FormMessage /></FormItem>)} />
                            </CardContent>
                        </Card>

                        <Collapsible>
                            <CollapsibleTrigger asChild>
                                <div className="flex items-center justify-between w-full p-4 rounded-lg border cursor-pointer hover:bg-muted/50">
                                    <h3 className="font-semibold">Display & Appearance</h3>
                                    <ChevronRight className="h-5 w-5 transition-transform data-[state=open]:rotate-90" />
                                </div>
                            </CollapsibleTrigger>
                            <CollapsibleContent className="border border-t-0 rounded-b-lg p-4 space-y-4">
                                <div className="space-y-2">
                                    <FormLabel>Image</FormLabel>
                                    <div className="flex items-center gap-6">
                                        <div className="w-40 h-24 rounded-md border border-dashed flex items-center justify-center bg-muted">
                                            <Image src="https://picsum.photos/seed/menu/160/96" width={160} height={96} alt="Category image" className="rounded-md object-cover"/>
                                        </div>
                                        <div className="flex flex-col gap-2">
                                        <Button variant="outline" asChild><label htmlFor="image-upload-edit" className="cursor-pointer"><Upload className="mr-2 h-4 w-4" />Change Image<Input id="image-upload-edit" type="file" className="sr-only" /></label></Button>
                                        <Button variant="ghost" className="text-destructive hover:text-destructive">Clear</Button>
                                        </div>
                                    </div>
                                </div>
                                <FormField control={form.control} name="viewFormat" render={({ field }) => (<FormItem><FormLabel>View Format</FormLabel><Select onValueChange={field.onChange} value={field.value}><FormControl><SelectTrigger><SelectValue placeholder="Select view format" /></SelectTrigger></FormControl><SelectContent><SelectItem value="grid_with_images">Grid with Images</SelectItem><SelectItem value="list">List View</SelectItem></SelectContent></Select></FormItem>)} />
                                <FormField control={form.control} name="displayFullwidth" render={({ field }) => (<FormItem className="flex items-center justify-between rounded-lg border p-3"><div className="space-y-0.5"><FormLabel>Display Fullwidth</FormLabel></div><FormControl><Switch checked={field.value} onCheckedChange={field.onChange} /></FormControl></FormItem>)} />
                                <FormField control={form.control} name="hiddenTitle" render={({ field }) => (<FormItem className="flex items-center justify-between rounded-lg border p-3"><div className="space-y-0.5"><FormLabel>Hide Title on Menu</FormLabel></div><FormControl><Switch checked={field.value} onCheckedChange={field.onChange} /></FormControl></FormItem>)} />
                                <FormField control={form.control} name="hiddenImage" render={({ field }) => (<FormItem className="flex items-center justify-between rounded-lg border p-3"><div className="space-y-0.5"><FormLabel>Hide Image on Menu</FormLabel></div><FormControl><Switch checked={field.value} onCheckedChange={field.onChange} /></FormControl></FormItem>)} />
                                <FormField control={form.control} name="cardShadow" render={({ field }) => (<FormItem className="flex items-center justify-between rounded-lg border p-3"><div className="space-y-0.5"><FormLabel>Enable Card Shadow</FormLabel></div><FormControl><Switch checked={field.value} onCheckedChange={field.onChange} /></FormControl></FormItem>)} />
                            </CollapsibleContent>
                        </Collapsible>

                         <Collapsible>
                            <CollapsibleTrigger asChild>
                                <div className="flex items-center justify-between w-full p-4 rounded-lg border cursor-pointer hover:bg-muted/50">
                                    <h3 className="font-semibold">Advanced Settings</h3>
                                    <ChevronRight className="h-5 w-5 transition-transform data-[state=open]:rotate-90" />
                                </div>
                            </CollapsibleTrigger>
                            <CollapsibleContent className="border border-t-0 rounded-b-lg p-4 space-y-4">
                                <FormField control={form.control} name="hidden" render={({ field }) => (<FormItem className="flex items-center justify-between rounded-lg border p-3"><div className="space-y-0.5"><FormLabel>Hide Category Entirely</FormLabel></div><FormControl><Switch checked={field.value} onCheckedChange={field.onChange} /></FormControl></FormItem>)} />
                                <div className="rounded-lg border p-3 space-y-4">
                                    <FormField control={form.control} name="disableLink" render={({ field }) => (<FormItem className="flex items-center justify-between"><div className="space-y-0.5"><FormLabel>Disable Category Link</FormLabel></div><FormControl><Switch checked={field.value} onCheckedChange={field.onChange} /></FormControl></FormItem>)} />
                                    {disableLink && (<FormField control={form.control} name="externalLink" render={({ field }) => (<FormItem className="pt-3 border-t"><FormLabel>External Link URL</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />)}
                                </div>
                                <FormField control={form.control} name="promotions" render={({ field }) => (<FormItem><FormLabel>Apply Promotions</FormLabel><Select onValueChange={field.onChange} value={field.value}><FormControl><SelectTrigger><SelectValue placeholder="Select promotions" /></SelectTrigger></FormControl><SelectContent><SelectItem value="none">No Promotions</SelectItem><SelectItem value="summer_sale">Summer Sale</SelectItem></SelectContent></Select></FormItem>)} />
                                <FormField control={form.control} name="sortOrder" render={({ field }) => (<FormItem><FormLabel>Sort Order</FormLabel><FormControl><Input type="number" {...field} /></FormControl></FormItem>)} />
                            </CollapsibleContent>
                        </Collapsible>

                         <Collapsible>
                            <CollapsibleTrigger asChild>
                                <div className="flex items-center justify-between w-full p-4 rounded-lg border cursor-pointer hover:bg-muted/50">
                                    <h3 className="font-semibold">Special Category</h3>
                                    <ChevronRight className="h-5 w-5 transition-transform data-[state=open]:rotate-90" />
                                </div>
                            </CollapsibleTrigger>
                            <CollapsibleContent className="border border-t-0 rounded-b-lg p-4 space-y-4">
                                <FormField control={form.control} name="enableSpecial" render={({ field }) => (<FormItem className="flex items-center justify-between rounded-lg border p-3"><div className="space-y-0.5"><FormLabel>Enable as a Special Category</FormLabel></div><FormControl><Switch checked={field.value} onCheckedChange={field.onChange} /></FormControl></FormItem>)} />
                                {enableSpecial && (
                                    <div className="pt-4 border-t space-y-6">
                                        <FormField control={form.control} name="specialType" render={({ field }) => (<FormItem><FormLabel>Special Category Type</FormLabel><Select onValueChange={field.onChange} value={field.value}><FormControl><SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger></FormControl><SelectContent><SelectItem value="popular">Popular</SelectItem><SelectItem value="new">New</SelectItem><SelectItem value="featured">Featured</SelectItem></SelectContent></Select><FormMessage /></FormItem>)} />
                                        <FormField control={form.control} name="displaySeparate" render={({ field }) => (<FormItem className="flex items-center justify-between rounded-lg border p-4"><div className="space-y-0.5"><FormLabel>Display products in separate categories</FormLabel></div><FormControl><Switch checked={field.value} onCheckedChange={field.onChange} /></FormControl></FormItem>)} />
                                    </div>
                                )}
                            </CollapsibleContent>
                         </Collapsible>
                    </div>
                </ScrollArea>
                <SheetFooter className="p-6 border-t bg-background">
                    <SheetClose asChild><Button variant="ghost">Cancel</Button></SheetClose>
                    <Button type="submit">Update Category</Button>
                </SheetFooter>
            </form>
            </Form>
        )}
      </SheetContent>
    </Sheet>
  );
}
