'use client';
import React from 'react';
import { Card } from '@/components/ui/card';
import { GripVertical, MoreHorizontal, Trash, Clock, Edit } from 'lucide-react';
import { UniqueIdentifier } from '@dnd-kit/core';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

type ItemProps = {
  id: UniqueIdentifier;
  name: string;
  onClick?: () => void;
  onDelete?: () => void;
  isOver?: boolean;
  attributes: any;
  listeners: any;
};

export const Item = React.forwardRef<HTMLDivElement, ItemProps>(
  ({ id, name, onClick, onDelete, isOver, attributes, listeners }, ref) => {
    return (
      <Card
        ref={ref}
        className={cn(
          'p-3 flex items-center justify-between bg-card transition-all',
          isOver && 'ring-2 ring-primary bg-primary/10'
        )}
      >
        <div className="flex items-center gap-2">
          <div
            className="cursor-grab touch-none p-2 -ml-2"
            {...attributes}
            {...listeners}
          >
            <GripVertical className="h-5 w-5 text-muted-foreground" />
          </div>
          <div className="cursor-pointer" onClick={onClick}>
            <p className="font-medium text-sm">{name}</p>
          </div>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={(e) => e.stopPropagation()}
            >
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="end"
            onCloseAutoFocus={(e) => e.preventDefault()}
          >
            <DropdownMenuItem className="cursor-pointer">
              <Clock className="mr-2 h-4 w-4" />
              Schedule
            </DropdownMenuItem>
            <DropdownMenuItem
              onSelect={onClick}
              className="cursor-pointer"
            >
              <Edit className="mr-2 h-4 w-4" />
              Edit
            </DropdownMenuItem>
            <DropdownMenuItem
              onSelect={onDelete}
              className="text-destructive cursor-pointer"
            >
              <Trash className="mr-2 h-4 w-4" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </Card>
    );
  }
);

Item.displayName = 'Item';
