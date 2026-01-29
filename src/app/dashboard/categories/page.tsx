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
import { arrayMove } from '@dnd-kit/sortable';

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

// Helper functions for tree operations
function findContainer(board: Column[], id: UniqueIdentifier) {
  if (board.some(c => c.id === id)) {
    return id;
  }
  const findRecursive = (items: Item[]): UniqueIdentifier | undefined => {
    for (const item of items) {
      if (item.id === id) {
        return findContainer(board, item.id);
      }
      if (item.children.length) {
        const childContainer = findRecursive(item.children);
        if (childContainer) {
          return childContainer;
        }
      }
    }
  };
  for (const column of board) {
    const container = findRecursive(column.items);
    if(container) return container
  }
}

function findItem(columns: Column[], itemId: UniqueIdentifier): Item | null {
  for (const column of columns) {
      const search = (items: Item[]): Item | null => {
          for (const item of items) {
              if (item.id === itemId) return item;
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

  const activeItem = useMemo(() => activeId ? findItem(board, activeId) : null, [activeId, board]);

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id);
    setOverId(null);
  };
  
  const handleDragOver = (event: DragOverEvent) => {
    setOverId(event.over?.id ?? null);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    setActiveId(null);
    setOverId(null);
  
    const { active, over } = event;
    if (!over || active.id === over.id) {
      return;
    }
  
    setBoard((board) => produce(board, (draft) => {
        let activeItem: Item | null = null;
  
        // Helper to find and remove an item from anywhere in the tree
        const findAndRemove = (id: UniqueIdentifier, items: Item[]): Item | null => {
            for (let i = 0; i < items.length; i++) {
                if (items[i].id === id) {
                    return items.splice(i, 1)[0];
                }
                if (items[i].children) {
                    const found = findAndRemove(id, items[i].children);
                    if (found) return found;
                }
            }
            return null;
        };
  
        for (const column of draft) {
            activeItem = findAndRemove(active.id, column.items);
            if (activeItem) break;
        }
  
        if (!activeItem) return;
  
        // Helper to insert an item at a specific location
        const findAndInsert = (
            id: UniqueIdentifier,
            items: Item[],
            itemToInsert: Item
        ): boolean => {
            for (let i = 0; i < items.length; i++) {
                if (items[i].id === id) {
                    // Dropping ON an item to nest it
                    if (!items[i].children) items[i].children = [];
                    items[i].children.unshift(itemToInsert); // Add to the beginning of children
                    return true;
                }
                if (items[i].children) {
                    if (findAndInsert(id, items[i].children, itemToInsert)) {
                        return true;
                    }
                }
            }
            return false;
        };
        
        // Find where the 'over' item is to determine drop position
        const findOverLocation = (id: UniqueIdentifier): { list: Item[], index: number } | null => {
            for (const column of draft) {
                const search = (items: Item[]): { list: Item[], index: number } | null => {
                    const index = items.findIndex(item => item.id === id);
                    if (index !== -1) return { list: items, index };
                    for (const item of items) {
                        if (item.children) {
                            const found = search(item.children);
                            if (found) return found;
                        }
                    }
                    return null;
                }
                const found = search(column.items);
                if (found) return found;
            }
            return null;
        };


        // Is the drop target a container column?
        const overColumn = draft.find((col) => col.id === over.id);
        if (overColumn) {
            overColumn.items.push(activeItem);
            return;
        }
        
        // Is the drop target another item?
        const overLocation = findOverLocation(over.id);
        if (overLocation) {
            // Dropping between items (reordering)
            overLocation.list.splice(overLocation.index, 0, activeItem);
        } else {
            // Attempt to drop ON an item (nesting)
            let dropped = false;
            for(const col of draft) {
                if(findAndInsert(over.id, col.items, activeItem)) {
                    dropped = true;
                    break;
                }
            }
            // If nesting fails, it might be a drop on the empty part of a column
            // This case is already handled by `overColumn` logic. If we are here, something is off.
            // As a fallback, we could add it back, but this might not be desired.
        }
    }));
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

        <div className="flex-grow p-4 sm:p-6 lg:p-8 overflow-x-auto" style={{width: "100vw"}}>
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
                  onAddItem={() => handleOpenAddDialog(column.id)}
                  activeId={activeId}
                  overId={overId}
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
