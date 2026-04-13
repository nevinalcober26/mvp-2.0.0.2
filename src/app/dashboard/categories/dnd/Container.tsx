
'use client';
import { useSortable, SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { useDroppable, UniqueIdentifier } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { SortableItem } from './SortableItem';
import type { Item, Column } from '@/app/dashboard/categories/types';
import { useMemo, useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Plus, MoreHorizontal, Trash, Edit, Clock, GripVertical } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';

type ContainerProps = {
  id: UniqueIdentifier;
  label: string;
  items: Item[];
  columnData: Column;
  onEditClick: (item: Item | Column) => void;
  onScheduleClick: (item: Item | Column) => void;
  onAddItem: (containerId: UniqueIdentifier) => void;
  onDeleteItem: (id: UniqueIdentifier, isColumn?: boolean) => void;
  onOpenColumnDialog: (column: Column) => void;
  activeId: UniqueIdentifier | null;
  overId: UniqueIdentifier | null;
  activeElementType?: 'container' | 'item';
  isAnyDrawerOpen: boolean;
};

const getDescendantIds = (items: Item[]): UniqueIdentifier[] => {
    let ids: UniqueIdentifier[] = [];
    for (const item of items) {
        ids.push(item.id);
        if (item.children && item.children.length > 0) {
            ids = [...ids, ...getDescendantIds(item.children)];
        }
    }
    return ids;
};

const isIdWithinContainer = (
    containerItems: Item[],
    targetId: UniqueIdentifier
  ): boolean => {
    for (const item of containerItems) {
      if (item.id === targetId) return true;
      if (item.children && isIdWithinContainer(item.children, targetId)) {
        return true;
      }
    }
    return false;
  };

export function Container({ id, label, items, columnData, onEditClick, onScheduleClick, onAddItem, onDeleteItem, onOpenColumnDialog, activeId, overId, activeElementType, isAnyDrawerOpen }: ContainerProps) {
  const { setNodeRef: setSortableNodeRef, transform, transition, attributes, listeners } = useSortable({ id, data: { type: 'container', item: columnData } });
  const { setNodeRef: setDroppableNodeRef, isOver } = useDroppable({
    id: id,
    data: {
        type: 'container-drop-zone',
        accepts: ['item']
    }
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };
  
  const allItemIds = useMemo(() => getDescendantIds(items), [items]);

  const isDraggingItem = activeElementType === 'item';
  const isDraggingColumn = activeElementType === 'container';

  // Highlight when an item is dragged over this container's droppable area
  const isOverForAnItem = isDraggingItem && isOver && activeId !== id;

  // Highlight when a column is dragged over this container or any of its items
  const overIsThisColumnOrChild = overId === id || (overId && isIdWithinContainer(items, overId));
  const isOverForAColumn = isDraggingColumn && overIsThisColumnOrChild && activeId !== id;
  
  const shouldHighlight = isOverForAnItem || isOverForAColumn;

  const totalDescendants = useMemo(() => {
    let count = 0;
    const countItems = (items: Item[]) => {
      count += items.length;
      items.forEach(item => {
        if(item.children) countItems(item.children);
      });
    }
    countItems(items);
    return count;
  }, [items]);

  return (
    <div ref={setSortableNodeRef} style={style} className="w-80 flex-shrink-0 flex flex-col">
        <Card
        ref={setDroppableNodeRef}
        className={cn("flex-grow flex flex-col transition-shadow", shouldHighlight && "shadow-lg ring-2 ring-primary")}
        >
            <CardHeader
              className="flex-row items-center justify-between"
            >
                <div className="flex items-center gap-2 flex-grow min-w-0">
                  <div className="cursor-grab p-1" {...attributes} {...listeners}>
                    <GripVertical className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <div onDoubleClick={() => onOpenColumnDialog(columnData)} className="cursor-pointer truncate">
                      <CardTitle>{label}</CardTitle>
                      {totalDescendants > 0 && <p className="text-xs text-muted-foreground">{totalDescendants} item{totalDescendants > 1 ? 's' : ''} total</p>}
                  </div>
                </div>

                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8 cursor-pointer">
                            <MoreHorizontal className="h-4 w-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuItem onSelect={() => onScheduleClick(columnData)} className="cursor-pointer">
                            <Clock className="mr-2 h-4 w-4" />
                            Schedule
                        </DropdownMenuItem>
                        <DropdownMenuItem onSelect={() => onEditClick(columnData)} className="cursor-pointer">
                            <Edit className="mr-2 h-4 w-4" />
                            Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem onSelect={() => onDeleteItem(id, true)} className="text-destructive cursor-pointer">
                            <Trash className="mr-2 h-4 w-4" />
                            Delete Column
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </CardHeader>
            <CardContent className={cn("flex flex-col gap-2", items.length > 0 ? 'flex-grow' : 'p-0')}>
                <SortableContext items={allItemIds} strategy={verticalListSortingStrategy} disabled={isAnyDrawerOpen}>
                {items.map((item) => (
                    <SortableItem 
                    key={item.id} 
                    item={item} 
                    onEditClick={onEditClick}
                    onScheduleClick={onScheduleClick}
                    onAddItem={onAddItem}
                    onDeleteItem={onDeleteItem}
                    activeId={activeId}
                    overId={overId}
                    isAnyDrawerOpen={isAnyDrawerOpen}
                    />
                ))}
                </SortableContext>
            </CardContent>
            <CardFooter>
                <Button variant="ghost" className="w-full justify-center" onClick={() => onAddItem(id)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add item
                </Button>
            </CardFooter>
        </Card>
    </div>
  );
}
