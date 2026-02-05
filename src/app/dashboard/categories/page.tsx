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
  horizontalListSortingStrategy,
} from '@dnd-kit/sortable';
import { produce } from 'immer';
import Image from 'next/image';

import { DashboardHeader } from '@/components/dashboard/header';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import { CategoriesPageSkeleton } from '@/components/dashboard/skeletons';
import { CategorySheet, type CategoryFormValues as UpdateCategoryFormValues } from './category-sheet';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { AddCategorySheet, type CategoryFormValues } from './add-category-sheet';
import { Container } from '@/components/dashboard/dnd/Container';
import { Item as ItemComponent } from '@/components/dashboard/dnd/Item';
import { mockDataStore } from '@/lib/mock-data-store';
import type { Item, Column } from './types';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

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

const DeleteConfirmationDialog = ({ open, onOpenChange, onConfirm, name, isColumn }: { open: boolean, onOpenChange: (open: boolean) => void, onConfirm: () => void, name: string, isColumn: boolean }) => {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Are you absolutely sure?</DialogTitle>
                    <DialogDescription>
                        This will permanently delete the {isColumn ? 'column' : 'category'} "{name}" and all its sub-categories. This action cannot be undone.
                    </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
                    <Button variant="destructive" onClick={onConfirm}>Delete</Button>
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
  const [isAddCategorySheetOpen, setIsAddCategorySheetOpen] = useState(false);
  const [addCategoryParent, setAddCategoryParent] = useState<
    UniqueIdentifier | 'none' | 'new-column'
  >('none');
  const [deleteTarget, setDeleteTarget] = useState<{ id: UniqueIdentifier; name: string; isColumn: boolean } | null>(null);
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

  const activeElement = useMemo(() => {
    if (!activeId) return null;

    const column = board.find((c) => c.id === activeId);
    if (column) {
      return { type: 'container', data: column as Column };
    }
    
    const item = findItemDeep(board, activeId)?.item;
    if (item) {
      return { type: 'item', data: item as Item };
    }

    return null;
  }, [activeId, board]);

  const columnIds = useMemo(() => board.map((c) => c.id), [board]);

  const findColumnForItemId = useCallback((itemId: UniqueIdentifier): UniqueIdentifier | null => {
      if (board.some(col => col.id === itemId)) {
          return itemId;
      }
      for (const column of board) {
          const hasItem = (items: Item[]): boolean => {
              for (const item of items) {
                  if (item.id === itemId) return true;
                  if (item.children && hasItem(item.children)) {
                      return true;
                  }
              }
              return false;
          };
          if (hasItem(column.items)) {
              return column.id;
          }
      }
      return null;
  }, [board]);

  const handleDragStart = useCallback((event: DragStartEvent) => {
    setActiveId(event.active.id);
    setOverId(event.over?.id ?? null);
  }, []);
  
  const handleDragOver = useCallback((event: DragOverEvent) => {
    setOverId(event.over?.id ?? null);
  }, []);

  const handleDragEnd = useCallback((event: DragEndEvent) => {
    const { active, over } = event;

    setActiveId(null);
    setOverId(null);

    if (!over || active.id === over.id) {
      return;
    }

    const isDraggingColumn = active.data.current?.type === 'container';
    const isDraggingItem = active.data.current?.type === 'item';

    // --- Scenario 1: Reordering Columns ---
    if (isDraggingColumn) {
        setBoard((board) => {
            const activeColumnIndex = board.findIndex((col) => col.id === active.id);
            const overColumnId = findColumnForItemId(over.id);
            
            if (!overColumnId) return board;
            
            const overColumnIndex = board.findIndex((col) => col.id === overColumnId);

            if (activeColumnIndex !== -1 && overColumnIndex !== -1 && activeColumnIndex !== overColumnIndex) {
              return arrayMove(board, activeColumnIndex, overColumnIndex);
            }
            
            return board;
        });
        return;
    }

    // --- Scenario 2: Moving an Item ---
    if (isDraggingItem) {
        setBoard(board => produce(board, draft => {
            const activeItem = findAndRemoveItem(draft, active.id);
            if (!activeItem) return;

            const overIsContainerDropZone = over.data.current?.type === 'container-drop-zone';
            if (overIsContainerDropZone) {
                const overColumn = draft.find(c => c.id === over.id);
                overColumn?.items.push(activeItem);
                return;
            }
            
            const overIsItemDropZone = over.data.current?.type === 'item-drop-zone';
            if (overIsItemDropZone) {
                const parentItemData = findItemDeep(draft, over.id);
                if (parentItemData) {
                    parentItemData.item.children = parentItemData.item.children ?? [];
                    parentItemData.item.children.unshift(activeItem);
                }
                return;
            }

            const overItemData = findItemDeep(draft, over.id);
            if (overItemData) {
                const { container: overContainer } = overItemData;
                const overIndex = overContainer.findIndex(item => item.id === over.id);
                
                if (overIndex !== -1) {
                    overContainer.splice(overIndex, 0, activeItem);
                }
                return;
            }
        }));
    }
  }, [board, findColumnForItemId]);
  
  const handleDragCancel = useCallback(() => {
    setActiveId(null);
    setOverId(null);
  }, []);

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

  const handleAddCategory = (values: CategoryFormValues) => {
    const { name, parentId } = values;
    const newItemId = `item-${Date.now()}`;
    const newCategory: Item = { id: newItemId, name, children: [] };

    setBoard(
      produce((draft) => {
        if (parentId === 'none' || parentId === 'new-column') {
          draft.push({
            id: `col-${Date.now()}`,
            name,
            items: [],
          });
        } else {
          const isColumn = draft.some(col => col.id === parentId);
          if (isColumn) {
            const parentColumn = draft.find((col) => col.id === parentId);
            parentColumn?.items.push(newCategory);
          } else {
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

  const handleUpdateCategory = (id: UniqueIdentifier, values: UpdateCategoryFormValues) => {
    console.log('Updating category:', id, values);
    // In a real app, you would find and update the item in the board state.
    // This could involve moving it if the parentId changed.
    toast({
      title: 'Category Updated',
      description: `"${values.name}" has been successfully updated. (This is a demo, data is not persisted).`,
    });
  };

  const handleOpenAddSheet = (parentId: UniqueIdentifier | 'none' | 'new-column' = 'none') => {
    setAddCategoryParent(parentId);
    setIsAddCategorySheetOpen(true);
  };
  
  const findName = (id: UniqueIdentifier): string => {
    for (const col of board) {
        if (col.id === id) return col.name;
        
        function findInItems(items: Item[]): string | null {
            for (const item of items) {
                if (item.id === id) return item.name;
                if (item.children) {
                    const foundName = findInItems(item.children);
                    if (foundName) return foundName;
                }
            }
            return null;
        }

        const name = findInItems(col.items);
        if (name) return name;
    }
    return '';
  }

  const handleDeleteRequest = (id: UniqueIdentifier, isColumn: boolean = false) => {
    const name = findName(id);
    if (name) {
        setDeleteTarget({ id, name, isColumn });
    }
  };

  const handleConfirmDelete = () => {
    if (!deleteTarget) return;
    
    if (deleteTarget.isColumn) {
        setBoard(board => board.filter(col => col.id !== deleteTarget.id));
    } else {
        setBoard(board => produce(board, draft => {
            findAndRemoveItem(draft, deleteTarget.id);
        }));
    }

    toast({
        title: `${deleteTarget.isColumn ? 'Column' : 'Category'} Deleted`,
        description: `"${deleteTarget.name}" has been removed.`,
    });

    setDeleteTarget(null);
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
            <div>
              <h1 className="text-2xl font-bold">
                Category Builder
              </h1>
              <p className="text-sm text-muted-foreground">
                Organize your menu by creating and managing product categories.
              </p>
            </div>
            <div className="flex items-center gap-4">
              <Button onClick={() => handleOpenAddSheet('new-column')}>
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
            <SortableContext items={columnIds} strategy={horizontalListSortingStrategy}>
              <div className="flex items-start gap-6 pb-4">
                {board.map((column) => (
                  <Container
                    key={column.id}
                    id={column.id}
                    label={column.name}
                    items={column.items}
                    onItemClick={setSelectedCategory}
                    onAddItem={handleOpenAddSheet}
                    onDeleteItem={handleDeleteRequest}
                    activeId={activeId}
                    overId={overId}
                    activeElementType={activeElement?.type}
                  />
                ))}
                <div className="w-80 flex-shrink-0">
                  <button
                    onClick={() => handleOpenAddSheet('new-column')}
                    className="w-full h-full rounded-lg border-2 border-dashed border-muted-foreground/50 bg-card p-6 flex flex-col items-center justify-center gap-2 text-muted-foreground hover:border-primary hover:text-primary hover:bg-primary/5 transition-colors"
                  >
                    <Plus className="h-8 w-8" />
                    <span className="font-semibold">Add Category Column</span>
                  </button>
                </div>
              </div>
            </SortableContext>
            <DragOverlay>
              {activeElement?.type === 'container' ? (
                  <Card className="w-80 shadow-lg bg-card">
                      <CardHeader className="flex-row items-center justify-between">
                          <CardTitle>{(activeElement.data as Column).name}</CardTitle>
                      </CardHeader>
                      <CardContent>
                          <p className="text-sm text-muted-foreground">{(activeElement.data as Column).items.length} top-level items</p>
                      </CardContent>
                  </Card>
              ) : activeElement?.type === 'item' ? (
                <ItemComponent id={activeElement.data.id} name={(activeElement.data as Item).name} />
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
        onUpdateCategory={handleUpdateCategory}
      />
      <AddCategorySheet
        open={isAddCategorySheetOpen}
        onOpenChange={setIsAddCategorySheetOpen}
        onAddCategory={handleAddCategory}
        board={board}
        initialParentId={addCategoryParent}
      />
      <DeleteConfirmationDialog 
        open={!!deleteTarget}
        onOpenChange={() => setDeleteTarget(null)}
        onConfirm={handleConfirmDelete}
        name={deleteTarget?.name ?? ''}
        isColumn={deleteTarget?.isColumn ?? false}
      />
    </>
  );
}
