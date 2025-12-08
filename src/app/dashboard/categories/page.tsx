'use client';
import React, { useState, useMemo, useRef, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, GripVertical, MoreHorizontal, CornerDownRight } from 'lucide-react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  DragOverlay,
  UniqueIdentifier,
  DragStartEvent,
  DragOverEvent,
  MeasuringStrategy,
} from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  horizontalListSortingStrategy,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { produce } from 'immer';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

type Item = {
  id: UniqueIdentifier;
  name: string;
  children: Item[];
};

type Column = {
  id: UniqueIdentifier;
  name: string;
  items: Item[];
};

const initialBoardData: Column[] = [
  {
    id: 'food',
    name: 'Food',
    items: [
      { id: 'item-1', name: 'Breakfast', children: [] },
      { id: 'item-2', name: 'Pancakes & French Toast', children: [
        { id: 'item-2-1', name: 'Classic Pancakes', children: [] },
        { id: 'item-2-2', name: 'Blueberry Pancakes', children: [] },
      ]},
      { id: 'item-3', name: 'Keto & Vegan', children: [] },
    ],
  },
  {
    id: 'beverages',
    name: 'Beverages',
    items: [
      { id: 'item-4', name: 'Coffee', children: [] },
      { id: 'item-5', name: 'Juices', children: [] },
    ],
  },
  {
    id: 'specials',
    name: 'Special Offers',
    items: [],
  },
];


function SortableItem({ item, depth = 0 }: { item: Item, depth?: number }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: item.id });

  const style = {
    transform: CSS.Translate.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    marginLeft: `${depth * 24}px`,
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes}>
        <Card className="mb-2" >
            <CardContent className="p-2 flex items-center justify-between">
                <div className="flex items-center gap-2">
                 <button {...listeners} className="cursor-grab p-1 text-muted-foreground hover:text-foreground">
                    <GripVertical className="h-5 w-5" />
                </button>
                {depth > 0 && <CornerDownRight className="h-4 w-4 text-muted-foreground" />}
                <span className="font-medium text-sm">{item.name}</span>
                </div>
                <MoreHorizontal className="h-5 w-5 text-muted-foreground" />
            </CardContent>
        </Card>
        {item.children.length > 0 && (
            <div className="pl-6">
                 <SortableContext items={item.children.map(i => i.id)} strategy={verticalListSortingStrategy}>
                    {item.children.map(child => <SortableItem key={child.id} item={child} depth={depth + 1} />)}
                 </SortableContext>
            </div>
        )}
    </div>
  );
}


function BoardColumn({ 
  column, 
  isEditing, 
  onTitleClick, 
  onTitleChange, 
  onTitleBlur 
}: { 
  column: Column;
  isEditing: boolean;
  onTitleClick: () => void;
  onTitleChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onTitleBlur: () => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: column.id, data: { type: 'Column' }, disabled: isEditing });

  const style = {
    transform: CSS.Translate.toString(transform),
    transition,
    opacity: isDragging ? 0.8 : 1,
  };
  
  const flattenItems = (items: Item[]): Item[] => {
    return items.flatMap(item => [item, ...flattenItems(item.children)]);
  };
  
  const allItemIds = useMemo(() => flattenItems(column.items).map(i => i.id), [column.items]);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isEditing) {
      inputRef.current?.focus();
      inputRef.current?.select();
    }
  }, [isEditing]);

  return (
    <div ref={setNodeRef} style={style} className="flex-shrink-0 w-80">
      <Card className="bg-muted/50">
        <CardHeader className="p-3 flex flex-row items-center justify-between border-b" {...attributes}>
           <div className="flex-grow" onClick={onTitleClick}>
            {isEditing ? (
              <Input
                  ref={inputRef}
                  value={column.name}
                  onChange={onTitleChange}
                  onBlur={onTitleBlur}
                  onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                          onTitleBlur();
                      }
                  }}
                  className="text-base font-semibold border-2 border-primary h-8"
              />
            ) : (
              <CardTitle className="text-base font-semibold cursor-pointer py-1 px-2">
                  {column.name}
              </CardTitle>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="secondary">{flattenItems(column.items).length}</Badge>
            <Button {...listeners} variant="ghost" size="icon" className="h-7 w-7 cursor-grab">
                <MoreHorizontal className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-3 min-h-[100px]">
          <SortableContext items={allItemIds} strategy={verticalListSortingStrategy}>
            {column.items.map((item) => (
              <SortableItem key={item.id} item={item} />
            ))}
          </SortableContext>
        </CardContent>
      </Card>
    </div>
  );
}

export default function CategoriesPage() {
  const [board, setBoard] = useState<Column[]>(initialBoardData);
  const [activeColumn, setActiveColumn] = useState<Column | null>(null);
  const [activeItem, setActiveItem] = useState<Item | null>(null);
  const [editingColumnId, setEditingColumnId] = useState<UniqueIdentifier | null>(null);
  
  const columnIds = useMemo(() => board.map(col => col.id), [board]);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const findColumn = (id: UniqueIdentifier) => board.find(col => col.id === id);

  const findItemAndParent = (itemId: UniqueIdentifier, items: Item[]): {item: Item | null, parent: Item[] | null, index: number} => {
    for (let i = 0; i < items.length; i++) {
        const item = items[i];
        if (item.id === itemId) {
            return { item, parent: items, index: i };
        }
        if (item.children.length > 0) {
            const found = findItemAndParent(itemId, item.children);
            if (found.item) {
                return found;
            }
        }
    }
    return { item: null, parent: null, index: -1 };
  };

  const findItemData = (itemId: UniqueIdentifier) => {
    for (const column of board) {
        const { item, parent, index } = findItemAndParent(itemId, column.items);
        if (item) {
            return { item, parent, columnIndex: board.indexOf(column), itemIndex: index };
        }
    }
    return { item: null, parent: null, columnIndex: -1, itemIndex: -1 };
  }

  const findColumnOfItem = (itemId: UniqueIdentifier): Column | null => {
      for (const column of board) {
          const { item } = findItemAndParent(itemId, column.items);
          if (item) return column;
      }
      return null;
  }

  const handleAddNewColumn = () => {
    const newColumnId = `col-${Date.now()}`;
    setBoard(produce(board => {
        board.push({
            id: newColumnId,
            name: 'New Category',
            items: [],
        });
    }));
    setEditingColumnId(newColumnId);
  };
  
  const handleColumnNameChange = (columnId: UniqueIdentifier, newName: string) => {
    setBoard(produce(board => {
        const column = board.find(c => c.id === columnId);
        if(column) {
            column.name = newName;
        }
    }));
  };

  const handleDragStart = (event: DragStartEvent) => {
    setEditingColumnId(null);
    const { active } = event;
    const activeId = active.id;
    const column = findColumn(activeId);
    if (column) {
      setActiveColumn(column);
      return;
    }
    const { item } = findItemData(activeId);
    if (item) {
      setActiveItem(item);
    }
  };

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event;
    if (!over || !activeItem) return;

    const activeId = active.id;
    const overId = over.id;

    if (activeId === overId) return;

    const activeContainerId = findColumnOfItem(activeId)?.id;
    const overContainerId = findColumn(overId)?.id ?? findColumnOfItem(overId)?.id;
    
    if (!activeContainerId || !overContainerId || activeContainerId !== overContainerId) {
        // This simplified logic only handles reordering within the same column.
        // Moving items between columns or nesting would require more complex logic here.
        return;
    }
    
    setBoard(produce(draft => {
        const activeColumn = draft.find(c => c.id === activeContainerId);
        if (!activeColumn) return;

        const { item: activeItem, parent: activeParent, index: activeIndex } = findItemAndParent(activeId, activeColumn.items);
        if (!activeItem || !activeParent) return;
        
        const { item: overItem, parent: overParent, index: overIndex } = findItemAndParent(overId, activeColumn.items);
        if (!overItem || !overParent) return;

        if (activeParent === overParent) {
          // Reorder in same list
          const [moved] = activeParent.splice(activeIndex, 1);
          overParent.splice(overIndex, 0, moved);
        } else {
            // Move to different level
            const [moved] = activeParent.splice(activeIndex, 1);
            
            // Logic to move into a new parent (overItem) or adjacent to it
            // Simplified: just add as child
            if(overItem.children) {
                overItem.children.push(moved);
            }
        }
    }));
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveColumn(null);
    setActiveItem(null);

    if (!over) return;
    
    const activeId = active.id;
    const overId = over.id;
    if (activeId === overId) return;
    
    const isColumnDrag = active.data.current?.type === 'Column';

    if (isColumnDrag && findColumn(overId)) {
        setBoard(produce(board => {
            const oldIndex = board.findIndex(c => c.id === activeId);
            const newIndex = board.findIndex(c => c.id === overId);
            if (oldIndex !== -1 && newIndex !== -1) {
              const [movedColumn] = board.splice(oldIndex, 1);
              board.splice(newIndex, 0, movedColumn);
            }
        }));
        return;
    }
    
    // The drag over logic should handle most cases, this is a final state update.
    // The logic here would be similar or identical to onDragOver
  };
  
  const flattenItems = (items: Item[]): Item[] => {
    return items.flatMap(item => [item, ...flattenItems(item.children)]);
  };

  return (
    <>
      <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b bg-card px-4 sm:px-6 lg:px-8 justify-between">
        <h1 className="text-xl font-semibold flex items-center gap-2">
          Menu Board Editor
          <Badge variant="destructive">BLOOMSBURY'S (RAS AL KHAIMAH)</Badge>
        </h1>
        <div className="flex items-center gap-4">
          <Button variant="secondary">PUBLISH</Button>
        </div>
      </header>

      <main className="p-4 sm:p-6 lg:p-8 flex-grow">
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragStart={handleDragStart}
          onDragOver={handleDragOver}
          onDragEnd={handleDragEnd}
          measuring={{ droppable: { strategy: MeasuringStrategy.Always } }}
        >
          <div className="flex gap-6 overflow-x-auto pb-4">
              <SortableContext items={columnIds} strategy={horizontalListSortingStrategy}>
                {board.map((column) => (
                  <BoardColumn 
                    key={column.id} 
                    column={column} 
                    isEditing={editingColumnId === column.id}
                    onTitleClick={() => {
                        if (activeColumn) return; // Don't allow edit while dragging column
                        setEditingColumnId(column.id);
                    }}
                    onTitleChange={(e) => handleColumnNameChange(column.id, e.target.value)}
                    onTitleBlur={() => setEditingColumnId(null)}
                  />
                ))}
              </SortableContext>
              <div className="flex-shrink-0 w-80">
                  <Button
                      variant="outline"
                      className="w-full h-full border-dashed flex-col py-12"
                      onClick={handleAddNewColumn}
                  >
                      <Plus className="h-8 w-8 mb-2" />
                      Add New Category
                  </Button>
              </div>
          </div>
          <DragOverlay>
            {activeColumn ? (
                <div className="flex-shrink-0 w-80">
                    <Card className="bg-card opacity-90 shadow-2xl">
                        <CardHeader className="p-3 flex flex-row items-center justify-between border-b">
                          <CardTitle className="text-base font-semibold">{activeColumn.name}</CardTitle>
                        </CardHeader>
                        <CardContent className="p-3 min-h-[100px]">
                            <SortableContext items={flattenItems(activeColumn.items).map(i => i.id)} strategy={verticalListSortingStrategy}>
                                {activeColumn.items.map(item => (
                                    <SortableItem key={item.id} item={item} />
                                ))}
                            </SortableContext>
                        </CardContent>
                    </Card>
                </div>
            ) : null}
            {activeItem ? (
                <Card>
                    <CardContent className="p-2 flex items-center justify-between">
                         <div className="flex items-center gap-2">
                            <GripVertical className="h-5 w-5 text-muted-foreground" />
                            <span className="font-medium text-sm">{activeItem.name}</span>
                        </div>
                    </CardContent>
                </Card>
            ) : null}
          </DragOverlay>
        </DndContext>
      </main>
    </>
  );
}
