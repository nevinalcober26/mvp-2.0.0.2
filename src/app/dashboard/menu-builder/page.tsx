
'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { MenuBuilderPreloader } from '@/components/dashboard/menu-builder/preloader';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { EMenuIcon } from '@/components/dashboard/app-sidebar';
import { List, LayoutGrid, X, Plus, Palette, Database, CheckCircle2, Loader2, GripVertical, Home, Receipt, ArrowLeft, Search, Flame, ShoppingCart, ImageIcon } from 'lucide-react';
import Image from 'next/image';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
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


const TemplateCard = ({ name, imageHint }: { name: string; imageHint: string }) => {
  const image = PlaceHolderImages.find(img => img.imageHint === imageHint);
  return (
    <Card className="overflow-hidden shadow-sm hover:shadow-lg transition-shadow cursor-pointer group">
      <CardHeader className="p-3 border-b">
        <p className="text-xs font-semibold flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-gray-300 group-hover:bg-primary transition-colors" />
          {name}
        </p>
      </CardHeader>
      <CardContent className="p-3">
        <div className="aspect-[4/3] w-full bg-muted rounded-md overflow-hidden">
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


const SortableSectionItem = ({ id, name, onEditClick }: { id: string; name: string; onEditClick: () => void }) => {
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
      </Card>
    </div>
  );
};


const SortableProductRow = ({ item, onUpdate, onImageUpload, onAvailabilityChange }: any) => {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: item.id });
    const style = { transform: CSS.Transform.toString(transform), transition, zIndex: isDragging ? 10 : 'auto' };
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleImageClick = () => {
        fileInputRef.current?.click();
    };

    return (
        <TableRow ref={setNodeRef} style={style} className="bg-background">
            <TableCell className="w-10">
                <button {...listeners} {...attributes} className="cursor-grab p-2">
                    <GripVertical className="h-5 w-5 text-muted-foreground" />
                </button>
            </TableCell>
            <TableCell>
                <input
                    type="file"
                    ref={fileInputRef}
                    className="hidden"
                    accept="image/*"
                    onChange={(e) => onImageUpload(item.id, e)}
                />
                <div className="w-16 h-16 rounded-md bg-muted flex items-center justify-center border overflow-hidden cursor-pointer" onClick={handleImageClick}>
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
                    onChange={(e) => onUpdate(item.id, 'name', e.target.value)}
                    className="font-bold border-transparent focus:border-input p-1 h-auto text-base"
                    placeholder="Product Name"
                />
                <Textarea
                    value={item.description}
                    onChange={(e) => onUpdate(item.id, 'description', e.target.value)}
                    placeholder="Short description..."
                    className="mt-1 text-xs border-transparent focus:border-input p-1 h-auto resize-none"
                    rows={2}
                />
            </TableCell>
            <TableCell className="align-top py-4">
                <Input
                    type="number"
                    value={item.price}
                    onChange={(e) => onUpdate(item.id, 'price', parseFloat(e.target.value))}
                    className="w-24"
                />
            </TableCell>
            <TableCell className="align-top py-4">
                <Switch
                    checked={item.available ?? true} // Assuming available if not specified
                    onCheckedChange={(checked) => onAvailabilityChange(item.id, checked)}
                />
            </TableCell>
        </TableRow>
    );
};


const CategoryItemsSheet = ({ category, isOpen, onOpenChange, onSave }: any) => {
    if (!category && !isOpen) {
        return null;
    }

    const [items, setItems] = useState<MenuItem[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const sensors = useSensors(useSensor(PointerSensor));
    const { toast } = useToast();

    useEffect(() => {
        if (category && isOpen) {
            setItems(category.items.map((item: any) => ({ ...item, available: item.available ?? true })));
            setSearchQuery('');
        }
    }, [category, isOpen]);
    
    const filteredItems = useMemo(() => {
        if (!searchQuery) {
            return items;
        }
        return items.filter(item =>
            item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (item.description && item.description.toLowerCase().includes(searchQuery.toLowerCase()))
        );
    }, [items, searchQuery]);
    
    const itemIds = useMemo(() => filteredItems.map(i => i.id), [filteredItems]);

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;
        if (over && active.id !== over.id) {
            setItems((currentItems) => {
                const oldIndex = currentItems.findIndex((item) => item.id === active.id);
                const newIndex = currentItems.findIndex((item) => item.id === over.id);
                if (oldIndex === -1 || newIndex === -1) return currentItems;
                return arrayMove(currentItems, oldIndex, newIndex);
            });
        }
    };

    const handleItemUpdate = (itemId: string, field: keyof MenuItem, value: any) => {
        setItems(currentItems =>
            currentItems.map(item => (item.id === itemId ? { ...item, [field]: value } : item))
        );
    };

    const handleImageUpload = (itemId: string, event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                handleItemUpdate(itemId, 'image', reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleAvailabilityChange = (itemId: string, available: boolean) => {
        setItems(currentItems =>
            currentItems.map(item => (item.id === itemId ? { ...item, available } : item))
        );
    };

    const handleSaveChanges = () => {
        if (category) {
            onSave(category.id, items);
            toast({
                title: "Changes Saved",
                description: `Items in "${category.name}" have been updated.`,
            });
        }
    };
    
    if (!category && isOpen) {
        return (
            <Sheet open={isOpen} onOpenChange={onOpenChange}>
                <SheetContent className="sm:max-w-3xl w-full p-0 flex flex-col">
                    <div className="flex-1 flex items-center justify-center">
                        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                    </div>
                </SheetContent>
            </Sheet>
        );
    }
    
    return (
        <Sheet open={isOpen} onOpenChange={onOpenChange}>
            <SheetContent className="sm:max-w-3xl w-full p-0 flex flex-col">
                {!category ? (
                    <div className="flex-1 flex items-center justify-center">
                        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                    </div>
                ) : (
                    <>
                        <SheetHeader className="p-6 border-b shrink-0">
                            <SheetTitle>Manage: {category.name}</SheetTitle>
                            <SheetDescription>Drag to reorder, edit details, and toggle availability.</SheetDescription>
                        </SheetHeader>
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
                        <div className="flex-1 overflow-y-auto p-6">
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
                                                    onUpdate={handleItemUpdate}
                                                    onImageUpload={handleImageUpload}
                                                    onAvailabilityChange={handleAvailabilityChange}
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
                        <SheetFooter className="p-6 border-t shrink-0">
                            <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
                            <Button onClick={handleSaveChanges}>Save Changes</Button>
                        </SheetFooter>
                    </>
                )}
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

  const [menuSections, setMenuSections] = useState(mockMenuData);
  const [editingCategory, setEditingCategory] = useState(null);
  const [isCategorySheetOpen, setIsCategorySheetOpen] = useState(false);

  const sensors = useSensors(useSensor(PointerSensor));

  const [previewCart, setPreviewCart] = useState<Record<string, number>>({});
  const [isCartAnimating, setIsCartAnimating] = useState(false);
  const prevCartTotalRef = useRef(0);

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

  const handleImportFromPos = () => {
    setIsAddMenuModalOpen(false);
    setPosFlowStep('select');
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
    // setEditingCategory(null);
  };

  const userMenus = [
    { name: 'My Ramadan Menu', imageHint: 'abstract red' },
    { name: 'Main Dinner Menu', imageHint: 'dark theme' },
  ];

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
              <LayoutGrid className="mr-3 h-5 w-5" /> Brand Management
            </Button>
          </div>

          {/* Main Content */}
          <ScrollArea className="flex-1">
            <div className="p-8 space-y-10">
              <section>
                <h2 className="text-2xl font-bold mb-4">Default</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  <TemplateCard name='Default' imageHint='abstract red' />
                </div>
              </section>
              <section>
                <h2 className="text-2xl font-bold mb-4">Your Menus</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {userMenus.map(m => <TemplateCard key={m.name} name={m.name} imageHint={m.imageHint} />)}
                  <Card className="border-2 border-dashed bg-muted/50 hover:border-primary hover:bg-primary/5 transition-all flex items-center justify-center min-h-[200px] cursor-pointer" onClick={() => setIsAddMenuModalOpen(true)}>
                    <div className="text-center text-muted-foreground">
                      <Plus className="mx-auto h-8 w-8 mb-2" />
                      <p className="font-semibold">Create New Menu</p>
                    </div>
                  </Card>
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
            <Card className="hover:shadow-lg hover:border-primary transition-all cursor-pointer">
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
              {isSyncComplete ? `${menuSections.reduce((acc, s) => acc + s.items.length, 0)} items imported successfully.` : 'Please wait while we securely import your menu data.'}
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
              <Button className="w-full" onClick={() => setPosFlowStep('customize')}>Customize Menu</Button>
            ) : (
              <Button variant="outline" className="w-full" onClick={() => setPosFlowStep('')}>Cancel Sync</Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Customize Full-Screen Modal */}
      <Dialog open={posFlowStep === 'customize'} onOpenChange={() => setPosFlowStep('')}>
          <DialogContent className="max-w-full w-screen h-screen m-0 p-0 rounded-none border-none flex flex-col">
              <DialogHeader className="p-4 border-b flex-row items-center justify-between space-y-0">
                  <DialogTitle>Customize Imported Menu</DialogTitle>
                  <div className="flex items-center gap-2">
                      <Button variant="outline">Save Draft</Button>
                      <Button onClick={() => setPosFlowStep('')}>Save & Close</Button>
                  </div>
              </DialogHeader>
              <div className="flex-1 grid grid-cols-3 overflow-hidden">
                  <div className="col-span-2 p-6 overflow-y-auto">
                      <h2 className="text-xl font-bold mb-4">Menu Structure</h2>
                      <p className="text-muted-foreground mb-6">Drag and drop sections to reorder your menu. Click 'Add Section' to create new categories.</p>
                      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                          <SortableContext items={menuSections.map(s => s.id)} strategy={verticalListSortingStrategy}>
                              <div className="space-y-3 max-w-lg">
                                  {menuSections.map(section => (
                                      <SortableSectionItem key={section.id} id={section.id} name={section.name} onEditClick={() => handleEditCategory(section)} />
                                  ))}
                              </div>
                          </SortableContext>
                      </DndContext>
                      <Button variant="outline" className="mt-4">
                          <Plus className="mr-2 h-4 w-4" /> Add Section
                      </Button>
                  </div>
                  <div className="col-span-1 bg-muted/30 p-6 overflow-y-auto">
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
                                        <p className="text-sm text-teal-600 font-medium">{mockMenuItems.filter(i => i.category === 'Bestsellers').length} items</p>
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
                                                {section.items.filter(item => item.available ?? true).map(item => (
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
