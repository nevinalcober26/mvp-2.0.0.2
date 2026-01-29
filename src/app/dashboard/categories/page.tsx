'use client';
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  DndContext,
  DragOverlay,
  closestCorners,
  PointerSensor,
  useSensor,
  useSensors,
  DragStartEvent,
  DragOverEvent,
  DragEndEvent,
  UniqueIdentifier,
  KeyboardSensor,
} from '@dnd-kit/core';
import {
  SortableContext,
  arrayMove,
  sortableKeyboardCoordinates,
} from '@dnd-kit/sortable';
import { produce } from 'immer';
import Image from 'next/image';

import { DashboardHeader } from '@/components/dashboard/header';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import { CategoriesPageSkeleton } from '@/components/dashboard/skeletons';
import { CategorySheet, getCategoryOptions } from './category-sheet';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Container } from '@/components/dashboard/dnd/Container';
import { SortableItem } from '@/components/dashboard/dnd/SortableItem';
import { Item } from '@/components/dashboard/dnd/Item';

export type Item = {
  id: UniqueIdentifier;
  name: string;
  children: Item[];
};

export type Column = {
  id: UniqueIdentifier;
  name: string;
  items: Item[];
};

const initialBoardData: Column[] = [
  {
    id: 'food',
    name: 'Food',
    items: [
      { id: 'item-1', name: 'Breakfast', children: [] },
      {
        id: 'item-2',
        name: 'Pancakes & French Toast',
        children: [
          { id: 'item-2-1', name: 'Classic Pancakes', children: [] },
          { id: 'item-2-2', name: 'Blueberry Pancakes', children: [] },
        ],
      },
      { id: 'item-3', name: 'Keto & Vegan', children: [] },
    ],
  },
  {
    id: 'beverages',
    name: 'Beverages',
    items: [
      { id: 'item-4', name: 'Coffee', children: [] },
      { id: 'item-5', name: 'Juices', children: [] },
    ],
  },
  {
    id: 'specials',
    name: 'Special Offers',
    items: [],
  },
];

const findItemRecursive = (
  items: Item[],
  itemId: UniqueIdentifier
): { item: Item; parent: Item[] } | undefined => {
  for (const item of items) {
    if (item.id === itemId) return { item, parent: items };
    if (item.children.length) {
      const found = findItemRecursive(item.children, itemId);
      if (found) return found;
    }
  }
  return undefined;
};

const findContainer = (
  id: UniqueIdentifier,
  containers: Column[]
): Column | undefined => {
  return containers.find((container) => container.id === id);
};

const findItemContainerId = (
  id: UniqueIdentifier,
  containers: Column[]
): UniqueIdentifier | undefined => {
  for (const container of containers) {
    if (container.items.some((item) => item.id === id)) {
      return container.id;
    }
    // This simple implementation doesn't check nested children for top-level moves
  }
  return undefined;
};


const AddCategoryDialog = ({
  open,
  onOpenChange,
  onAddCategory,
  board,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAddCategory: (name: string, parentId: UniqueIdentifier | 'none') => void;
  board: Column[];
}) => {
  const [name, setName] = useState('');
  const [parentId, setParentId] = useState<string>('none');
  const categoryOptions = useMemo(() => getCategoryOptions(board), [board]);

  const handleSave = () => {
    if (name.trim()) {
      onAddCategory(name, parentId);
      onOpenChange(false);
      setName('');
      setParentId('none');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add New Category</DialogTitle>
          <DialogDescription>
            Enter a name and select a parent for your new category.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="new-category-name">Category Name</Label>
            <Input
              id="new-category-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Desserts"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="parent">Parent</Label>
            <Select value={parentId} onValueChange={setParentId}>
              <SelectTrigger id="parent">
                <SelectValue placeholder="Select a parent category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">None (Top-level)</SelectItem>
                {categoryOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    <span style={{ paddingLeft: `${option.depth * 1.5}rem` }}>
                      {option.depth > 0 && '↳ '}
                      {option.label}
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave}>Save Category</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};


export default function CategoriesPage() {
  const [board, setBoard] = useState<Column[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeId, setActiveId] = useState<UniqueIdentifier | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<Column | Item | null>(null);
  const [isAddCategoryDialogOpen, setIsAddCategoryDialogOpen] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const timer = setTimeout(() => {
      setBoard(initialBoardData);
      setIsLoading(false);
    }, 1500);
    return () => clearTimeout(timer);
  }, []);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const findItem = (id: UniqueIdentifier) => {
    for (const col of board) {
        const foundInItems = col.items.find(i => i.id === id);
        if (foundInItems) return foundInItems;
        // Simplified: doesn't find nested items for top-level drag
    }
    return null;
  }
  
  const activeItem = activeId ? findItem(activeId) : null;


  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id);
  };

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const activeContainerId = findItemContainerId(active.id, board);
    const overContainerId = over.data.current?.sortable?.containerId || over.id;

    if (!activeContainerId || !overContainerId || activeContainerId === overContainerId) {
      return;
    }

    setBoard(
      produce((draft) => {
        const activeContainer = draft.find((c) => c.id === activeContainerId);
        const overContainer = draft.find((c) => c.id === overContainerId);

        if (!activeContainer || !overContainer) return;

        const activeItemIndex = activeContainer.items.findIndex((i) => i.id === active.id);
        const overItemIndex = overContainer.items.findIndex((i) => i.id === over.id);

        let newIndex: number;
        if (over.id in overContainer.items.map(i => i.id)) {
            newIndex = overContainer.items.length + 1;
        } else {
            const isBelow = over && active.rect.current.translated && active.rect.current.translated.top > over.rect.top + over.rect.height;
            const modifier = isBelow ? 1: 0;
            newIndex = overItemIndex >= 0 ? overItemIndex + modifier : overContainer.items.length + 1;
        }

        const [movedItem] = activeContainer.items.splice(activeItemIndex, 1);
        overContainer.items.splice(newIndex, 0, movedItem);
      })
    );
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over) {
      setActiveId(null);
      return;
    }

    if (active.id !== over.id) {
      const activeContainerId = findItemContainerId(active.id, board);
      const overContainerId = over.data.current?.sortable?.containerId || over.id;
      
      if (activeContainerId && overContainerId && activeContainerId === overContainerId) {
          const container = board.find(c => c.id === activeContainerId);
          if (container) {
              const oldIndex = container.items.findIndex(i => i.id === active.id);
              const newIndex = container.items.findIndex(i => i.id === over.id);
              if (oldIndex !== -1 && newIndex !== -1) {
                  setBoard(produce(draft => {
                      const targetContainer = draft.find(c => c.id === activeContainerId);
                      if (targetContainer) {
                          targetContainer.items = arrayMove(targetContainer.items, oldIndex, newIndex);
                      }
                  }));
              }
          }
      }
    }
    
    setActiveId(null);
  };
  
  const handleAddCategoryFromDialog = (
    name: string,
    parentId: UniqueIdentifier | 'none'
  ) => {
    const newItemId = `item-${Date.now()}`;
    const newCategory: Item = { id: newItemId, name, children: [] };

    setBoard(
      produce((draft) => {
        if (parentId === 'none' || !parentId) {
          // Create a new top-level category (column)
          draft.push({
            id: `col-${Date.now()}`,
            name: name,
            items: [],
          });
        } else {
          // Find parent and add as sub-category
          const parentColumn = draft.find((col) => col.id === parentId);
          if (parentColumn) {
            parentColumn.items.push(newCategory);
          } else {
             // simplified: does not handle nested adding
          }
        }
      })
    );
    toast({
      title: 'Category Added',
      description: `"${name}" has been successfully added.`,
    });
  };

  if (isLoading) {
    return <CategoriesPageSkeleton view="gallery" />;
  }

  return (
    <>
      <DashboardHeader />
      <div className="flex flex-col h-[calc(100vh-4rem)]">
        <div className="p-4 sm:p-6 lg:p-8 border-b bg-background z-10">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-semibold flex items-center gap-2">
              Categories
              <Badge variant="destructive">BLOOMSBURY'S (RAS AL KHAIMAH)</Badge>
            </h1>
            <div className="flex items-center gap-4">
              <Button onClick={() => setIsAddCategoryDialogOpen(true)}>
                <Plus className="mr-2 h-4 w-4" /> Add Category
              </Button>
              <Button variant="secondary">PUBLISH</Button>
            </div>
          </div>
        </div>

        <div
          className="flex-grow p-4 sm:p-6 lg:p-8 overflow-x-auto"
          style={{ width: '1430px', overflowX: 'scroll' }}
        >
          <DndContext
            sensors={sensors}
            collisionDetection={closestCorners}
            onDragStart={handleDragStart}
            onDragOver={handleDragOver}
            onDragEnd={handleDragEnd}
          >
            <div className="flex items-start gap-6 pb-4">
              {board.map((column) => (
                <Container
                  key={column.id}
                  id={column.id}
                  label={column.name}
                  items={column.items}
                  onItemClick={setSelectedCategory}
                />
              ))}
              <div className="w-80 flex-shrink-0">
                <button
                  onClick={() => setIsAddCategoryDialogOpen(true)}
                  className="w-full h-full rounded-lg border-2 border-dashed border-muted-foreground/50 bg-card p-6 flex flex-col items-center justify-center gap-2 text-muted-foreground hover:border-primary hover:text-primary hover:bg-primary/5 transition-colors"
                >
                  <Plus className="h-8 w-8" />
                  <span className="font-semibold">Add Category</span>
                </button>
              </div>
            </div>
            <DragOverlay>
              {activeItem ? <Item id={activeItem.id} name={activeItem.name} /> : null}
            </DragOverlay>
          </DndContext>
        </div>
      </div>
      <CategorySheet
        open={!!selectedCategory}
        onOpenChange={(isOpen) => {
          if (!isOpen) {
            setSelectedCategory(null);
          }
        }}
        category={selectedCategory}
        board={board}
      />
      <AddCategoryDialog
        open={isAddCategoryDialogOpen}
        onOpenChange={setIsAddCategoryDialogOpen}
        onAddCategory={handleAddCategoryFromDialog}
        board={board}
      />
    </>
  );
}
