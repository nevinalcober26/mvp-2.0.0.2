'use client';
import { useSortable } from '@dnd-kit/sortable';
import { useDroppable, UniqueIdentifier } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import { Item as ItemComponent } from '@/components/dashboard/dnd/Item';
import type { Item as ItemData, Column } from '@/app/dashboard/categories/types';
import React, { useMemo } from 'react';
import {
  SortableContext,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { cn } from '@/lib/utils';


type SortableItemProps = {
  item: ItemData;
  onEditClick: (item: ItemData) => void;
  onScheduleClick: (item: ItemData) => void;
  onAddItem: (parentId: UniqueIdentifier) => void;
  onDeleteItem: (itemId: UniqueIdentifier) => void;
  activeId: UniqueIdentifier | null;
  overId: UniqueIdentifier | null;
  isAnyDrawerOpen: boolean;
  depth?: number;
};

export function SortableItem({ item, onEditClick, onScheduleClick, onAddItem, onDeleteItem, activeId, overId, depth = 0, isAnyDrawerOpen }: SortableItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef: setSortableNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: item.id, data: { type: 'item', item } });
  
  const { setNodeRef: setDroppableNodeRef, isOver } = useDroppable({
    id: item.id,
    data: {
      type: 'item-drop-zone',
      accepts: ['item']
    }
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    '--depth': `${depth * 1.5}rem`,
  } as React.CSSProperties;

  const hasChildren = item.children && item.children.length > 0;
  
  const isOverForNesting = isOver && activeId !== item.id;
  
  const itemChildrenIds = useMemo(() => item.children?.map(child => child.id) ?? [], [item.children]);

  return (
    <div
      ref={setSortableNodeRef}
      style={style}
      className="flex flex-col gap-2"
    >
        <div ref={setDroppableNodeRef}>
            <ItemComponent 
                id={item.id} 
                name={item.name} 
                onClick={() => onEditClick(item)}
                onSchedule={() => onScheduleClick(item)}
                onDelete={() => onDeleteItem(item.id)}
                isOver={isOverForNesting}
                attributes={attributes}
                listeners={listeners}
                childCount={item.children?.length}
            />
        </div>

        {hasChildren && (
            <div className="pl-6 border-l-2 border-dashed ml-3 space-y-2">
                <SortableContext items={itemChildrenIds} strategy={verticalListSortingStrategy} disabled={isAnyDrawerOpen}>
                    {item.children.map(child => (
                        <SortableItem 
                            key={child.id} 
                            item={child} 
                            onEditClick={onEditClick}
                            onScheduleClick={onScheduleClick}
                            onAddItem={onAddItem}
                            onDeleteItem={onDeleteItem}
                            activeId={activeId}
                            overId={overId}
                            depth={depth + 1} 
                            isAnyDrawerOpen={isAnyDrawerOpen}
                        />
                    ))}
                </SortableContext>
            </div>
        )}
    </div>
  );
}
