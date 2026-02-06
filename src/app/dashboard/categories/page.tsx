
'use client';
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  DndContext,
  closestCenter,
  MouseSensor,
  TouchSensor,
  useSensor,
  useSensors,
  DragStartEvent,
  DragOverEvent,
  DragEndEvent,
  UniqueIdentifier,
  KeyboardSensor,
  DragOverlay,
  DropAnimation,
  defaultDropAnimationSideEffects,
} from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  arrayMove,
  horizontalListSortingStrategy,
} from '@dnd-kit/sortable';
import { produce } from 'immer';

import { DashboardHeader } from '@/components/dashboard/header';
import { Button } from '@/components/ui/button';
import { Plus, GripVertical } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
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
import { AddCategorySheet, type CategoryFormValues } from './add-category-sheet';
import { Container } from './dnd/Container';
import { mockDataStore } from '@/lib/mock-data-store';
import type { Item, Column, ScheduleRule } from './types';
import { Card, CardHeader, CardTitle } from '@/components/ui/card';
import { CategoryScheduleSheet } from './schedule-sheet';

// Helper functions for tree operations
const findItem = (board: Column[], id: UniqueIdentifier): Item | null => {
    for (const column of board) {
        const findInItems = (items: Item[]): Item | null => {
            for (const item of items) {
                if (item.id === id) return item;
                if (item.children) {
                    const found = findInItems(item.children);
                    if (found) return found;
                }
            }
            return null;
        }
        const found = findInItems(column.items);
        if (found) return found;
    }
    return null;
};

const findAndRemoveItem = (board: Column[], id: UniqueIdentifier): Item | null => {
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

const dropAnimation: DropAnimation = {
  sideEffects: defaultDropAnimationSideEffects({
    styles: {
      active: {
        opacity: '0.5',
      },
    },
  }),
};

export default function CategoriesPage() {
  const [board, setBoard] = useState<Column[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeItem, setActiveItem] = useState<Item | Column | null>(null);
  const [overId, setOverId] = useState<UniqueIdentifier | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<Column | Item | null>(null);
  const [isAddCategorySheetOpen, setIsAddCategorySheetOpen] = useState(false);
  const [isScheduleSheetOpen, setIsScheduleSheetOpen] = useState(false);
  const [schedulingCategory, setSchedulingCategory] = useState<Item | Column | null>(null);
  const [addCategoryParent, setAddCategoryParent] = useState<
    UniqueIdentifier | 'none' | 'new-column'
  >('none');
  const [deleteTarget, setDeleteTarget] = useState<{ id: UniqueIdentifier; name: string; isColumn: boolean } | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const timer = setTimeout(() => {
      try {
        const storedBoard = localStorage.getItem('category-board');
        if (storedBoard) {
          setBoard(JSON.parse(storedBoard));
        } else {
          setBoard(mockDataStore.categories);
        }
      } catch (error) {
        console.error("Could not load categories from localStorage", error);
        setBoard(mockDataStore.categories);
      } finally {
        setIsLoading(false);
      }
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!isLoading) {
      try {
        localStorage.setItem('category-board', JSON.stringify(board));
      } catch (error) {
        console.error("Could not save categories to localStorage", error);
      }
    }
  }, [board, isLoading]);


  const sensors = useSensors(
    useSensor(MouseSensor, {
      activationConstraint: {
        distance: 10,
      },
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 250,
        tolerance: 5,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const columnIds = useMemo(() => board.map((c) => c.id), [board]);
  
  const isAnyDrawerOpen = useMemo(() => isAddCategorySheetOpen || isScheduleSheetOpen || !!selectedCategory, [isAddCategorySheetOpen, isScheduleSheetOpen, selectedCategory]);


  const handleDragStart = useCallback((event: DragStartEvent) => {
    setActiveItem(event.active.data.current?.item as Item | Column | null);
    setOverId(event.over?.id ?? null);
  }, []);
  
  const handleDragOver = useCallback((event: DragOverEvent) => {
    setOverId(event.over?.id ?? null);
  }, []);

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      setActiveItem(null);
      setOverId(null);
      const { active, over } = event;
      if (!over) return;
  
      const isDraggingColumn = active.data.current?.type === 'container';
      
      if (isDraggingColumn) {
        if (active.id !== over.id && board.find(c => c.id === over.id)) {
            setBoard((board) => {
                const oldIndex = board.findIndex((col) => col.id === active.id);
                const newIndex = board.findIndex((col) => col.id === over.id || board.find(c => c.id === over.id)?.items.find(i => i.id === over.id));
                if (newIndex === -1) return board;
                return arrayMove(board, oldIndex, newIndex);
            });
        }
        return;
      }
      
      const isDraggingItem = active.data.current?.type === 'item';

      if (isDraggingItem) {
          const overIsContainer = over.data.current?.type === 'container-drop-zone';
          const overIsItem = over.data.current?.type === 'item-drop-zone';
          
          setBoard(board => produce(board, draft => {
              const activeItem = findAndRemoveItem(draft, active.id);
              if (!activeItem) return;

              if (overIsContainer) {
                  const overColumn = draft.find(c => c.id === over.id);
                  overColumn?.items.push(activeItem);
                  return;
              }

              if (overIsItem) {
                  const findParentAndPush = (items: Item[]): boolean => {
                    for (const item of items) {
                        if (item.id === over.id) {
                            item.children = item.children ?? [];
                            item.children.unshift(activeItem);
                            return true;
                        }
                        if (item.children) {
                            if (findParentAndPush(item.children)) return true;
                        }
                    }
                    return false;
                  }
                  for (const column of draft) {
                    if (findParentAndPush(column.items)) return;
                  }
                  return;
              }

              const findOverAndInsert = (items: Item[]): boolean => {
                for (let i = 0; i < items.length; i++) {
                    if (items[i].id === over.id) {
                        items.splice(i, 0, activeItem);
                        return true;
                    }
                    if (items[i].children) {
                        if (findOverAndInsert(items[i].children)) return true;
                    }
                }
                return false;
              }
               for (const column of draft) {
                if (findOverAndInsert(column.items)) return;
              }
          }));
      }
    },
    []
  );
  
  const handleDragCancel = useCallback(() => {
    setActiveItem(null);
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
    const { name, parentId, ...rest } = values;
    
    setBoard(
      produce((draft) => {
        if (parentId === 'none' || parentId === 'new-column') {
          const newColumn: Column = {
              id: `col-${Date.now()}`,
              name,
              items: [],
              ...rest,
              children: [], // to satisfy type, not used
          };
          draft.push(newColumn);
        } else {
            const newItem: Item = { 
                id: `item-${Date.now()}`, 
                name,
                ...rest,
                children: []
            };
          const isColumn = draft.some(col => col.id === parentId);
          if (isColumn) {
            const parentColumn = draft.find((col) => col.id === parentId);
            parentColumn?.items.push(newItem);
          } else {
            for (const column of draft) {
                if (addItemToParent(column.items, parentId, newItem)) {
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

  const handleUpdateCategory = (id: UniqueIdentifier, values: CategoryFormValues) => {
    const { parentId, ...rest } = values;
    setBoard(
      produce((draft) => {
        
        let currentItem = findAndRemoveItem(draft, id);
        let currentColumn: Column | null = null;
        const columnIndex = draft.findIndex(c => c.id === id);
        
        if (columnIndex !== -1) {
            currentColumn = draft.splice(columnIndex, 1)[0];
        }

        if (currentColumn) {
             Object.assign(currentColumn, rest);
             draft.splice(columnIndex, 0, currentColumn); // put it back
            return;
        }
        
        if (currentItem) {
            Object.assign(currentItem, rest);

            const isNewParentColumn = draft.some(c => c.id === parentId);

            if (parentId === 'none') {
                 draft.push({
                    id: currentItem.id,
                    name: currentItem.name,
                    items: currentItem.children || [],
                    ...rest
                 });
            } else if (isNewParentColumn) {
                const targetColumn = draft.find(c => c.id === parentId);
                targetColumn?.items.push(currentItem);
            } else {
                let parentFound = false;
                for (const column of draft) {
                    if(addItemToParent(column.items, parentId, currentItem)) {
                        parentFound = true;
                        break;
                    }
                }
                if (!parentFound) { // Fallback if parent somehow not found
                    const firstCol = draft[0];
                    if (firstCol) {
                        firstCol.items.push(currentItem);
                    } else { // No columns exist
                        draft.push({ id: `col-${Date.now()}`, name: currentItem.name, items: [currentItem] });
                    }
                }
            }
        }
      })
    );

    toast({
      title: 'Category Updated',
      description: `"${values.name}" has been successfully updated.`,
    });
  };
  
  const handleUpdateColumn = (id: UniqueIdentifier, newName: string) => {
    setBoard(
      produce((draft) => {
        const column = draft.find((col) => col.id === id);
        if (column) {
          column.name = newName;
        }
      })
    );
    toast({
      title: 'Column Updated',
      description: `Column name has been updated to "${newName}".`,
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
  
  const handleEditClick = (itemOrColumn: Item | Column) => {
    setSelectedCategory(itemOrColumn);
  }

  const handleOpenScheduleSheet = (category: Item | Column) => {
    setSchedulingCategory(category);
    setIsScheduleSheetOpen(true);
  };

  const handleSaveSchedule = (id: UniqueIdentifier, schedules: ScheduleRule[]) => {
    setBoard(
        produce((draft) => {
            let category: Item | Column | null = null;
            const colIndex = draft.findIndex(c => c.id === id);
            if (colIndex !== -1) {
                category = draft[colIndex];
            } else {
                category = findItem(draft, id);
            }
            
            if (category) {
                category.schedules = schedules;
            }
        })
    );
    toast({
        title: "Schedule Saved",
        description: "The display schedule has been updated.",
    });
  };

  const activeElementType = activeItem ? (columnIds.includes(activeItem.id) ? 'container' : 'item') : undefined;

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
            sensors={isAnyDrawerOpen ? [] : sensors}
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
                    columnData={column}
                    onEditClick={handleEditClick}
                    onScheduleClick={handleOpenScheduleSheet}
                    onAddItem={handleOpenAddSheet}
                    onDeleteItem={handleDeleteRequest}
                    onUpdateColumn={handleUpdateColumn}
                    activeId={activeItem?.id ?? null}
                    overId={overId}
                    activeElementType={activeElementType}
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
            <DragOverlay dropAnimation={dropAnimation}>
                {activeItem ? (
                    'items' in activeItem ? (
                        <Card className="w-80 shadow-lg opacity-75">
                            <CardHeader className="flex-row items-center justify-between">
                                <div className="flex items-center gap-2 flex-grow min-w-0">
                                    <GripVertical className="h-5 w-5 text-muted-foreground" />
                                    <CardTitle className="truncate">{activeItem.name}</CardTitle>
                                </div>
                            </CardHeader>
                        </Card>
                    ) : (
                        <Card className="p-3 flex items-center justify-between w-[304px] shadow-lg bg-card opacity-75">
                            <div className="flex items-center gap-2">
                                <GripVertical className="h-5 w-5 text-muted-foreground" />
                                <p className="font-medium text-sm">{activeItem.name}</p>
                            </div>
                        </Card>
                    )
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
       <CategoryScheduleSheet
        open={isScheduleSheetOpen}
        onOpenChange={setIsScheduleSheetOpen}
        category={schedulingCategory}
        onSave={handleSaveSchedule}
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
