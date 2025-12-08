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
import { Plus, GripVertical, MoreHorizontal, CornerDownRight, X } from 'lucide-react';
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
  verticalListSortingStrategy,
  horizontalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { produce } from 'immer';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { CategorySheet } from './category-sheet';
import { cn } from '@/lib/utils';


export type Item = {
  id: UniqueIdentifier;
  name: string;
  children: Item[];
};

export type Column = {
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
  onDeleteItem,
  onSelect,
}: { 
  item: Item, 
  depth?: number,
  onDeleteItem: (itemId: UniqueIdentifier) => void;
  onSelect: (item: Item) => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: item.id, data: {type: 'Item', item} });

  const style = {
    transform: CSS.Translate.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };
  
  return (
    <div ref={setNodeRef} style={style} {...attributes}>
        <Card className="mb-2 group/item" onClick={() => onSelect(item)}>
            <CardContent className="p-2 flex items-center justify-between">
                <div className="flex items-center gap-2 flex-grow">
                 <button {...listeners} className="cursor-grab p-1 text-muted-foreground hover:text-foreground" onClick={(e) => e.stopPropagation()}>
                    <GripVertical className="h-5 w-5" />
                </button>
                {[...Array(depth)].map((_, i) => (
                  <CornerDownRight key={i} className="h-4 w-4 text-muted-foreground" />
                ))}
                 <div className="flex-grow" onClick={(e) => { e.stopPropagation(); onSelect(item);}}>
                    <span className="font-medium text-sm cursor-pointer py-1 px-2 block">{item.name}</span>
                 </div>
                </div>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-6 w-6 opacity-0 group-hover/item:opacity-100" onClick={(e) => e.stopPropagation()}>
                            <MoreHorizontal className="h-4 w-4 text-muted-foreground" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={(e) => {e.stopPropagation(); onSelect(item);}}>Edit</DropdownMenuItem>
                        <DropdownMenuItem onClick={(e) => {e.stopPropagation(); onDeleteItem(item.id)}} className="text-red-500">Delete</DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </CardContent>
        </Card>
        {item.children && item.children.length > 0 && (
            <div className="pl-6">
                 <SortableContext items={item.children.map(i => i.id)} strategy={verticalListSortingStrategy}>
                    {item.children.map(child => <SortableItem 
                        key={child.id} 
                        item={child} 
                        depth={depth + 1} 
                        onDeleteItem={onDeleteItem}
                        onSelect={onSelect}
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
  onDeleteColumn,
  onDeleteItem,
  onSelect,
  isAddingItem,
  onToggleAddItem,
  newItemName,
  setNewItemName,
  isDragging
}: { 
  column: Column;
  isEditing: boolean;
  onTitleClick: () => void;
  onTitleChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onTitleBlur: () => void;
  onAddItem: () => void;
  onDeleteColumn: (columnId: UniqueIdentifier) => void;
  onDeleteItem: (itemId: UniqueIdentifier) => void;
  onSelect: (item: Column | Item) => void;
  isAddingItem: boolean;
  onToggleAddItem: () => void;
  newItemName: string;
  setNewItemName: (name: string) => void;
  isDragging: boolean;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id: column.id, data: { type: 'Column', column } });

  const style = {
    transform: CSS.Translate.toString(transform),
    transition,
  };
  
  const allItemIds = useMemo(() => {
    const ids: UniqueIdentifier[] = [];
    function recursive(items: Item[]) {
        items.forEach(item => {
            ids.push(item.id);
            if(item.children) {
                recursive(item.children);
            }
        })
    }
    recursive(column.items);
    return ids;
  }, [column.items]);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isEditing) {
      inputRef.current?.focus();
      inputRef.current?.select();
    }
  }, [isEditing]);
  
  return (
    <div ref={setNodeRef} style={style} className="flex-shrink-0 w-80">
      <Card className="bg-muted/50 flex flex-col h-full">
        <CardHeader {...attributes} className="p-3 flex flex-row items-center justify-between border-b" >
           <div className="flex-grow" onClick={(e) => { e.stopPropagation(); onTitleClick(); }}>
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
              <CardTitle className="text-base font-semibold py-1 px-2 cursor-pointer">
                  {column.name}
              </CardTitle>
            )}
          </div>
          <div className="flex items-center gap-0">
            <Badge variant="secondary">{allItemIds.length}</Badge>
             <button {...listeners} className="cursor-grab p-1 text-muted-foreground hover:text-foreground">
                <GripVertical className="h-5 w-5" />
            </button>
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-7 w-7 cursor-pointer" onClick={(e) => e.stopPropagation()}>
                        <MoreHorizontal className="h-4 w-4" />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => onSelect(column)}>Edit</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => onDeleteColumn(column.id)} className="text-red-500">Delete</DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardHeader>
        <CardContent className={cn("p-3", isDragging && "min-h-[100px]")}>
          <SortableContext items={allItemIds} strategy={verticalListSortingStrategy}>
            {column.items.map((item) => (
                <SortableItem
                    key={item.id}
                    item={item}
                    onDeleteItem={onDeleteItem}
                    onSelect={onSelect}
                />
             ))}
          </SortableContext>
        </CardContent>
        <CardFooter className="p-3 border-t">
            {isAddingItem ? (
              <div className="w-full space-y-2">
                <Textarea 
                  placeholder="Enter a title for this category"
                  rows={3}
                  value={newItemName}
                  onChange={(e) => setNewItemName(e.target.value)}
                  autoFocus
                />
                <div className="flex items-center gap-2">
                  <Button onClick={onAddItem}>Add Item</Button>
                  <Button variant="ghost" size="icon" onClick={onToggleAddItem}><X className="h-4 w-4"/></Button>
                </div>
              </div>
            ) : (
              <Button variant="ghost" className="w-full" onClick={onToggleAddItem}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add new item
              </Button>
            )}
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
  const [selectedCategory, setSelectedCategory] = useState<Column | Item | null>(null);
  const [addingToColumnId, setAddingToColumnId] = useState<UniqueIdentifier | null>(null);
  const [newItemName, setNewItemName] = useState('');
  
  const columnIds = useMemo(() => board.map(col => col.id), [board]);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const findItemAndParent = (itemId: UniqueIdentifier, items: Item[]): {item: Item | null, parent: Item[] | null, index: number} => {
      for (let i = 0; i < items.length; i++) {
          const item = items[i];
          if (item.id === itemId) {
              return { item, parent: items, index: i };
          }
          if (item.children && item.children.length > 0) {
              const found = findItemAndParent(itemId, item.children);
              if (found.item) {
                  return found;
              }
          }
      }
      return { item: null, parent: null, index: -1 };
  };

  const findContainer = (id: UniqueIdentifier) => {
    if (board.some(c => c.id === id)) {
        return id;
    }
    for (const col of board) {
        const { item } = findItemAndParent(id, col.items);
        if (item) {
            return col.id;
        }
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
  
  const handleDeleteColumn = (columnId: UniqueIdentifier) => {
    setBoard(produce(board => {
        const index = board.findIndex(c => c.id === columnId);
        if (index !== -1) {
            board.splice(index, 1);
        }
    }));
  };

  const handleDeleteItem = (itemId: UniqueIdentifier) => {
      setBoard(produce(draft => {
          const findAndRemove = (items: Item[]): boolean => {
              for (let i = 0; i < items.length; i++) {
                  if (items[i].id === itemId) {
                      items.splice(i, 1);
                      return true;
                  }
                  if (items[i].children && findAndRemove(items[i].children)) {
                      return true;
                  }
              }
              return false;
          };
          for (const column of draft) {
              if (findAndRemove(column.items)) {
                  break;
              }
          }
      }));
  };


  const handleAddNewItem = (columnId: UniqueIdentifier) => {
      if (!newItemName.trim()) return;
      const newItemId = `item-${Date.now()}`;
      setBoard(produce(draft => {
          const column = draft.find(c => c.id === columnId);
          if (column) {
              column.items.push({
                  id: newItemId,
                  name: newItemName,
                  children: []
              });
          }
      }));
      setNewItemName('');
      setAddingToColumnId(null);
  }
  
  const handleToggleAddItem = (columnId: UniqueIdentifier) => {
    setAddingToColumnId(currentId => (currentId === columnId ? null : columnId));
    setNewItemName('');
  };

  const handleDragStart = (event: DragStartEvent) => {
    setEditingColumnId(null);
    const { active } = event;
    const { id, data } = active;
    if (data.current?.type === 'Column') {
      setActiveColumn(data.current.column);
    } else if (data.current?.type === 'Item') {
      setActiveItem(data.current.item);
    }
  };

  const handleDragOver = (event: DragOverEvent) => {
     const { active, over, draggingRect } = event;
     const overId = over?.id;
     if (!overId || active.id === overId) return;

     const activeIsItem = active.data.current?.type === 'Item';
     if (!activeIsItem) return;

     const overIsItem = over.data.current?.type === 'Item';
     
     if (overIsItem) {
        // This logic makes items children of other items, but can be buggy
        // and cause re-renders. We will do this in onDragEnd instead.
        return;
     }

      setBoard((board) => produce(board, (draft) => {
          let activeItem: Item | null = null;
          let activeParent: Item[] | null = null;
          for (const col of draft) {
              const result = findItemAndParent(active.id, col.items);
              if (result.item) {
                  activeItem = result.item;
                  activeParent = result.parent;
                  break;
              }
          }

          if (!activeItem || !activeParent) return;

          // Check if moving to a different column
          const overCol = draft.find(c => c.id === overId);
          if (overCol && !overCol.items.some(i => i.id === active.id)) {
             const activeIndex = activeParent.findIndex(i => i.id === active.id);
             activeParent.splice(activeIndex, 1);
             overCol.items.push(activeItem);
          }
      }));
  }


  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveColumn(null);
    setActiveItem(null);

    if (!over) return;
    
    const activeId = active.id;
    const overId = over.id;
    if (activeId === overId) return;
    
    const activeIsColumn = active.data.current?.type === 'Column';
    if (activeIsColumn) {
      setBoard(produce(draft => {
        const oldIndex = draft.findIndex(c => c.id === activeId);
        const newIndex = draft.findIndex(c => c.id === overId);
        if (oldIndex !== -1 && newIndex !== -1) {
            const [movedColumn] = draft.splice(oldIndex, 1);
            draft.splice(newIndex, 0, movedColumn);
        }
      }));
      return;
    }

    const activeIsItem = active.data.current?.type === 'Item';
    if(activeIsItem) {
      setBoard(produce(draft => {
          let activeItem: Item | null = null;

          // 1. Find and remove active item from its original position
          for (const col of draft) {
              const { item, parent } = findItemAndParent(activeId, col.items);
              if (item && parent) {
                  activeItem = { ...item };
                  const itemIndex = parent.findIndex(i => i.id === activeId);
                  parent.splice(itemIndex, 1);
                  break;
              }
          }

          if (!activeItem) return;

          // 2. Find drop position and insert the item
          let overParent: Item[] | null = null;
          let overIndex: number = -1;
          
          const { item: overItem, parent: overItemParent, index: overItemIndex } = (() => {
            for (const col of draft) {
              const result = findItemAndParent(overId, col.items);
              if (result.item) return result;
            }
            return {item: null, parent: null, index: -1};
          })();


          if (overItem) { // Dropped on another item
              overItem.children.unshift(activeItem);
          } else { // Dropped in a sortable list or on a column
              const overCol = draft.find(c => c.id === overId);
              if (overCol) { // Dropped on a column
                  overCol.items.push(activeItem);
              } else if (overItemParent) { // Dropped in a list
                 const isBelow = over && active.rect.current.translated && over.rect.top > active.rect.current.translated.top;
                 overItemParent.splice(overItemIndex + (isBelow ? 1 : 0), 0, activeItem);
              } else {
                 // Fallback if we can't find a place, put it back
                  for (const col of initialBoardData) {
                    const { item, parent } = findItemAndParent(activeId, col.items);
                    if(item && parent) {
                        const originalCol = draft.find(c => c.id === col.id);
                        originalCol?.items.push(activeItem);
                        break;
                    }
                  }
              }
          }
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
          onDragEnd={handleDragEnd}
          onDragOver={handleDragOver}
        >
          <div className="flex gap-6 overflow-x-auto pb-4 items-start">
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
                    onAddItem={() => handleAddNewItem(column.id)}
                    onDeleteColumn={handleDeleteColumn}
                    onDeleteItem={handleDeleteItem}
                    onSelect={setSelectedCategory}
                    isAddingItem={addingToColumnId === column.id}
                    onToggleAddItem={() => handleToggleAddItem(column.id)}
                    newItemName={newItemName}
                    setNewItemName={setNewItemName}
                    isDragging={!!activeItem}
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
                            {/* Overlay doesn't need full sortable context */}
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
      <CategorySheet 
        open={!!selectedCategory} 
        onOpenChange={(isOpen) => {
            if (!isOpen) {
                setSelectedCategory(null);
            }
        }}
        category={selectedCategory}
        />
    </>
  );
}
