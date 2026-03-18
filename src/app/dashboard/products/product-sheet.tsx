
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  SelectSeparator,
  SelectGroup,
  SelectLabel,
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
  PlusCircle,
  Trash,
  Video,
  HelpCircle,
  Wand,
  RefreshCw,
  ChevronDown,
  CheckCircle,
} from 'lucide-react';
import type { Product, Variation } from './types';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { generateProductDescription } from '@/ai/flows/generate-product-description-flow';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { mockDataStore, mockComboGroups } from '@/lib/mock-data-store';
import { getCategoryNameOptions } from '@/app/dashboard/categories/utils';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { Textarea } from '@/components/ui/textarea';

const productSchema = z
  .object({
    name: z.string().min(1, 'Product name is required'),
    category: z.string().min(1, 'Category is required'),
    properties: z.string().optional(),
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
  const [isGenerating, setIsGenerating] = useState<'short' | 'long' | null>(
    null
  );
  const [showNewComboInput, setShowNewComboInput] = useState(false);

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

  const { toast } = useToast();
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
    setShowNewComboInput(false);
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

      if (type === 'short') {
        form.setValue('smallDescription', result.description, { shouldDirty: true, shouldValidate: true });
      } else {
        form.setValue('description', result.description, { shouldDirty: true, shouldValidate: true });
      }

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

  const onSubmit = (data: ProductFormValues, statusOverride?: Product['status']) => {
    let discountedPrice: number | undefined;
    if (data.discountType === 'percentage' && data.discountValue) {
      discountedPrice = data.price * (1 - data.discountValue / 100);
    } else if (data.discountType === 'fixed' && data.discountValue) {
      discountedPrice = data.price - data.discountValue;
    }

    const { discountType: dt, discountValue: dv, ...restOfData } = data;

    let finalStatus: Product['status'];
    if (product) { // Editing
        finalStatus = product.status;
        if (data.hidden) {
            finalStatus = 'Archived';
        } else if (data.outOfStock) {
            finalStatus = 'Out of Stock';
        } else if (finalStatus === 'Archived' || finalStatus === 'Out of Stock') {
            finalStatus = 'Active'; 
        }
    } else { // Creating
        finalStatus = statusOverride || 'Active';
    }


    const fullProductData: Product = {
      ...(product || {
        id: `new_${Date.now()}`,
        stock: 0,
      }),
      ...restOfData,
      status: finalStatus,
      branch: 'Ras Al Khaimah',
      discountedPrice,
      smallDescription: data.smallDescription || '',
      description: data.description || '',
    };
    
    onSave(fullProductData as Product);
    onOpenChange(false);
    form.reset();
  };

  const onInvalid = () => {
    const errorKeys = Object.keys(errors) as Array<keyof ProductFormValues>;
    const tabMap: Record<string, string> = {
      name: 'basic-info',
      category: 'basic-info',
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
    form.getValues('name') &&
    form.getValues('category');
  const isPricingComplete = !errors.price && !errors.discountValue && form.getValues('price') > 0;
  const areVariationsComplete = !errors.variations;
  
  const tabsConfig = [
    { value: 'basic-info', label: 'Basic Info', isComplete: isBasicInfoComplete },
    { value: 'pricing', label: 'Pricing', isComplete: isPricingComplete },
    { value: 'display', label: 'Display & Options', isComplete: true },
    { value: 'media', label: 'Media', isComplete: true },
    { value: 'variations', label: 'Variations', isComplete: areVariationsComplete },
  ];

  return (
    <>
      <Sheet open={open} onOpenChange={handleAttemptClose}>
        <SheetContent className="sm:max-w-4xl w-full p-0 bg-card">
          <TooltipProvider>
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit((data) => onSubmit(data, 'Active'), onInvalid)}
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
                    <TabsList className="w-full justify-start rounded-none border-b px-6 py-2 h-auto bg-background sticky top-0 z-10">
                      <div className="flex items-center gap-2">
                          {tabsConfig.map((tab, index) => {
                              const isActive = activeTab === tab.value;
                              const isComplete = tab.isComplete;
                              return (
                                <TabsTrigger
                                  key={tab.value}
                                  value={tab.value}
                                  className={cn(
                                    "relative flex items-center gap-3 p-2 transition-colors",
                                    isActive ? "" : "rounded-lg hover:bg-muted/50"
                                  )}
                                >
                                  {isComplete && !isActive ? (
                                    <CheckCircle className="h-5 w-5 text-green-500" />
                                  ) : (
                                    <div
                                        className={cn(
                                        'flex h-5 w-5 items-center justify-center rounded-md border text-xs font-bold',
                                        'transition-colors',
                                        isActive
                                            ? 'bg-primary text-primary-foreground border-primary'
                                            : 'bg-background text-muted-foreground',
                                        !isComplete && !isActive && 'border-destructive text-destructive'
                                        )}
                                    >
                                        {index + 1}
                                    </div>
                                  )}
                                  <span
                                    className={cn(
                                      'font-medium transition-colors',
                                      isActive ? 'text-foreground' : 'text-muted-foreground',
                                      isComplete && !isActive && 'text-foreground'
                                    )}
                                  >
                                    {tab.label}
                                  </span>
                                  {isActive && (
                                    <div className="absolute bottom-[-9px] left-0 right-0 h-0.5 bg-primary" />
                                  )}
                                </TabsTrigger>
                              );
                          })}
                      </div>
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
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                                            <Input
                                                placeholder="A short, catchy line for your product."
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
                              <CardDescription>
                                Special features like upselling and combos.
                              </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                              <FormField
                                control={form.control}
                                name="recommend"
                                render={({ field }) => (
                                  <FormItem className="flex items-center justify-between rounded-lg border p-3">
                                    <div className="space-y-0.5">
                                      <FormLabel>Recommend</FormLabel>
                                      <FormDescription>
                                        Feature this product on your menu.
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
                              <FormField
                                control={form.control}
                                name="upsell"
                                render={({ field }) => (
                                  <FormItem className="flex items-center justify-between rounded-lg border p-3">
                                    <div className="space-y-0.5">
                                      <FormLabel>Enable Upsell</FormLabel>
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
                              <div className="rounded-lg border">
                                <FormField
                                  control={form.control}
                                  name="enableCombo"
                                  render={({ field }) => (
                                    <FormItem className="flex items-center justify-between p-3">
                                      <div className="space-y-0.5">
                                        <FormLabel>Enable Combo</FormLabel>
                                        <FormDescription>
                                          Group this product with others as a combo deal.
                                        </FormDescription>
                                      </div>
                                      <FormControl>
                                        <Switch
                                          checked={field.value}
                                          onCheckedChange={(checked) => {
                                            field.onChange(checked);
                                            if (!checked) {
                                              form.setValue('comboGroup', '');
                                              setShowNewComboInput(false);
                                            }
                                          }}
                                        />
                                      </FormControl>
                                    </FormItem>
                                  )}
                                />
                                {form.watch('enableCombo') && (
                                  <div className="p-3 pt-4 border-t">
                                    {!showNewComboInput ? (
                                      <FormField
                                        control={form.control}
                                        name="comboGroup"
                                        render={({ field }) => (
                                          <FormItem>
                                            <FormLabel>Combo Group</FormLabel>
                                            <Select
                                              onValueChange={(value) => {
                                                if (value === '__CREATE_NEW__') {
                                                  setShowNewComboInput(true);
                                                  field.onChange('');
                                                } else {
                                                  field.onChange(value);
                                                }
                                              }}
                                              value={field.value}
                                            >
                                              <FormControl>
                                                <SelectTrigger>
                                                  <SelectValue placeholder="Select a combo group" />
                                                </SelectTrigger>
                                              </FormControl>
                                              <SelectContent>
                                                {mockComboGroups.map((group) => (
                                                  <SelectItem key={group} value={group}>
                                                    {group}
                                                  </SelectItem>
                                                ))}
                                                <SelectSeparator />
                                                <SelectItem value="__CREATE_NEW__">
                                                  <div className="flex items-center gap-2">
                                                    <PlusCircle className="h-4 w-4" />
                                                    <span>Create new combo group</span>
                                                  </div>
                                                </SelectItem>
                                              </SelectContent>
                                            </Select>
                                            <FormDescription>Select an existing group or create a new one.</FormDescription>
                                            <FormMessage />
                                          </FormItem>
                                        )}
                                      />
                                    ) : (
                                      <FormField
                                        control={form.control}
                                        name="comboGroup"
                                        render={({ field }) => (
                                          <FormItem>
                                            <FormLabel>New Combo Group Name</FormLabel>
                                            <div className="flex items-center gap-2">
                                              <FormControl>
                                                <Input placeholder="e.g. Weekend Specials" {...field} autoFocus />
                                              </FormControl>
                                              <Button
                                                type="button"
                                                variant="ghost"
                                                onClick={() => {
                                                  setShowNewComboInput(false);
                                                  form.setValue('comboGroup', '');
                                                }}
                                              >
                                                Cancel
                                              </Button>
                                            </div>
                                            <FormDescription>Enter a unique name for your new combo group.</FormDescription>
                                            <FormMessage />
                                          </FormItem>
                                        )}
                                      />
                                    )}
                                  </div>
                                )}
                              </div>
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
                                <div className="space-y-4">
                                    {variationFields.map((field, index) => (
                                        <Collapsible
                                            key={field.id}
                                            defaultOpen={true}
                                            className="rounded-lg border bg-muted/40"
                                        >
                                            <div className="flex items-center p-3">
                                                <CollapsibleTrigger className="flex flex-1 items-center gap-2 text-left [&[data-state=open]>svg]:rotate-180">
                                                    <ChevronDown className="h-4 w-4 shrink-0 transition-transform duration-200" />
                                                    <span className="font-semibold">
                                                        {form.watch(`variations.${index}.value`) || 'New Variation'}
                                                    </span>
                                                </CollapsibleTrigger>
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => removeVariation(index)}
                                                    className="ml-4 shrink-0"
                                                >
                                                    <Trash className="h-4 w-4 text-destructive" />
                                                </Button>
                                            </div>
                                            <CollapsibleContent>
                                                <div className="space-y-4 border-t bg-card p-4">
                                                    <FormField
                                                        control={form.control}
                                                        name={`variations.${index}.value`}
                                                        render={({ field }) => (
                                                            <FormItem className="w-full">
                                                                <FormLabel>Variation Value*</FormLabel>
                                                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                                    <FormControl>
                                                                        <SelectTrigger>
                                                                            <SelectValue placeholder="Select a variation value" />
                                                                        </SelectTrigger>
                                                                    </FormControl>
                                                                    <SelectContent>
                                                                        {mockDataStore.variationGroups.map((group, groupIndex) => (
                                                                            <React.Fragment key={group.id}>
                                                                                <SelectGroup>
                                                                                    <SelectLabel>{group.name}</SelectLabel>
                                                                                    {group.options.map((option) => (
                                                                                        <SelectItem key={option.id} value={option.value}>
                                                                                            {option.value}
                                                                                        </SelectItem>
                                                                                    ))}
                                                                                </SelectGroup>
                                                                                {groupIndex < mockDataStore.variationGroups.length - 1 && <SelectSeparator />}
                                                                            </React.Fragment>
                                                                        ))}
                                                                    </SelectContent>
                                                                </Select>
                                                                <FormMessage />
                                                            </FormItem>
                                                        )}
                                                    />

                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                        <FormField
                                                            control={form.control}
                                                            name={`variations.${index}.price`}
                                                            render={({ field }) => (
                                                                <FormItem>
                                                                    <FormLabel>Price Override*</FormLabel>
                                                                    <FormControl>
                                                                        <Input type="number" placeholder="Overrides base price" {...field} />
                                                                    </FormControl>
                                                                    <FormDescription>This price will be used instead of the base product price.</FormDescription>
                                                                    <FormMessage />
                                                                </FormItem>
                                                            )}
                                                        />
                                                        <FormField
                                                            control={form.control}
                                                            name={`variations.${index}.matrix`}
                                                            render={({ field }) => (
                                                                <FormItem>
                                                                    <FormLabel>Matrix / SKU (Optional)</FormLabel>
                                                                    <FormControl>
                                                                        <Input placeholder="Identifier for POS" {...field} />
                                                                    </FormControl>
                                                                    <FormDescription>Optional ID for your inventory system.</FormDescription>
                                                                    <FormMessage />
                                                                </FormItem>
                                                            )}
                                                        />
                                                    </div>
                                                    
                                                    <div>
                                                        <Label className="text-sm font-medium">Display Options</Label>
                                                        <div className="mt-2 space-y-2 rounded-lg border p-4 bg-background">
                                                            <FormField
                                                                control={form.control}
                                                                name={`variations.${index}.hidden`}
                                                                render={({ field }) => (
                                                                    <FormItem className="flex items-center justify-between">
                                                                        <div className="space-y-0.5">
                                                                            <FormLabel>Hidden Variation</FormLabel>
                                                                            <FormDescription>
                                                                                If checked, this variation will be hidden from customers.
                                                                            </FormDescription>
                                                                        </div>
                                                                        <FormControl><Switch checked={field.value} onCheckedChange={field.onChange} /></FormControl>
                                                                    </FormItem>
                                                                )}
                                                            />
                                                            <div className={cn("pl-4 border-l ml-2 pt-2 space-y-2", form.watch(`variations.${index}.hidden`) && "opacity-50")}>
                                                                <FormField
                                                                    control={form.control}
                                                                    name={`variations.${index}.categoryPage`}
                                                                    render={({ field }) => (
                                                                        <FormItem className="flex items-center justify-between">
                                                                            <FormLabel>Show on Category Page</FormLabel>
                                                                            <FormControl>
                                                                                <Checkbox 
                                                                                    checked={field.value} 
                                                                                    onCheckedChange={field.onChange}
                                                                                    disabled={form.watch(`variations.${index}.hidden`)}
                                                                                />
                                                                            </FormControl>
                                                                        </FormItem>
                                                                    )}
                                                                />
                                                                <FormField
                                                                    control={form.control}
                                                                    name={`variations.${index}.productPage`}
                                                                    render={({ field }) => (
                                                                        <FormItem className="flex items-center justify-between">
                                                                            <FormLabel>Show on Product Page</FormLabel>
                                                                            <FormControl>
                                                                                <Checkbox 
                                                                                    checked={field.value} 
                                                                                    onCheckedChange={field.onChange}
                                                                                    disabled={form.watch(`variations.${index}.hidden`)}
                                                                                />
                                                                            </FormControl>
                                                                        </FormItem>
                                                                    )}
                                                                />
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </CollapsibleContent>
                                        </Collapsible>
                                    ))}
                                </div>

                                <Button
                                    type="button"
                                    variant="outline"
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
                        variant="ghost"
                        onClick={handleAttemptClose}
                    >
                        Cancel
                    </Button>
                    <div className="flex items-center gap-2">
                        {product ? (
                            <Tooltip delayDuration={100} open={!isValid ? undefined : false}>
                                <TooltipTrigger asChild>
                                    <div tabIndex={0}>
                                        <Button type="submit" disabled={!isValid}>
                                            Update Product
                                        </Button>
                                    </div>
                                </TooltipTrigger>
                                <TooltipContent>
                                    <p>Please complete all required fields.</p>
                                </TooltipContent>
                            </Tooltip>
                        ) : (
                            <>
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={form.handleSubmit((data) => onSubmit(data, 'Draft'), onInvalid)}
                                >
                                    Save as Draft
                                </Button>
                                <Tooltip delayDuration={100} open={!isValid ? undefined : false}>
                                    <TooltipTrigger asChild>
                                        <div tabIndex={0}>
                                            <Button type="submit" disabled={!isValid}>
                                                Publish
                                            </Button>
                                        </div>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                        <p>Please complete all required fields to publish.</p>
                                    </TooltipContent>
                                </Tooltip>
                            </>
                        )}
                    </div>
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
