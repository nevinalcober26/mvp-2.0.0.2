'use client';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Item as ItemComponent } from './Item';
import type { Item as ItemData } from '@/app/dashboard/categories/page';
import React, { useMemo } from 'react';
import {
  SortableContext,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { UniqueIdentifier } from '@dnd-kit/core';

type SortableItemProps = {
  item: ItemData;
  onItemClick: (item: ItemData) => void;
  activeId: UniqueIdentifier | null;
  overId: UniqueIdentifier | null;
  depth?: number;
};

export function SortableItem({ item, onItemClick, activeId, overId, depth = 0 }: SortableItemProps) {
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
  
  const isOver = overId === item.id && activeId !== item.id;
  const isParentOfOver = hasChildren && item.children.some(child => child.id === overId);

  const showTopIndicator = isOver;
  const showBottomIndicator = false; // Simplified for clarity
  const showChildIndicator = isParentOfOver;


  return (
    <div ref={setNodeRef} style={style} className="relative flex flex-col gap-2">
      {showTopIndicator && <div className="absolute -top-1 left-0 right-0 h-1 bg-blue-500 z-10" />}

      <div {...attributes} {...listeners}>
        <ItemComponent id={item.id} name={item.name} onClick={() => onItemClick(item)} />
      </div>

      {hasChildren && (
           <div className="ml-4 pl-4 border-l border-dashed space-y-2 relative">
              {showChildIndicator && <div className="absolute top-0 left-0 right-0 h-1 bg-blue-500 z-10" />}
              {item.children.map(child => (
                  <SortableItem 
                    key={child.id} 
                    item={child} 
                    onItemClick={onItemClick}
                    activeId={activeId}
                    overId={overId}
                    depth={depth + 1} 
                    />
              ))}
           </div>
      )}
      {showBottomIndicator && <div className="absolute -bottom-1 left-0 right-0 h-1 bg-blue-500 z-10" />}
    </div>
  );
}
