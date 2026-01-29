'use client';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Item as ItemComponent } from './Item';
import type { Item as ItemData } from '@/app/dashboard/categories/page';
import React from 'react';
import {
  SortableContext,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';

type SortableItemProps = {
  item: ItemData;
  onItemClick: (item: ItemData) => void;
};

export function SortableItem({ item, onItemClick }: SortableItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: item.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const hasChildren = item.children && item.children.length > 0;
  
  return (
    <div ref={setNodeRef} style={style} className="flex flex-col gap-2" {...attributes} {...listeners}>
        <ItemComponent id={item.id} name={item.name} onClick={() => onItemClick(item)} />
        {hasChildren && (
             <div className="ml-4 pl-4 border-l border-dashed space-y-2">
                {item.children.map(child => (
                    <SortableItem key={child.id} item={child} onItemClick={onItemClick} />
                ))}
             </div>
        )}
    </div>
  );
}
