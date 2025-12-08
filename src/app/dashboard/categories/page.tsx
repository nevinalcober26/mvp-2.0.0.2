'use client';
import React, { useState, useMemo } from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Plus,
  GripVertical,
  ChevronDown,
  Trash2,
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  DragOverlay,
  UniqueIdentifier,
  DragStartEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { produce } from 'immer';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';

type Category = {
  id: UniqueIdentifier;
  name: string;
  originalName: string;
  children: Category[];
};

type FlattenedCategory = Category & {
  parentId: UniqueIdentifier | null;
  depth: number;
};

const initialCategoriesData: Category[] = [
  {
    id: '1',
    name: 'Menu',
    originalName: 'Menu',
    children: [
      {
        id: '6',
        name: 'Food',
        originalName: 'Food',
        children: [
          { id: '11', name: 'Breakfast', originalName: 'Breakfast', children: [] },
          { id: '12', name: 'Pancakes & French Toast', originalName: 'Pancakes & French Toast', children: [] },
          { id: '13', name: 'Keto & Vegan', originalName: 'Keto & Vegan', children: [] },
        ],
      },
      { id: '7', name: 'Beverages', originalName: 'Beverages', children: [] },
    ],
  },
  { id: '2', name: 'Special Offer', originalName: 'Special Offer', children: [] },
  { id: '3', name: 'About Us', originalName: 'About Us', children: [] },
];

function flattenCategories(
  categories: Category[],
  parentId: UniqueIdentifier | null = null,
  depth = 0
): FlattenedCategory[] {
  return categories.reduce<FlattenedCategory[]>((acc, category) => {
    return [
      ...acc,
      { ...category, parentId, depth },
      ...flattenCategories(category.children, category.id, depth + 1),
    ];
  }, []);
}

function unflattenCategories(
  flattenedCategories: FlattenedCategory[]
): Category[] {
  const tree: Category[] = [];
  const mapped: Record<UniqueIdentifier, Category> = {};

  flattenedCategories.forEach((item) => {
    const { id, name, originalName } = item;
    mapped[id] = { id, name, originalName, children: [] };
  });

  flattenedCategories.forEach((item) => {
    if (item.parentId && mapped[item.parentId]) {
      mapped[item.parentId].children.push(mapped[item.id]);
    } else {
      tree.push(mapped[item.id]);
    }
  });

  return tree;
}

function SortableCategoryItem({ item }: { item: FlattenedCategory }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: item.id });

  const style = {
    transform: CSS.Translate.toString(transform),
    transition,
    marginLeft: `${item.depth * 2}rem`,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <Card
      ref={setNodeRef}
      style={style}
      className="mb-2 relative"
      {...attributes}
    >
      <div className="flex items-center justify-between p-3 border-b">
        <div className="flex items-center gap-2">
          <button {...listeners} className="cursor-grab p-1">
            <GripVertical className="h-5 w-5 text-muted-foreground" />
          </button>
          <span className="font-medium">{item.name}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">
            {item.depth > 0 ? 'Sub-item' : 'Category'}
          </span>
          <AccordionTrigger className="p-2 hover:no-underline rounded-md hover:bg-accent [&[data-state=open]>svg]:rotate-180">
            <ChevronDown className="h-4 w-4" />
          </AccordionTrigger>
        </div>
      </div>
      <AccordionContent className="p-4 space-y-4">
        <div className="space-y-2">
          <label htmlFor={`nav-label-${item.id}`} className="text-sm font-medium">Navigation Label</label>
          <Input id={`nav-label-${item.id}`} defaultValue={item.name} />
        </div>
        <div className="flex justify-between items-center">
            <p className="text-sm">Original: {item.originalName}</p>
            <Button variant="link" className="text-red-500 hover:text-red-600 p-0 h-auto">
                <Trash2 className="h-4 w-4 mr-1"/>
                Remove
            </Button>
        </div>
      </AccordionContent>
    </Card>
  );
}

function AvailableItemsPanel() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Available Items</CardTitle>
      </CardHeader>
      <CardContent>
        <Accordion type="multiple" className="w-full">
          <AccordionItem value="pages">
            <AccordionTrigger>Pages</AccordionTrigger>
            <AccordionContent className="p-2 space-y-2 max-h-40 overflow-y-auto">
              <div className="flex items-center space-x-2">
                <Checkbox id="page-home" />
                <label htmlFor="page-home" className="text-sm font-medium">Home</label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox id="page-about" />
                <label htmlFor="page-about" className="text-sm font-medium">About Us</label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox id="page-contact" />
                <label htmlFor="page-contact" className="text-sm font-medium">Contact</label>
              </div>
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="products">
            <AccordionTrigger>Products</AccordionTrigger>
            <AccordionContent>
              <p className="p-2 text-sm text-muted-foreground">Product items will appear here.</p>
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="links">
            <AccordionTrigger>Custom Links</AccordionTrigger>
            <AccordionContent className="p-2 space-y-4">
              <div className="space-y-2">
                <Input placeholder="URL"/>
                <Input placeholder="Link Text"/>
              </div>
              <Button size="sm" className="w-full">Add to Menu</Button>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
        <Button className="w-full mt-4">Add to Menu</Button>
      </CardContent>
    </Card>
  );
}


export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>(initialCategoriesData);
  const [activeId, setActiveId] = useState<UniqueIdentifier | null>(null);

  const flattenedItems = useMemo(() => flattenCategories(categories), [categories]);
  const flattenedIds = useMemo(() => flattenedItems.map(({ id }) => id), [flattenedItems]);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);

    if (over && active.id !== over.id) {
        setCategories((prev) => {
            const oldIndex = flattenedIds.indexOf(active.id);
            const newIndex = flattenedIds.indexOf(over.id);
            
            // This is a simplified reordering logic.
            // A production-ready solution would need more complex logic to handle nesting.
            const newItems = Array.from(flattenedItems);
            const [movedItem] = newItems.splice(oldIndex, 1);
            newItems.splice(newIndex, 0, movedItem);

            return unflattenCategories(newItems);
        });
    }
  };

  const activeItem = activeId ? flattenedItems.find(({ id }) => id === activeId) : null;

  return (
    <>
      <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b bg-card px-4 sm:px-6 lg:px-8 justify-between">
        <h1 className="text-xl font-semibold flex items-center gap-2">
          Menu Editor
          <Badge variant="destructive">BLOOMSBURY'S (RAS AL KHAIMAH)</Badge>
        </h1>
        <div className="flex items-center gap-4">
          <Button>PUBLISH</Button>
          <Select defaultValue="en">
            <SelectTrigger className="w-auto">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="en">English (EN)</SelectItem>
              <SelectItem value="es">Spanish (ES)</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </header>

      <main className="p-4 sm:p-6 lg:p-8 grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-1">
          <AvailableItemsPanel />
        </div>
        <div className="md:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Menu Structure</CardTitle>
              <CardDescription>
                Drag and drop menu items to reorder them.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragStart={handleDragStart}
                onDragEnd={handleDragEnd}
              >
                <SortableContext items={flattenedIds} strategy={verticalListSortingStrategy}>
                  <Accordion type="multiple" className="w-full">
                    {flattenedItems.map((item) => (
                      <AccordionItem key={item.id} value={item.id.toString()} className="border-b-0">
                        <SortableCategoryItem item={item} />
                      </AccordionItem>
                    ))}
                  </Accordion>
                </SortableContext>
                <DragOverlay>
                  {activeItem ? (
                     <Card className="shadow-lg">
                        <div className="flex items-center justify-between p-3">
                            <div className="flex items-center gap-2">
                                <GripVertical className="h-5 w-5 text-muted-foreground" />
                                <span className="font-medium">{activeItem.name}</span>
                            </div>
                        </div>
                    </Card>
                  ) : null}
                </DragOverlay>
              </DndContext>
            </CardContent>
          </Card>
        </div>
      </main>
    </>
  );
}
