
'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { MenuBuilderPreloader } from '@/components/dashboard/menu-builder/preloader';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { EMenuIcon } from '@/components/dashboard/app-sidebar';
import { List, LayoutGrid, X, Plus, Palette, Database, CheckCircle2, Loader2, GripVertical, Home, Receipt, ArrowLeft, Search, Flame, ShoppingCart, ImageIcon, Edit, ChevronDown, Wand, RefreshCw, Lock, MoreHorizontal } from 'lucide-react';
import Image from 'next/image';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { DndContext, closestCenter, PointerSensor, useSensor, useSensors, DragEndEvent } from '@dnd-kit/core';
import { arrayMove, SortableContext, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { cn } from '@/lib/utils';
import { MenuItemCard, type MenuItem as BaseMenuItem } from '@/app/mobile/menu/menu-item-card';
import { Badge } from '@/components/ui/badge';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetFooter } from '@/components/ui/sheet';
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
} from '@/components/ui/dropdown-menu';

const TemplateCard = ({ name, imageHint, isLocked, status, onDelete, onEdit }: { 
  name: string; 
  imageHint: string; 
  isLocked?: boolean; 
  status?: 'Offline' | 'Online', 
  onDelete?: () => void;
  onEdit?: () => void;
}) => {
  const image = PlaceHolderImages.find(img => img.id === imageHint);
  return (
    <Card 
      onClick={!isLocked ? onEdit : undefined}
      className={cn("overflow-hidden shadow-sm transition-shadow group", isLocked ? "cursor-not-allowed" : "hover:shadow-lg cursor-pointer")}
    >
      <CardHeader className="p-3 border-b flex-row justify-between items-center">
        <p className="text-xs font-semibold flex items-center gap-1.5">
          {isLocked ? <Lock className="h-3 w-3 text-muted-foreground mr-1" /> : (
            <span className={cn(
              "h-2 w-2 rounded-full",
              status === 'Online' ? 'bg-green-500' : 'bg-red-500'
            )} />
          )}
          {name}
        </p>
        <div className="flex items-center gap-2">
          {isLocked ? null : (
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
                <DropdownMenuItem onSelect={onEdit}>
                  <Edit className="mr-2 h-4 w-4" /> Edit
                </DropdownMenuItem>
                <DropdownMenuItem>Set as Offline</DropdownMenuItem>
                <DropdownMenuItem>Deactivate</DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="text-destructive" onClick={onDelete}>Delete</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </CardHeader>
      <CardContent className="p-3">
        <div className={cn("aspect-[4/3] w-full bg-muted rounded-md overflow-hidden", isLocked && "filter grayscale opacity-70")}>
          {image && <Image src={image.imageUrl} alt={name} width={600} height={400} className="object-cover h-full w-full" data-ai-hint={image.imageHint} />}
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
}

const mockMenuItems: MenuItem[] = [
    { id: 'pizza-margherita-12', name: 'Pizza Margherita - 12 inches', description: 'Homemade dough, homemade pizza sauce,...', price: 36.00, category: 'Bestsellers', image: getImageUrl('margherita-pizza'), isCustomisable: false },
    { id: 'chicken-alfredo-pizza-12', name: 'Chicken Alfredo Pizza - 12 inches', description: 'Homemade dough, white sauce base, marinated...', price: 48.00, category: 'Bestsellers', isCustomisable: true, image: getImageUrl('alfredo-pizza') },
    { id: 'pizza-margherita-10', name: 'Pizza Margherita - 10 inches', description: 'Homemade dough, homemade pizza sauce,...', price: 27.00, category: 'Pizza', image: getImageUrl('margherita-pizza'), isCustomisable: false },
    { id: 'hawaiian-pizza-10', name: 'Hawaiian Pizza - 10 inches', description: 'Homemade dough, pizza sauce, mozzarella, ham,...', price: 32.00, category: 'Pizza', isCustomisable: true, image: getImageUrl('hawaiian-pizza') },
    { id: 'soft-drink', name: 'Soft Drink', description: 'Choose your favorite flavor.', price: 3.00, category: 'Drinks', isCustomisable: true, image: getImageUrl('soft-drink') },
    { id: 'bottled-water', name: 'Bottled Water', description: 'Still or sparkling water.', price: 2.50, category: 'Drinks', image: getImageUrl('bottled-water') },
    { id: 'steak-frites', name: 'Steak Frites', description: 'Juicy steak served with a side of crispy french fries.', price: 25.00, category: 'Main Courses', image: getImageUrl('ribeye-steak') } as any,
    { id: 'classic-cheeseburger', name: 'Classic Cheeseburger', description: 'A succulent beef patty with melted cheddar.', price: 35.00, category: 'Bestsellers', image: getImageUrl('classic-cheeseburger') } as any,
    { id: 'truffle-fries', name: 'Truffle Fries', description: 'Crispy fries with a truffle twist.', price: 15.00, category: 'Sides', image: getImageUrl('truffle-fries') } as any,
    { id: 'lava-cake', name: 'Chocolate Lava Cake', description: 'A chocolate lover\'s dream.', price: 22.00, category: 'Desserts', image: getImageUrl('lava-cake') } as any
];

const mockMenuData = [
    { id: 'bestsellers', name: 'Bestsellers', items: mockMenuItems.filter(i => i.category === 'Bestsellers') },
    { id: 'pizza', name: 'Pizza', items: mockMenuItems.filter(i => i.category === 'Pizza') },
    { id: 'sides', name: 'Sides', items: mockMenuItems.filter(i => i.category === 'Sides') },
    { id: 'desserts', name: 'Desserts', items: mockMenuItems.filter(i => i.category === 'Desserts') },
    { id: 'drinks', name: 'Drinks', items: mockMenuItems.filter(i => i.category === 'Drinks') },
];


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

    if (!item) {
        return (
            <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground p-8">
                <Edit className="h-12 w-12 mb-4" />
                <h3 className="font-semibold">Select an Item</h3>
                <p className="text-sm">Click on an item from the list to see and edit its details here.</p>
            </div>
        );
    }
    
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
                    onChange={(e) => onUpdate(item.id, 'name', e.target.value)}
                    className="font-bold text-base"
                />
            </div>
             <div>
                <Label htmlFor="itemDescription">Description</Label>
                <Textarea
                    id="itemDescription"
                    value={item.description}
                    onChange={(e) => onUpdate(item.id, 'description', e.target.value)}
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
                    onChange={(e) => onUpdate(item.id, 'price', parseFloat(e.target.value) || 0)}
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
        </div>
    );
};


const SortableProductRow = ({ item, onAvailabilityChange, onRowClick, isSelected }: any) => {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: item.id });
    const style = { transform: CSS.Transform.toString(transform), transition, zIndex: isDragging ? 10 : 'auto' };

    return (
        <TableRow ref={setNodeRef} style={style} className={cn("bg-background cursor-pointer", isSelected && 'bg-primary/5')} onClick={() => onRowClick(item)}>
            <TableCell className="w-10">
                <button {...listeners} {...attributes} className="cursor-grab p-2">
                    <GripVertical className="h-5 w-5 text-muted-foreground" />
                </button>
            </TableCell>
            <TableCell>
                <div className="w-16 h-16 rounded-md bg-muted flex items-center justify-center border overflow-hidden">
                    {item.image ? (
                        <Image src={item.image} alt={item.name} width={64} height={64} className="object-cover" />
                    ) : (
                        <ImageIcon className="h-6 w-6 text-muted-foreground" />
                    )}
                </div>
            </TableCell>
            <TableCell className="font-medium align-top py-4">
                 <Input
                    value={item.name}
                    readOnly
                    className="font-bold text-base bg-transparent border-none shadow-none p-0 h-auto"
                />
                <Textarea
                    value={item.description}
                    readOnly
                    className="mt-1 text-xs text-muted-foreground line-clamp-2 bg-transparent border-none shadow-none p-0 h-auto resize-none"
                />
            </TableCell>
            <TableCell className="align-top py-4 font-mono font-semibold">
                AED {item.price.toFixed(2)}
            </TableCell>
            <TableCell className="align-top py-4">
                <Switch
                    checked={item.available ?? true}
                    onCheckedChange={(checked) => onAvailabilityChange(item.id, checked)}
                    onClick={(e) => e.stopPropagation()} // Prevent row click when toggling
                />
            </TableCell>
        </TableRow>
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
          setSelectedItem(null);
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
            
            // Reconstruct the full items array based on the new order of filtered items
            const newFullItemsOrder = [...items];
            let lastFoundIndex = -1;

            newOrderedFilteredItems.forEach(filteredItem => {
                const currentIndexInFull = newFullItemsOrder.findIndex(item => item.id === filteredItem.id);
                if (currentIndexInFull > lastFoundIndex) {
                    // This item is already in a correct relative position
                    lastFoundIndex = currentIndexInFull;
                } else {
                    // Move this item to be after the last placed item
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
            <SheetContent className="sm:max-w-6xl w-full p-0 flex flex-col">
                {!category ? (
                    <div className="flex-1 flex items-center justify-center">
                        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                    </div>
                ) : (
                  <>
                    <SheetHeader className="p-6 border-b shrink-0">
                        <SheetTitle>Manage: {category.name} ({items.length} items)</SheetTitle>
                        <SheetDescription>Drag to reorder, click a row to edit details, and toggle availability.</SheetDescription>
                    </SheetHeader>
                    <div className="grid grid-cols-1 md:grid-cols-3 flex-1 overflow-hidden">
                        <div className="md:col-span-1 border-r bg-muted/30 overflow-y-auto">
                            <ItemEditor 
                                item={selectedItem}
                                onUpdate={handleItemUpdate}
                                onImageUpload={handleImageUpload}
                                onAvailabilityChange={handleAvailabilityChange}
                            />
                        </div>
                        <div className="md:col-span-2 flex flex-col overflow-hidden">
                            <div className="p-6 pb-4 border-b shrink-0">
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
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead className="w-10"></TableHead>
                                                <TableHead>Image</TableHead>
                                                <TableHead>Details</TableHead>
                                                <TableHead>Price</TableHead>
                                                <TableHead>Available</TableHead>
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
                        </div>
                    </div>
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
    enableSpecial: z.boolean().default(false),
    specialTagName: z.string().optional(),
    specialTagIcon: z.string().optional(),
    enableCategoryLink: z.boolean().default(false),
    externalLink: z.string().url().optional().or(z.literal('')),
});
type AddSectionFormValues = z.infer<typeof addSectionSchema>;

const AddSectionSheet = ({ 
    isOpen, 
    onOpenChange, 
    onAddSection, 
    allProducts, 
    onProductUpdate 
}: {
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
    onAddSection: (data: AddSectionFormValues, productIds: string[]) => void;
    allProducts: MenuItem[];
    onProductUpdate: (product: MenuItem) => void;
}) => {
    const [addedProducts, setAddedProducts] = useState<MenuItem[]>([]);
    const [editingProduct, setEditingProduct] = useState<MenuItem | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const sensors = useSensors(useSensor(PointerSensor));
    const fileInputRef = useRef<HTMLInputElement>(null);

    const form = useForm<AddSectionFormValues>({
        resolver: zodResolver(addSectionSchema),
        defaultValues: { 
            name: '',
            enableSpecial: false,
            specialTagName: '',
            specialTagIcon: '',
            enableCategoryLink: false,
            externalLink: ''
        },
    });

    useEffect(() => {
        if (isOpen) {
            form.reset();
            setAddedProducts([]);
            setEditingProduct(null);
            setSearchQuery('');
        }
    }, [isOpen, form]);

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
        if (editingProduct?.id === productId) {
            setEditingProduct(null);
        }
    };

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;
        if (over && active.id !== over.id) {
            setAddedProducts((items) => {
                const oldIndex = items.findIndex(item => item.id === active.id);
                const newIndex = items.findIndex(item => item.id === over.id);
                return arrayMove(items, oldIndex, newIndex);
            });
        }
    };
    
    const handleEditorChange = (field: keyof MenuItem, value: any) => {
        if (!editingProduct) return;
        const updatedProduct = { ...editingProduct, [field]: value };
        setEditingProduct(updatedProduct);
        setAddedProducts(prev => prev.map(p => p.id === updatedProduct.id ? updatedProduct : p));
        onProductUpdate(updatedProduct);
    };

    const handleImageUpload = (itemId: string, event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                const result = reader.result as string;
                handleEditorChange('image', result);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleAvailabilityChange = (available: boolean) => {
        if (editingProduct) {
            handleEditorChange('available', available);
        }
    };

    const onSubmit = (data: AddSectionFormValues) => {
        onAddSection(data, addedProducts.map(p => p.id));
        onOpenChange(false);
    };

    return (
        <Sheet open={isOpen} onOpenChange={onOpenChange}>
            <SheetContent className="w-[90vw] max-w-[90vw] p-0 flex flex-col">
                <SheetHeader className="p-6 border-b shrink-0">
                    <SheetTitle>Add New Menu Section</SheetTitle>
                    <SheetDescription>Build a new category by selecting items from your library.</SheetDescription>
                </SheetHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="flex-1 flex flex-col overflow-hidden">
                        <div className="grid grid-cols-1 lg:grid-cols-3 flex-1 overflow-hidden relative">
                            {/* Settings Column */}
                             <div className="lg:col-span-1 flex flex-col overflow-hidden border-r">
                                <ScrollArea className="flex-1">
                                    <div className="p-6 space-y-6">
                                        <FormField
                                            control={form.control}
                                            name="name"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Section Name</FormLabel>
                                                    <FormControl><Input placeholder="e.g., Summer Specials" {...field} /></FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        <div className="space-y-4 pt-6">
                                            <FormField
                                                control={form.control}
                                                name="enableSpecial"
                                                render={({ field }) => (
                                                    <FormItem className="flex items-center justify-between rounded-lg border p-3">
                                                        <div className="space-y-0.5">
                                                            <FormLabel>Mark as Special</FormLabel>
                                                            <FormDescription className="text-xs">Highlight this section on the menu.</FormDescription>
                                                        </div>
                                                        <FormControl>
                                                            <Switch checked={field.value} onCheckedChange={field.onChange} />
                                                        </FormControl>
                                                    </FormItem>
                                                )}
                                            />
                                            {form.watch('enableSpecial') && (
                                                <div className="space-y-4 p-4 border rounded-lg ml-4 bg-muted/30">
                                                     <FormField
                                                        control={form.control}
                                                        name="specialTagName"
                                                        render={({ field }) => (
                                                            <FormItem>
                                                                <FormLabel>Tag Name</FormLabel>
                                                                <FormControl><Input placeholder="e.g., Hot, New" {...field} /></FormControl>
                                                            </FormItem>
                                                        )}
                                                    />
                                                     <div className="space-y-2">
                                                        <FormLabel>Tag Icon</FormLabel>
                                                         <div className="flex items-center gap-2">
                                                            <div className="w-10 h-10 rounded-md bg-background flex items-center justify-center border">
                                                                <ImageIcon className="h-5 w-5 text-muted-foreground" />
                                                            </div>
                                                            <Button type="button" variant="outline" size="sm">Upload</Button>
                                                        </div>
                                                     </div>
                                                </div>
                                            )}

                                            <FormField
                                                control={form.control}
                                                name="enableCategoryLink"
                                                render={({ field }) => (
                                                    <FormItem className="flex items-center justify-between rounded-lg border p-3">
                                                        <div className="space-y-0.5">
                                                            <FormLabel>Enable Category Link</FormLabel>
                                                             <FormDescription className="text-xs">Link to a URL instead of showing items.</FormDescription>
                                                        </div>
                                                        <FormControl>
                                                            <Switch checked={field.value} onCheckedChange={field.onChange} />
                                                        </FormControl>
                                                    </FormItem>
                                                )}
                                            />
                                            {form.watch('enableCategoryLink') && (
                                                <div className="space-y-4 p-4 border rounded-lg ml-4 bg-muted/30">
                                                     <FormField
                                                        control={form.control}
                                                        name="externalLink"
                                                        render={({ field }) => (
                                                            <FormItem>
                                                                <FormLabel>External URL</FormLabel>
                                                                <FormControl><Input placeholder="https://example.com" {...field} /></FormControl>
                                                                 <FormMessage />
                                                            </FormItem>
                                                        )}
                                                    />
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </ScrollArea>
                             </div>

                             {form.watch('enableCategoryLink') && (
                                <div className="absolute inset-0 lg:left-1/3 bg-background/80 backdrop-blur-sm z-10 flex items-center justify-center">
                                    <div className="text-center p-4">
                                        <p className="font-semibold">Item selection is disabled.</p>
                                        <p className="text-sm text-muted-foreground">This section is configured as an external link.</p>
                                    </div>
                                </div>
                            )}

                            {/* Item Selection & Editor Columns */}
                            <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-3 flex-1 overflow-hidden">
                                {/* Available Items */}
                                <div className="md:col-span-1 flex flex-col overflow-hidden border-r">
                                    <div className="p-4 border-b">
                                        <div className="relative">
                                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                            <Input placeholder="Search all products..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="pl-10" />
                                        </div>
                                    </div>
                                    <ScrollArea className="flex-1">
                                        <div className="p-2 space-y-1">
                                            {availableProducts.map(product => (
                                                <div key={product.id} className="flex items-center gap-2 p-2 rounded-md hover:bg-muted">
                                                    <Image src={product.image!} alt={product.name} width={40} height={40} className="rounded object-cover" />
                                                    <div className="flex-1">
                                                        <p className="text-sm font-semibold line-clamp-1">{product.name}</p>
                                                        <p className="text-xs text-muted-foreground">AED {product.price.toFixed(2)}</p>
                                                    </div>
                                                    <Button type="button" size="icon" variant="ghost" className="h-8 w-8 text-primary" onClick={() => handleAddProduct(product)}>
                                                        <Plus className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            ))}
                                        </div>
                                    </ScrollArea>
                                </div>
                                {/* Added Items List */}
                                <div className="md:col-span-1 flex flex-col overflow-hidden border-r">
                                    <div className="p-4 border-b shrink-0">
                                        <h3 className="font-semibold text-lg">{form.watch('name') || 'New Section'} ({addedProducts.length} items)</h3>
                                        <p className="text-sm text-muted-foreground">Drag to reorder. Click to edit.</p>
                                    </div>
                                    <ScrollArea className="flex-1">
                                         <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                                            <SortableContext items={addedProductIds} strategy={verticalListSortingStrategy}>
                                                <div className="p-2 space-y-1">
                                                    {addedProducts.map(product => {
                                                        const SortableWrapper = ({ children }: { children: React.ReactNode }) => {
                                                            const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: product.id });
                                                            const style = { transform: CSS.Transform.toString(transform), transition };
                                                            return <div ref={setNodeRef} style={style} className="touch-none flex items-center gap-2 p-2 rounded-md bg-background border" {...attributes} >
                                                                <button {...listeners} className="cursor-grab p-1"><GripVertical className="h-5 w-5 text-muted-foreground" /></button>
                                                                {children}
                                                            </div>;
                                                        };
                                                        return (
                                                            <SortableWrapper key={product.id}>
                                                                <div className="flex-1 cursor-pointer" onClick={() => setEditingProduct(product)}>
                                                                    <p className={cn("text-sm font-semibold line-clamp-1", editingProduct?.id === product.id && "text-primary")}>{product.name}</p>
                                                                    <p className="text-xs text-muted-foreground">AED {product.price.toFixed(2)}</p>
                                                                </div>
                                                                <Button type="button" size="icon" variant="ghost" className="h-8 w-8 text-destructive" onClick={() => handleRemoveProduct(product.id)}>
                                                                    <X className="h-4 w-4" />
                                                                </Button>
                                                            </SortableWrapper>
                                                        )
                                                    })}
                                                </div>
                                            </SortableContext>
                                         </DndContext>
                                    </ScrollArea>
                                </div>
                                {/* Item Editor */}
                                 <div className="md:col-span-1 bg-muted/30 overflow-y-auto">
                                    <div className="p-4 border-b shrink-0">
                                        <h3 className="font-semibold text-lg">Item Editor</h3>
                                    </div>
                                    {editingProduct ? (
                                        <div className="p-4 space-y-4">
                                            <div>
                                                <Label>Product Image</Label>
                                                <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={(e) => handleImageUpload(editingProduct.id, e)} />
                                                <div className="relative group mt-2" onClick={() => fileInputRef.current?.click()}>
                                                    <div className="w-full aspect-video rounded-md bg-background flex items-center justify-center border overflow-hidden cursor-pointer">
                                                        {editingProduct.image ? (
                                                            <Image src={editingProduct.image} alt={editingProduct.name} width={240} height={135} className="object-cover w-full h-full" />
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
                                                <Input id="itemName" value={editingProduct.name} onChange={(e) => handleEditorChange('name', e.target.value)} className="font-bold text-base" />
                                            </div>
                                            <div>
                                                <Label htmlFor="itemDescription">Description</Label>
                                                <Textarea id="itemDescription" value={editingProduct.description} onChange={(e) => handleEditorChange('description', e.target.value)} placeholder="Short description..." rows={3}/>
                                            </div>
                                            <div>
                                                <Label htmlFor="itemPrice">Price (AED)</Label>
                                                <Input id="itemPrice" type="number" value={editingProduct.price} onChange={(e) => handleEditorChange('price', parseFloat(e.target.value) || 0)}/>
                                            </div>
                                            <div className="flex items-center justify-between rounded-lg border p-3 bg-background">
                                                <Label htmlFor="itemAvailability" className="font-medium">Available</Label>
                                                <Switch id="itemAvailability" checked={editingProduct.available ?? true} onCheckedChange={handleAvailabilityChange} />
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground p-8">
                                            <Edit className="h-12 w-12 mb-4" />
                                            <h3 className="font-semibold">Select an Item</h3>
                                            <p className="text-sm">Click on an item from the center list to edit its details here.</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        <SheetFooter className="p-6 border-t shrink-0">
                            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
                            <Button type="submit">Create Section</Button>
                        </SheetFooter>
                    </form>
                </Form>
            </SheetContent>
        </Sheet>
    );
};

const MenuBuilderMainPage = ({ onClose }: { onClose: () => void }) => {
  const [isAddMenuModalOpen, setIsAddMenuModalOpen] = useState(false);
  const [posFlowStep, setPosFlowStep] = useState<'select' | 'sync' | 'customize' | ''>('');
  const [selectedPos, setSelectedPos] = useState('');
  const [syncProgress, setSyncProgress] = useState(0);
  const [isSyncComplete, setIsSyncComplete] = useState(false);
  const [isConfirmingPublish, setIsConfirmingPublish] = useState(false);
  const [pendingPublishData, setPendingPublishData] = useState<any>(null);

  const [menuItems, setMenuItems] = useState<MenuItem[]>(mockMenuItems.map(item => ({ ...item, available: item.available ?? true })));
  const [menuSections, setMenuSections] = useState<any[]>(mockMenuData);
  const [editingCategory, setEditingCategory] = useState<any>(null);
  const [isCategorySheetOpen, setIsCategorySheetOpen] = useState(false);
  const [isAddSectionSheetOpen, setIsAddSectionSheetOpen] = useState(false);
  const [userMenus, setUserMenus] = useState<any[]>([]);
  const [importedMenuName, setImportedMenuName] = useState('');
  const [editingMenuIndex, setEditingMenuIndex] = useState<number | null>(null);
  
  const { toast } = useToast();
  const sensors = useSensors(useSensor(PointerSensor));

  const [previewCart, setPreviewCart] = useState<Record<string, number>>({});
  const [isCartAnimating, setIsCartAnimating] = useState(false);
  const prevCartTotalRef = useRef(0);

  const defaultMenuStatus = useMemo(() => {
    const isAnyCustomMenuOnline = userMenus.some(menu => menu.status === 'Online');
    return isAnyCustomMenuOnline ? 'Offline' : 'Online';
  }, [userMenus]);

  const handleAddMenu = (type: 'scratch' | 'pos') => {
    if (type === 'pos') {
      handleImportFromPos();
      return;
    }
    const newName = `My New Menu #${userMenus.length + 1}`;
    const newMenu = {
        name: newName,
        imageHint: 'template-3',
        status: 'Offline',
        sections: [],
    };
    setUserMenus(prev => [...prev, newMenu]);
    setIsAddMenuModalOpen(false);
    toast({
        title: "Offline Menu Created",
        description: `${newName} has been added.`
    });
  };

  const handleImportFromPos = () => {
    setIsAddMenuModalOpen(false);
    setEditingMenuIndex(null);
    setPosFlowStep('select');
  };

  const handleEditMenu = (menu: any, index: number) => {
    setEditingMenuIndex(index);
    setImportedMenuName(menu.name);
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
    const providerName = SUPPORTED_POS.find(p => p.id === selectedPos)?.name || 'Imported Menu';
    setImportedMenuName(`${providerName} Menu`);
    setMenuSections(mockMenuData);
    setPosFlowStep('customize');
  };
  
  const handleSaveImportedMenu = (status: 'Online' | 'Offline') => {
    const newName = importedMenuName.trim();
    if (!newName) {
      toast({
        variant: 'destructive',
        title: 'Cannot Save Menu',
        description: 'Please name your menu.',
      });
      return;
    }
    
    const menuData = {
      name: newName,
      imageHint: editingMenuIndex !== null ? userMenus[editingMenuIndex].imageHint : 'template-2',
      status: status,
      sections: menuSections,
    };

    if (status === 'Online') {
        setPendingPublishData(menuData);
        setIsConfirmingPublish(true);
    } else { // It's an Offline menu
        if (editingMenuIndex !== null) {
            setUserMenus(prev => prev.map((menu, index) => index === editingMenuIndex ? { ...menu, ...menuData } : menu));
            toast({ title: 'Menu Updated', description: `"${newName}" has been saved as offline.` });
        } else {
            setUserMenus((prev) => [...prev, menuData]);
            toast({ title: "Offline Menu Saved", description: `${newName} has been added to Your Menus.` });
        }
        setEditingMenuIndex(null);
        setPosFlowStep('');
    }
  };

  const handleConfirmPublish = () => {
    if (!pendingPublishData) return;
    
    // Set all other custom menus to 'Offline'
    let updatedMenus = userMenus.map((menu, i) => {
      // If we are editing, we don't want to change the status of the menu being edited here.
      if (editingMenuIndex !== null && i === editingMenuIndex) {
        return menu;
      }
      return { ...menu, status: 'Offline' as const };
    });

    if (editingMenuIndex !== null) {
        // Update the existing menu being edited
        updatedMenus[editingMenuIndex] = { ...updatedMenus[editingMenuIndex], ...pendingPublishData };
    } else {
        // Add the new menu
        updatedMenus.push(pendingPublishData);
    }
    
    setUserMenus(updatedMenus);

    toast({
        title: "Menu Published!",
        description: `"${pendingPublishData.name}" is now the live menu. Other menus have been set to offline.`,
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
    // Update items within the specific category
    setMenuSections(prevSections =>
      prevSections.map(section =>
        section.id === categoryId ? { ...section, items: updatedItems } : section
      )
    );
  
    // Rebuild the master list of all menu items to reflect changes from all sections
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
        name: data.name,
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
      <div className="fixed inset-0 z-40 bg-background flex flex-col animate-in fade-in duration-500">
        {/* Header */}
        <div className="flex-shrink-0 h-16 border-b flex items-center px-4 justify-between bg-card">
          <div className="flex items-center gap-4">
            <EMenuIcon />
          </div>
          <div className="flex items-center gap-2">
            <Button onClick={() => setIsAddMenuModalOpen(true)}>
              <Plus className="h-4 w-4 mr-2" /> Add
            </Button>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-5 w-5" />
            </Button>
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 flex overflow-hidden">
          {/* Sidebar */}
          <div className="w-64 bg-card border-r p-4 flex flex-col">
            <Button variant="ghost" className="w-full justify-start font-semibold text-base bg-primary/10 text-primary hover:bg-primary/20 hover:text-primary">
              <List className="mr-3 h-5 w-5" /> Create a Menu
            </Button>

            <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mt-8 mb-2 px-3">CUSTOMIZATION</p>
            <Button variant="ghost" className="w-full justify-start font-semibold text-base">
              <Palette className="mr-3 h-5 w-5" /> Brand Management
            </Button>
          </div>

          {/* Main Content */}
          <ScrollArea className="flex-1">
            <div className="p-8 space-y-10">
              <section>
                <h2 className="text-2xl font-bold mb-4">Default</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  <TemplateCard name='Default' imageHint='template-1' isLocked status={defaultMenuStatus} />
                </div>
              </section>
              <section>
                <h2 className="text-2xl font-bold mb-4">Your Menus</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {userMenus.length === 0 ? (
                        <Card 
                            className="border-2 border-dashed bg-muted/50 hover:border-primary hover:bg-primary/5 transition-all flex items-center justify-center min-h-[200px] cursor-pointer col-span-1" 
                            onClick={() => setIsAddMenuModalOpen(true)}
                        >
                            <div className="text-center text-muted-foreground">
                                <Plus className="mx-auto h-8 w-8 mb-2" />
                                <p className="font-semibold">Create Your First Menu</p>
                                <p className="text-xs mt-1">Start from scratch or import from POS.</p>
                            </div>
                        </Card>
                    ) : (
                        <>
                            {userMenus.map((m, index) => (
                                <TemplateCard 
                                    key={`${m.name}-${index}`}
                                    name={m.name} 
                                    imageHint={m.imageHint} 
                                    status={m.status} 
                                    onDelete={() => handleDeleteMenu(index)}
                                    onEdit={() => handleEditMenu(m, index)}
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
                        </>
                    )}
                </div>
              </section>
            </div>
          </ScrollArea>
        </div>
      </div>
      
      {/* Add Menu Choice Modal */}
      <Dialog open={isAddMenuModalOpen} onOpenChange={setIsAddMenuModalOpen}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-center text-2xl font-bold">How would you like to build your menu?</DialogTitle>
            <DialogDescription className="text-center max-w-md mx-auto">
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

            <Card className="hover:shadow-lg hover:border-primary transition-all cursor-pointer" onClick={handleImportFromPos}>
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
      
      {/* POS Selection Modal */}
      <Dialog open={posFlowStep === 'select'} onOpenChange={() => setPosFlowStep('')}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Select POS Provider</DialogTitle>
            <DialogDescription>Choose your Point of Sale system to import from.</DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Select value={selectedPos} onValueChange={setSelectedPos}>
              <SelectTrigger><SelectValue placeholder="Select a POS..." /></SelectTrigger>
              <SelectContent>
                {SUPPORTED_POS.map(pos => <SelectItem key={pos.id} value={pos.id}>{pos.name}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setPosFlowStep('')}>Cancel</Button>
            <Button onClick={startSyncProcess} disabled={!selectedPos}>Next</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Syncing Modal */}
      <Dialog open={posFlowStep === 'sync'} onOpenChange={() => setPosFlowStep('')}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-center">{isSyncComplete ? 'Sync Complete!' : 'Syncing Menu from POS'}</DialogTitle>
            <DialogDescription className="text-center">
              {isSyncComplete ? `${menuItems.length} items imported successfully.` : 'Please wait while we securely import your menu data.'}
            </DialogDescription>
          </DialogHeader>
          <div className="py-8 flex flex-col items-center justify-center gap-4">
            {isSyncComplete ? (
              <CheckCircle2 className="h-16 w-16 text-green-500 animate-in zoom-in duration-300" />
            ) : (
              <>
                <Loader2 className="h-16 w-16 text-primary animate-spin" />
                <Progress value={syncProgress} className="w-full" />
              </>
            )}
          </div>
          <DialogFooter>
            {isSyncComplete ? (
              <Button className="w-full" onClick={handleStartCustomization}>Customize Menu</Button>
            ) : (
              <Button variant="outline" className="w-full" onClick={() => setPosFlowStep('')}>Cancel Sync</Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Customize Full-Screen Modal */}
      <Dialog open={posFlowStep === 'customize'} onOpenChange={(open) => !open && setPosFlowStep('')}>
          <DialogContent className="max-w-full w-screen h-screen m-0 p-0 rounded-none border-none flex flex-col">
              <DialogTitle className="sr-only">Customize Imported Menu</DialogTitle>
              <DialogDescription className="sr-only">
                  Here you can reorder menu sections and customize items imported from your Point-of-Sale system.
              </DialogDescription>
              <div className="p-4 border-b flex-row items-center justify-between space-y-0 flex">
                  <Input
                    value={importedMenuName}
                    onChange={(e) => setImportedMenuName(e.target.value)}
                    className="text-xl font-bold border-0 shadow-none focus-visible:ring-0 p-0 h-auto flex-1"
                    aria-label="Menu Name"
                  />
                  <div className="flex items-center gap-2">
                      <Button variant="outline" onClick={() => handleSaveImportedMenu('Offline')}>Save Offline</Button>
                      <Button onClick={() => handleSaveImportedMenu('Online')}>Save & Publish</Button>
                  </div>
              </div>
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
                      <Button variant="outline" className="mt-4" onClick={() => setIsAddSectionSheetOpen(true)}>
                          <Plus className="mr-2 h-4 w-4" /> Add Section
                      </Button>
                  </div>
                  <div className="col-span-2 bg-muted/30 p-6 overflow-y-auto">
                      <h2 className="text-xl font-bold mb-4 text-center">Live Preview</h2>
                       <div className="w-full max-w-sm mx-auto bg-white rounded-[40px] shadow-2xl p-4 border-[6px] border-black overflow-hidden">
                          {/* Replicate the full mobile layout here */}
                          <div className="relative h-[600px] overflow-hidden bg-[#F7F9FB] flex flex-col">
                            {/* 1. Header */}
                            <header className="sticky top-0 z-20 bg-white/80 backdrop-blur-lg p-4 pb-0 flex-shrink-0">
                                <div className="flex items-center justify-between mb-4">
                                    <ArrowLeft className="h-6 w-6 text-gray-800" />
                                    <div className="text-center">
                                        <h1 className="text-xl font-bold text-gray-900">Bestsellers</h1>
                                        <p className="text-sm text-teal-600 font-medium">{menuItems.filter(i => i.category === 'Bestsellers').length} items</p>
                                    </div>
                                    <Search className="h-6 w-6 text-gray-800" />
                                </div>
                                <ScrollArea className="w-full whitespace-nowrap">
                                    <div className="flex items-center space-x-1 border-b">
                                        {['Bestsellers', 'Pizza', 'Sides', 'Desserts', 'Drinks'].map(cat => (
                                            <button key={cat} className={cn(
                                                "flex items-center gap-1.5 whitespace-nowrap px-4 py-3 text-sm font-bold transition-colors relative",
                                                cat === 'Bestsellers' ? 'text-teal-600' : 'text-gray-500'
                                            )}>
                                                {cat === 'Bestsellers' && <Flame className="h-4 w-4 text-red-500" />}
                                                {cat}
                                                {cat === 'Bestsellers' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-teal-500 rounded-full" />}
                                            </button>
                                        ))}
                                    </div>
                                    <ScrollBar orientation="horizontal" className="hidden" />
                                </ScrollArea>
                            </header>

                            {/* 2. Scrollable Body */}
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
                                                        quantity={previewCart[item.id] || 0}
                                                        onAdd={handlePreviewAddToCart}
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

                            {/* 3. Floating Cart Icon */}
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
                            
                            {/* 4. Footer */}
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
      <AddSectionSheet
        isOpen={isAddSectionSheetOpen}
        onOpenChange={setIsAddSectionSheetOpen}
        onAddSection={handleAddNewSection}
        allProducts={menuItems}
        onProductUpdate={handleProductUpdate}
      />
      <AlertDialog open={isConfirmingPublish} onOpenChange={setIsConfirmingPublish}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure you want to publish this menu?</AlertDialogTitle>
            <AlertDialogDescription>
              Publishing this menu will make it the live version for your customers. All other custom menus will be set to 'Offline'.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmPublish}>Publish</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default function MenuBuilderPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [showBuilder, setShowBuilder] = useState(false);

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
    router.back();
  };

  if (!showBuilder) {
    return <MenuBuilderPreloader onLoaded={handleLoaded} />;
  }

  return <MenuBuilderMainPage onClose={handleClose} />;
}
