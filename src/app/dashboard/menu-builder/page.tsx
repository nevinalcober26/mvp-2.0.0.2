

'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { MenuBuilderPreloader } from '@/components/dashboard/menu-builder/preloader';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { List, LayoutGrid, X, Plus, Palette, Database, CheckCircle2, Loader2, GripVertical, Home, Receipt, ArrowLeft, ChevronDown, Wand, RefreshCw, Lock, MoreHorizontal, Trash2, PlusCircle, Plug, Leaf, Package, Rocket, Tag, AlertTriangle, Wheat, Milk, Sprout, Sparkles, Minus, ArrowRight, Check, Flame, ChevronRight, ShoppingCart, Edit, ImageIcon, GalleryHorizontal, Upload, QrCode, ExternalLink, Eye, HelpCircle } from 'lucide-react';
import Image from 'next/image';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { Dialog, DialogContent, DialogHeader, DialogDescription, DialogFooter, DialogClose } from '@/components/ui/dialog';
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, SelectSeparator, SelectGroup, SelectLabel } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { DndContext, closestCenter, useSensor, useSensors, DragEndEvent, PointerSensor, KeyboardSensor, sortableKeyboardCoordinates } from '@dnd-kit/core';
import { arrayMove, SortableContext, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { cn } from '@/lib/utils';
import { MenuItemCard, type MenuItem as BaseMenuItem } from '@/app/mobile/menu/menu-item-card';
import { Badge } from '@/components/ui/badge';
import { Sheet, SheetContent, SheetHeader, SheetDescription } from '@/components/ui/sheet';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Label } from '@/components/ui/label';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Checkbox } from '@/components/ui/checkbox';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuCheckboxItem,
} from '@/components/ui/dropdown-menu';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import type { PosConnection } from '@/app/dashboard/integration/pos/types';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Panel, PanelGroup, PanelResizeHandle } from 'react-resizable-panels';
import NextLink from 'next/link';
import { Search } from 'lucide-react';
import type { VariationGroup, ProductVariationGroup } from '@/app/dashboard/catalog/variations/types';
import { mockCategories, mockVariationGroups, mockComboGroupNames } from '@/lib/mock-data-store';
import { getCategoryNameOptions } from '@/app/dashboard/categories/utils';
import dynamic from 'next/dynamic';


const BuilderSidebar = ({ onCreateMenuClick }: { onCreateMenuClick: () => void }) => {
    return (
        <aside className="w-80 bg-white border-r flex flex-col">
            <div className="h-16 border-b flex items-center px-4 shrink-0">
                <div className="flex items-center gap-2">
                    <div className="h-8 w-8 bg-[#18B4A6] rounded-md flex items-center justify-center">
                        <List className="h-5 w-5 text-white" />
                    </div>
                    <h2 className="text-base font-bold tracking-wider">MENU BUILDER</h2>
                </div>
            </div>
            <div className="p-4 flex flex-col gap-2">
                 <Button 
                    className="w-full justify-start p-3 h-auto bg-teal-100/50 hover:bg-teal-100/80 text-teal-600 font-bold rounded-lg"
                    onClick={onCreateMenuClick}
                >
                    <List className="h-5 w-5 mr-3" />
                    Create a Menu
                </Button>

                <div className="px-2 pt-4">
                    <h3 className="text-xs font-bold text-muted-foreground tracking-widest uppercase">
                        Customization
                    </h3>
                </div>

                <Button variant="ghost" className="w-full justify-start p-3 h-auto font-bold text-gray-600 hover:text-gray-800">
                    <Palette className="h-5 w-5 mr-3 text-gray-500" />
                    Brand Management
                </Button>
            </div>
        </aside>
    );
};


const TemplateCard = ({ name, imageHint, isLocked, status, onDelete, onEdit, onPreview }: {
    name: string;
    imageHint: string;
    isLocked?: boolean;
    status?: 'Offline' | 'Online' | 'Draft',
    onDelete?: () => void;
    onEdit?: () => void;
    onPreview?: () => void;
}) => {
    const router = useRouter();
    const image = PlaceHolderImages.find(img => img.id === imageHint);

    const isOnline = status === 'Online';
    const isDraft = status === 'Draft';

    const tooltipText = isOnline ? "Currently set as live and public" : "Currently offline";
    const dotColor = isOnline ? 'bg-green-500' : 'bg-red-500';

    return (
        <Card
            onClick={(e) => {
                if (!isLocked && onEdit) {
                    onEdit();
                }
            }}
            className={cn("overflow-hidden shadow-sm transition-shadow group", isLocked ? "cursor-not-allowed" : "hover:shadow-lg cursor-pointer")}
        >
            <CardHeader className="p-3 border-b flex-row justify-between items-center">
                <div className="text-xs font-semibold flex items-center gap-1.5">
                    <TooltipProvider delayDuration={100}>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <span className={cn("h-2 w-2 rounded-full", dotColor)} />
                            </TooltipTrigger>
                            <TooltipContent>
                                <p>{tooltipText}</p>
                            </TooltipContent>
                        </Tooltip>
                    </TooltipProvider>

                    {isLocked && <Lock className="h-3 w-3 text-muted-foreground" />}

                    <span className="truncate">{name}</span>

                    {isDraft && <Badge variant="secondary" className="font-bold text-xs px-1.5 py-0.5 h-4">DRAFT</Badge>}
                </div>
                {!isLocked && (
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <button
                                className="h-8 w-8 rounded-full bg-black/5 text-gray-500 flex items-center justify-center hover:bg-gray-100 transition-colors"
                                onClick={(e) => e.stopPropagation()}
                            >
                                <MoreHorizontal className="h-4 w-4" />
                            </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuItem onSelect={(e) => { e.stopPropagation(); onPreview && window.open('/mobile/menu', '_blank'); }}>
                                <Eye className="mr-2 h-4 w-4" /> Preview
                            </DropdownMenuItem>
                            <DropdownMenuItem onSelect={onEdit}>
                                <Edit className="mr-2 h-4 w-4" /> Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem disabled>Set as Offline</DropdownMenuItem>
                            <DropdownMenuItem disabled>Deactivate</DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                                className="text-destructive cursor-pointer"
                                onSelect={(e) => {
                                    e.preventDefault();
                                    if (onDelete) onDelete();
                                }}
                            >
                                <Trash2 className="mr-2 h-4 w-4" />
                                Delete
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                )}
            </CardHeader>
            <CardContent className="p-3">
                <div className={cn("relative aspect-[4/3] w-full bg-muted rounded-md overflow-hidden", isLocked && "filter grayscale opacity-70")}>
                    {image && <Image src={image.imageUrl} alt={name} width={600} height={400} className="object-cover h-full w-full transition-transform group-hover:scale-105" data-ai-hint={image.imageHint} />}
                    {!isLocked && (
                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center gap-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                            <TooltipProvider>
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <Button size="icon" variant="outline" className="bg-white/20 text-white hover:bg-white/30 backdrop-blur-sm rounded-full h-12 w-12 border-white/30" onClick={(e) => { e.stopPropagation(); onPreview && window.open('/mobile/menu', '_blank'); }}>
                                            <Eye className="h-6 w-6" />
                                        </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                        <p>Preview Menu</p>
                                    </TooltipContent>
                                </Tooltip>
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <Button size="icon" variant="outline" className="bg-white/20 text-white hover:bg-white/30 backdrop-blur-sm rounded-full h-12 w-12 border-white/30" onClick={(e) => { e.stopPropagation(); if (onEdit) onEdit(); }}>
                                            <Edit className="h-6 w-6" />
                                        </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                        <p>Edit Menu</p>
                                    </TooltipContent>
                                </Tooltip>
                            </TooltipProvider>
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    );
};


const SUPPORTED_POS = [
  { id: 'oracle-simphony', name: 'Oracle Micros Simphony' },
  { id: 'toast', name: 'Toast' },
  { id: 'square', name: 'Square' },
  { id: 'revel', name: 'Revel Systems' },
  { id: 'clover', name: 'Clover' },
];

const getImageUrl = (id: string) => {
    const image = PlaceHolderImages.find(img => img.id === id);
    return image?.imageUrl || 'https://picsum.photos/seed/placeholder/400/400';
};

interface MenuItem extends BaseMenuItem {
  available?: boolean;
  nutrition?: Record<string, number>;
  variationGroups?: ProductVariationGroup[];
  properties?: string[];
}

const mapGroupToProductVariation = (group: VariationGroup): ProductVariationGroup => {
  return {
    ...group,
    options: group.options.map(opt => ({
        id: opt.id,
        value: opt.value,
        priceMode: 'add',
        priceValue: opt.regularPrice || 0,
        hidden: false,
    }))
  };
};

const mockMenuItems: MenuItem[] = [
    {
        id: 'pizza-margherita-12',
        name: 'Pizza Margherita - 12 inches',
        description: 'Homemade dough, homemade pizza sauce, shredded mozzarella cheese, and shredded cheddar cheese.',
        price: 36.00,
        category: 'Bestsellers',
        image: getImageUrl('margherita-pizza'),
        isCustomisable: true,
        properties: ['Vegetarian', 'Gluten', 'Dairy'],
        variationGroups: [
            mapGroupToProductVariation(mockVariationGroups.find(g => g.id === 'group_1')!),
        ],
        nutrition: {
            protein: 32,
            fat: 38,
            carbs: 98,
        }
    },
    {
        id: 'chicken-alfredo-pizza-12',
        name: 'Chicken Alfredo Pizza - 12 inches',
        description: 'Homemade dough, white sauce base, marinated...',
        price: 48.00,
        category: 'Bestsellers',
        isCustomisable: true,
        image: getImageUrl('alfredo-pizza'),
        properties: ['Halal'],
        nutrition: {
            protein: 45,
            fat: 30,
            carbs: 75,
            sugar: 8
        }
    },
    {
        id: 'pizza-margherita-10',
        name: 'Pizza Margherita - 10 inches',
        description: 'Homemade dough, homemade pizza sauce,...',
        price: 27.00,
        category: 'Pizza',
        image: getImageUrl('margherita-pizza'),
        isCustomisable: false,
        properties: ['Vegetarian', 'Gluten', 'Dairy'],
        nutrition: {
            protein: 18,
            fat: 15,
            carbs: 60,
            sugar: 7
        }
    },
    {
        id: 'hawaiian-pizza-10',
        name: 'Hawaiian Pizza - 10 inches',
        description: 'Homemade dough, pizza sauce, mozzarella, ham,...',
        price: 32.00,
        category: 'Pizza',
        isCustomisable: true,
        image: getImageUrl('hawaiian-pizza'),
        properties: ['Gluten', 'Dairy'],
        nutrition: {
            protein: 22,
            fat: 18,
            carbs: 70,
            sugar: 25
        }
    },
    {
        id: 'soft-drink',
        name: 'Soft Drink',
        description: 'Choose your favorite flavor.',
        price: 3.00,
        category: 'Drinks',
        isCustomisable: true,
        image: getImageUrl('soft-drink'),
        properties: [],
        variationGroups: [
            mapGroupToProductVariation(mockVariationGroups.find(g => g.id === 'group_2')!),
        ],
        nutrition: {
            protein: 0,
            fat: 0,
            carbs: 39,
            sugar: 39
        }
    },
    {
        id: 'bottled-water',
        name: 'Bottled Water',
        description: 'Still or sparkling water.',
        price: 2.50,
        category: 'Drinks',
        isCustomisable: false,
        image: getImageUrl('bottled-water'),
        properties: [],
        nutrition: {
            protein: 0,
            fat: 0,
            carbs: 0,
            sugar: 0
        }
    },
    {
        id: 'steak-frites',
        name: 'Steak Frites',
        description: 'Juicy steak served with a side of crispy french fries.',
        price: 25.00,
        category: 'Main Courses',
        image: getImageUrl('ribeye-steak'),
        properties: ['Halal'],
        variationGroups: [
          mapGroupToProductVariation(mockVariationGroups.find(g => g.id === 'group_3')!),
        ],
        nutrition: {
            protein: 50,
            fat: 35,
            carbs: 40
        }
    },
    {
        id: 'classic-cheeseburger',
        name: 'Classic Cheeseburger',
        description: 'A succulent beef patty with melted cheddar.',
        price: 35.00,
        category: 'Bestsellers',
        image: getImageUrl('classic-cheeseburger'),
        properties: ['Halal', 'Gluten', 'Dairy'],
        variationGroups: [
            mapGroupToProductVariation(mockVariationGroups.find(g => g.id === 'group_3')!),
            mapGroupToProductVariation(mockVariationGroups.find(g => g.id === 'group_5')!)
        ],
        nutrition: {
            protein: 30,
            fat: 25,
            carbs: 40,
            sugar: 8
        }
    },
    {
        id: 'truffle-fries',
        name: 'Truffle Fries',
        description: 'Crispy fries with a truffle twist.',
        price: 15.00,
        category: 'Sides',
        image: getImageUrl('truffle-fries'),
        properties: ['Vegetarian'],
        nutrition: {
            protein: 4,
            fat: 15,
            carbs: 35,
            sodium: 350
        }
    },
    {
        id: 'lava-cake',
        name: 'Chocolate Lava Cake',
        description: 'A chocolate lover\'s dream.',
        price: 22.00,
        category: 'Desserts',
        image: getImageUrl('lava-cake'),
        properties: ['Vegetarian', 'Gluten', 'Dairy'],
        nutrition: {
            protein: 6,
            fat: 22,
            carbs: 50,
            sugar: 35
        }
    }
];


const mockMenuData = [
    { id: 'bestsellers', name: 'Bestsellers', items: mockMenuItems.filter(i => i.category === 'Bestsellers') },
    { id: 'pizza', name: 'Pizza', items: mockMenuItems.filter(i => i.category === 'Pizza') },
    { id: 'main-courses', name: 'Main Courses', items: mockMenuItems.filter(i => i.category === 'Main Courses') },
    { id: 'sides', name: 'Sides', items: mockMenuItems.filter(i => i.category === 'Sides') },
    { id: 'desserts', name: 'Desserts', items: mockMenuItems.filter(i => i.category === 'Desserts') },
    { id: 'drinks', name: 'Drinks', items: mockMenuItems.filter(i => i.category === 'Drinks') },
];

const initialNutritionItems: { id: string; name: string; unit: 'g' | 'mg' | 'kcal'; enabled: boolean; }[] = [
  { id: '2', name: 'Protein', unit: 'g', enabled: true },
  { id: '3', name: 'Fat', unit: 'g', enabled: true },
  { id: '4', name: 'Carbohydrates', unit: 'g', enabled: true },
  { id: '5', name: 'Sugar', unit: 'g', enabled: true },
  { id: '6', name: 'Sodium', unit: 'mg', enabled: true },
  { id: '7', name: 'Fiber', unit: 'g', enabled: true },
];

const mockProperties = ['Spicy', 'Vegetarian', 'Gluten-Free', 'New', 'Halal', 'Organic', 'Gluten', 'Dairy'];


const SortableSectionItem = ({ id, name, onEditClick, itemCount }: { id: string; name: string; onEditClick: () => void; itemCount: number; }) => {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div ref={setNodeRef} style={style} className="touch-none">
      <Card className="p-3 flex items-center justify-between cursor-pointer bg-white hover:bg-muted/50" onClick={onEditClick}>
        <div className="flex items-center gap-3">
          <div {...attributes} {...listeners} className="cursor-grab p-1" onClick={(e) => e.stopPropagation()}>
            <GripVertical className="h-5 w-5 text-muted-foreground" />
          </div>
          <span className="font-semibold text-sm">{name}</span>
        </div>
        <Badge variant="secondary">{itemCount} items</Badge>
      </Card>
    </div>
  );
};

const ItemEditor = ({ item, onUpdate, onImageUpload, onAvailabilityChange }: {
    item: MenuItem | null;
    onUpdate: (itemId: string, field: keyof MenuItem, value: any) => void;
    onImageUpload: (itemId: string, e: React.ChangeEvent<HTMLInputElement>) => void;
    onAvailabilityChange: (itemId: string, available: boolean) => void;
}) => {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [localVariationGroups, setLocalVariationGroups] = useState<ProductVariationGroup[]>([]);
    const [localNutrition, setLocalNutrition] = useState<Record<string, number>>({});
    const [isNutritionEnabled, setIsNutritionEnabled] = useState(false);
    const [editingGroupName, setEditingGroupName] = useState<{ id: string; name: string } | null>(null);

    useEffect(() => {
        if (item) {
            setLocalVariationGroups(item.variationGroups || []);
            const nutritionData = item.nutrition || {};
            setLocalNutrition(nutritionData);
            setIsNutritionEnabled(item.nutrition !== undefined);
        } else {
            setLocalVariationGroups([]);
            setLocalNutrition({});
            setIsNutritionEnabled(false);
        }
    }, [item]);
    
    const handleVariationGroupsChange = (newGroups: ProductVariationGroup[]) => {
      setLocalVariationGroups(newGroups);
      if (item) {
          onUpdate(item.id, 'variationGroups', newGroups);
      }
    };
    
    const availableVariationGroups = useMemo(() => {
      if (!item) return [];
      const addedGroupIds = new Set(localVariationGroups.map(field => field.id));
      return mockVariationGroups.filter(group => !addedGroupIds.has(group.id));
    }, [localVariationGroups, item]);

    const totalKcal = useMemo(() => {
        if (!isNutritionEnabled) return 0;
        const protein = localNutrition.protein || 0;
        const carbs = localNutrition.carbohydrates || localNutrition.carbs || 0;
        const fat = localNutrition.fat || 0;
        return Math.round((protein * 4) + (carbs * 4) + (fat * 9));
    }, [localNutrition, isNutritionEnabled]);

    const handleUpdate = (field: keyof MenuItem, value: any) => {
        if (item) onUpdate(item.id, field, value);
    };

    const handleNutritionChange = (key: string, value: string) => {
        const newNutrition = { ...localNutrition, [key]: parseFloat(value) || 0 };
        setLocalNutrition(newNutrition);
        handleUpdate('nutrition', newNutrition);
    };

    const handleAddNutritionField = (key: string) => {
        const newNutrition = { ...localNutrition, [key]: 0 };
        setLocalNutrition(newNutrition);
        handleUpdate('nutrition', newNutrition);
    };

    const handleRemoveNutritionField = (key: string) => {
        const { [key]: _, ...rest } = localNutrition;
        setLocalNutrition(rest);
        handleUpdate('nutrition', rest);
    };

    const handleNutritionToggle = (enabled: boolean) => {
        setIsNutritionEnabled(enabled);
        if (!enabled) {
            setLocalNutrition({});
            handleUpdate('nutrition', undefined);
        } else if (item && item.nutrition === undefined) {
            handleUpdate('nutrition', {});
        }
    };

    const handleGroupNameUpdate = () => {
        if (editingGroupName && item) {
            const newGroups = localVariationGroups.map(g =>
                g.id === editingGroupName.id ? { ...g, name: editingGroupName.name } : g
            );
            handleVariationGroupsChange(newGroups);
            setEditingGroupName(null);
        }
    };


    if (!item) {
        return (
            <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground p-8">
                <Edit className="h-12 w-12 mb-4" />
                <h3 className="font-semibold">Select an Item</h3>
                <p className="text-sm">Click on an item from the list to see and edit its details here.</p>
            </div>
        );
    }

    const addedNutritionKeys = Object.keys(localNutrition);
    const availableNutritionItems = initialNutritionItems.filter(
        ni => ni.enabled && !addedNutritionKeys.includes(ni.name.toLowerCase().replace(/\s/g, '_'))
    );

    return (
        <div className="p-6 space-y-6">
            <div>
                <Label>Product Image</Label>
                <input
                    type="file"
                    ref={fileInputRef}
                    className="hidden"
                    accept="image/*"
                    onChange={(e) => onImageUpload(item.id, e)}
                />
                <div className="relative group mt-2" onClick={() => fileInputRef.current?.click()}>
                    <div className="w-full aspect-video rounded-md bg-muted flex items-center justify-center border overflow-hidden cursor-pointer">
                        {item.image ? (
                            <Image src={item.image} alt={item.name} width={240} height={135} className="object-cover w-full h-full" />
                        ) : (
                            <div className="text-center text-muted-foreground">
                                <ImageIcon className="h-8 w-8 mx-auto mb-2" />
                                <p className="text-xs">Click to upload</p>
                            </div>
                        )}
                    </div>
                     <div className="absolute inset-0 bg-black/50 rounded-md opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer">
                        <Edit className="h-8 w-8 text-white" />
                    </div>
                </div>
            </div>
             <div>
                <Label htmlFor="itemName">Product Name</Label>
                <Input
                    id="itemName"
                    value={item.name}
                    onChange={(e) => handleUpdate('name', e.target.value)}
                    className="font-bold text-base"
                />
            </div>
             <div>
                <Label htmlFor="itemDescription">Description</Label>
                <Textarea
                    id="itemDescription"
                    value={item.description}
                    onChange={(e) => handleUpdate('description', e.target.value)}
                    placeholder="Short description..."
                    rows={3}
                />
            </div>
             <div>
                <Label htmlFor="itemPrice">Price (AED)</Label>
                <Input
                    id="itemPrice"
                    type="number"
                    value={item.price}
                    onChange={(e) => handleUpdate('price', parseFloat(e.target.value) || 0)}
                />
            </div>
            <div className="flex items-center justify-between rounded-lg border p-4">
                <Label htmlFor="itemAvailability" className="font-medium">Available for Purchase</Label>
                <Switch
                    id="itemAvailability"
                    checked={item.available ?? true}
                    onCheckedChange={(checked) => onAvailabilityChange(item.id, checked)}
                />
            </div>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-lg"><Tag className="h-5 w-5" /> Allergens & Properties</CardTitle>
                </CardHeader>
                <CardContent>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="outline" className="w-full justify-between font-normal">
                                <span className="truncate">
                                    {(item.properties && item.properties.length > 0)
                                        ? item.properties.join(', ')
                                        : "Select properties"}
                                </span>
                                <ChevronDown className="h-4 w-4 shrink-0 opacity-50" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className="w-[--radix-dropdown-menu-trigger-width]">
                            {mockProperties.map((prop) => (
                                <DropdownMenuCheckboxItem
                                    key={prop}
                                    checked={item.properties?.includes(prop)}
                                    onSelect={(e) => e.preventDefault()}
                                    onCheckedChange={(checked) => {
                                        const currentProps = item.properties || [];
                                        const newProps = checked
                                            ? [...currentProps, prop]
                                            : currentProps.filter((p) => p !== prop);
                                        handleUpdate('properties', newProps);
                                    }}
                                >
                                    {prop}
                                </DropdownMenuCheckboxItem>
                            ))}
                        </DropdownMenuContent>
                    </DropdownMenu>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-lg"><Package className="h-5 w-5" /> Variation Groups</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    {localVariationGroups.map((group, groupIndex) => (
                        <Collapsible key={group.id} className="border rounded-lg bg-muted/30">
                            <div className="flex items-center p-2">
                                <CollapsibleTrigger asChild>
                                    <Button variant="ghost" className="flex-1 justify-start gap-2 h-auto py-1">
                                        <ChevronRight className="h-4 w-4 transition-transform duration-200 data-[state=open]:rotate-90" />
                                        {editingGroupName?.id === group.id ? (
                                            <Input
                                                value={editingGroupName.name}
                                                onChange={(e) => setEditingGroupName({ ...editingGroupName, name: e.target.value })}
                                                onBlur={handleGroupNameUpdate}
                                                onKeyDown={(e) => { if (e.key === 'Enter') handleGroupNameUpdate(); if (e.key === 'Escape') setEditingGroupName(null); }}
                                                autoFocus
                                                className="h-7 text-base"
                                                onClick={(e) => e.stopPropagation()}
                                            />
                                        ) : (
                                            <span className="font-semibold text-base" onDoubleClick={() => setEditingGroupName({ id: group.id, name: group.name })}>
                                                {group.name}
                                            </span>
                                        )}
                                    </Button>
                                </CollapsibleTrigger>
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => {
                                        const newGroups = localVariationGroups.filter((_, i) => i !== groupIndex);
                                        handleVariationGroupsChange(newGroups);
                                    }}
                                >
                                    <Trash2 className="h-4 w-4 text-destructive" />
                                </Button>
                            </div>
                            <CollapsibleContent className="p-4 pt-0">
                                <div className="space-y-4 border-t pt-4">
                                    <div className="flex items-center justify-between rounded-lg border bg-background p-3">
                                        <Label htmlFor={`multi-select-${groupIndex}`} className="font-medium flex items-center gap-2">
                                            Multi-selection?
                                            <TooltipProvider>
                                                <Tooltip>
                                                    <TooltipTrigger asChild>
                                                        <button type="button" onClick={e => e.preventDefault()}><HelpCircle className="h-4 w-4 text-muted-foreground" /></button>
                                                    </TooltipTrigger>
                                                    <TooltipContent>
                                                        <p>Enable customers to select multiple options.</p>
                                                    </TooltipContent>
                                                </Tooltip>
                                            </TooltipProvider>
                                        </Label>
                                        <Switch
                                            id={`multi-select-${groupIndex}`}
                                            checked={group.multiple}
                                            onCheckedChange={(checked) => {
                                                const newGroups = [...localVariationGroups];
                                                newGroups[groupIndex].multiple = checked;
                                                handleVariationGroupsChange(newGroups);
                                            }}
                                        />
                                    </div>
                                    <div className="space-y-4">
                                      {group.options.map((option, optionIndex) => (
                                          <div key={option.id} className="grid grid-cols-1 md:grid-cols-4 gap-2 items-end border-t pt-4">
                                              <Label className="font-normal md:col-span-1">{option.value}</Label>
                                              <div className="space-y-1">
                                                <Label>Price Rule</Label>
                                                <Select
                                                    value={option.priceMode}
                                                    onValueChange={(value) => {
                                                        const newGroups = [...localVariationGroups];
                                                        newGroups[groupIndex].options[optionIndex].priceMode = value as any;
                                                        handleVariationGroupsChange(newGroups);
                                                    }}
                                                >
                                                    <SelectTrigger><SelectValue /></SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="add">Add Price</SelectItem>
                                                        <SelectItem value="subtract">Subtract Price</SelectItem>
                                                        <SelectItem value="override">Override Price</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                              </div>
                                              <div className="space-y-1">
                                                <Label>Value (AED)</Label>
                                                <Input
                                                    type="number"
                                                    placeholder='0.00'
                                                    value={option.priceValue}
                                                    onChange={(e) => {
                                                        const newGroups = [...localVariationGroups];
                                                        newGroups[groupIndex].options[optionIndex].priceValue = parseFloat(e.target.value) || 0;
                                                        handleVariationGroupsChange(newGroups);
                                                    }}
                                                />
                                              </div>
                                              <div className="flex flex-col items-center justify-center gap-2">
                                                  <Label>Hidden</Label>
                                                  <Switch checked={option.hidden} onCheckedChange={(checked) => {
                                                      const newGroups = [...localVariationGroups];
                                                      newGroups[groupIndex].options[optionIndex].hidden = checked;
                                                      handleVariationGroupsChange(newGroups);
                                                  }}/>
                                              </div>
                                          </div>
                                      ))}
                                    </div>
                                </div>
                            </CollapsibleContent>
                        </Collapsible>
                    ))}
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button
                                type="button"
                                variant="outline"
                                className="w-full"
                                disabled={availableVariationGroups.length === 0}
                            >
                                <PlusCircle className="mr-2 h-4 w-4" />
                                Add Variation Group
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                            {availableVariationGroups.map((group) => (
                                <DropdownMenuItem
                                    key={group.id}
                                    onSelect={() => {
                                        const newGroup: ProductVariationGroup = {
                                            id: group.id,
                                            name: group.name,
                                            multiple: group.multiple,
                                            required: group.required,
                                            options: group.options.map(opt => ({
                                                id: opt.id,
                                                value: opt.value,
                                                priceMode: 'add',
                                                priceValue: opt.regularPrice || 0,
                                                hidden: false,
                                            }))
                                        };
                                        handleVariationGroupsChange([...localVariationGroups, newGroup]);
                                    }}
                                >
                                    {group.name}
                                </DropdownMenuItem>
                            ))}
                            {availableVariationGroups.length === 0 && <DropdownMenuItem disabled>All groups added</DropdownMenuItem>}
                        </DropdownMenuContent>
                    </DropdownMenu>
                </CardContent>
            </Card>


            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-lg"><Leaf className="h-5 w-5" /> Nutritional Facts</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex items-center justify-between rounded-lg border p-3">
                        <Label htmlFor="enableNutrition" className="font-medium">Enable Info</Label>
                        <Switch
                            id="enableNutrition"
                            checked={isNutritionEnabled}
                            onCheckedChange={handleNutritionToggle}
                        />
                    </div>
                    {isNutritionEnabled && (
                        <div className="space-y-4 pt-4 border-t">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-6">
                                {Object.entries(localNutrition).map(([key, value]) => {
                                    const nutritionItem = initialNutritionItems.find(i => i.name.toLowerCase().replace(/\s/g, '_') === key || i.name.toLowerCase() === key);
                                    return (
                                        <div key={key} className="flex items-end gap-2">
                                            <div className="flex-1">
                                                <Label htmlFor={`nutrition-${key}`} className="text-sm text-muted-foreground">{nutritionItem?.name || key}</Label>
                                                <div className="relative">
                                                    <Input
                                                        id={`nutrition-${key}`}
                                                        type="number"
                                                        step="0.1"
                                                        value={value ?? ''}
                                                        onChange={(e) => handleNutritionChange(key, e.target.value)}
                                                        className="pr-12"
                                                    />
                                                    <span className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-muted-foreground text-sm uppercase">{nutritionItem?.unit}</span>
                                                </div>
                                            </div>
                                            <Button type="button" variant="ghost" size="icon" onClick={() => handleRemoveNutritionField(key)}>
                                                <Trash2 className="h-4 w-4 text-destructive" />
                                            </Button>
                                        </div>
                                    )
                                })}
                            </div>

                            {availableNutritionItems.length > 0 && (
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="outline" size="sm" className="mt-2">
                                            <PlusCircle className="mr-2 h-4 w-4" />
                                            Add Fact
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent>
                                        {availableNutritionItems.map(ni => (
                                            <DropdownMenuItem key={ni.id} onSelect={() => handleAddNutritionField(ni.name.toLowerCase().replace(/\s/g, '_'))}>
                                                {ni.name}
                                            </DropdownMenuItem>
                                        ))}
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            )}
                        </div>
                    )}
                </CardContent>
                {isNutritionEnabled && totalKcal > 0 && (
                    <CardFooter className="bg-muted/50 p-3 border-t">
                        <div className="flex justify-between items-center w-full">
                            <span className="font-bold text-sm">Total Calories (est.)</span>
                            <span className="font-mono font-bold text-lg text-primary">{totalKcal} kcal</span>
                        </div>
                    </CardFooter>
                )}
            </Card>
        </div>
    );
};


const ItemPreviewer = ({ item }: { item: MenuItem | null }) => {
    const [quantity, setQuantity] = useState(1);
    const [selections, setSelections] = useState<Record<string, string | string[]>>({});

    const allergenIcons: Record<string, React.ElementType> = {
        'Gluten': Wheat,
        'Dairy': Milk,
        'Vegetarian': Leaf,
        'Spicy': Flame,
        'Halal': Sprout,
        'Gluten-Free': Wheat,
        'New': Sparkles,
        'Organic': Leaf
    };

    useEffect(() => {
        setQuantity(1);
        if (item?.variationGroups) {
            const initialSelections: Record<string, string | string[]> = {};
            item.variationGroups.forEach(group => {
                if (group.required && !group.multiple && group.options.length > 0) {
                    const defaultOption = group.options.find(opt => !opt.hidden);
                    if (defaultOption) {
                        initialSelections[group.id] = defaultOption.id;
                    }
                } else if (group.multiple) {
                    initialSelections[group.id] = [];
                } else {
                    initialSelections[group.id] = '';
                }
            });
            setSelections(initialSelections);
        } else {
            setSelections({});
        }
    }, [item]);

    const handleSelectionChange = (groupId: string, optionId: string, isMultiple: boolean) => {
        setSelections(prev => {
            const newSelections = { ...prev };
            if (isMultiple) {
                const currentSelection = (newSelections[groupId] as string[]) || [];
                if (currentSelection.includes(optionId)) {
                    newSelections[groupId] = currentSelection.filter(id => id !== optionId);
                } else {
                    newSelections[groupId] = [...currentSelection, optionId];
                }
            } else {
                newSelections[groupId] = optionId;
            }
            return newSelections;
        });
    };
    
    const totalKcal = useMemo(() => {
        if (!item?.nutrition) return 0;
        const { protein = 0, carbs = 0, carbohydrates = 0, fat = 0 } = item.nutrition;
        return Math.round((protein * 4) + ((carbohydrates || carbs) * 4) + (fat * 9));
    }, [item?.nutrition]);

    const totalPrice = useMemo(() => {
        if (!item) return 0;

        let basePrice = item.price;
        const additions: number[] = [];
        const overrides: number[] = [];

        if (item.variationGroups) {
          Object.entries(selections).forEach(([groupId, selectedOptionIds]) => {
            const group = item.variationGroups?.find(g => g.id === groupId);
            if (!group) return;

            const ids = Array.isArray(selectedOptionIds) ? selectedOptionIds : [selectedOptionIds].filter(Boolean);
            ids.forEach(optionId => {
              const option = group.options.find(o => o.id === optionId);
              if (option) {
                if (option.priceMode === 'override') {
                  overrides.push(option.priceValue);
                } else {
                  additions.push(option.priceMode === 'add' ? option.priceValue : -option.priceValue);
                }
              }
            });
          });
        }
        
        if(overrides.length > 0) {
          basePrice = Math.max(...overrides);
        }
        
        const finalPrice = basePrice + additions.reduce((acc, val) => acc + val, 0);

        return finalPrice * quantity;
    }, [item, selections, quantity]);


    if (!item) {
        return (
            <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground p-8 w-full max-w-sm">
                <ImageIcon className="h-12 w-12 mb-4 opacity-30" />
                <h3 className="font-semibold">Live Preview</h3>
                <p className="text-sm">Click on an item from the list to see a live preview of its details here.</p>
            </div>
        );
    }

    return (
        <div className="w-full max-w-[340px] h-[720px] bg-gray-100 rounded-[32px] shadow-2xl p-3 border-[6px] border-black overflow-hidden flex flex-col">
            <div className="flex-1 overflow-y-auto bg-white rounded-t-[20px]">
                <div className="relative h-52">
                    <Image src={item.image || ''} alt={item.name} fill className="object-cover rounded-t-[20px]" />
                    <div className="absolute top-3 right-3 h-8 w-8 rounded-full bg-black/40 flex items-center justify-center text-white cursor-pointer"><X size={18} /></div>
                </div>

                <div className="p-4 space-y-4">
                    <h2 className="text-2xl font-bold">{item.name}</h2>
                    <p className="text-sm text-gray-500">{item.description}</p>
                    <p className="text-xl font-bold">AED {item.price.toFixed(2)} <span className="text-base text-gray-400 font-normal">(Base Price)</span></p>

                    {item.nutrition && (
                        <Card className="bg-gray-50 rounded-xl">
                            <CardHeader className="flex-row items-center gap-2 space-y-0 p-3">
                                <Flame className="h-5 w-5 text-orange-500"/>
                                <h3 className="font-bold">Nutritional Info</h3>
                                <span className="text-xs text-gray-400 ml-auto">Per serving</span>
                            </CardHeader>
                            <CardContent className="p-3 pt-0 grid grid-cols-4 gap-2 text-center">
                                {totalKcal > 0 && <div className="p-2 bg-white rounded-lg border"><p className="font-bold text-lg">{totalKcal}</p><p className="text-xs text-gray-500">Kcal</p></div>}
                                {item.nutrition.protein && <div className="p-2 bg-white rounded-lg border"><p className="font-bold text-lg">{item.nutrition.protein}g</p><p className="text-xs text-gray-500">Protein</p></div>}
                                {(item.nutrition.carbs || item.nutrition.carbohydrates) && <div className="p-2 bg-white rounded-lg border"><p className="font-bold text-lg">{item.nutrition.carbs || item.nutrition.carbohydrates}g</p><p className="text-xs text-gray-500">Carbs</p></div>}
                                {item.nutrition.fat && <div className="p-2 bg-white rounded-lg border"><p className="font-bold text-lg">{item.nutrition.fat}g</p><p className="text-xs text-gray-500">Fat</p></div>}
                            </CardContent>
                        </Card>
                    )}

                    {item.properties && item.properties.length > 0 && (
                         <Card className="bg-yellow-50 border-yellow-200 rounded-xl">
                            <CardHeader className="flex-row items-center gap-2 space-y-0 p-3">
                                <AlertTriangle className="h-5 w-5 text-yellow-600"/>
                                <h3 className="font-bold">Allergen Information</h3>
                            </CardHeader>
                            <CardContent className="p-3 pt-0 flex flex-wrap gap-2">
                                {item.properties.map(prop => {
                                    const Icon = allergenIcons[prop];
                                    return Icon ? (
                                        <Badge key={prop} variant="outline" className="bg-white gap-1.5 font-semibold text-gray-600 border-gray-200 py-1 px-2"><Icon className="h-4 w-4"/> {prop}</Badge>
                                    ) : null;
                                })}
                            </CardContent>
                        </Card>
                    )}

                    {item.variationGroups && item.variationGroups.map(group => (
                        <Card key={group.id} className="bg-gray-50 rounded-xl">
                            <CardHeader className="p-3">
                                <h3 className="font-bold">{group.name}</h3>
                                <p className="text-sm text-gray-500">
                                  {group.multiple ? "Select one or more options" : "Select one option"}{' '}
                                  {group.required && <span className="text-red-500 font-semibold">(Required)</span>}
                                </p>
                            </CardHeader>
                            <CardContent className="p-3 pt-0">
                                {group.multiple ? (
                                    <div className="space-y-2">
                                        {group.options.filter(opt => !opt.hidden).map((opt, i) => (
                                            <div key={opt.id} className="flex items-center justify-between border-b last:border-b-0 border-dashed pb-3 last:pb-0">
                                                <Label htmlFor={`preview-opt-${group.id}-${i}`} className="text-base font-medium text-gray-700 flex-1 cursor-pointer">
                                                    {opt.value}
                                                    {opt.priceValue > 0 && <span className="text-sm text-gray-500 ml-2">(+AED {opt.priceValue.toFixed(2)})</span>}
                                                </Label>
                                                <Checkbox
                                                    id={`preview-opt-${group.id}-${i}`}
                                                    checked={(selections[group.id] as string[])?.includes(opt.id)}
                                                    onCheckedChange={() => handleSelectionChange(group.id, opt.id, true)}
                                                    className="h-5 w-5 text-teal-500 border-gray-300 data-[state=checked]:border-teal-500 data-[state=checked]:bg-teal-500"
                                                />
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <RadioGroup 
                                        value={selections[group.id] as string || ''}
                                        onValueChange={(value) => handleSelectionChange(group.id, value, false)}
                                    >
                                        <div className="space-y-2">
                                            {group.options.filter(opt => !opt.hidden).map((opt, i) => (
                                            <div key={opt.id} className="flex items-center justify-between border-b last:border-b-0 border-dashed pb-3 last:pb-0">
                                                <Label htmlFor={`preview-opt-${group.id}-${i}`} className="text-base font-medium text-gray-700 flex-1 cursor-pointer">
                                                  {opt.value}
                                                  {opt.priceValue > 0 && <span className="text-sm text-gray-500 ml-2">(+AED {opt.priceValue.toFixed(2)})</span>}
                                                </Label>
                                                <RadioGroupItem value={opt.id} id={`preview-opt-${group.id}-${i}`} className="h-5 w-5 text-teal-500 border-gray-300 data-[state=checked]:border-teal-500" />
                                            </div>
                                            ))}
                                        </div>
                                    </RadioGroup>
                                )}
                            </CardContent>
                        </Card>
                    ))}

                    <Card className="bg-gray-50 rounded-xl">
                        <CardHeader className="flex-row items-center gap-2 space-y-0 p-3">
                            <Edit className="h-5 w-5 text-gray-500"/>
                            <h3 className="font-bold">Special requests</h3>
                        </CardHeader>
                        <CardContent className="p-3 pt-0">
                             <p className="text-xs text-gray-400 mb-2">We'll pass your special request to the restaurant... a refund isn't available if they can't.</p>
                             <Textarea placeholder="For example: less spicy, no sugar, etc." className="bg-white"/>
                        </CardContent>
                    </Card>

                </div>
            </div>
            <div className="sticky bottom-0 bg-white p-3 border-t shadow-inner rounded-b-[20px] flex items-center gap-3">
                <div className="flex items-center justify-between rounded-lg p-1 border w-28">
                    <Button size="icon" variant="ghost" className="h-9 w-9 text-gray-700" onClick={() => setQuantity(q => Math.max(1, q - 1))}><Minus className="h-5 w-5" /></Button>
                    <span className="font-bold text-lg text-gray-800">{quantity}</span>
                    <Button size="icon" variant="ghost" className="h-9 w-9 text-gray-700" onClick={() => setQuantity(q => q + 1)}><Plus className="h-5 w-5" /></Button>
                </div>
                <Button className="flex-1 h-12 text-white font-bold text-base bg-teal-500 hover:bg-teal-600">Add • AED {totalPrice.toFixed(2)}</Button>
            </div>
        </div>
    );
};


const CategoryItemsSheet = ({ category, isOpen, onOpenChange, onSave }: any) => {

    const [items, setItems] = useState<MenuItem[]>([]);
    const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const sensors = useSensors(useSensor(PointerSensor));
    const { toast } = useToast();

    useEffect(() => {
        if (category && isOpen) {
          setItems(category.items.map((item: any) => ({ ...item, available: item.available ?? true })));
          setSelectedItem(category.items.length > 0 ? category.items[0] : null);
          setSearchQuery('');
        }
    }, [category, isOpen]);

    const filteredItems = useMemo(() => {
        if (!searchQuery) return items;
        return items.filter(item =>
            item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (item.description && item.description.toLowerCase().includes(searchQuery.toLowerCase()))
        );
    }, [items, searchQuery]);

    const itemIds = useMemo(() => filteredItems.map(i => i.id), [filteredItems]);

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;
        if (over && active.id !== over.id) {
            const oldIndexInFiltered = filteredItems.findIndex(item => item.id === active.id);
            const newIndexInFiltered = filteredItems.findIndex(item => item.id === over.id);

            if (oldIndexInFiltered === -1 || newIndexInFiltered === -1) return;

            const newOrderedFilteredItems = arrayMove(filteredItems, oldIndexInFiltered, newIndexInFiltered);

            const newFullItemsOrder = [...items];
            let lastFoundIndex = -1;

            newOrderedFilteredItems.forEach(filteredItem => {
                const currentIndexInFull = newFullItemsOrder.findIndex(item => item.id === filteredItem.id);
                if (currentIndexInFull > lastFoundIndex) {
                    lastFoundIndex = currentIndexInFull;
                } else {
                    const [itemToMove] = newFullItemsOrder.splice(currentIndexInFull, 1);
                    newFullItemsOrder.splice(lastFoundIndex + 1, 0, itemToMove);
                    lastFoundIndex++;
                }
            });

            setItems(newFullItemsOrder);
        }
    };

    const handleItemUpdate = (itemId: string, field: keyof MenuItem, value: any) => {
        const newItems = items.map(item => (item.id === itemId ? { ...item, [field]: value } : item));
        setItems(newItems);
        if (selectedItem?.id === itemId) {
            setSelectedItem(prev => prev ? { ...prev, [field]: value } : null);
        }
    };

    const handleImageUpload = (itemId: string, event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                const result = reader.result as string;
                handleItemUpdate(itemId, 'image', result);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleAvailabilityChange = (itemId: string, available: boolean) => {
        const newItems = items.map(item => (item.id === itemId ? { ...item, available } : item));
        setItems(newItems);
        if (selectedItem?.id === itemId) {
            setSelectedItem(prev => prev ? { ...prev, available } : null);
        }
    };

    const handleSaveChanges = () => {
        if (category) {
            onSave(category.id, items);
            onOpenChange(false);
            toast({
                title: "Changes Saved",
                description: `Items in "${category.name}" have been updated.`,
            });
        }
    };

    const handleRowClick = (item: MenuItem) => {
        setSelectedItem(item);
    };

    if (!isOpen) {
        return null;
    }

    return (
        <Sheet open={isOpen} onOpenChange={onOpenChange}>
            <SheetContent className="sm:max-w-[90vw] w-[90vw] p-0 flex flex-col">
                {!category ? (
                    <div className="flex-1 flex items-center justify-center">
                        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                    </div>
                ) : (
                  <>
                    <SheetHeader className="p-6 border-b shrink-0">
                        <DialogTitle>Manage: {category.name} ({items.length} items)</DialogTitle>
                        <SheetDescription>Drag to reorder, click a row to edit details, and toggle availability.</SheetDescription>
                    </SheetHeader>
                    <PanelGroup direction="horizontal" className="flex-1 overflow-hidden">
                        <Panel defaultSize={33} minSize={25} className="flex flex-col overflow-hidden border-r bg-muted/30">
                           <div className="p-4 border-b shrink-0">
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        placeholder={`Search in ${category.name}...`}
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="pl-10"
                                    />
                                </div>
                            </div>
                            <div className="flex-1 overflow-y-auto">
                                <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                                    <Table>
                                        <TableHeader className="sr-only">
                                            <TableRow>
                                                <TableHead className="w-10"></TableHead>
                                                <TableHead>Image</TableHead>
                                                <TableHead>Details</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <SortableContext items={itemIds} strategy={verticalListSortingStrategy}>
                                            <TableBody>
                                                {filteredItems.map(item => (
                                                    <SortableProductRow
                                                        key={item.id}
                                                        item={item}
                                                        onAvailabilityChange={handleAvailabilityChange}
                                                        onRowClick={handleRowClick}
                                                        isSelected={selectedItem?.id === item.id}
                                                    />
                                                ))}
                                            </TableBody>
                                        </SortableContext>
                                    </Table>
                                    {filteredItems.length === 0 && (
                                        <div className="text-center py-16 text-muted-foreground">
                                            <p>No items found{searchQuery && ` for "${searchQuery}"`}.</p>
                                        </div>
                                    )}
                                </DndContext>
                            </div>
                        </Panel>
                        <PanelResizeHandle className="w-1.5 bg-muted hover:bg-border transition-colors data-[resize-handle-state=drag]:bg-primary" />
                        <Panel defaultSize={42} minSize={30} className="flex flex-col overflow-hidden border-r">
                           <div className="flex-1 overflow-y-auto">
                             <ItemEditor
                                item={selectedItem}
                                onUpdate={handleItemUpdate}
                                onImageUpload={handleImageUpload}
                                onAvailabilityChange={handleAvailabilityChange}
                             />
                           </div>
                        </Panel>
                        <PanelResizeHandle className="w-1.5 bg-muted hover:bg-border transition-colors data-[resize-handle-state=drag]:bg-primary" />
                        <Panel defaultSize={25} minSize={20} className="bg-muted/30 flex items-center justify-center p-4">
                           <ItemPreviewer item={selectedItem} />
                        </Panel>
                    </PanelGroup>
                    <SheetFooter className="p-6 border-t shrink-0">
                        <Button variant="outline" onClick={() => onOpenChange(false)}>Close</Button>
                        <Button onClick={handleSaveChanges}>Save Changes</Button>
                    </SheetFooter>
                  </>
                )}
            </SheetContent>
        </Sheet>
    );
};

const addSectionSchema = z.object({
    name: z.string().min(1, 'Section name is required'),
    description: z.string().optional(),
    imageUrl: z.string().optional(),
    enableSpecial: z.boolean().default(false),
    specialTagName: z.string().optional(),
    enableCategoryLink: z.boolean().default(false),
    externalLink: z.string().url().optional().or(z.literal('')),
});
type AddSectionFormValues = z.infer<typeof addSectionSchema>;

const AddSectionDetailsDialog = ({ isOpen, onOpenChange, onConfirm }: { isOpen: boolean; onOpenChange: (open: boolean) => void; onConfirm: (data: AddSectionFormValues) => void; }) => {
  const form = useForm<AddSectionFormValues>({
    resolver: zodResolver(addSectionSchema),
    defaultValues: { name: '', description: '', imageUrl: '', enableSpecial: false },
  });

  useEffect(() => {
    if (isOpen) {
      form.reset();
    }
  }, [isOpen, form]);

  const onSubmit = (data: AddSectionFormValues) => {
    onConfirm(data);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create New Menu Section</DialogTitle>
          <DialogDescription>
            Enter the basic details for your new section. You can add products in the next step.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form id="add-section-details-form" onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
            <FormField control={form.control} name="name" render={({ field }) => (
                <FormItem>
                    <FormLabel>Section Name*</FormLabel>
                    <FormControl><Input placeholder="e.g., Summer Specials" {...field} /></FormControl>
                    <FormMessage />
                </FormItem>
            )}/>
            <FormField control={form.control} name="description" render={({ field }) => (
                <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl><Textarea placeholder="A short description for this section." rows={2} {...field} /></FormControl>
                    <FormMessage />
                </FormItem>
            )}/>
            <FormField control={form.control} name="imageUrl" render={({ field }) => (
              <FormItem>
                <FormLabel>Image</FormLabel>
                <div className="flex items-center gap-4">
                  <div className="w-24 h-24 bg-muted rounded-md flex items-center justify-center border">
                    <ImageIcon className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <Button variant="outline" asChild><label className="cursor-pointer"><Upload className="mr-2 h-4 w-4"/>Upload</label></Button>
                  <Input type="file" id="image-upload" className="hidden" />
                </div>
              </FormItem>
            )}/>
             <FormField control={form.control} name="enableSpecial" render={({ field }) => (
                <FormItem className="flex items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                        <FormLabel>Mark as Special</FormLabel>
                        <FormDescription>
                            Highlight this section on your menu.
                        </FormDescription>
                    </div>
                    <FormControl><Switch checked={field.value} onCheckedChange={field.onChange} /></FormControl>
                </FormItem>
            )} />
          </form>
        </Form>
        <DialogFooter>
          <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button type="submit" form="add-section-details-form">
            Create & Add Items <ArrowRight className="ml-2 h-4 w-4"/>
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};


const AddSectionSheet = ({
    isOpen,
    onOpenChange,
    onAddSection,
    allProducts,
    initialData,
}: {
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
    onAddSection: (data: AddSectionFormValues, productIds: string[]) => void;
    allProducts: MenuItem[];
    initialData?: Partial<AddSectionFormValues> | null;
}) => {
    const [addedProducts, setAddedProducts] = useState<MenuItem[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const sensors = useSensors(useSensor(PointerSensor));
    const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null);

    useEffect(() => {
        if (isOpen) {
            setAddedProducts([]);
            setSearchQuery('');
            setSelectedItem(null);
        }
    }, [isOpen]);

    const availableProducts = useMemo(() => {
        const addedIds = new Set(addedProducts.map(p => p.id));
        return allProducts.filter(p =>
            !addedIds.has(p.id) &&
            p.name.toLowerCase().includes(searchQuery.toLowerCase())
        );
    }, [allProducts, addedProducts, searchQuery]);

    const addedProductIds = useMemo(() => addedProducts.map(p => p.id), [addedProducts]);

    const handleAddProduct = (product: MenuItem) => {
        setAddedProducts(prev => [...prev, product]);
    };

    const handleRemoveProduct = (productId: string) => {
        setAddedProducts(prev => prev.filter(p => p.id !== productId));
        if (selectedItem?.id === productId) {
            setSelectedItem(null);
        }
    };

    const handleReorderProducts = (event: DragEndEvent) => {
        const { active, over } = event;
        if (over && active.id !== over.id) {
            setAddedProducts((items) => {
                const oldIndex = items.findIndex((item) => item.id === active.id);
                const newIndex = items.findIndex((item) => item.id === over.id);
                return arrayMove(items, oldIndex, newIndex);
            });
        }
    };

    const handleItemUpdate = (itemId: string, field: keyof MenuItem, value: any) => {
        const updateProduct = (product: MenuItem) => product.id === itemId ? { ...product, [field]: value } : product;
        setAddedProducts(prev => prev.map(updateProduct));
        if (selectedItem?.id === itemId) {
            setSelectedItem(prev => prev ? { ...prev, [field]: value } : null);
        }
    };

    const handleImageUpload = (itemId: string, e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                const result = reader.result as string;
                handleItemUpdate(itemId, 'image', result);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleAvailabilityChange = (itemId: string, available: boolean) => {
       handleItemUpdate(itemId, 'available', available);
    };

    const handleRowClick = (item: MenuItem) => {
        setSelectedItem(item);
    };

    const handleSubmit = () => {
        if(initialData){
            onAddSection(initialData as AddSectionFormValues, addedProducts.map(p => p.id));
        }
        onOpenChange(false);
    };

    const SortableAddedProductRow = ({ product, isSelected, onClick }: { product: MenuItem; isSelected: boolean; onClick: () => void; }) => {
        const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: product.id });
        const style = { transform: CSS.Transform.toString(transform), transition };
        return (
            <div ref={setNodeRef} style={style} className={cn("flex items-center gap-2 p-2 rounded-md bg-background border touch-none cursor-default", isSelected && "border-primary bg-primary/5")} onClick={onClick}>
                <button {...listeners} className="cursor-grab p-1" onClick={e => e.stopPropagation()}><GripVertical className="h-5 w-5 text-muted-foreground" /></button>
                <Image src={product.image || 'https://picsum.photos/seed/placeholder/100/100'} alt={product.name} width={40} height={40} className="rounded-md object-cover" />
                <div className="flex-1">
                    <p className="text-sm font-semibold line-clamp-1">{product.name}</p>
                    <p className="text-xs text-muted-foreground">AED {product.price.toFixed(2)}</p>
                </div>
                <Button type="button" size="icon" variant="ghost" className="h-8 w-8 text-destructive" onClick={(e) => { e.stopPropagation(); handleRemoveProduct(product.id); }}>
                    <X className="h-4 w-4" />
                </Button>
            </div>
        );
    };

    return (
        <Sheet open={isOpen} onOpenChange={onOpenChange}>
            <SheetContent className="w-full max-w-[95vw] sm:max-w-[90vw] lg:max-w-[80vw] p-0 flex flex-col">
                <SheetHeader className="p-6 border-b shrink-0">
                    <DialogTitle className="text-xl">Create New Section: {initialData?.name}</DialogTitle>
                    <SheetDescription>{initialData?.description || 'Build a new section by adding and customizing products from your library.'}</SheetDescription>
                </SheetHeader>
                <PanelGroup direction="horizontal" className="flex-1 overflow-hidden">
                    <Panel defaultSize={20} minSize={15} className="flex flex-col overflow-hidden border-r bg-muted/30">
                          <div className="p-4 border-b shrink-0">
                              <h3 className="font-semibold mb-2">Available Products ({availableProducts.length})</h3>
                              <div className="relative">
                                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                  <Input placeholder="Search all products..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="pl-10" />
                              </div>
                          </div>
                          <ScrollArea className="flex-1 p-2">
                              {availableProducts.map(product => (
                                  <div key={product.id} className="flex items-center gap-2 p-2 rounded-md hover:bg-muted">
                                      <Image src={product.image || 'https://picsum.photos/seed/placeholder/100/100'} alt={product.name} width={40} height={40} className="rounded object-cover" />
                                      <div className="flex-1">
                                          <p className="text-sm font-semibold line-clamp-1">{product.name}</p>
                                          <p className="text-xs text-muted-foreground">AED {product.price.toFixed(2)}</p>
                                      </div>
                                      <Button type="button" size="icon" variant="ghost" className="h-8 w-8 text-primary" onClick={() => handleAddProduct(product)}>
                                          <Plus className="h-4 w-4" />
                                      </Button>
                                  </div>
                              ))}
                              {availableProducts.length === 0 && <p className="text-sm text-center text-muted-foreground p-8">No available products found.</p>}
                          </ScrollArea>
                    </Panel>
                    <PanelResizeHandle className="w-1.5 bg-muted hover:bg-border transition-colors data-[resize-handle-state=drag]:bg-primary" />
                    <Panel defaultSize={20} minSize={15} className="flex flex-col overflow-hidden border-r">
                         <div className="p-4 border-b shrink-0">
                            <h3 className="font-semibold">Items in {initialData?.name || 'New Section'} ({addedProducts.length})</h3>
                            <p className="text-xs text-muted-foreground">Drag to reorder items</p>
                        </div>
                        <ScrollArea className="flex-1 p-2">
                             <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleReorderProducts}>
                                <SortableContext items={addedProductIds} strategy={verticalListSortingStrategy}>
                                    <div className="space-y-2">
                                        {addedProducts.map(product => (
                                            <SortableAddedProductRow key={product.id} product={product} isSelected={selectedItem?.id === product.id} onClick={() => handleRowClick(product)} />
                                        ))}
                                    </div>
                                </SortableContext>
                            </DndContext>
                            {addedProducts.length === 0 && <p className="text-sm text-center text-muted-foreground p-8">Add products from the library.</p>}
                        </ScrollArea>
                    </Panel>
                    <PanelResizeHandle className="w-1.5 bg-muted hover:bg-border transition-colors data-[resize-handle-state=drag]:bg-primary" />
                    <Panel defaultSize={35} minSize={25} className="flex flex-col overflow-hidden border-r">
                        <div className="p-6 border-b shrink-0">
                            <h3 className="font-semibold">Product Details</h3>
                        </div>
                        <div className="flex-1 overflow-y-auto">
                            <ItemEditor
                                item={selectedItem}
                                onUpdate={handleItemUpdate}
                                onImageUpload={handleImageUpload}
                                onAvailabilityChange={handleAvailabilityChange}
                            />
                        </div>
                    </Panel>
                    <PanelResizeHandle className="w-1.5 bg-muted hover:bg-border transition-colors data-[resize-handle-state=drag]:bg-primary" />
                    <Panel defaultSize={25} minSize={20} className="bg-muted/30 flex items-center justify-center p-4">
                        <ItemPreviewer item={selectedItem} />
                    </Panel>
                </PanelGroup>
                <DialogFooter className="p-6 border-t shrink-0">
                    <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
                    <Button type="button" onClick={handleSubmit}>Create Section</Button>
                </DialogFooter>
            </SheetContent>
        </Sheet>
    );
};

const SortableProductRow = ({ item, isSelected, onAvailabilityChange, onRowClick }: {
    item: MenuItem;
    isSelected: boolean;
    onAvailabilityChange: (id: string, available: boolean) => void;
    onRowClick: (item: MenuItem) => void;
}) => {
    const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: item.id });
    const style = { transform: CSS.Transform.toString(transform), transition };

    return (
        <TableRow ref={setNodeRef} style={style} onClick={() => onRowClick(item)} data-state={isSelected ? 'selected' : undefined} className="cursor-pointer">
            <TableCell className="w-12 px-2" onClick={e => e.stopPropagation()}>
                <div className="cursor-grab touch-none p-2" {...attributes} {...listeners}>
                    <GripVertical className="h-5 w-5 text-muted-foreground" />
                </div>
            </TableCell>
            <TableCell className="w-16 p-2">
                <div className="relative w-12 h-12 rounded-md bg-muted overflow-hidden">
                    <Image src={item.image} alt={item.name} fill className="object-cover" />
                </div>
            </TableCell>
            <TableCell>
                <p className="font-semibold">{item.name}</p>
                <p className="text-xs text-muted-foreground line-clamp-1">{item.description}</p>
            </TableCell>
            <TableCell className="text-right">
                <Switch
                    checked={item.available}
                    onCheckedChange={(checked) => onAvailabilityChange(item.id, checked)}
                    onClick={e => e.stopPropagation()}
                />
            </TableCell>
        </TableRow>
    );
};

const FloatingActionMenu = ({ onQrClick }: { onQrClick: () => void }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="fixed bottom-8 right-8 z-50">
      <div className="relative flex flex-col items-center gap-4">
        {/* Secondary Buttons (visible when open) */}
        <div className={cn("flex flex-col items-center gap-4 transition-all duration-300 ease-in-out", isOpen ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4 pointer-events-none")}>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  variant="outline" 
                  size="icon" 
                  className="h-14 w-14 rounded-2xl bg-white shadow-lg border-gray-200 hover:bg-gray-50"
                  onClick={() => {
                    onQrClick();
                    setIsOpen(false);
                  }}
                >
                  <QrCode className="h-7 w-7 text-primary" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="left" className="bg-gray-800 text-white border-0">
                <p>Mobile QR Preview</p>
              </TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <a href="/mobile/menu" target="_blank" rel="noopener noreferrer">
                  <Button variant="outline" size="icon" className="h-14 w-14 rounded-2xl bg-white shadow-lg border-gray-200 hover:bg-gray-50">
                    <ExternalLink className="h-6 w-6 text-primary" />
                  </Button>
                </a>
              </TooltipTrigger>
              <TooltipContent side="left" className="bg-gray-800 text-white border-0">
                <p>Open Live Preview</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
        
        {/* Main FAB */}
        <Button
          size="icon"
          className="h-16 w-16 rounded-2xl bg-primary text-white shadow-xl transition-all duration-300 hover:scale-105 active:scale-100"
          onClick={() => setIsOpen(!isOpen)}
        >
          <Sparkles className={cn("absolute h-8 w-8 transition-all duration-300", isOpen ? "rotate-45 scale-0 opacity-0" : "rotate-0 scale-100 opacity-100")} />
          <X className={cn("absolute h-8 w-8 transition-all duration-300", isOpen ? "rotate-0 scale-100 opacity-100" : "-rotate-45 scale-0 opacity-0")} />
        </Button>
      </div>
    </div>
  );
};

const QrPreviewModal = ({ isOpen, onOpenChange }: { isOpen: boolean; onOpenChange: (open: boolean) => void; }) => {
    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-xs text-center p-0 overflow-hidden rounded-2xl">
                <DialogHeader className="bg-primary/5 p-6 pb-4">
                    <div className="mx-auto h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center border border-primary/20">
                        <QrCode className="h-6 w-6 text-primary" />
                    </div>
                    <DialogTitle className="pt-2">Scan to Preview</DialogTitle>
                    <DialogDescription>
                        Use your phone's camera to see your menu live.
                    </DialogDescription>
                </DialogHeader>
                <div className="p-8 bg-white">
                    <div className="p-4 bg-white rounded-lg border border-dashed">
                        <QrCode className="h-full w-full text-black" strokeWidth={1.5} />
                    </div>
                </div>
                <DialogFooter className="bg-muted/50 p-4 text-center text-xs text-muted-foreground border-t">
                    Point your device's camera at the code to open the link.
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};


const MenuBuilderMainPage = ({ onClose, isAddMenuModalOpen, setIsAddMenuModalOpen }: {
    onClose: () => void,
    isAddMenuModalOpen: boolean;
    setIsAddMenuModalOpen: (open: boolean) => void;
 }) => {
  const router = useRouter();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('');
  const [posFlowStep, setPosFlowStep] = useState<'select' | 'sync' | 'customize' | ''>('');
  const [selectedPos, setSelectedPos] = useState('');
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncProgress, setSyncProgress] = useState(0);
  const [isSyncComplete, setIsSyncComplete] = useState(false);
  const [isQrModalOpen, setIsQrModalOpen] = useState(false);

  const [isConfirmingPublish, setIsConfirmingPublish] = useState(false);
  const [pendingPublishData, setPendingPublishData] = useState<any>(null);

  const [menuItems, setMenuItems] = useState<MenuItem[]>(mockMenuItems.map(item => ({ ...item, available: item.available ?? true })));
  const [menuSections, setMenuSections] = useState<any[]>(mockMenuData);
  const [editingCategory, setEditingCategory] = useState<any>(null);
  const [isCategorySheetOpen, setIsCategorySheetOpen] = useState(false);
  const [isAddSectionSheetOpen, setIsAddSectionSheetOpen] = useState(false);
  const [userMenus, setUserMenus] = useState<any[]>([]);
  const [editingMenuName, setEditingMenuName] = useState('Untitled Menu');
  const [editingMenuIndex, setEditingMenuIndex] = useState<number | null>(null);
  const [deleteConfirmation, setDeleteConfirmation] = useState<{ index: number; name: string } | null>(null);
  const [isAddSectionDetailsModalOpen, setIsAddSectionDetailsModalOpen] = useState(false);
  const [newSectionDetails, setNewSectionDetails] = useState<Partial<AddSectionFormValues> | null>(null);

  const [connectedPos, setConnectedPos] = useState<PosConnection[]>([]);

  useEffect(() => {
    if (menuSections.length > 0) {
      setActiveTab(menuSections[0].name);
    }
  }, [menuSections]);

  useEffect(() => {
    try {
        const storedConnections = localStorage.getItem('posConnections');
        if (storedConnections) {
            setConnectedPos(JSON.parse(storedConnections));
        }
    } catch (e) {
        console.error("Failed to parse POS connections from localStorage", e);
    }
  }, []);

  const sensors = useSensors(useSensor(PointerSensor), useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }));

  const [previewCart, setPreviewCart] = useState<Record<string, number>>({});
  const [isCartAnimating, setIsCartAnimating] = useState(false);
  const prevCartTotalRef = useRef(0);

  const handleStartAddingItems = (data: AddSectionFormValues) => {
    setNewSectionDetails(data);
    setIsAddSectionDetailsModalOpen(false);
    setIsAddSectionSheetOpen(true);
  };

  const handleImportFromPos = () => {
    setIsAddMenuModalOpen(false);
    if (connectedPos.length > 0) {
      setPosFlowStep('select');
    } else {
      router.push('/dashboard/integration/pos');
      toast({
        title: "No POS Connected",
        description: "Redirecting you to connect a POS system first.",
        action: <Button onClick={() => router.push('/dashboard/integration/pos')}>Connect</Button>
      });
    }
  };

  const handleAddMenu = (type: 'scratch' | 'pos') => {
    setIsAddMenuModalOpen(false);
    if (type === 'pos') {
      handleImportFromPos();
    } else {
      setEditingMenuIndex(null);
      setEditingMenuName('Untitled Menu');
      setMenuSections([]);
      setPosFlowStep('customize');
    }
  };

  const handleEditMenu = (menu: any, index: number) => {
    setEditingMenuIndex(index);
    setEditingMenuName(menu.name);
    setMenuSections(menu.sections || []);
    setPosFlowStep('customize');
  };

  const startSyncProcess = () => {
    setPosFlowStep('sync');
    setIsSyncComplete(false);
    setSyncProgress(0);

    let progress = 0;
    const interval = setInterval(() => {
      progress += Math.floor(Math.random() * 10) + 5;
      if (progress >= 100) {
        setSyncProgress(100);
        clearInterval(interval);
        setTimeout(() => setIsSyncComplete(true), 500);
      } else {
        setSyncProgress(progress);
      }
    }, 300);
  };

  const handleStartCustomization = () => {
    setEditingMenuName('Untitled Menu');
    setMenuSections(mockMenuData);
    setPosFlowStep('customize');
  };

  const handleSaveImportedMenu = (status: 'Online' | 'Offline' | 'Draft') => {
    const newName = editingMenuName.trim();
    if (!newName) {
      toast({
        variant: 'destructive',
        title: 'Cannot Save Menu',
        description: 'Please name your menu.',
      });
      return;
    }

    const menuToSave = editingMenuIndex !== null ? userMenus[editingMenuIndex] : null;

    const menuData = {
      name: newName,
      imageHint: menuToSave ? menuToSave.imageHint : 'template-2',
      status: status,
      sections: menuSections,
    };

    if (status === 'Online') {
        setPendingPublishData(menuData);
        setIsConfirmingPublish(true);
    } else {
        if (editingMenuIndex !== null) {
            setUserMenus(prev => prev.map((menu, index) => index === editingMenuIndex ? { ...menu, ...menuData } : menu));
            toast({ title: 'Menu Updated', description: `"${newName}" has been saved as ${status.toLowerCase()}.` });
        } else {
            setUserMenus((prev) => [...prev, menuData]);
            toast({ title: `Menu Saved as ${status}`, description: `${newName} has been added to Your Menus.` });
        }
        setEditingMenuIndex(null);
        setPosFlowStep('');
    }
  };

  const handleConfirmPublish = () => {
    if (!pendingPublishData) return;

    let updatedMenus = userMenus.map((menu, i) => {
        if (editingMenuIndex !== null && i === editingMenuIndex) {
            return menu;
        }
        if (menu.status === 'Online') {
            return { ...menu, status: 'Offline' as const };
        }
        return menu;
    });

    if (editingMenuIndex !== null) {
        updatedMenus[editingMenuIndex] = { ...updatedMenus[editingMenuIndex], ...pendingPublishData };
    } else {
        updatedMenus.push(pendingPublishData);
    }

    setUserMenus(updatedMenus);

    toast({
        title: "Menu Published!",
        description: `"${pendingPublishData.name}" is now the live menu. Other active menus have been set to offline.`,
    });

    setPendingPublishData(null);
    setIsConfirmingPublish(false);
    setEditingMenuIndex(null);
    setPosFlowStep('');
  };

  const handleDeleteMenu = (indexToDelete: number) => {
    setUserMenus(menus => menus.filter((_, index) => index !== indexToDelete));
    toast({
      title: "Menu Deleted",
      description: "The menu has been removed.",
      variant: "destructive",
    });
  };

  const totalItemsInCart = useMemo(() => {
    return Object.values(previewCart).reduce((sum, quantity) => sum + quantity, 0);
  }, [previewCart]);

  useEffect(() => {
    if (totalItemsInCart > prevCartTotalRef.current) {
        setIsCartAnimating(true);
    }
    prevCartTotalRef.current = totalItemsInCart;
  }, [totalItemsInCart]);

  useEffect(() => {
    if (isCartAnimating) {
        const timer = setTimeout(() => setIsCartAnimating(false), 500);
        return () => clearTimeout(timer);
    }
  }, [isCartAnimating]);

  const handlePreviewAddToCart = (item: MenuItem) => {
    setPreviewCart(prev => ({
        ...prev,
        [item.id]: (prev[item.id] || 0) + 1,
    }));
  };

  const handlePreviewIncrement = (itemId: string) => {
    setPreviewCart(prev => ({
        ...prev,
        [itemId]: (prev[itemId] || 0) + 1,
    }));
  };

  const handlePreviewDecrement = (itemId: string) => {
    setPreviewCart(prev => {
      const newQuantity = (prev[itemId] || 0) - 1;
      if (newQuantity <= 0) {
        const { [itemId]: _, ...rest } = prev;
        return rest;
      }
      return {
        ...prev,
        [itemId]: newQuantity,
      };
    });
  };


  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      setMenuSections((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over.id);
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  }

  const handleEditCategory = (category: any) => {
    setEditingCategory(category);
    setIsCategorySheetOpen(true);
  };

  const handleSaveCategoryItems = (categoryId: string, updatedItems: MenuItem[]) => {
    setMenuSections(prevSections =>
      prevSections.map(section =>
        section.id === categoryId ? { ...section, items: updatedItems } : section
      )
    );

    const allUpdatedItems = menuSections.reduce((acc, section) => {
        if (section.id === categoryId) {
            return acc.concat(updatedItems);
        }
        return acc.concat(section.items);
    }, [] as MenuItem[]);

    const uniqueItems = Array.from(new Map(allUpdatedItems.map(item => [item.id, item])).values());
    setMenuItems(uniqueItems);
  };

  const handleProductUpdate = (updatedProduct: MenuItem) => {
    const updateItems = (items: MenuItem[]): MenuItem[] =>
        items.map(item => item.id === updatedProduct.id ? { ...item, ...updatedProduct } : item);

    setMenuItems(prev => updateItems(prev));
    setMenuSections(prev => prev.map(sec => ({
        ...sec,
        items: updateItems(sec.items)
    })));
  };

  const handleAddNewSection = (data: AddSectionFormValues, productIds: string[]) => {
    const newSection = {
        id: `section_${Date.now()}`,
        items: menuItems.filter(item => productIds.includes(item.id)),
        ...data,
    };
    setMenuSections(prev => [...prev, newSection]);
    toast({
      title: "Section Added",
      description: `"${data.name}" has been added to your menu.`,
    });
  };

  return (
    <>
      <div className="flex-1 flex flex-col bg-muted/40">
        <div className="flex-shrink-0 h-16 border-b flex items-center px-4 justify-between bg-card">
          <div className="flex items-center gap-4">
            
          </div>
          <div className="flex items-center gap-2">
            <Button onClick={() => setIsAddMenuModalOpen(true)}>
              <Plus className="h-4 w-4 mr-2" /> Add Menu
            </Button>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-5 w-5" />
            </Button>
          </div>
        </div>

        <ScrollArea className="flex-1">
          <div className="p-8 space-y-10">
            <section>
              <h2 className="text-2xl font-bold mb-4">Your Menus</h2>
                {userMenus.length === 0 ? (
                <Card className="text-center py-20 border-2 border-dashed bg-muted/20">
                  <CardHeader>
                    <div className="mx-auto h-16 w-16 rounded-2xl bg-white flex items-center justify-center border shadow-sm mb-4">
                      <Palette className="h-8 w-8 text-muted-foreground" />
                    </div>
                    <CardTitle className="text-2xl">No Menus Created</CardTitle>
                    <CardDescription>
                      Get started by creating your first menu from scratch or import one from your POS.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button onClick={() => setIsAddMenuModalOpen(true)}>
                      <PlusCircle className="mr-2 h-4 w-4" />
                      Create Your First Menu
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {userMenus.map((m, index) => (
                    <TemplateCard
                      key={`${m.name}-${index}`}
                      name={m.name}
                      imageHint={m.imageHint}
                      status={m.status}
                      onDelete={() => setDeleteConfirmation({ index, name: m.name })}
                      onEdit={() => handleEditMenu(m, index)}
                      onPreview={() => window.open('/mobile/menu', '_blank')}
                    />
                  ))}
                  <Card
                    className="border-2 border-dashed bg-muted/50 hover:border-primary hover:bg-primary/5 transition-all flex items-center justify-center min-h-[200px] cursor-pointer"
                    onClick={() => setIsAddMenuModalOpen(true)}
                  >
                    <div className="text-center text-muted-foreground">
                      <Plus className="mx-auto h-8 w-8 mb-2" />
                      <p className="font-semibold">Create New Menu</p>
                    </div>
                  </Card>
                </div>
              )}
            </section>
          </div>
        </ScrollArea>
      </div>

      <Dialog open={isAddMenuModalOpen} onOpenChange={setIsAddMenuModalOpen}>
        <DialogContent className="sm:max-w-2xl">
        <DialogTitle className="sr-only">Add new menu</DialogTitle>
          <DialogHeader>
            <DialogTitle className="text-center text-2xl font-bold">How would you like to build your menu?</DialogTitle>
            <DialogDescription className="text-center">
              Choose how you want to set up your menu. You can manage multiple versions and publish anytime.
            </DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-6">
            <Card className="hover:shadow-lg hover:border-primary transition-all cursor-pointer" onClick={() => handleAddMenu('scratch')}>
              <CardHeader className="flex-row items-center gap-4 space-y-0 pb-4">
                <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                  <Palette className="h-6 w-6 text-primary" />
                </div>
                <CardTitle className="text-lg">Start from Scratch</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Create your menu manually using a basic template or a blank setup.
                </p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg hover:border-primary transition-all cursor-pointer" onClick={() => handleAddMenu('pos')}>
              <CardHeader className="flex-row items-center gap-4 space-y-0 pb-4">
                <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                  <Database className="h-6 w-6 text-primary" />
                </div>
                <CardTitle className="text-lg">Import from POS</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Bring in your existing menu from a connected POS and customise it before publishing.
                </p>
              </CardContent>
            </Card>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={posFlowStep === 'select'} onOpenChange={(open) => !open && setPosFlowStep('')}>
        <DialogContent>
          <DialogTitle className="sr-only">Import from POS</DialogTitle>
          <DialogHeader>
            <DialogTitle>Import from POS</DialogTitle>
            <DialogDescription>
              {connectedPos.length > 0
                ? 'Choose a connected POS system to import your menu from.'
                : "First, connect your Point-of-Sale system to import your menu automatically."}
            </DialogDescription>
          </DialogHeader>
          {connectedPos.length > 0 ? (
            <>
              <div className="py-4">
                <Select
                  value={selectedPos}
                  onValueChange={(value) => {
                    if (value === '__ADD_NEW_POS__') {
                      router.push('/dashboard/integration/pos');
                      setPosFlowStep('');
                    } else {
                      setSelectedPos(value);
                    }
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a connected POS..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectLabel>Connected POS Systems</SelectLabel>
                      {connectedPos.map((pos: any) => (
                        <SelectItem key={pos.id} value={pos.id}>
                          {pos.label} ({pos.brand})
                        </SelectItem>
                      ))}
                    </SelectGroup>
                    <SelectSeparator />
                    <SelectItem value="__CREATE_NEW__">
                      <div className="flex items-center gap-2 text-primary font-semibold">
                        <PlusCircle className="h-4 w-4" />
                        Connect New POS
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setPosFlowStep('')}>Cancel</Button>
                <Button onClick={startSyncProcess} disabled={!selectedPos}>Next</Button>
              </DialogFooter>
            </>
          ) : (
            <>
              <div className="py-8 text-center space-y-4">
                <div className="mx-auto h-16 w-16 rounded-2xl bg-muted/50 flex items-center justify-center">
                  <Plug className="h-8 w-8 text-muted-foreground" />
                </div>
                <p className="text-muted-foreground">
                  No POS systems have been connected yet.
                </p>
                <Button onClick={() => {
                  router.push('/dashboard/integration/pos');
                  setPosFlowStep('');
                }}>
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Connect Your POS
                </Button>
              </div>
              <DialogFooter className="sm:justify-center">
                <Button variant="outline" onClick={() => setPosFlowStep('')}>Cancel</Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={posFlowStep === 'sync'} >
        <DialogContent>
        <DialogTitle className="sr-only">Syncing</DialogTitle>
          <DialogHeader>
              <DialogTitle className="text-center">{isSyncComplete ? 'Sync Complete!' : 'Syncing Menu from POS'}</DialogTitle>
              <DialogDescription className="text-center">
                {isSyncComplete ? `${menuItems.length} items imported successfully.` : 'Please wait while we securely import your menu data.'}
              </DialogDescription>
          </DialogHeader>
          <div className="py-8 flex flex-col items-center justify-center gap-4">
            <div className={cn(
                "h-24 w-24 rounded-full border-4 border-muted flex items-center justify-center transition-all duration-500",
                isSyncComplete ? "border-green-500 bg-green-50" : "border-primary/20"
              )}>
                {isSyncComplete ? (
                  <Check className="h-12 w-12 text-green-600 animate-in zoom-in duration-300" />
                ) : (
                  <Loader2 className="h-12 w-12 text-primary animate-spin" />
                )}
              </div>
            {!isSyncComplete && (
                <Progress value={syncProgress} className="w-full mt-2" />
            )}
          </div>
          <DialogFooter>
            {isSyncComplete ? (
              <Button className="w-full" onClick={handleStartCustomization}>
                Customize Menu
                <ChevronRight className="ml-2 h-4 w-4" />
              </Button>
            ) : (
              <Button variant="outline" className="w-full" onClick={() => setPosFlowStep('')}>Cancel Sync</Button>
            )}
           </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={posFlowStep === 'customize'} onOpenChange={(open) => !open && setPosFlowStep('')}>
        <DialogContent className="max-w-full w-screen h-screen m-0 p-0 rounded-none border-none flex flex-col">
          <DialogTitle className="sr-only">{editingMenuName || 'Menu Editor'}</DialogTitle>
          <DialogHeader className="p-4 border-b flex-row items-center justify-between space-y-0 flex gap-4">
            <div className="flex items-center gap-2 flex-1">
              <Button variant="ghost" size="icon" className="-ml-2" onClick={() => setPosFlowStep('')}>
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <Input
                value={editingMenuName}
                onChange={(e) => setEditingMenuName(e.target.value)}
                className="text-xl font-bold border-0 shadow-none focus-visible:ring-0 p-0 h-auto"
                aria-label="Menu Name"
              />
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" onClick={() => handleSaveImportedMenu('Draft')}>Save as Draft</Button>
              <Button onClick={() => handleSaveImportedMenu('Online')}>
                <Rocket className="mr-2 h-4 w-4" />
                Publish
              </Button>
            </div>
          </DialogHeader>
          <div className="flex-1 grid grid-cols-3 overflow-hidden">
            <div className="col-span-1 p-6 overflow-y-auto border-r">
              <h2 className="text-xl font-bold mb-4">Menu Structure</h2>
              <p className="text-muted-foreground mb-6">Drag and drop sections to reorder your menu. Click 'Add Section' to create new categories.</p>
              <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                <SortableContext items={menuSections.map(s => s.id)} strategy={verticalListSortingStrategy}>
                  <div className="space-y-3">
                    {menuSections.map(section => (
                      <SortableSectionItem
                        key={section.id}
                        id={section.id}
                        name={section.name}
                        itemCount={section.items.length}
                        onEditClick={() => handleEditCategory(section)}
                      />
                    ))}
                  </div>
                </SortableContext>
              </DndContext>
              <Button variant="outline" className="mt-4" onClick={() => setIsAddSectionDetailsModalOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Add Section
              </Button>
            </div>
            <div className="col-span-2 bg-muted/30 p-6 overflow-y-auto">
              <h2 className="text-xl font-bold mb-4 text-center">Live Preview</h2>
              <div className="w-full max-w-sm mx-auto bg-white rounded-[40px] shadow-2xl p-4 border-[6px] border-black overflow-hidden">
                <div className="relative h-[600px] overflow-hidden bg-[#F7F9FB] flex flex-col">
                  <header className="sticky top-0 z-20 bg-white/80 backdrop-blur-lg p-4 pb-0 flex-shrink-0">
                    <div className="flex items-center justify-between mb-4">
                      <Button variant="ghost" size="icon" className="-ml-2">
                        <ArrowLeft className="h-6 w-6 text-gray-800" />
                      </Button>
                      <div className="text-center">
                        <h1 className="text-xl font-bold text-gray-900">{activeTab}</h1>
                        <p className="text-sm text-teal-600 font-medium">{menuItems.filter(i => i.category === activeTab).length} items</p>
                      </div>
                      <Button variant="ghost" size="icon">
                        <Search className="h-6 w-6 text-gray-800" />
                      </Button>
                    </div>
                    <ScrollArea className="w-full whitespace-nowrap">
                      <div className="flex items-center space-x-1 border-b">
                        {menuSections.map((section: any) => (
                          <button key={section.id} className={cn(
                            "flex items-center gap-1.5 whitespace-nowrap px-4 py-3 text-sm font-bold transition-colors relative",
                             activeTab === section.name ? 'text-teal-600' : 'text-gray-500'
                          )}>
                            {section.name === 'Bestsellers' && <Flame className="h-4 w-4 text-red-500" />}
                            {section.name}
                            {activeTab === section.name && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-teal-500 rounded-full" />}
                          </button>
                        ))}
                      </div>
                      <ScrollBar orientation="horizontal" className="hidden" />
                    </ScrollArea>
                  </header>

                  <div className="flex-1 overflow-y-auto">
                    <main className="p-4 space-y-8">
                      {menuSections.map(section => (
                        <div key={section.id}>
                          <h2 className="text-2xl font-bold text-gray-900 mb-4">{section.name}</h2>
                          <div className="space-y-4">
                            {section.items.filter((item: any) => item.available ?? true).map((item: any) => (
                              <MenuItemCard
                                key={item.id}
                                item={item}
                                onAdd={handlePreviewAddToCart}
                                quantity={previewCart[item.id] || 0}
                                onIncrement={handlePreviewIncrement}
                                onDecrement={handlePreviewDecrement}
                                isPurchasingEnabled={true}
                              />
                            ))}
                          </div>
                        </div>
                      ))}
                    </main>
                  </div>

                  {totalItemsInCart > 0 && (
                    <div id="floating-cart-icon" className="absolute bottom-24 right-6 z-20">
                      <div className="relative">
                        <div className={cn(
                          "rounded-full w-16 h-16 bg-red-500 flex items-center justify-center shadow-lg",
                            isCartAnimating && "animate-pulse-once"
                        )}>
                          <ShoppingCart className="h-8 w-8 text-white" />
                        </div>
                        <Badge className="absolute -top-1 -right-1 w-6 h-6 flex items-center justify-center bg-gray-800 text-white rounded-full border-2 border-red-500">
                          {totalItemsInCart}
                        </Badge>
                      </div>
                    </div>
                  )}

                  <nav className="shrink-0 bg-[#F7F9FB] border-t border-gray-200/80">
                    <div className="flex justify-around items-center h-20">
                      <div className="flex flex-col items-center gap-1 text-teal-500">
                        <Home className="h-6 w-6" />
                        <span className="text-xs font-bold">Menu</span>
                      </div>
                      <div className="flex flex-col items-center gap-1 text-gray-500">
                        <Receipt className="h-6 w-6" />
                        <span className="text-xs font-bold">Orders</span>
                      </div>
                    </div>
                  </nav>

                </div>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
      <CategoryItemsSheet
        isOpen={isCategorySheetOpen}
        onOpenChange={setIsCategorySheetOpen}
        category={editingCategory}
        onSave={handleSaveCategoryItems}
      />
      <AddSectionDetailsDialog
        isOpen={isAddSectionDetailsModalOpen}
        onOpenChange={setIsAddSectionDetailsModalOpen}
        onConfirm={handleStartAddingItems}
      />
      <AddSectionSheet
        isOpen={isAddSectionSheetOpen}
        onOpenChange={setIsAddSectionSheetOpen}
        onAddSection={handleAddNewSection}
        allProducts={menuItems}
        initialData={newSectionDetails}
      />
      <AlertDialog open={isConfirmingPublish} onOpenChange={setIsConfirmingPublish}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure you want to publish this menu?</AlertDialogTitle>
            <AlertDialogDescription>
              Publishing this menu will make it the live version for your customers. Other active menus will be set to offline.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmPublish}>Publish</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
       <AlertDialog open={!!deleteConfirmation} onOpenChange={() => setDeleteConfirmation(null)}>
        <AlertDialogContent>
            <AlertDialogHeader>
                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                <AlertDialogDescription>
                    This action cannot be undone. This will permanently delete the menu: <strong>{deleteConfirmation?.name}</strong>.
                </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
                <AlertDialogCancel onClick={() => setDeleteConfirmation(null)}>Cancel</AlertDialogCancel>
                <AlertDialogAction
                    className="bg-destructive hover:bg-destructive/90"
                    onClick={() => {
                        if (deleteConfirmation !== null) {
                            handleDeleteMenu(deleteConfirmation.index);
                        }
                        setDeleteConfirmation(null);
                    }}
                >
                    Delete
                </AlertDialogAction>
            </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      <QrPreviewModal isOpen={isQrModalOpen} onOpenChange={setIsQrModalOpen} />
    </>
  );
};


export default function MenuBuilderPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [showBuilder, setShowBuilder] = useState(false);
  const [isAddMenuModalOpen, setIsAddMenuModalOpen] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 2500);
    return () => clearTimeout(timer);
  }, []);

  const handleLoaded = () => {
    setShowBuilder(true);
  };

  const handleClose = () => {
    router.push('/dashboard');
  };

  if (!showBuilder) {
    return <MenuBuilderPreloader onLoaded={handleLoaded} />;
  }

  return (
    <div className="fixed inset-0 z-40 bg-background flex animate-in fade-in duration-500">
      <BuilderSidebar onCreateMenuClick={() => setIsAddMenuModalOpen(true)} />
      <MenuBuilderMainPage
        onClose={handleClose}
        isAddMenuModalOpen={isAddMenuModalOpen}
        setIsAddMenuModalOpen={setIsAddMenuModalOpen}
      />
    </div>
  );
}

    
