'use client';
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  DndContext,
  DragOverlay,
  closestCenter,
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
  sortableKeyboardCoordinates,
  arrayMove,
} from '@dnd-kit/sortable';
import { produce } from 'immer';
import Image from 'next/image';

import { DashboardHeader } from '@/components/dashboard/header';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import { CategoriesPageSkeleton } from '@/components/dashboard/skeletons';
import { CategorySheet } from './category-sheet';
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
import { mockDataStore } from '@/lib/mock-data-store';
import { getCategoryOptions } from './utils';
import type { Item, Column } from './types';

// Helper functions for tree operations
function findItemDeep(
  columns: Column[],
  itemId: UniqueIdentifier
): { container: Item[] | Column['items']; item: Item } | null {
  for (const column of columns) {
    const search = (
      items: Item[]
    ): { container: Item[]; item: Item } | null => {
      for (const item of items) {
        if (item.id === itemId) return { container: items, item };
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
}

function findAndRemoveItem(board: Column[], id: UniqueIdentifier): Item | null {
    let removedItem: Item | null = null;

    function findAndRemove(items: Item[], itemId: UniqueIdentifier): boolean {
        for (let i = 0; i < items.length; i++) {
            if (items[i].id === itemId) {
                removedItem = items.splice(i, 1)[0];
                return true;
            }
            if (items[i].children) {
                if (findAndRemove(items[i].children, itemId)) {
                    return true;
                }
            }
        }
        return false;
    }

    for (const column of board) {
        if (findAndRemove(column.items, id)) {
            break;
        }
    }
    return removedItem;
}


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
  const [overId, setOverId] = useState<UniqueIdentifier | null>(null);
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
      setBoard(mockDataStore.categories);
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

  const activeItem = useMemo(() => activeId ? findItemDeep(board, activeId)?.item : null, [activeId, board]);

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id);
    setOverId(event.over?.id ?? null);
  };
  
  const handleDragOver = (event: DragOverEvent) => {
    setOverId(event.over?.id ?? null);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (!over || active.id === over.id) {
        setActiveId(null);
        setOverId(null);
        return;
    }

    setBoard(board => produce(board, draft => {
        // First, pull the active item out of the tree
        const activeItem = findAndRemoveItem(draft, active.id);
        if (!activeItem) return;

        const overId = over.id;
        const overIsContainer = over.data.current?.type === 'container-drop-zone';
        const overIsItem = over.data.current?.type === 'item-drop-zone';

        // Case 1: Dropping into a container (column)
        if (overIsContainer) {
            const overColumn = draft.find(c => c.id === overId);
            overColumn?.items.push(activeItem);
            return;
        }

        // Case 2: Dropping ON another item (nesting)
        if (overIsItem) {
            const parentItemData = findItemDeep(draft, overId);
            if (parentItemData) {
                if (!parentItemData.item.children) {
                    parentItemData.item.children = [];
                }
                parentItemData.item.children.unshift(activeItem);
            }
            return;
        }

        // Case 3: Reordering (dropping next to another item)
        const overItemData = findItemDeep(draft, overId);
        if (overItemData) {
            const { container: overContainer, item: overItem } = overItemData;
            const overIndex = overContainer.findIndex(item => item.id === overId);
            
            if (overIndex !== -1) {
                overContainer.splice(overIndex, 0, activeItem);
            }
            return;
        }
    }));

    setActiveId(null);
    setOverId(null);
  };
  
  const handleDragCancel = () => {
    setActiveId(null);
    setOverId(null);
  }

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
        if (parentId === 'none' || parentId === 'new-column') {
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
            </h1>
            <div className="flex items-center gap-4">
              <Button onClick={() => handleOpenAddDialog('new-column')}>
                <Plus className="mr-2 h-4 w-4" /> Add Category Column
              </Button>
              <Button variant="secondary">PUBLISH</Button>
            </div>
          </div>
        </div>

        <div className="flex-grow p-4 sm:p-6 lg:p-8 overflow-x-auto">
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragStart={handleDragStart}
            onDragOver={handleDragOver}
            onDragEnd={handleDragEnd}
            onDragCancel={handleDragCancel}
          >
            <div className="flex items-start gap-6 pb-4">
              {board.map((column) => (
                <Container
                  key={column.id}
                  id={column.id}
                  label={column.name}
                  items={column.items}
                  onItemClick={setSelectedCategory}
                  onAddItem={handleOpenAddDialog}
                  activeId={activeId}
                  overId={overId}
                />
              ))}
              <div className="w-80 flex-shrink-0">
                <button
                  onClick={() => handleOpenAddDialog('new-column')}
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
