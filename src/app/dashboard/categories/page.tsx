'use client';
import React, { useState, useMemo, useRef, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, GripVertical, MoreHorizontal } from 'lucide-react';
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

type Item = {
  id: UniqueIdentifier;
  name: string;
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
      { id: 'item-1', name: 'Breakfast' },
      { id: 'item-2', name: 'Pancakes & French Toast' },
      { id: 'item-3', name: 'Keto & Vegan' },
    ],
  },
  {
    id: 'beverages',
    name: 'Beverages',
    items: [
      { id: 'item-4', name: 'Coffee' },
      { id: 'item-5', name: 'Juices' },
    ],
  },
  {
    id: 'specials',
    name: 'Special Offers',
    items: [],
  },
];

function SortableItem({ item }: { item: Item }) {
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
  };

  return (
    <Card ref={setNodeRef} style={style} className="mb-3" {...attributes}>
      <CardContent className="p-3 flex items-center justify-between">
        <span className="font-medium text-sm">{item.name}</span>
        <button {...listeners} className="cursor-grab p-1 text-muted-foreground hover:text-foreground">
          <GripVertical className="h-5 w-5" />
        </button>
      </CardContent>
    </Card>
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
  
  const itemIds = useMemo(() => column.items.map(i => i.id), [column.items]);
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
            <Badge variant="secondary">{column.items.length}</Badge>
            <Button {...listeners} variant="ghost" size="icon" className="h-7 w-7 cursor-grab">
                <MoreHorizontal className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-3 min-h-[100px]">
          <SortableContext items={itemIds} strategy={verticalListSortingStrategy}>
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
  const findItem = (id: UniqueIdentifier) => board.flatMap(col => col.items).find(item => item.id === id);
  const findColumnOfItem = (id: UniqueIdentifier) => board.find(col => col.items.some(item => item.id === id));

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
    const item = findItem(activeId);
    if (item) {
      setActiveItem(item);
    }
  };

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over, draggingRect } = event;
    if (!over || !activeItem) return;

    const activeId = active.id;
    const overId = over.id;

    if (activeId === overId) return;

    const activeContainerId = findColumnOfItem(activeId)?.id;
    const overContainerId = findColumn(overId)?.id || findColumnOfItem(overId)?.id;

    if (!activeContainerId || !overContainerId || activeContainerId === overContainerId) {
      return;
    }

    setBoard(produce(board => {
        const activeColumn = board.find(c => c.id === activeContainerId)!;
        const overColumn = board.find(c => c.id === overContainerId)!;
        
        const activeIndex = activeColumn.items.findIndex(i => i.id === activeId);
        const [movedItem] = activeColumn.items.splice(activeIndex, 1);
        
        const isOverAColumn = !!findColumn(overId);
        let overIndex;

        if (isOverAColumn) {
          overIndex = overColumn.items.length;
        } else {
          overIndex = overColumn.items.findIndex(i => i.id === overId);
        }

        overColumn.items.splice(overIndex, 0, movedItem);
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

    // Dragging a column
    if (isColumnDrag) {
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

    // Dragging an item
    const activeContainerId = findColumnOfItem(activeId)?.id;
    const overContainerId = findColumn(overId)?.id || findColumnOfItem(overId)?.id;

    if (!activeContainerId || !overContainerId) return;

    if (activeContainerId === overContainerId) {
      // Just reordering within the same column
      setBoard(produce(board => {
        const column = board.find(c => c.id === activeContainerId)!;
        const oldIndex = column.items.findIndex(i => i.id === activeId);
        const newIndex = column.items.findIndex(i => i.id === overId);
        if (oldIndex !== -1 && newIndex !== -1) {
          const [movedItem] = column.items.splice(oldIndex, 1);
          column.items.splice(newIndex, 0, movedItem);
        }
      }));
    } else {
      // This case is handled by onDragOver, this is a fallback.
      // It is also triggered when dropping an item into an empty column.
        setBoard(produce(board => {
            const activeCol = board.find(c => c.id === activeContainerId)!;
            const overCol = board.find(c => c.id === overContainerId)!;

            const activeIndex = activeCol.items.findIndex(i => i.id === activeId);
            const [movedItem] = activeCol.items.splice(activeIndex, 1);

            let overIndex = overCol.items.findIndex(i => i.id === overId);
            if (overIndex === -1 && findColumn(overId)) {
                overIndex = overCol.items.length;
            } else if (overIndex === -1) {
              // Fallback if not found
              const isDroppingInSameColumn = activeContainerId === overContainerId;
              const overContainer = findColumn(overId);
              if (overContainer) { // dropping on a column
                overIndex = overContainer.items.length;
              } else { // dropping on an item
                const overItemContainer = findColumnOfItem(overId)!;
                overIndex = overItemContainer.items.findIndex(i => i.id === overId);
              }
            }

            overCol.items.splice(overIndex, 0, movedItem);
        }));
    }
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
        >
          <div className="flex gap-6 overflow-x-auto pb-4">
              <SortableContext items={columnIds} strategy={horizontalListSortingStrategy}>
                {board.map((column) => (
                  <BoardColumn 
                    key={column.id} 
                    column={column} 
                    isEditing={editingColumnId === column.id}
                    onTitleClick={() => {
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
                            <SortableContext items={activeColumn.items.map(i => i.id)} strategy={verticalListSortingStrategy}>
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
                    <CardContent className="p-3 flex items-center justify-between">
                        <span className="font-medium text-sm">{activeItem.name}</span>
                        <GripVertical className="h-5 w-5 text-muted-foreground" />
                    </CardContent>
                </Card>
            ) : null}
          </DragOverlay>
        </DndContext>
      </main>
    </>
  );
}
