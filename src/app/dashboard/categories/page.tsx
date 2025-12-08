'use client';
import React, { useState, useMemo, useRef, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardFooter,
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


function SortableItem({ 
  item, 
  depth = 0,
  isEditing,
  onTitleClick,
  onTitleChange,
  onTitleBlur,
}: { 
  item: Item, 
  depth?: number,
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
  } = useSortable({ id: item.id, data: {type: 'Item'} });

  const style = {
    transform: CSS.Translate.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isEditing) {
      inputRef.current?.focus();
      inputRef.current?.select();
    }
  }, [isEditing]);

  return (
    <div ref={setNodeRef} style={style} {...attributes}>
        <Card className="mb-2" >
            <CardContent className="p-2 flex items-center justify-between">
                <div className="flex items-center gap-2 flex-grow">
                 <button {...listeners} className="cursor-grab p-1 text-muted-foreground hover:text-foreground">
                    <GripVertical className="h-5 w-5" />
                </button>
                {[...Array(depth)].map((_, i) => (
                  <CornerDownRight key={i} className="h-4 w-4 text-muted-foreground" />
                ))}
                 <div className="flex-grow" onClick={onTitleClick}>
                  {isEditing ? (
                     <Input
                        ref={inputRef}
                        value={item.name}
                        onChange={onTitleChange}
                        onBlur={onTitleBlur}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                                onTitleBlur();
                            }
                        }}
                        className="text-sm font-medium border-2 border-primary h-7"
                    />
                  ) : (
                    <span className="font-medium text-sm cursor-pointer py-1 px-2 block">{item.name}</span>
                  )}
                 </div>
                </div>
                <MoreHorizontal className="h-5 w-5 text-muted-foreground" />
            </CardContent>
        </Card>
        {item.children && item.children.length > 0 && (
            <div className="pl-6">
                 <SortableContext items={item.children.map(i => i.id)} strategy={verticalListSortingStrategy}>
                    {item.children.map(child => <SortableItem 
                        key={child.id} 
                        item={child} 
                        depth={depth + 1} 
                        isEditing={isEditing && child.id === (isEditing as any)}
                        onTitleClick={() => onTitleClick()}
                        onTitleChange={onTitleChange}
                        onTitleBlur={onTitleBlur}
                      />)}
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
  onTitleBlur,
  onAddItem,
  editingItemId,
  setEditingItemId,
  handleItemNameChange,
}: { 
  column: Column;
  isEditing: boolean;
  onTitleClick: () => void;
  onTitleChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onTitleBlur: () => void;
  onAddItem: () => void;
  editingItemId: UniqueIdentifier | null;
  setEditingItemId: (id: UniqueIdentifier | null) => void;
  handleItemNameChange: (itemId: UniqueIdentifier, newName: string) => void;
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
    return items.flatMap(item => [item, ...flattenItems(item.children || [])]);
  };
  
  const allItemIds = useMemo(() => flattenItems(column.items).map(i => i.id), [column.items]);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isEditing) {
      inputRef.current?.focus();
      inputRef.current?.select();
    }
  }, [isEditing]);
  
  const renderSortableItem = (item: Item, depth = 0) => {
    return (
        <div key={item.id}>
            <SortableItem
                item={item}
                depth={depth}
                isEditing={editingItemId === item.id}
                onTitleClick={() => setEditingItemId(item.id)}
                onTitleChange={(e) => handleItemNameChange(item.id, e.target.value)}
                onTitleBlur={() => setEditingItemId(null)}
            />
            {item.children && item.children.length > 0 && (
                <div className="pl-6">
                    <SortableContext items={item.children.map(i => i.id)} strategy={verticalListSortingStrategy}>
                        {item.children.map(child => renderSortableItem(child, depth + 1))}
                    </SortableContext>
                </div>
            )}
        </div>
    );
};


  return (
    <div ref={setNodeRef} style={style} className="flex-shrink-0 w-80">
      <Card className="bg-muted/50 flex flex-col h-full">
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
        <CardContent className="p-3 min-h-[100px] flex-grow">
          <SortableContext items={allItemIds} strategy={verticalListSortingStrategy}>
            {column.items.map((item) => renderSortableItem(item))}
          </SortableContext>
        </CardContent>
        <CardFooter className="p-3 border-t">
            <Button variant="ghost" className="w-full" onClick={onAddItem}>
                <Plus className="h-4 w-4 mr-2" />
                Add new item
            </Button>
        </CardFooter>
      </Card>
    </div>
  );
}

export default function CategoriesPage() {
  const [board, setBoard] = useState<Column[]>(initialBoardData);
  const [activeColumn, setActiveColumn] = useState<Column | null>(null);
  const [activeItem, setActiveItem] = useState<Item | null>(null);
  const [editingColumnId, setEditingColumnId] = useState<UniqueIdentifier | null>(null);
  const [editingItemId, setEditingItemId] = useState<UniqueIdentifier | null>(null);
  
  const columnIds = useMemo(() => board.map(col => col.id), [board]);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const findItemRecursive = (itemId: UniqueIdentifier, items: Item[]): {item: Item | null, parent: Item[] | null, index: number} => {
      for (let i = 0; i < items.length; i++) {
          const item = items[i];
          if (item.id === itemId) {
              return { item, parent: items, index: i };
          }
          if (item.children && item.children.length > 0) {
              const found = findItemRecursive(itemId, item.children);
              if (found.item) {
                  return found;
              }
          }
      }
      return { item: null, parent: null, index: -1 };
  };

  const findItemData = (itemId: UniqueIdentifier) => {
    for (const column of board) {
        const { item, parent, index } = findItemRecursive(itemId, column.items);
        if (item) {
            return { item, parent, column, itemIndexInParent: index };
        }
    }
    return { item: null, parent: null, column: null, itemIndexInParent: -1 };
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

  const handleItemNameChange = (itemId: UniqueIdentifier, newName: string) => {
      setBoard(produce(draft => {
          const findAndMutate = (items: Item[]) => {
              for (const item of items) {
                  if (item.id === itemId) {
                      item.name = newName;
                      return true;
                  }
                  if (item.children && findAndMutate(item.children)) {
                      return true;
                  }
              }
              return false;
          };

          for (const column of draft) {
              if (findAndMutate(column.items)) {
                  break;
              }
          }
      }));
  };


  const handleAddNewItem = (columnId: UniqueIdentifier) => {
      setBoard(produce(draft => {
          const column = draft.find(c => c.id === columnId);
          if (column) {
              column.items.push({
                  id: `item-${Date.now()}`,
                  name: `New Item`,
                  children: []
              });
          }
      }));
  }

  const handleDragStart = (event: DragStartEvent) => {
    setEditingColumnId(null);
    setEditingItemId(null);
    const { active } = event;
    const activeId = active.id;
    if (active.data.current?.type === 'Column') {
      setActiveColumn(board.find(col => col.id === activeId) || null);
      return;
    }
    if(active.data.current?.type === 'Item') {
      const { item } = findItemData(activeId);
      setActiveItem(item);
    }
  };

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event;
    if (!over || !active.data.current?.type) return;

    const activeId = active.id;
    const overId = over.id;

    if (activeId === overId) return;

    if (active.data.current.type !== 'Item') return;

    setBoard(produce(draft => {
        let activeItemData: Item | null = null;
        let sourceParent: Item[] | null = null;
        let sourceColumn: Column | null = null;
        let sourceIndex = -1;

        // Find and remove the active item from its original position
        for (const col of draft) {
            const { item, parent, index } = findItemRecursive(activeId, col.items);
            if (item) {
                activeItemData = item;
                sourceParent = parent;
                sourceColumn = col;
                sourceIndex = index;
                sourceParent!.splice(sourceIndex, 1);
                break;
            }
        }
        
        if (!activeItemData) return;

        // Now, find where to place it
        
        // Case 1: Dropping into a column directly
        const overIsColumn = draft.some(c => c.id === overId);
        if (overIsColumn) {
            const targetColumn = draft.find(c => c.id === overId);
            if(targetColumn) {
              targetColumn.items.push(activeItemData);
            }
            return;
        }

        // Case 2: Dropping on another item (to nest) or near another item (to reorder)
        for (const col of draft) {
            const {item: overItem, parent: overItemParent, index: overItemIndex} = findItemRecursive(overId, col.items);
            if(overItem) {
                // Heuristic: for now, assume dropping ON an item means making it a child.
                // A more robust solution might use drop zones.
                const isDroppingOnItemItself = true; 
                if(isDroppingOnItemItself) {
                    overItem.children.push(activeItemData);
                } else {
                    // This logic for dropping "near" an item is more complex and not fully implemented here
                    // overItemParent!.splice(overItemIndex, 0, activeItemData);
                }
                return; // Stop searching once we've placed the item
            }
        }

        // Case 3: If dropping area isn't an item or a column, put it back in its original column (or handle as needed)
        // For simplicity, we'll try to add it to the original source column if no other target was found.
        const originalColumn = draft.find(c => c.id === sourceColumn?.id);
        if(originalColumn) {
          originalColumn.items.push(activeItemData);
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
  };
  
  const flattenItems = (items: Item[]): Item[] => {
    return items.flatMap(item => [item, ...flattenItems(item.children || [])]);
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
          <div className="flex gap-6 overflow-x-auto pb-4 items-start">
              <SortableContext items={columnIds} strategy={horizontalListSortingStrategy}>
                {board.map((column) => (
                  <BoardColumn 
                    key={column.id} 
                    column={column} 
                    isEditing={editingColumnId === column.id}
                    onTitleClick={() => {
                        if (activeColumn || activeItem) return;
                        setEditingColumnId(column.id);
                    }}
                    onTitleChange={(e) => handleColumnNameChange(column.id, e.target.value)}
                    onTitleBlur={() => setEditingColumnId(null)}
                    onAddItem={() => handleAddNewItem(column.id)}
                    editingItemId={editingItemId}
                    setEditingItemId={setEditingItemId}
                    handleItemNameChange={handleItemNameChange}
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
                                    <SortableItem key={item.id} item={item} isEditing={false} onTitleClick={()=>{}} onTitleChange={()=>{}} onTitleBlur={()=>{}} />
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
