
'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { MenuBuilderPreloader } from '@/components/dashboard/menu-builder/preloader';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { EMenuIcon } from '@/components/dashboard/app-sidebar';
import { List, LayoutGrid, X, Plus, Palette, Database, CheckCircle2, Loader2, GripVertical } from 'lucide-react';
import Image from 'next/image';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { DndContext, closestCenter, PointerSensor, useSensor, useSensors, DragEndEvent } from '@dnd-kit/core';
import { arrayMove, SortableContext, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { cn } from '@/lib/utils';

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

const mockMenuData = [
    { id: 'starters', name: 'Starters', items: ['Soup of the Day', 'Bruschetta', 'Garlic Bread'] },
    { id: 'mains', name: 'Main Courses', items: ['Steak Frites', 'Grilled Salmon', 'Mushroom Risotto', 'Chicken Alfredo'] },
    { id: 'desserts', name: 'Desserts', items: ['Lava Cake', 'Ice Cream', 'Tiramisu'] },
    { id: 'beverages', name: 'Beverages', items: ['Coke', 'Sprite', 'Iced Tea'] },
];

const SortableSectionItem = ({ id, name }: { id: string, name: string }) => {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div ref={setNodeRef} style={style} className="touch-none">
      <Card className="p-3 flex items-center justify-between cursor-default bg-white hover:bg-muted/50">
        <div className="flex items-center gap-3">
          <button {...attributes} {...listeners} className="cursor-grab p-1">
            <GripVertical className="h-5 w-5 text-muted-foreground" />
          </button>
          <span className="font-semibold text-sm">{name}</span>
        </div>
      </Card>
    </div>
  );
};

const MenuBuilderMainPage = ({ onClose }: { onClose: () => void }) => {
  const [isAddMenuModalOpen, setIsAddMenuModalOpen] = useState(false);
  const [posFlowStep, setPosFlowStep] = useState<'select' | 'sync' | 'customize' | ''>('');
  const [selectedPos, setSelectedPos] = useState('');
  const [syncProgress, setSyncProgress] = useState(0);
  const [isSyncComplete, setIsSyncComplete] = useState(false);

  const [menuSections, setMenuSections] = useState(mockMenuData);
  const sensors = useSensors(useSensor(PointerSensor));

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

  const templates = [
    { name: 'Template 1', imageHint: 'abstract red' },
    { name: 'Template 2', imageHint: 'dark theme' },
    { name: 'Template 3', imageHint: 'gray placeholder' },
  ];

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
                <h2 className="text-2xl font-bold mb-4">Templates</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {templates.map(t => <TemplateCard key={t.name} name={t.name} imageHint={t.imageHint} />)}
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
              {isSyncComplete ? `${menuSections.length} categories and ${menuSections.reduce((acc, s) => acc + s.items.length, 0)} items imported successfully.` : 'Please wait while we securely import your menu data.'}
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
                                      <SortableSectionItem key={section.id} id={section.id} name={section.name} />
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
                          <div className="h-[600px] overflow-y-auto">
                              <div className="p-4">
                                  <h1 className="text-2xl font-bold mb-6">Our Menu</h1>
                                  <div className="space-y-6">
                                      {menuSections.map(section => (
                                          <div key={section.id}>
                                              <h2 className="text-lg font-bold border-b pb-1 mb-2">{section.name}</h2>
                                              <ul className="space-y-1 list-disc list-inside text-muted-foreground">
                                                  {section.items.map(item => <li key={item}>{item}</li>)}
                                              </ul>
                                          </div>
                                      ))}
                                  </div>
                              </div>
                          </div>
                      </div>
                  </div>
              </div>
          </DialogContent>
      </Dialog>
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
