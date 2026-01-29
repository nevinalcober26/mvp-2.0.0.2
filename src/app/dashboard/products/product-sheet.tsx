'use client';

import { useState, useEffect, useMemo } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
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
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Upload,
  CheckCircle,
  AlertCircle,
  PlusCircle,
  Trash,
  Video,
} from 'lucide-react';
import type { Product, Variation } from './types';
import Image from 'next/image';
import { cn } from '@/lib/utils';

const productSchema = z.object({
  name: z.string().min(1, 'Product name is required'),
  category: z.string().min(1, 'Category is required'),
  price: z.coerce.number().min(0.01, 'Price must be greater than 0'),
  smallDescription: z.string().optional(),
  description: z.string().optional(),
  discountedPrice: z.coerce.number().optional(),
  sortOrder: z.coerce.number().optional(),
  recommend: z.boolean().default(false),
  displayFullwidth: z.boolean().default(false),
  hiddenTitle: z.boolean().default(false),
  hiddenImage: z.boolean().default(false),
  disableLink: z.boolean().default(false),
  cardShadow: z.boolean().default(true),
  hidden: z.boolean().default(false),
  outOfStock: z.boolean().default(false),
  upsell: z.boolean().default(false),
  enableCombo: z.boolean().default(false),
  comboGroup: z.string().optional(),
  videoUrl: z.string().url().optional().or(z.literal('')),
  variations: z
    .array(
      z.object({
        value: z.string().min(1, 'Variation value is required'),
        matrix: z.string().optional(),
        price: z.coerce.number().min(0),
        visible: z.boolean().default(true),
        hidden: z.boolean().default(false),
      })
    )
    .optional(),
});

type ProductFormValues = z.infer<typeof productSchema>;

const mockCategories = [
  'Burgers',
  'Sides',
  'Desserts',
  'Mains',
  'Salads',
  'Beverages',
];

export function ProductSheet({
  open,
  onOpenChange,
  product,
  onSave,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  product: Product | null;
  onSave: (data: Product) => void;
}) {
  const [activeTab, setActiveTab] = useState('basic-info');
  const [showUnsavedDialog, setShowUnsavedDialog] = useState(false);

  const defaultValues = useMemo(() => {
    return {
      name: product?.name || '',
      category: product?.category || '',
      price: product?.price || 0,
      smallDescription: product?.smallDescription || '',
      description: product?.description || '',
      discountedPrice: product?.discountedPrice,
      sortOrder: product?.sortOrder,
      recommend: product?.recommend || false,
      displayFullwidth: product?.displayFullwidth || false,
      hiddenTitle: product?.hiddenTitle || false,
      hiddenImage: product?.hiddenImage || false,
      disableLink: product?.disableLink || false,
      cardShadow: product?.cardShadow ?? true,
      hidden: product?.hidden || false,
      outOfStock: product?.outOfStock || false,
      upsell: product?.upsell || false,
      enableCombo: product?.enableCombo || false,
      comboGroup: product?.comboGroup || '',
      videoUrl: product?.videoUrl || '',
      variations: product?.variations || [],
    };
  }, [product]);

  const form = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema),
    defaultValues,
    mode: 'onChange',
  });

  const {
    fields: variationFields,
    append: appendVariation,
    remove: removeVariation,
  } = useFieldArray({
    control: form.control,
    name: 'variations',
  });

  const { isDirty, isValid, errors } = form.formState;

  const handleAttemptClose = () => {
    if (isDirty) {
      setShowUnsavedDialog(true);
    } else {
      onOpenChange(false);
      form.reset(defaultValues);
    }
  };

  const handleConfirmClose = () => {
    setShowUnsavedDialog(false);
    onOpenChange(false);
    form.reset(defaultValues);
  };

  const onSubmit = (data: ProductFormValues) => {
    const fullProductData: Product = {
      ...product!,
      id: product?.id || `new_${Date.now()}`,
      stock: product?.stock || 0, // Mocked data
      status: product?.status || 'Active', // Mocked data
      ...data,
    };
    onSave(fullProductData);
    onOpenChange(false);
    form.reset();
  };

  const onInvalid = () => {
    const errorKeys = Object.keys(errors) as Array<keyof ProductFormValues>;
    const tabMap: Record<keyof ProductFormValues, string> = {
      name: 'basic-info',
      category: 'basic-info',
      price: 'pricing',
      discountedPrice: 'pricing',
      // ... map other fields to their tabs if needed
    };

    for (const key of errorKeys) {
      if (tabMap[key]) {
        setActiveTab(tabMap[key]);
        // Find and focus the element
        setTimeout(() => {
          const fieldElement = document.getElementsByName(key)[0];
          fieldElement?.focus();
        }, 100);
        return;
      }
    }
  };

  // Tab validation status
  const isBasicInfoComplete = !errors.name && !errors.category && form.getValues('name') && form.getValues('category');
  const isPricingComplete = !errors.price && form.getValues('price') > 0;
  
  const discount = useMemo(() => {
    const price = form.watch('price');
    const discountedPrice = form.watch('discountedPrice');
    if (price && discountedPrice && discountedPrice < price) {
      return (((price - discountedPrice) / price) * 100).toFixed(0);
    }
    return '0';
  }, [form.watch('price'), form.watch('discountedPrice')]);


  const TabIndicator = ({ isComplete }: { isComplete: boolean }) =>
    isComplete ? (
      <CheckCircle className="h-4 w-4 text-green-500" />
    ) : (
      <AlertCircle className="h-4 w-4 text-red-500" />
    );

  return (
    <>
      <Sheet open={open} onOpenChange={handleAttemptClose}>
        <SheetContent className="sm:max-w-4xl w-full p-0">
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit, onInvalid)}
              className="flex flex-col h-full"
            >
              <SheetHeader className="p-6 border-b">
                <SheetTitle className="text-xl">
                  {product ? 'Edit Product' : 'Add Product'}
                </SheetTitle>
                <SheetDescription>
                  Fill in the details for your product across the tabs.
                </SheetDescription>
              </SheetHeader>
              <div className="flex-grow overflow-y-auto">
                <Tabs
                  value={activeTab}
                  onValueChange={setActiveTab}
                  className="h-full flex flex-col"
                >
                  <TabsList className="w-full justify-start rounded-none border-b px-6 sticky top-0 bg-background z-10">
                    <TabsTrigger value="basic-info" className="gap-2">
                      <TabIndicator isComplete={isBasicInfoComplete} /> Basic
                      Info
                    </TabsTrigger>
                    <TabsTrigger value="pricing" className="gap-2">
                      <TabIndicator isComplete={isPricingComplete} /> Pricing
                    </TabsTrigger>
                    <TabsTrigger value="display">Display & Options</TabsTrigger>
                    <TabsTrigger value="media">Media</TabsTrigger>
                    <TabsTrigger value="variations">Variations</TabsTrigger>
                  </TabsList>
                  <div className="p-6 space-y-6 flex-grow">
                    <TabsContent value="basic-info">
                      <div className="space-y-4">
                        <FormField
                          control={form.control}
                          name="name"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Product Name*</FormLabel>
                              <FormControl>
                                <Input
                                  placeholder="e.g., Classic Cheeseburger"
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="smallDescription"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Small Description</FormLabel>
                              <FormControl>
                                <Textarea
                                  placeholder="A short, catchy line for your product."
                                  rows={2}
                                  {...field}
                                />
                              </FormControl>
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="description"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Description</FormLabel>
                              <FormControl>
                                <Textarea
                                  placeholder="Detailed description including ingredients, allergens, etc."
                                  rows={5}
                                  {...field}
                                />
                              </FormControl>
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="category"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Category*</FormLabel>
                              <Select
                                onValueChange={field.onChange}
                                defaultValue={field.value}
                              >
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select a category" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {mockCategories.map((cat) => (
                                    <SelectItem key={cat} value={cat}>
                                      {cat}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </TabsContent>
                    <TabsContent value="pricing">
                      <div className="space-y-6 max-w-md">
                        <FormField
                          control={form.control}
                          name="price"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Price (AED)*</FormLabel>
                              <FormControl>
                                <Input type="number" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="discountedPrice"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Discounted Price</FormLabel>
                              <FormControl>
                                <Input type="number" {...field} />
                              </FormControl>
                            </FormItem>
                          )}
                        />
                        <FormItem>
                          <FormLabel>Discount %</FormLabel>
                          <Input value={discount} readOnly />
                          <FormDescription>
                            This is calculated automatically based on price and
                            discounted price.
                          </FormDescription>
                        </FormItem>
                      </div>
                    </TabsContent>
                    <TabsContent value="display">
                      <div className="space-y-4">
                        <FormField
                          control={form.control}
                          name="recommend"
                          render={({ field }) => (
                            <FormItem className="flex items-center justify-between rounded-lg border p-4">
                              <div className="space-y-0.5">
                                <FormLabel>Recommend</FormLabel>
                                <FormDescription>
                                  Feature this item as a recommendation.
                                </FormDescription>
                              </div>
                              <FormControl>
                                <Switch
                                  checked={field.value}
                                  onCheckedChange={field.onChange}
                                />
                              </FormControl>
                            </FormItem>
                          )}
                        />
                        {/* Add other switches similarly */}
                        <FormField
                          control={form.control}
                          name="outOfStock"
                          render={({ field }) => (
                            <FormItem className="flex items-center justify-between rounded-lg border p-4">
                              <div className="space-y-0.5">
                                <FormLabel>Mark as Out of Stock</FormLabel>
                              </div>
                              <FormControl>
                                <Switch
                                  checked={field.value}
                                  onCheckedChange={field.onChange}
                                />
                              </FormControl>
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="sortOrder"
                          render={({ field }) => (
                            <FormItem className="max-w-xs">
                              <FormLabel>Sort Order</FormLabel>
                              <FormControl>
                                <Input
                                  type="number"
                                  placeholder="e.g., 1"
                                  {...field}
                                />
                              </FormControl>
                              <FormDescription>
                                A smaller number will appear first.
                              </FormDescription>
                            </FormItem>
                          )}
                        />
                      </div>
                    </TabsContent>
                    <TabsContent value="media">
                      <div className="space-y-6">
                        <div>
                          <Label>Main Image</Label>
                          <div className="mt-2 flex items-center gap-6">
                            <div className="w-40 h-24 rounded-md border border-dashed flex items-center justify-center bg-muted">
                              <Image
                                src="https://picsum.photos/seed/product/160/96"
                                width={160}
                                height={96}
                                alt="Product image"
                                className="rounded-md object-cover"
                              />
                            </div>
                            <div className="flex flex-col gap-2">
                              <Button variant="outline" asChild>
                                <label
                                  htmlFor="image-upload"
                                  className="cursor-pointer"
                                >
                                  <Upload className="mr-2 h-4 w-4" />
                                  Upload Image
                                  <Input
                                    id="image-upload"
                                    type="file"
                                    className="sr-only"
                                  />
                                </label>
                              </Button>
                              <Button
                                variant="ghost"
                                className="text-destructive hover:text-destructive"
                              >
                                Clear
                              </Button>
                            </div>
                          </div>
                        </div>
                        <div>
                          <Label>Additional Images</Label>
                           <div className="mt-2 p-4 border rounded-lg">
                            <p className="text-center text-sm text-muted-foreground">Additional images feature coming soon.</p>
                          </div>
                        </div>
                        <FormField
                          control={form.control}
                          name="videoUrl"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="flex items-center gap-2">
                                <Video /> Video URL (Optional)
                              </FormLabel>
                              <FormControl>
                                <Input
                                  placeholder="https://www.youtube.com/watch?v=..."
                                  {...field}
                                />
                              </FormControl>
                               <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </TabsContent>
                     <TabsContent value="variations">
                        <div className="space-y-4">
                            <Label>Product Variations</Label>
                            <div className="p-4 border rounded-lg space-y-4">
                                {variationFields.map((field, index) => (
                                    <div key={field.id} className="grid grid-cols-[1fr,1fr,100px,auto,auto] gap-2 items-center">
                                        <FormField
                                            control={form.control}
                                            name={`variations.${index}.value`}
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormControl><Input placeholder="Value (e.g. Large)" {...field} /></FormControl>
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={form.control}
                                            name={`variations.${index}.matrix`}
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormControl><Input placeholder="Matrix ID" {...field} /></FormControl>
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={form.control}
                                            name={`variations.${index}.price`}
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormControl><Input type="number" placeholder="Price" {...field} /></FormControl>
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={form.control}
                                            name={`variations.${index}.visible`}
                                            render={({ field }) => (
                                                <FormItem className="flex flex-col items-center">
                                                    <FormControl><Switch checked={field.value} onCheckedChange={field.onChange} /></FormControl>
                                                </FormItem>
                                            )}
                                        />
                                        <Button variant="ghost" size="icon" onClick={() => removeVariation(index)}>
                                            <Trash className="h-4 w-4 text-destructive" />
                                        </Button>
                                    </div>
                                ))}
                            </div>
                            <Button type="button" variant="outline" size="sm" onClick={() => appendVariation({ value: '', matrix: '', price: 0, visible: true, hidden: false })}>
                                <PlusCircle className="mr-2 h-4 w-4" />
                                Add Variation
                            </Button>
                        </div>
                    </TabsContent>
                  </div>
                </Tabs>
              </div>
              <SheetFooter className="p-6 border-t bg-background flex-row justify-between w-full">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleAttemptClose}
                >
                  Cancel
                </Button>
                <TooltipProvider>
                  <Tooltip
                    delayDuration={100}
                    open={!isValid ? undefined : false}
                  >
                    <TooltipTrigger asChild>
                      {/* This div is necessary to make the tooltip work on a disabled button */}
                      <div tabIndex={0}> 
                        <Button type="submit" disabled={!isValid}>
                          {product ? 'Update Product' : 'Save Product'}
                        </Button>
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>
                        Please complete all required fields in each tab.
                      </p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </SheetFooter>
            </form>
          </Form>
        </SheetContent>
      </Sheet>

      <AlertDialog open={showUnsavedDialog} onOpenChange={setShowUnsavedDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>You have unsaved changes</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to discard your changes? This action cannot
              be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Keep Editing</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmClose}>
              Discard Changes
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
