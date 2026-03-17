'use client';

import { useEffect, useMemo, useState } from 'react';
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
import { Textarea } from '@/components/ui/textarea';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from '@/components/ui/form';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Checkbox } from '@/components/ui/checkbox';
import type { ComboGroup } from './types';
import { useToast } from '@/hooks/use-toast';
import { mockDataStore } from '@/lib/mock-data-store';
import { Search } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

const comboGroupSchema = z.object({
  name: z.string().min(1, 'Group name is required'),
  description: z.string().optional(),
  price: z.coerce.number().min(0.01, 'A price is required for the combo.'),
  productIds: z.array(z.string()).min(2, 'A combo must include at least two products.'),
});

type ComboGroupFormValues = z.infer<typeof comboGroupSchema>;

interface ComboGroupSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  group: ComboGroup | null;
  onSave: (data: ComboGroup) => void;
}

export function ComboGroupSheet({ open, onOpenChange, group, onSave }: ComboGroupSheetProps) {
  const { toast } = useToast();
  const [productSearch, setProductSearch] = useState('');

  const form = useForm<ComboGroupFormValues>({
    resolver: zodResolver(comboGroupSchema),
    defaultValues: {
      name: '',
      description: '',
      price: 0,
      productIds: [],
    },
  });

  const availableProducts = useMemo(() => {
    return mockDataStore.products.filter(p => p.name.toLowerCase().includes(productSearch.toLowerCase()));
  }, [productSearch]);

  useEffect(() => {
    if (open) {
      if (group) {
        form.reset({
          name: group.name,
          description: group.description,
          price: group.price,
          productIds: group.productIds,
        });
      } else {
        form.reset({
          name: '',
          description: '',
          price: 0,
          productIds: [],
        });
      }
    }
  }, [group, open, form]);

  const onSubmit = (data: ComboGroupFormValues) => {
    const finalData: ComboGroup = {
      id: group?.id || `combo_${Date.now()}`,
      ...data,
    };

    onSave(finalData);
    toast({
      title: group ? 'Combo Updated' : 'Combo Created',
      description: `Combo group "${finalData.name}" has been saved.`,
    });
    onOpenChange(false);
  };

  const selectedProductIds = form.watch('productIds') || [];

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-2xl w-full">
        <SheetHeader>
          <SheetTitle>{group ? 'Edit' : 'Add'} Combo Group</SheetTitle>
          <SheetDescription>
            Bundle products together to create special deals for your customers.
          </SheetDescription>
        </SheetHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col h-[calc(100%-4rem)]">
            <ScrollArea className="flex-grow p-6">
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Combo Name</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., Lunch Special" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="price"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Combo Price (AED)</FormLabel>
                        <FormControl>
                          <Input type="number" step="0.01" placeholder="25.99" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea placeholder="A short description of what this combo includes." {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="productIds"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Included Products</FormLabel>
                      <FormDescription>Select at least two products to include in this combo.</FormDescription>
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground"/>
                        <Input 
                            placeholder="Search products..."
                            className="pl-10 mb-2"
                            value={productSearch}
                            onChange={(e) => setProductSearch(e.target.value)}
                        />
                      </div>
                      <ScrollArea className="h-64 rounded-md border p-4">
                        <div className="space-y-2">
                          {availableProducts.map(product => (
                            <FormItem key={product.id} className="flex flex-row items-center space-x-3 space-y-0 p-2 rounded-md hover:bg-muted">
                              <FormControl>
                                <Checkbox
                                  checked={field.value?.includes(product.id)}
                                  onCheckedChange={(checked) => {
                                    return checked
                                      ? field.onChange([...(field.value || []), product.id])
                                      : field.onChange(
                                          field.value?.filter(
                                            (value) => value !== product.id
                                          )
                                        )
                                  }}
                                />
                              </FormControl>
                              <FormLabel className="font-normal flex-grow cursor-pointer">
                                {product.name}
                              </FormLabel>
                              <Badge variant="outline">${product.price.toFixed(2)}</Badge>
                            </FormItem>
                          ))}
                           {availableProducts.length === 0 && <p className="text-sm text-muted-foreground text-center py-4">No products found.</p>}
                        </div>
                      </ScrollArea>
                      <FormMessage />
                    </FormItem>
                  )}
                />

              </div>
            </ScrollArea>
            <SheetFooter className="p-6 border-t bg-background">
                <div className="w-full flex justify-between items-center">
                    <p className="text-sm text-muted-foreground font-medium">
                        {selectedProductIds.length} product(s) selected
                    </p>
                    <div>
                        <SheetClose asChild><Button variant="ghost">Cancel</Button></SheetClose>
                        <Button type="submit">Save Combo</Button>
                    </div>
                </div>
            </SheetFooter>
          </form>
        </Form>
      </SheetContent>
    </Sheet>
  );
}
