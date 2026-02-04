'use client';

import { useState, useMemo, useEffect } from 'react';
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
  HelpCircle,
  Wand,
  RefreshCw,
} from 'lucide-react';
import type { Product, Variation } from './types';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { generateProductDescription } from '@/ai/flows/generate-product-description-flow';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { mockDataStore } from '@/lib/mock-data-store';
import { getCategoryNameOptions } from '@/app/dashboard/categories/utils';

const productSchema = z
  .object({
    name: z.string().min(1, 'Product name is required'),
    category: z.string().min(1, 'Category is required'),
    properties: z.string().optional(),
    branch: z.string().min(1, 'Branch is required'),
    price: z.coerce.number().min(0.01, 'Price must be greater than 0'),
    smallDescription: z.string().optional(),
    description: z.string().optional(),
    discountType: z.enum(['none', 'percentage', 'fixed']).default('none'),
    discountValue: z.coerce.number().positive('Discount must be a positive number.').optional(),
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
    externalLink: z.string().url().optional().or(z.literal('')),
    variations: z
      .array(
        z.object({
          value: z.string().min(1, 'Variation value is required'),
          matrix: z.string().optional(),
          price: z.coerce.number().min(0, "Price can't be negative"),
          hidden: z.boolean().default(false),
          categoryPage: z.boolean().default(false),
          productPage: z.boolean().default(false),
        })
      )
      .optional(),
  })
  .superRefine((data, ctx) => {
    if (data.discountType === 'percentage') {
      if (!data.discountValue) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Percentage value is required.', path: ['discountValue'] });
      } else if (data.discountValue > 100) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Percentage cannot be over 100.', path: ['discountValue'] });
      }
    }
    if (data.discountType === 'fixed') {
      if (!data.discountValue) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Discount amount is required.', path: ['discountValue'] });
      } else if (data.discountValue >= data.price) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Fixed discount must be less than the product price.',
          path: ['discountValue'],
        });
      }
    }
    if (data.discountType !== 'none' && !data.discountValue) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'A discount value is required.', path: ['discountValue'] });
    }
  });

type ProductFormValues = z.infer<typeof productSchema>;

const mockProperties = ['Spicy', 'Vegetarian', 'Gluten-Free', 'New'];

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
  const { toast } = useToast();
  const [isGenerating, setIsGenerating] = useState<'short' | 'long' | null>(
    null
  );

  const categoryOptions = useMemo(() => getCategoryNameOptions(mockDataStore.categories), []);

  const defaultValues = useMemo(() => {
    let discountType: 'none' | 'percentage' | 'fixed' = 'none';
    let discountValue: number | undefined;

    if (product?.price && product.discountedPrice && product.discountedPrice < product.price) {
        discountType = 'fixed';
        discountValue = product.price - product.discountedPrice;
    }

    return {
      name: product?.name || '',
      category: product?.category || '',
      properties: product?.properties || '',
      branch: product?.branch || '',
      price: product?.price || 0,
      smallDescription: product?.smallDescription || '',
      description: product?.description || '',
      discountType,
      discountValue,
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
      externalLink: product?.externalLink || '',
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
  const productName = form.watch('name');
  const productCategory = form.watch('category');

  const price = form.watch('price');
  const discountType = form.watch('discountType');
  const discountValue = form.watch('discountValue');

  const { finalPrice, finalDiscountPercent } = useMemo(() => {
    let calculatedPrice: number | undefined;
    let calculatedPercent: number | undefined;

    if (price > 0 && discountValue && discountValue > 0) {
      if (discountType === 'percentage' && discountValue <= 100) {
        calculatedPrice = price * (1 - discountValue / 100);
        calculatedPercent = discountValue;
      } else if (discountType === 'fixed' && discountValue < price) {
        calculatedPrice = price - discountValue;
        calculatedPercent = (discountValue / price) * 100;
      }
    }
    return { finalPrice: calculatedPrice, finalDiscountPercent: calculatedPercent };
  }, [price, discountType, discountValue]);

  useEffect(() => {
    form.reset(defaultValues);
  }, [defaultValues, form]);

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

  const handleGenerateDescription = async (type: 'short' | 'long') => {
    setIsGenerating(type);

    if (!productName || !productCategory) {
      toast({
        variant: 'destructive',
        title: 'Product Name and Category Required',
        description:
          'Please enter a product name and select a category first.',
      });
      setIsGenerating(null);
      return;
    }

    try {
      const result = await generateProductDescription({
        productName,
        productCategory,
        descriptionType: type,
      });

      const fieldToUpdate =
        type === 'short' ? 'smallDescription' : 'description';
      form.setValue(fieldToUpdate, result.description, {
        shouldDirty: true,
        shouldValidate: true,
      });

      toast({
        title: 'AI Description Generated',
        description: `Your ${type} description has been filled in.`,
      });
    } catch (error) {
      console.error('AI Description Generation Error:', error);
      toast({
        variant: 'destructive',
        title: 'AI Generation Failed',
        description:
          'Could not generate a description at this time. Please try again later.',
      });
    } finally {
      setIsGenerating(null);
    }
  };

  const onSubmit = (data: ProductFormValues) => {
    let discountedPrice: number | undefined;
    if (data.discountType === 'percentage' && data.discountValue) {
        discountedPrice = data.price * (1 - data.discountValue / 100);
    } else if (data.discountType === 'fixed' && data.discountValue) {
        discountedPrice = data.price - data.discountValue;
    }

    const { discountType, discountValue, ...restOfData } = data;

    const fullProductData: Product = {
      ...product!,
      id: product?.id || `new_${Date.now()}`,
      stock: product?.stock || 0,
      status: product?.status || 'Active',
      ...restOfData,
      discountedPrice,
    };

    onSave(fullProductData);
    onOpenChange(false);
    form.reset();
  };

  const onInvalid = () => {
    const errorKeys = Object.keys(errors) as Array<keyof ProductFormValues>;
    const tabMap: Record<string, string> = {
      name: 'basic-info',
      category: 'basic-info',
      branch: 'basic-info',
      price: 'pricing',
      discountValue: 'pricing',
      variations: 'variations',
    };

    for (const key of errorKeys) {
      if (tabMap[key]) {
        setActiveTab(tabMap[key]);
        setTimeout(() => {
          const fieldElement = document.getElementsByName(key)[0];
          fieldElement?.focus();
        }, 100);
        return;
      }
    }
  };

  const isBasicInfoComplete =
    !errors.name &&
    !errors.category &&
    !errors.branch &&
    form.getValues('name') &&
    form.getValues('category') &&
    form.getValues('branch');
  const isPricingComplete = !errors.price && !errors.discountValue && form.getValues('price') > 0;
  const areVariationsComplete = !errors.variations;

  const TabIndicator = ({ isComplete }: { isComplete: boolean }) =>
    isComplete ? (
      <CheckCircle className="h-4 w-4 text-green-500" />
    ) : (
      <AlertCircle className="h-4 w-4 text-red-500" />
    );

  return (
    <>
      <Sheet open={open} onOpenChange={handleAttemptClose}>
        <SheetContent className="sm:max-w-4xl w-full p-0 bg-card">
          <TooltipProvider>
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
                      <TabsTrigger value="display">
                        Display & Options
                      </TabsTrigger>
                      <TabsTrigger value="media">Media</TabsTrigger>
                      <TabsTrigger value="variations" className="gap-2">
                        <TabIndicator isComplete={areVariationsComplete} />
                        Variations
                      </TabsTrigger>
                    </TabsList>
                    <div className="p-6 space-y-6 flex-grow">
                      <TabsContent value="basic-info" className="mt-0">
                        <div className="space-y-6">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Basic Information</CardTitle>
                                    <CardDescription>This is the core information for your product.</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
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
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                                                    {categoryOptions.map((cat) => (
                                                        <SelectItem key={cat.value} value={cat.value}>
                                                            <span style={{ paddingLeft: `${cat.depth * 1.5}rem` }}>
                                                                {cat.depth > 0 && '↳ '}
                                                                {cat.label}
                                                            </span>
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                                </Select>
                                                <FormMessage />
                                            </FormItem>
                                            )}
                                        />
                                         <FormField
                                            control={form.control}
                                            name="properties"
                                            render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Properties</FormLabel>
                                                <Select
                                                onValueChange={field.onChange}
                                                defaultValue={field.value}
                                                >
                                                <FormControl>
                                                    <SelectTrigger>
                                                    <SelectValue placeholder="Select properties" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    {mockProperties.map((prop) => (
                                                        <SelectItem key={prop} value={prop}>{prop}</SelectItem>
                                                    ))}
                                                </SelectContent>
                                                </Select>
                                                <FormMessage />
                                            </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={form.control}
                                            name="branch"
                                            render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Branch*</FormLabel>
                                                <Select
                                                onValueChange={field.onChange}
                                                defaultValue={field.value}
                                                >
                                                <FormControl>
                                                    <SelectTrigger>
                                                    <SelectValue placeholder="Select a branch" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    <SelectItem value="Ras Al Khaimah">Ras Al Khaimah</SelectItem>
                                                    <SelectItem value="Dubai Mall">Dubai Mall</SelectItem>
                                                </SelectContent>
                                                </Select>
                                                <FormMessage />
                                            </FormItem>
                                            )}
                                        />
                                    </div>
                                </CardContent>
                            </Card>
                             <Card>
                                <CardHeader>
                                    <CardTitle>Marketing Copy</CardTitle>
                                    <CardDescription>Write compelling descriptions to attract customers. Use our AI assistant to help!</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-6">
                                    <FormField
                                        control={form.control}
                                        name="smallDescription"
                                        render={({ field }) => (
                                        <FormItem>
                                            <div className="flex justify-between items-center">
                                                <FormLabel className="flex items-center gap-1.5">
                                                    Small Description
                                                    <Tooltip delayDuration={100}>
                                                    <TooltipTrigger asChild>
                                                        <button
                                                        type="button"
                                                        onClick={(e) => e.preventDefault()}
                                                        >
                                                        <HelpCircle className="h-4 w-4 text-muted-foreground cursor-help" />
                                                        </button>
                                                    </TooltipTrigger>
                                                    <TooltipContent>
                                                        <p>
                                                        A short, catchy description for product
                                                        cards and list views.
                                                        </p>
                                                    </TooltipContent>
                                                    </Tooltip>
                                                </FormLabel>
                                                <Tooltip>
                                                    <TooltipTrigger asChild>
                                                    <div>
                                                        <Button
                                                        type="button"
                                                        size="sm"
                                                        variant="ghost"
                                                        onClick={() =>
                                                            handleGenerateDescription('short')
                                                        }
                                                        disabled={
                                                            isGenerating !== null ||
                                                            !productName ||
                                                            !productCategory
                                                        }
                                                        className="gap-1.5"
                                                        >
                                                        {isGenerating === 'short' ? (
                                                            <RefreshCw className="h-4 w-4 animate-spin" />
                                                        ) : (
                                                            <Wand className="h-4 w-4" />
                                                        )}
                                                        Generate
                                                        </Button>
                                                    </div>
                                                    </TooltipTrigger>
                                                    <TooltipContent>
                                                    <p>
                                                        {!productName || !productCategory
                                                        ? 'Enter name and category first'
                                                        : 'Generate with AI'}
                                                    </p>
                                                    </TooltipContent>
                                                </Tooltip>
                                            </div>
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
                                            <div className="flex justify-between items-center">
                                                <FormLabel>Description</FormLabel>
                                                <Tooltip>
                                                    <TooltipTrigger asChild>
                                                    <div>
                                                        <Button
                                                        type="button"
                                                        size="sm"
                                                        variant="ghost"
                                                        onClick={() =>
                                                            handleGenerateDescription('long')
                                                        }
                                                        disabled={
                                                            isGenerating !== null ||
                                                            !productName ||
                                                            !productCategory
                                                        }
                                                        className="gap-1.5"
                                                        >
                                                        {isGenerating === 'long' ? (
                                                            <RefreshCw className="h-4 w-4 animate-spin" />
                                                        ) : (
                                                            <Wand className="h-4 w-4" />
                                                        )}
                                                        Generate
                                                        </Button>
                                                    </div>
                                                    </TooltipTrigger>
                                                    <TooltipContent>
                                                    <p>
                                                        {!productName || !productCategory
                                                        ? 'Enter name and category first'
                                                        : 'Generate with AI'}
                                                    </p>
                                                    </TooltipContent>
                                                </Tooltip>
                                            </div>
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
                                </CardContent>
                             </Card>
                        </div>
                      </TabsContent>
                      <TabsContent value="pricing">
                        <Card className="max-w-2xl">
                          <CardHeader>
                            <CardTitle>Pricing Strategy</CardTitle>
                            <CardDescription>
                              Set the price for your product and an optional
                              discount.
                            </CardDescription>
                          </CardHeader>
                          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-6">
                                <FormField
                                    control={form.control}
                                    name="price"
                                    render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Price (AED)*</FormLabel>
                                        <FormControl>
                                        <Input type="number" {...field} onChange={e => field.onChange(e.target.valueAsNumber)} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="discountType"
                                    render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Discount Type</FormLabel>
                                        <Select
                                            onValueChange={(value) => {
                                                field.onChange(value);
                                                form.setValue('discountValue', undefined);
                                                form.clearErrors('discountValue');
                                            }}
                                            value={field.value}
                                        >
                                        <FormControl>
                                            <SelectTrigger>
                                            <SelectValue placeholder="Select discount type" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            <SelectItem value="none">No Discount</SelectItem>
                                            <SelectItem value="percentage">Percentage (%)</SelectItem>
                                            <SelectItem value="fixed">Fixed Amount</SelectItem>
                                        </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                    )}
                                />
                                {discountType !== 'none' && (
                                    <FormField
                                        control={form.control}
                                        name="discountValue"
                                        render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>
                                            {discountType === 'percentage'
                                                ? 'Discount Percentage'
                                                : 'Discount Amount (AED)'}
                                            </FormLabel>
                                            <FormControl>
                                            <Input
                                                type="number"
                                                placeholder={
                                                discountType === 'percentage'
                                                    ? 'e.g. 15'
                                                    : 'e.g. 5.00'
                                                }
                                                {...field}
                                                value={field.value ?? ''}
                                                onChange={e => field.onChange(e.target.value === '' ? undefined : e.target.valueAsNumber)}
                                            />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                        )}
                                    />
                                )}
                            </div>
                            <Card className="bg-muted/50 p-6 space-y-4">
                                <h4 className="font-semibold text-center">Summary</h4>
                                <div>
                                    <p className="text-sm text-muted-foreground">Original Price</p>
                                    <p className="text-lg font-mono font-semibold">{price > 0 ? `$${price.toFixed(2)}` : '-'}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground">Discount</p>
                                    <p className="text-lg font-mono font-semibold text-red-600">
                                        {finalDiscountPercent ? `-${finalDiscountPercent.toFixed(1)}%` : '-'}
                                    </p>
                                </div>
                                <div className="border-t pt-4">
                                     <p className="text-sm text-muted-foreground">Final Price</p>
                                    <p className="text-2xl font-mono font-bold text-green-600">
                                        {finalPrice ? `$${finalPrice.toFixed(2)}` : (price > 0 ? `$${price.toFixed(2)}` : '-')}
                                    </p>
                                </div>
                            </Card>
                          </CardContent>
                        </Card>
                      </TabsContent>
                      <TabsContent value="display">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <Card>
                            <CardHeader>
                              <CardTitle>Menu Display</CardTitle>
                              <CardDescription>How the product card looks on the menu.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-2">
                                <FormField control={form.control} name="hiddenTitle" render={({ field }) => (<FormItem className="flex items-center justify-between rounded-lg border p-3"><div className="space-y-0.5"><FormLabel>Hidden Title</FormLabel></div><FormControl><Switch checked={field.value} onCheckedChange={field.onChange}/></FormControl></FormItem>)} />
                                <FormField control={form.control} name="hiddenImage" render={({ field }) => (<FormItem className="flex items-center justify-between rounded-lg border p-3"><div className="space-y-0.5"><FormLabel>Hidden Image</FormLabel></div><FormControl><Switch checked={field.value} onCheckedChange={field.onChange}/></FormControl></FormItem>)} />
                                <FormField control={form.control} name="cardShadow" render={({ field }) => (<FormItem className="flex items-center justify-between rounded-lg border p-3"><div className="space-y-0.5"><FormLabel>Card Shadow</FormLabel></div><FormControl><Switch checked={field.value} onCheckedChange={field.onChange}/></FormControl></FormItem>)} />
                                <FormField control={form.control} name="displayFullwidth" render={({ field }) => (<FormItem className="flex items-center justify-between rounded-lg border p-3"><div className="space-y-0.5"><FormLabel>Display Fullwidth</FormLabel></div><FormControl><Switch checked={field.value} onCheckedChange={field.onChange}/></FormControl></FormItem>)} />
                            </CardContent>
                          </Card>
                          <Card>
                             <CardHeader>
                              <CardTitle>Behavior & Visibility</CardTitle>
                              <CardDescription>Control stock and menu visibility.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-2">
                                <FormField control={form.control} name="hidden" render={({ field }) => (<FormItem className="flex items-center justify-between rounded-lg border p-3"><div className="space-y-0.5"><FormLabel>Hidden</FormLabel></div><FormControl><Switch checked={field.value} onCheckedChange={field.onChange}/></FormControl></FormItem>)} />
                                <FormField control={form.control} name="outOfStock" render={({ field }) => (<FormItem className="flex items-center justify-between rounded-lg border p-3"><div className="space-y-0.5"><FormLabel>Out of Stock</FormLabel></div><FormControl><Switch checked={field.value} onCheckedChange={field.onChange}/></FormControl></FormItem>)} />
                                <FormField control={form.control} name="disableLink" render={({ field }) => (<FormItem className="flex items-center justify-between rounded-lg border p-3"><div className="space-y-0.5"><FormLabel>Disable Link</FormLabel></div><FormControl><Switch checked={field.value} onCheckedChange={field.onChange}/></FormControl></FormItem>)} />
                                 {form.watch('disableLink') && <FormField control={form.control} name="externalLink" render={({ field }) => (<FormItem className="p-3 border rounded-lg"><FormLabel>External Link</FormLabel><FormControl><Input placeholder="https://example.com" {...field} /></FormControl><FormDescription>If provided, this product will link to this URL.</FormDescription><FormMessage /></FormItem>)} />}
                            </CardContent>
                          </Card>
                          <Card className="md:col-span-2">
                             <CardHeader>
                              <CardTitle>Advanced Options</CardTitle>
                              <CardDescription>Special features like upselling and combos.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-2">
                                <FormField control={form.control} name="recommend" render={({ field }) => (<FormItem className="flex items-center justify-between rounded-lg border p-3"><div className="space-y-0.5"><FormLabel>Recommend</FormLabel><FormDescription>Feature this product on your menu.</FormDescription></div><FormControl><Switch checked={field.value} onCheckedChange={field.onChange}/></FormControl></FormItem>)} />
                                <FormField control={form.control} name="upsell" render={({ field }) => (<FormItem className="flex items-center justify-between rounded-lg border p-3"><div className="space-y-0.5"><FormLabel>Enable Upsell</FormLabel></div><FormControl><Switch checked={field.value} onCheckedChange={field.onChange}/></FormControl></FormItem>)} />
                                <FormField control={form.control} name="enableCombo" render={({ field }) => (<FormItem className="flex items-center justify-between rounded-lg border p-3"><div className="space-y-0.5"><FormLabel>Enable Combo</FormLabel></div><FormControl><Switch checked={field.value} onCheckedChange={field.onChange}/></FormControl></FormItem>)} />
                                {form.watch('enableCombo') && <FormField control={form.control} name="comboGroup" render={({ field }) => (<FormItem className="p-3"><FormLabel>Combo Group</FormLabel><FormControl><Input placeholder="e.g. Burger Combos" {...field} /></FormControl><FormMessage /></FormItem>)} />}
                            </CardContent>
                          </Card>
                        </div>
                      </TabsContent>
                      <TabsContent value="media">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Main Image</CardTitle>
                                    <CardDescription>This is the primary image shown for the product.</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="w-full aspect-video rounded-md border border-dashed flex items-center justify-center bg-muted overflow-hidden">
                                        <Image
                                        src="https://picsum.photos/seed/product/320/180"
                                        width={320}
                                        height={180}
                                        alt="Product image"
                                        className="object-cover w-full h-full"
                                        />
                                    </div>
                                    <div className="flex gap-2">
                                        <Button variant="outline" asChild className="w-full">
                                            <label
                                                htmlFor="image-upload"
                                                className="cursor-pointer"
                                            >
                                                <Upload className="mr-2 h-4 w-4" />
                                                Upload Image
                                            </label>
                                        </Button>
                                        <Input
                                            id="image-upload"
                                            type="file"
                                            className="sr-only"
                                        />
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            className="text-destructive hover:text-destructive"
                                        >
                                            Clear
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                            <div className="space-y-6">
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Additional Media</CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
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
                                        <div>
                                            <Label>Video List</Label>
                                            <Button type="button" variant="outline" className="w-full mt-2">Create Video List</Button>
                                        </div>
                                        <div>
                                            <Label>Image Gallery</Label>
                                            <div className="mt-2 p-4 h-24 border rounded-lg border-dashed flex items-center justify-center">
                                                <p className="text-center text-sm text-muted-foreground">Image gallery coming soon.</p>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>
                        </div>
                      </TabsContent>
                      <TabsContent value="variations">
                        <Card>
                            <CardHeader>
                                <CardTitle>Product Variations</CardTitle>
                                <CardDescription>
                                    Offer different options for this product, like size or type. Each variation can have its own price.
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {variationFields.length > 0 && (
                                    <div className="space-y-4">
                                        <div className="grid grid-cols-[1fr,1fr,100px,auto,auto,auto,auto] gap-4 items-center text-sm font-medium text-muted-foreground px-1">
                                             <Label>Value*</Label>
                                                <Label className="flex items-center gap-1.5">
                                                    Matrix ID
                                                    <Tooltip delayDuration={100}>
                                                    <TooltipTrigger asChild>
                                                        <button type="button" onClick={(e) => e.preventDefault()} >
                                                            <HelpCircle className="h-4 w-4 cursor-help" />
                                                        </button>
                                                    </TooltipTrigger>
                                                    <TooltipContent><p>Optional identifier for your POS system.</p></TooltipContent>
                                                    </Tooltip>
                                                </Label>
                                                <Label className="flex items-center gap-1.5">
                                                    Price*
                                                    <Tooltip delayDuration={100}>
                                                    <TooltipTrigger asChild>
                                                        <button type="button" onClick={(e) => e.preventDefault()}>
                                                            <HelpCircle className="h-4 w-4 cursor-help" />
                                                        </button>
                                                    </TooltipTrigger>
                                                    <TooltipContent><p>This price will override the base price.</p></TooltipContent>
                                                    </Tooltip>
                                                </Label>
                                                <Label className="text-center">Cat. Page</Label>
                                                <Label className="text-center">Prod. Page</Label>
                                                <Label className="text-center">Hidden</Label>
                                                <div><span className="sr-only">Actions</span></div>
                                        </div>
                                        {variationFields.map((field, index) => (
                                        <div
                                            key={field.id}
                                            className="grid grid-cols-[1fr,1fr,100px,auto,auto,auto,auto] gap-4 items-start"
                                        >
                                            <FormField control={form.control} name={`variations.${index}.value`} render={({ field }) => (<FormItem><FormControl><Input placeholder="e.g. Large" {...field}/></FormControl><FormMessage /></FormItem>)} />
                                            <FormField control={form.control} name={`variations.${index}.matrix`} render={({ field }) => (<FormItem><FormControl><Input placeholder="Matrix ID" {...field}/></FormControl><FormMessage /></FormItem>)} />
                                            <FormField control={form.control} name={`variations.${index}.price`} render={({ field }) => (<FormItem><FormControl><Input type="number" placeholder="Price" {...field}/></FormControl><FormMessage /></FormItem>)} />
                                            <FormField control={form.control} name={`variations.${index}.categoryPage`} render={({ field }) => (<FormItem className="flex h-10 items-center justify-center"><FormControl><Checkbox checked={field.value} onCheckedChange={field.onChange} /></FormControl></FormItem>)} />
                                            <FormField control={form.control} name={`variations.${index}.productPage`} render={({ field }) => (<FormItem className="flex h-10 items-center justify-center"><FormControl><Checkbox checked={field.value} onCheckedChange={field.onChange} /></FormControl></FormItem>)} />
                                            <FormField control={form.control} name={`variations.${index}.hidden`} render={({ field }) => (<FormItem className="flex h-10 items-center justify-center"><FormControl><Switch checked={field.value} onCheckedChange={field.onChange}/></FormControl></FormItem>)}/>
                                            <Button type="button" variant="ghost" size="icon" onClick={() => removeVariation(index)}><Trash className="h-4 w-4 text-destructive" /></Button>
                                        </div>
                                        ))}
                                    </div>
                                )}
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={() =>
                                    appendVariation({ value: '', matrix: '', price: 0, hidden: false, categoryPage: true, productPage: true })
                                    }
                                >
                                    <PlusCircle className="mr-2 h-4 w-4" />
                                    Add Variation
                                </Button>
                            </CardContent>
                        </Card>
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
                  <Tooltip
                    delayDuration={100}
                    open={!isValid ? undefined : false}
                  >
                    <TooltipTrigger asChild>
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
                </SheetFooter>
              </form>
            </Form>
          </TooltipProvider>
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
