'use client';
import { useSortable, SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { useDroppable, UniqueIdentifier } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { SortableItem } from './SortableItem';
import type { Item, Column } from '@/app/dashboard/categories/types';
import { useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Plus, MoreHorizontal, Trash } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

type ContainerProps = {
  id: UniqueIdentifier;
  label: string;
  items: Item[];
  onItemClick: (item: Item | Column) => void;
  onAddItem: (containerId: UniqueIdentifier) => void;
  onDeleteItem: (id: UniqueIdentifier, isColumn?: boolean) => void;
  activeId: UniqueIdentifier | null;
  overId: UniqueIdentifier | null;
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
}

export function Container({ id, label, items, onItemClick, onAddItem, onDeleteItem, activeId, overId }: ContainerProps) {
  const { setNodeRef: setSortableNodeRef, transform, transition, attributes, listeners } = useSortable({ id, data: { type: 'container' } });
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

  const isOverContainer = isOver && activeId !== id;

  return (
    <div ref={setSortableNodeRef} style={style} className="w-80 flex-shrink-0 flex flex-col">
        <Card
        ref={setDroppableNodeRef}
        className={cn("flex-grow flex flex-col transition-shadow", isOverContainer && "shadow-lg ring-2 ring-primary")}
        >
            <CardHeader 
              className="flex-row items-center justify-between cursor-grab"
              {...attributes}
              {...listeners}
            >
                <CardTitle>{label}</CardTitle>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8 cursor-pointer">
                            <MoreHorizontal className="h-4 w-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => onDeleteItem(id, true)} className="text-destructive cursor-pointer">
                            <Trash className="mr-2 h-4 w-4" />
                            Delete Column
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </CardHeader>
            <CardContent className={cn("flex flex-col gap-2", items.length > 0 ? 'flex-grow' : 'p-0')}>
                <SortableContext items={allItemIds} strategy={verticalListSortingStrategy}>
                {items.map((item) => (
                    <SortableItem 
                    key={item.id} 
                    item={item} 
                    onItemClick={onItemClick}
                    onAddItem={onAddItem}
                    onDeleteItem={onDeleteItem}
                    activeId={activeId}
                    overId={overId}
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
