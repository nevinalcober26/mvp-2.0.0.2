'use client';
import { useSortable, SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { UniqueIdentifier } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { SortableItem } from './SortableItem';
import type { Item } from '@/app/dashboard/categories/page';
import { useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

type ContainerProps = {
  id: UniqueIdentifier;
  label: string;
  items: Item[];
  onItemClick: (item: Item) => void;
  onAddItem: (containerId: UniqueIdentifier) => void;
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

export function Container({ id, label, items, onItemClick, onAddItem }: ContainerProps) {
  const { setNodeRef, transform, transition } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };
  
  const allItemIds = useMemo(() => getDescendantIds(items), [items]);

  return (
    <Card
      ref={setNodeRef}
      style={style}
      className="w-80 flex-shrink-0 flex flex-col"
    >
      <CardHeader>
        <CardTitle>{label}</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-2 flex-grow">
        <SortableContext items={allItemIds} strategy={verticalListSortingStrategy}>
          {items.map((item) => (
            <SortableItem key={item.id} item={item} onItemClick={onItemClick}/>
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
  );
}
