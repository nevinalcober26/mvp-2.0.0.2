'use client';
import { useMemo, useEffect } from 'react';
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
import type { Column } from './types';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from '@/components/ui/form';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
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

interface AddCategorySheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAddCategory: (values: CategoryFormValues) => void;
  board: Column[];
  initialParentId?: UniqueIdentifier | 'none' | 'new-column';
}

export function AddCategorySheet({
  open,
  onOpenChange,
  onAddCategory,
  board,
  initialParentId = 'none',
}: AddCategorySheetProps) {
  const categoryOptions = useMemo(() => getCategoryOptions(board), [board]);

  const form = useForm<CategoryFormValues>({
    resolver: zodResolver(categorySchema),
    defaultValues: {
      name: '',
      description: '',
      parentId: initialParentId.toString(),
      displayFullwidth: false,
      hiddenTitle: false,
      hiddenImage: false,
      cardShadow: true,
      viewFormat: 'grid_with_images',
      hidden: false,
      disableLink: false,
      externalLink: '',
      promotions: 'none',
      sortOrder: 0,
      enableSpecial: false,
      displaySeparate: false,
    },
  });
  
  useEffect(() => {
    if (open) {
      form.reset({
        name: '',
        description: '',
        parentId: initialParentId.toString() === 'new-column' ? 'none' : initialParentId.toString(),
        displayFullwidth: false,
        hiddenTitle: false,
        hiddenImage: false,
        cardShadow: true,
        viewFormat: 'grid_with_images',
        hidden: false,
        disableLink: false,
        externalLink: '',
        promotions: 'none',
        sortOrder: 0,
        enableSpecial: false,
        displaySeparate: false,
      });
    }
  }, [open, initialParentId, form]);

  const onSubmit = (data: CategoryFormValues) => {
    onAddCategory(data);
    onOpenChange(false);
  };
  
  const disableLink = form.watch('disableLink');
  const enableSpecial = form.watch('enableSpecial');

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-lg w-full p-0">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col h-full">
            <SheetHeader className="p-6 border-b">
              <SheetTitle className="text-xl">Add New Category</SheetTitle>
              <SheetDescription>
                Fill in the details for your new menu category.
              </SheetDescription>
            </SheetHeader>
            <ScrollArea className="flex-grow p-6">
              <div className="space-y-8">
                <div className="space-y-4">
                  <FormField control={form.control} name="name" render={({ field }) => (<FormItem><FormLabel>Category Name*</FormLabel><FormControl><Input {...field} placeholder="e.g., Desserts" /></FormControl><FormMessage /></FormItem>)} />
                  <FormField control={form.control} name="parentId" render={({ field }) => (
                      <FormItem>
                          <FormLabel>Parent Category</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}><FormControl><SelectTrigger><SelectValue placeholder="Select a parent category" /></SelectTrigger></FormControl>
                              <SelectContent>
                                  <SelectItem value="none">None (New Top-level Column)</SelectItem>
                                  {categoryOptions.map((option) => (<SelectItem key={option.value} value={option.value}><span style={{ paddingLeft: `${option.depth * 1.5}rem` }}>{option.depth > 0 && '↳ '}{option.label}</span></SelectItem>))}
                              </SelectContent>
                          </Select>
                          <FormMessage />
                      </FormItem>
                  )} />
                  <FormField control={form.control} name="description" render={({ field }) => (<FormItem><FormLabel>Description</FormLabel><FormControl><Textarea {...field} rows={3} placeholder="A short, helpful description for this category." /></FormControl><FormMessage /></FormItem>)} />
                </div>
                
                <Separator />
                
                <div className="space-y-4">
                  <h3 className="font-semibold text-lg">Display & Appearance</h3>
                  <div className="space-y-2">
                      <FormLabel>Image</FormLabel>
                      <div className="flex items-center gap-6">
                          <div className="w-40 h-24 rounded-md border border-dashed flex items-center justify-center bg-muted"><ImageIcon className="h-8 w-8 text-muted-foreground" /></div>
                          <Button variant="outline" asChild><label htmlFor="image-upload" className="cursor-pointer"><Upload className="mr-2 h-4 w-4" />Upload Image<Input id="image-upload" type="file" className="sr-only" /></label></Button>
                      </div>
                  </div>
                   <FormField control={form.control} name="viewFormat" render={({ field }) => (
                      <FormItem>
                          <FormLabel>View Format</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                              <FormControl><SelectTrigger><SelectValue placeholder="Select a view format" /></SelectTrigger></FormControl>
                              <SelectContent>
                                  <SelectItem value="grid_with_images">Grid with Images</SelectItem>
                                  <SelectItem value="grid_no_images">Grid (No Images)</SelectItem>
                                  <SelectItem value="list_with_images">List with Images</SelectItem>
                                  <SelectItem value="list_no_images">List (No Images)</SelectItem>
                              </SelectContent>
                          </Select>
                          <FormDescription>How this category and its products appear on the mobile menu.</FormDescription>
                          <FormMessage />
                      </FormItem>
                  )} />
                  <FormField control={form.control} name="hiddenTitle" render={({ field }) => (<FormItem className="flex items-center justify-between rounded-lg border p-3"><div className="space-y-0.5"><FormLabel>Hide Title on Menu</FormLabel></div><FormControl><Switch checked={field.value} onCheckedChange={field.onChange} /></FormControl></FormItem>)} />
                  <FormField control={form.control} name="hiddenImage" render={({ field }) => (<FormItem className="flex items-center justify-between rounded-lg border p-3"><div className="space-y-0.5"><FormLabel>Hide Image on Menu</FormLabel></div><FormControl><Switch checked={field.value} onCheckedChange={field.onChange} /></FormControl></FormItem>)} />
                </div>

                <Separator />

                <Collapsible>
                  <CollapsibleTrigger className="flex w-full items-center justify-between text-lg font-semibold">
                    Advanced Settings
                    <ChevronRight className="h-5 w-5 transition-transform data-[state=open]:rotate-90" />
                  </CollapsibleTrigger>
                  <CollapsibleContent className="space-y-4 pt-6">
                      <FormField control={form.control} name="displayFullwidth" render={({ field }) => (<FormItem className="flex items-center justify-between rounded-lg border p-3"><div className="space-y-0.5"><FormLabel>Display Fullwidth</FormLabel></div><FormControl><Switch checked={field.value} onCheckedChange={field.onChange} /></FormControl></FormItem>)} />
                      <FormField control={form.control} name="cardShadow" render={({ field }) => (<FormItem className="flex items-center justify-between rounded-lg border p-3"><div className="space-y-0.5"><FormLabel>Enable Card Shadow</FormLabel></div><FormControl><Switch checked={field.value} onCheckedChange={field.onChange} /></FormControl></FormItem>)} />
                      <FormField control={form.control} name="hidden" render={({ field }) => (<FormItem className="flex items-center justify-between rounded-lg border p-3"><div className="space-y-0.5"><FormLabel>Hide Category Entirely</FormLabel></div><FormControl><Switch checked={field.value} onCheckedChange={field.onChange} /></FormControl></FormItem>)} />
                      <div className="rounded-lg border p-3 space-y-4">
                          <FormField control={form.control} name="disableLink" render={({ field }) => (<FormItem className="flex items-center justify-between"><div className="space-y-0.5"><FormLabel>Disable Category Link</FormLabel></div><FormControl><Switch checked={field.value} onCheckedChange={field.onChange} /></FormControl></FormItem>)} />
                          {disableLink && (<FormField control={form.control} name="externalLink" render={({ field }) => (<FormItem className="pt-3 border-t"><FormLabel>External Link URL</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />)}
                      </div>
                      <FormField control={form.control} name="promotions" render={({ field }) => (<FormItem><FormLabel>Apply Promotions</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue placeholder="Select promotions" /></SelectTrigger></FormControl><SelectContent><SelectItem value="none">No Promotions</SelectItem><SelectItem value="summer_sale">Summer Sale</SelectItem></SelectContent></Select></FormItem>)} />
                      <FormField control={form.control} name="sortOrder" render={({ field }) => (<FormItem><FormLabel>Sort Order</FormLabel><FormControl><Input type="number" {...field} /></FormControl></FormItem>)} />
                  </CollapsibleContent>
                </Collapsible>
                
                <Separator />

                <Collapsible>
                  <CollapsibleTrigger className="flex w-full items-center justify-between text-lg font-semibold">
                    Special Category
                    <ChevronRight className="h-5 w-5 transition-transform data-[state=open]:rotate-90" />
                  </CollapsibleTrigger>
                  <CollapsibleContent className="space-y-4 pt-6">
                      <FormField control={form.control} name="enableSpecial" render={({ field }) => (<FormItem className="flex items-center justify-between rounded-lg border p-3"><div className="space-y-0.5"><FormLabel>Enable as a Special Category</FormLabel></div><FormControl><Switch checked={field.value} onCheckedChange={field.onChange} /></FormControl></FormItem>)} />
                      {enableSpecial && (
                          <div className="pt-4 border-t space-y-6">
                              <FormField control={form.control} name="specialType" render={({ field }) => (<FormItem><FormLabel>Special Category Type</FormLabel><Select onValueChange={field.onChange}><FormControl><SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger></FormControl><SelectContent><SelectItem value="popular">Popular</SelectItem><SelectItem value="new">New</SelectItem><SelectItem value="featured">Featured</SelectItem></SelectContent></Select><FormMessage /></FormItem>)} />
                              <FormField control={form.control} name="displaySeparate" render={({ field }) => (<FormItem className="flex items-center justify-between rounded-lg border p-4"><div className="space-y-0.5"><FormLabel>Display products in separate categories</FormLabel></div><FormControl><Switch checked={field.value} onCheckedChange={field.onChange} /></FormControl></FormItem>)} />
                          </div>
                      )}
                  </CollapsibleContent>
                </Collapsible>

              </div>
            </ScrollArea>
            <SheetFooter className="p-6 border-t bg-background">
              <SheetClose asChild>
                  <Button variant="ghost">Cancel</Button>
              </SheetClose>
              <Button type="submit">Save Category</Button>
            </SheetFooter>
          </form>
        </Form>
      </SheetContent>
    </Sheet>
  );
}
