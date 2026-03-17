
'use client';

import { useState, useCallback, useMemo } from 'react';
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  DragStartEvent,
  DragOverEvent,
  DragEndEvent,
  closestCorners,
  UniqueIdentifier,
} from '@dnd-kit/core';
import { arrayMove, SortableContext, horizontalListSortingStrategy } from '@dnd-kit/sortable';
import { DashboardHeader } from '@/components/dashboard/header';
import { Button } from '@/components/ui/button';
import { PlusCircle, Edit, Trash2, Plus } from 'lucide-react';
import { Container } from '@/app/dashboard/categories/dnd/Container';
import { SortableItem } from '@/app/dashboard/categories/dnd/SortableItem';
import { Item as ItemComponent } from '@/components/dashboard/dnd/Item';
import { AddCategorySheet, type CategoryFormValues } from '@/app/dashboard/categories/add-category-sheet';
import { CategorySheet } from '@/app/dashboard/categories/category-sheet';
import { CategoryScheduleSheet } from '@/app/dashboard/categories/schedule-sheet';
import type { Column, Item, ScheduleRule } from '@/app/dashboard/categories/types';
import { mockDataStore } from '@/lib/mock-data-store';
import { useToast } from '@/hooks/use-toast';
import { produce } from 'immer';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
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


// Helper functions to find items and columns
const findColumn = (board: Column[], id: UniqueIdentifier) => board.find(c => c.id === id);

const findItemRecursive = (items: Item[], id: UniqueIdentifier): { item: Item, parent: Item[] } | undefined => {
  for (const item of items) {
    if (item.id === id) return { item, parent: items };
    if (item.children) {
      const found = findItemRecursive(item.children, id);
      if (found) return found;
    }
  }
  return undefined;
};

const findItem = (board: Column[], id: UniqueIdentifier): { item: Item, parent: Item[], column: Column } | undefined => {
  for (const column of board) {
    const found = findItemRecursive(column.items, id);
    if (found) return { ...found, column };
  }
  return undefined;
};

const findItemParent = (items: Item[], id: UniqueIdentifier): Item | null => {
    for (const item of items) {
        if (item.children.some(child => child.id === id)) {
            return item;
        }
        const found = findItemParent(item.children, id);
        if (found) return found;
    }
    return null;
}

export default function CategoriesPage() {
    const [board, setBoard] = useState<Column[]>(mockDataStore.categories);
    const [activeId, setActiveId] = useState<UniqueIdentifier | null>(null);
    const [activeElement, setActiveElement] = useState<'container' | 'item' | null>(null);
    const [overId, setOverId] = useState<UniqueIdentifier | null>(null);

    // Sheet states
    const [isAddSheetOpen, setIsAddSheetOpen] = useState(false);
    const [initialParentId, setInitialParentId] = useState<UniqueIdentifier | 'none' | 'new-column'>('none');
    const [isEditSheetOpen, setIsEditSheetOpen] = useState(false);
    const [isScheduleSheetOpen, setIsScheduleSheetOpen] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState<Column | Item | null>(null);

    // Delete confirmation dialog state
    const [deleteTarget, setDeleteTarget] = useState<{ id: UniqueIdentifier, isColumn: boolean } | null>(null);

    const { toast } = useToast();

    const sensors = useSensors(useSensor(PointerSensor));

    const activeColumn = useMemo(() => {
        if (activeElement !== 'container' || !activeId) return null;
        return findColumn(board, activeId);
    }, [activeId, activeElement, board]);

    const activeItem = useMemo(() => {
        if (activeElement !== 'item' || !activeId) return null;
        return findItem(board, activeId)?.item;
    }, [activeId, activeElement, board]);

    const handleDragStart = (event: DragStartEvent) => {
        setActiveId(event.active.id);
        setOverId(event.over?.id || null);
        setActiveElement(event.active.data.current?.type);
    };

    const handleDragOver = (event: DragOverEvent) => {
        setOverId(event.over?.id || null);
    };

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;
    
        if (!over || active.id === over.id) {
          resetDragState();
          return;
        }

        const activeType = active.data.current?.type;
        const overType = over.data.current?.type;
        
        setBoard(
          produce(draft => {
            if (activeType === 'container' && overType === 'container') {
                const activeIndex = draft.findIndex(c => c.id === active.id);
                const overIndex = draft.findIndex(c => c.id === over.id);
                if (activeIndex !== -1 && overIndex !== -1) {
                    draft.splice(overIndex, 0, draft.splice(activeIndex, 1)[0]);
                }
            } else if (activeType === 'item') {
                let activeParent: Item[] | undefined;
                let activeItemIndex = -1;
                let activeItemData: Item | undefined;

                for (const col of draft) {
                    const found = findItemRecursive(col.items, active.id);
                    if (found) {
                        activeParent = found.parent;
                        activeItemIndex = activeParent.findIndex(i => i.id === active.id);
                        if(activeItemIndex !== -1) {
                            activeItemData = activeParent[activeItemIndex];
                        }
                        break;
                    }
                }
                
                if (!activeItemData || activeItemIndex === -1 || !activeParent) return;

                // Scenario 1: Dropping over a container (top-level)
                if (overType === 'container-drop-zone') {
                    const overColumn = draft.find(c => c.id === over.id);
                    if (overColumn) {
                        activeParent.splice(activeItemIndex, 1);
                        overColumn.items.push(activeItemData);
                    }
                }
                // Scenario 2: Dropping over another item
                else if (overType === 'item' || overType === 'item-drop-zone') {
                    const overId = over.data.current?.type === 'item-drop-zone' ? over.id : over.id;
                    const { item: overItem, parent: overParent } = findItem(draft, overId) || {};
                    if(overItem && overParent) {
                        const overItemIndex = overParent.findIndex(i => i.id === overId);
                        
                        // Reordering in same list
                        if (activeParent === overParent) {
                           overParent.splice(overItemIndex, 0, activeParent.splice(activeItemIndex, 1)[0]);
                        } else {
                        // Moving to nest
                            activeParent.splice(activeItemIndex, 1);
                            overItem.children = overItem.children || [];
                            overItem.children.push(activeItemData);
                        }
                    }
                }
            }
          })
        );
        resetDragState();
    };

    const resetDragState = () => {
        setActiveId(null);
        setOverId(null);
        setActiveElement(null);
    };

    const handleAddColumn = () => {
        setBoard(produce(board, draft => {
            draft.push({ id: `col_${Date.now()}`, name: 'New Column', items: [] });
        }));
    };
    
    const handleUpdateColumn = (id: UniqueIdentifier, name: string) => {
        setBoard(produce(board, draft => {
            const col = findColumn(draft, id);
            if (col) col.name = name;
        }));
    };

    const handleOpenAddSheet = (parentId: UniqueIdentifier | 'new-column' = 'none') => {
        setInitialParentId(parentId);
        setIsAddSheetOpen(true);
    };

    const handleAddCategory = (values: CategoryFormValues) => {
        const newCategory: Item = {
          id: `item_${Date.now()}`,
          name: values.name,
          description: values.description,
          children: [],
          ...values,
        };
        
        setBoard(
          produce(draft => {
            if (values.parentId === 'none') {
                const newColumn: Column = { id: newCategory.id, name: newCategory.name, items: [], ...values };
                draft.push(newColumn);
            } else {
                const parentCol = findColumn(draft, values.parentId);
                if (parentCol) {
                    parentCol.items.push(newCategory);
                } else {
                    const parentItem = findItem(draft, values.parentId);
                    if (parentItem) {
                        parentItem.item.children = parentItem.item.children || [];
                        parentItem.item.children.push(newCategory);
                    }
                }
            }
          })
        );
        
        toast({ title: "Category Added", description: `"${values.name}" has been created.` });
    };

    const handleEditCategory = (category: Item | Column) => {
        setSelectedCategory(category);
        setIsEditSheetOpen(true);
    };

    const handleUpdateCategory = (id: UniqueIdentifier, values: CategoryFormValues) => {
      setBoard(produce(draft => {
          let itemToMove: Item | Column | undefined;
          let oldParent: Item[] | undefined;
          let oldColumnIndex: number | undefined;

          // Find and remove the item from its old position
          const colIndex = draft.findIndex(c => c.id === id);
          if (colIndex !== -1) {
              itemToMove = draft[colIndex];
              Object.assign(itemToMove, values);
              // if parent is changing, remove from here
              if (values.parentId !== 'none') {
                  draft.splice(colIndex, 1);
              }
          } else {
               for (const [i, col] of draft.entries()) {
                  const found = findItemRecursive(col.items, id);
                  if (found) {
                      oldParent = found.parent;
                      const itemIndex = oldParent.findIndex(i => i.id === id);
                      if(itemIndex !== -1) {
                          itemToMove = oldParent[itemIndex];
                          Object.assign(itemToMove, values);
                          const oldParentId = findItemParent(draft.flatMap(c => c.items), id)?.id || col.id;
                          if (oldParentId.toString() !== values.parentId) {
                            oldParent.splice(itemIndex, 1);
                          }
                      }
                      break;
                  }
              }
          }
          
          if(!itemToMove) return;

          // Add it to its new position
          if (values.parentId === 'none') {
             if (!('items' in itemToMove)) { // if it was an item, make it a column
                const newCol: Column = { ...itemToMove, items: itemToMove.children || [] };
                delete (newCol as any).children;
                if(colIndex === -1) draft.push(newCol); // only push if it was moved
             }
          } else {
              const newParentCol = findColumn(draft, values.parentId);
              if (newParentCol) {
                 if('items' in itemToMove) { // if it was a column, make it an item
                    const newItem: Item = { ...itemToMove, children: itemToMove.items };
                    delete (newItem as any).items;
                    newParentCol.items.push(newItem);
                 } else {
                    newParentCol.items.push(itemToMove as Item);
                 }
              } else {
                  const newParentItem = findItem(draft, values.parentId);
                  if (newParentItem) {
                      newParentItem.item.children = newParentItem.item.children || [];
                      if('items' in itemToMove) { // if it was a column
                          const newItem: Item = { ...itemToMove, children: itemToMove.items };
                          delete (newItem as any).items;
                           newParentItem.item.children.push(newItem);
                      } else {
                           newParentItem.item.children.push(itemToMove as Item);
                      }
                  }
              }
          }
      }));

      toast({ title: "Category Updated", description: `"${values.name}" has been updated.` });
    };

    const handleScheduleCategory = (category: Item | Column) => {
        setSelectedCategory(category);
        setIsScheduleSheetOpen(true);
    };
    
    const handleSaveSchedule = (id: UniqueIdentifier, schedules: ScheduleRule[]) => {
      setBoard(produce(board, (draft) => {
          const col = findColumn(draft, id);
          if (col) {
              col.schedules = schedules;
          } else {
              const item = findItem(draft, id);
              if (item) item.item.schedules = schedules;
          }
      }));
      toast({ title: "Schedule Saved", description: `Display rules have been updated.` });
    }

    const confirmDeleteItem = (id: UniqueIdentifier, isColumn: boolean = false) => {
      setDeleteTarget({ id, isColumn });
    }

    const handleDeleteItem = () => {
        if (!deleteTarget) return;
        const { id, isColumn } = deleteTarget;
        
        let deletedName = '';
        setBoard(produce(board, draft => {
            if (isColumn) {
                const index = draft.findIndex(c => c.id === id);
                if (index !== -1) {
                  deletedName = draft[index].name;
                  draft.splice(index, 1);
                }
            } else {
                for (const col of draft) {
                    const found = findItemRecursive(col.items, id);
                    if (found) {
                        const itemIndex = found.parent.findIndex(i => i.id === id);
                        if (itemIndex > -1) {
                          deletedName = found.parent[itemIndex].name;
                          found.parent.splice(itemIndex, 1);
                        }
                        break;
                    }
                }
            }
        }));
        
        toast({
          variant: "destructive",
          title: "Category Deleted",
          description: `"${deletedName}" has been removed.`
        });
        setDeleteTarget(null);
    };

    const isAnyDrawerOpen = isAddSheetOpen || isEditSheetOpen || isScheduleSheetOpen;
    const boardContainerIds = useMemo(() => board.map(c => c.id), [board]);

  return (
    <>
        <DashboardHeader />
        <main className="flex-1 flex flex-col p-4 sm:p-6 lg:p-8">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-2xl font-bold">Category Builder</h1>
                    <p className="text-muted-foreground">
                    Organize your menu by creating and managing product categories.
                    </p>
                </div>
                <Button onClick={() => handleOpenAddSheet('new-column')}>
                    <PlusCircle className="h-4 w-4 mr-2" />
                    Add Category Column
                </Button>
            </div>
            
            <DndContext
                sensors={sensors}
                onDragStart={handleDragStart}
                onDragOver={handleDragOver}
                onDragEnd={handleDragEnd}
                collisionDetection={closestCorners}
            >
                <ScrollArea className="flex-1 -mb-8">
                  <div className="flex gap-8 pb-8">
                      <SortableContext items={boardContainerIds} strategy={horizontalListSortingStrategy}>
                          {board.map((column) => (
                              <Container
                                  key={column.id}
                                  id={column.id}
                                  label={column.name}
                                  items={column.items}
                                  columnData={column}
                                  onEditClick={handleEditCategory}
                                  onScheduleClick={handleScheduleCategory}
                                  onAddItem={handleOpenAddSheet}
                                  onDeleteItem={confirmDeleteItem}
                                  onUpdateColumn={handleUpdateColumn}
                                  activeId={activeId}
                                  overId={overId}
                                  activeElementType={activeElement || undefined}
                                  isAnyDrawerOpen={isAnyDrawerOpen}
                              />
                          ))}
                      </SortableContext>
                      <div className="w-80 flex-shrink-0">
                          <button
                              onClick={handleAddColumn}
                              className="w-full h-full border-2 border-dashed rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:border-primary transition-colors"
                          >
                              <Plus className="h-8 w-8" />
                              <span className="ml-2">Add Column</span>
                          </button>
                      </div>
                  </div>
                   <ScrollBar orientation="horizontal" />
                </ScrollArea>
                
                <DragOverlay>
                    {activeElement === 'container' && activeColumn ? (
                        <Container id={activeColumn.id} label={activeColumn.name} items={activeColumn.items} columnData={activeColumn} onEditClick={()=>{}} onScheduleClick={()=>{}} onAddItem={()=>{}} onDeleteItem={()=>{}} onUpdateColumn={()=>{}} activeId={null} overId={null} isAnyDrawerOpen={isAnyDrawerOpen} />
                    ) : null}
                    {activeElement === 'item' && activeItem ? (
                        <ItemComponent id={activeItem.id} name={activeItem.name} attributes={{}} listeners={{}} />
                    ) : null}
                </DragOverlay>
            </DndContext>
        </main>
        
        <AddCategorySheet open={isAddSheetOpen} onOpenChange={setIsAddSheetOpen} onAddCategory={handleAddCategory} board={board} initialParentId={initialParentId} />
        <CategorySheet open={isEditSheetOpen} onOpenChange={setIsEditSheetOpen} category={selectedCategory} board={board} onUpdateCategory={handleUpdateCategory} />
        <CategoryScheduleSheet open={isScheduleSheetOpen} onOpenChange={setIsScheduleSheetOpen} category={selectedCategory} onSave={handleSaveSchedule} />
        
        <AlertDialog open={!!deleteTarget} onOpenChange={() => setDeleteTarget(null)}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                    <AlertDialogDescription>This action cannot be undone. This will permanently delete the category and all its sub-categories.</AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={handleDeleteItem} className="bg-destructive hover:bg-destructive/90">Delete</AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    </>
  );
}
