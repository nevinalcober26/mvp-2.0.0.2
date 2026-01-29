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
import { Item as ItemComponent } from '@/components/dashboard/dnd/Item';

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

const AddCategoryDialog = ({
  open,
  onOpenChange,
  onAddCategory,
  board,
  initialParentId = 'none',
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAddCategory: (name: string, parentId: UniqueIdentifier | 'none') => void;
  board: Column[];
  initialParentId?: UniqueIdentifier | 'none';
}) => {
  const [name, setName] = useState('');
  const [parentId, setParentId] = useState<string>(initialParentId.toString());
  const categoryOptions = useMemo(() => getCategoryOptions(board), [board]);

  useEffect(() => {
    if (open) {
      setName('');
      setParentId(initialParentId.toString());
    }
  }, [open, initialParentId]);

  const handleSave = () => {
    if (name.trim()) {
      onAddCategory(name, parentId);
      onOpenChange(false);
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
                <SelectItem value="none">None (New Top-level Column)</SelectItem>
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
  const [selectedCategory, setSelectedCategory] = useState<Column | Item | null>(
    null
  );
  const [isAddCategoryDialogOpen, setIsAddCategoryDialogOpen] = useState(false);
  const [addCategoryParent, setAddCategoryParent] = useState<
    UniqueIdentifier | 'none'
  >('none');
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

  const findItem = (id: UniqueIdentifier, columns: Column[]): Item | null => {
    for (const column of columns) {
      const search = (items: Item[]): Item | null => {
        for (const item of items) {
          if (item.id === id) return item;
          if (item.children) {
            const found = search(item.children);
            if (found) return found;
          }
        }
        return null;
      };
      const found = search(column.items);
      if (found) return found;
    }
    return null;
  };

  const activeItem = useMemo(() => activeId ? findItem(activeId, board) : null, [activeId, board]);

  const findItemContainerId = (id: UniqueIdentifier, columns: Column[]): UniqueIdentifier | undefined => {
    for (const column of columns) {
      const search = (items: Item[]): boolean => {
        for (const item of items) {
          if (item.id === id) return true;
          if (item.children && search(item.children)) return true;
        }
        return false;
      };
      if (search(column.items)) return column.id;
    }
    return undefined;
  };
  
  const findAndRemove = (items: Item[], id: UniqueIdentifier): Item | null => {
    for (let i = 0; i < items.length; i++) {
        const item = items[i];
        if (item.id === id) {
            // Found it, remove and return
            return items.splice(i, 1)[0];
        }
        if (item.children) {
            const found = findAndRemove(item.children, id);
            if (found) return found;
        }
    }
    return null;
  }

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id);
  };

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
  
    setBoard(produce((draft) => {
        const activeContainerId = findItemContainerId(active.id, draft);
        const overContainerId = over.data.current?.sortable?.containerId || over.id;

        if (!activeContainerId || !overContainerId || activeContainerId === overContainerId) {
            return;
        }
  
        const overContainer = draft.find(c => c.id === overContainerId);
        if (!overContainer) return;
  
        let activeItem: Item | null = null;
        const activeContainer = draft.find(c => c.id === activeContainerId);
        if (activeContainer) {
            activeItem = findAndRemove(activeContainer.items, active.id);
        }
  
        if (activeItem) {
          // Add to the new container's top-level items
          overContainer.items.push(activeItem);
        }
    }));
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
            setBoard(produce(draft => {
                const container = draft.find(c => c.id === activeContainerId);
                if (container) {
                    const oldIndex = container.items.findIndex(i => i.id === active.id);
                    const newIndex = container.items.findIndex(i => i.id === over.id);

                    if (oldIndex !== -1 && newIndex !== -1) {
                        container.items = arrayMove(container.items, oldIndex, newIndex);
                    }
                    // Note: This does not handle reordering of nested children yet
                }
            }));
        }
    }

    setActiveId(null);
  };
  
  const addItemToParent = (items: Item[], parentId: UniqueIdentifier, newItem: Item): boolean => {
    for(const item of items) {
        if(item.id === parentId) {
            if (!item.children) item.children = [];
            item.children.push(newItem);
            return true;
        }
        if (item.children) {
            if (addItemToParent(item.children, parentId, newItem)) {
                return true;
            }
        }
    }
    return false;
  }

  const handleAddCategoryFromDialog = (
    name: string,
    parentId: UniqueIdentifier | 'none'
  ) => {
    const newItemId = `item-${Date.now()}`;
    const newCategory: Item = { id: newItemId, name, children: [] };

    setBoard(
      produce((draft) => {
        if (parentId === 'none') {
          draft.push({
            id: `col-${Date.now()}`,
            name: name,
            items: [],
          });
        } else {
          const isColumn = draft.some(col => col.id === parentId);
          if (isColumn) {
            const parentColumn = draft.find((col) => col.id === parentId);
            parentColumn?.items.push(newCategory);
          } else {
            // It's a nested item. Find it across all columns.
            for (const column of draft) {
                if (addItemToParent(column.items, parentId, newCategory)) {
                    break;
                }
            }
          }
        }
      })
    );
    toast({
      title: 'Category Added',
      description: `"${name}" has been successfully added.`,
    });
  };

  const handleOpenAddDialog = (parentId: UniqueIdentifier | 'none' = 'none') => {
    setAddCategoryParent(parentId);
    setIsAddCategoryDialogOpen(true);
  };

  if (isLoading) {
    return <CategoriesPageSkeleton view="gallery" />;
  }

  return (
    <>
      <DashboardHeader />
      <div className="flex flex-col h-[calc(100vh-4rem)]">
        <div className="p-4 sm:p-6 lg:p-8 border-b bg-background z-10 sticky top-16">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-semibold flex items-center gap-2">
              Categories
              <Badge variant="destructive">BLOOMSBURY'S (RAS AL KHAIMAH)</Badge>
            </h1>
            <div className="flex items-center gap-4">
              <Button onClick={() => handleOpenAddDialog('none')}>
                <Plus className="mr-2 h-4 w-4" /> Add Category Column
              </Button>
              <Button variant="secondary">PUBLISH</Button>
            </div>
          </div>
        </div>

        <div className="flex-grow p-4 sm:p-6 lg:p-8 overflow-x-auto">
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
                  onAddItem={() => handleOpenAddDialog(column.id)}
                />
              ))}
              <div className="w-80 flex-shrink-0">
                <button
                  onClick={() => handleOpenAddDialog('none')}
                  className="w-full h-full rounded-lg border-2 border-dashed border-muted-foreground/50 bg-card p-6 flex flex-col items-center justify-center gap-2 text-muted-foreground hover:border-primary hover:text-primary hover:bg-primary/5 transition-colors"
                >
                  <Plus className="h-8 w-8" />
                  <span className="font-semibold">Add Category Column</span>
                </button>
              </div>
            </div>
            <DragOverlay>
              {activeItem ? (
                <ItemComponent id={activeItem.id} name={activeItem.name} />
              ) : null}
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
        initialParentId={addCategoryParent}
      />
    </>
  );
}
