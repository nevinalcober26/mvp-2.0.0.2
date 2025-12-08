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
import { Textarea } from '@/components/ui/textarea';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { CategorySheet } from './category-sheet';

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
  editingItemId,
  setEditingItemId,
  handleItemNameChange,
  onDeleteItem,
  onSelect,
}: { 
  item: Item, 
  depth?: number,
  editingItemId: UniqueIdentifier | null;
  setEditingItemId: (id: UniqueIdentifier | null) => void;
  handleItemNameChange: (itemId: UniqueIdentifier, newName: string) => void;
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
  } = useSortable({ id: item.id, data: {type: 'Item'} });

  const style = {
    transform: CSS.Translate.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };
  
  return (
    <div ref={setNodeRef} style={style} {...attributes}>
        <Card className="mb-2" onClick={() => onSelect(item)}>
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
                        <Button variant="ghost" size="icon" className="h-6 w-6" onClick={(e) => e.stopPropagation()}>
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
                        editingItemId={editingItemId}
                        setEditingItemId={setEditingItemId}
                        handleItemNameChange={handleItemNameChange}
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
  editingItemId,
  setEditingItemId,
  handleItemNameChange,
  onDeleteColumn,
  onDeleteItem,
  onSelect,
  isAddingItem,
  onToggleAddItem,
  newItemName,
  setNewItemName
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
  onDeleteColumn: (columnId: UniqueIdentifier) => void;
  onDeleteItem: (itemId: UniqueIdentifier) => void;
  onSelect: (item: Column | Item) => void;
  isAddingItem: boolean;
  onToggleAddItem: () => void;
  newItemName: string;
  setNewItemName: (name: string) => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: column.id, data: { type: 'Column' } });

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
        <SortableItem
            key={item.id}
            item={item}
            depth={depth}
            editingItemId={editingItemId}
            setEditingItemId={setEditingItemId}
            handleItemNameChange={handleItemNameChange}
            onDeleteItem={onDeleteItem}
            onSelect={onSelect}
        />
    );
};


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
            <Badge variant="secondary">{flattenItems(column.items).length}</Badge>
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
        <CardContent className="p-3 min-h-[100px] flex-grow">
          <SortableContext items={allItemIds} strategy={verticalListSortingStrategy}>
            {column.items.map((item) => renderSortableItem(item))}
          </SortableContext>
        </CardContent>
        <CardFooter className="p-3 border-t">
            {isAddingItem ? (
              <div className="w-full space-y-2">
                <Textarea 
                  placeholder="Enter a title for this card..."
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
  const [editingItemId, setEditingItemId] = useState<UniqueIdentifier | null>(null);
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
  
  const findColumn = (columnId: UniqueIdentifier) => board.find(c => c.id === columnId);

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

    const isItemDrag = active.data.current?.type === 'Item';

    if(isItemDrag) {
      setBoard(produce(draft => {
        const { item: activeItem, parent: activeParent, column: activeColumn } = findItemData(activeId);
        
        if (!activeItem || !activeParent || !activeColumn) return;

        // Find where the active item is and remove it
        const activeIndex = activeParent.findIndex(i => i.id === activeId);
        activeParent.splice(activeIndex, 1);
        
        // --- Find Drop Target ---

        // Case 1: Drop over a column
        const overColumn = draft.find(c => c.id === overId);
        if (overColumn) {
          overColumn.items.push(activeItem);
          return;
        }

        // Case 2: Drop over another item
        const { item: overItem, parent: overParent, column: overItemColumn, itemIndexInParent: overIndex } = findItemData(overId);
        
        if (overItem) {
          // Logic to nest inside another item
          if (!overItem.children) {
              overItem.children = [];
          }
          overItem.children.unshift(activeItem);
        } else {
            // Case 3: Reorder within a list (or move to a different column's root)
             const targetColumn = draft.find(c => c.items.some(item => findItemRecursive(overId, [item]).item));
             if (targetColumn) {
                const { parent: targetParent } = findItemRecursive(overId, targetColumn.items);
                if (targetParent) {
                    const overIndex = targetParent.findIndex(i => i.id === overId);
                    targetParent.splice(overIndex + 1, 0, activeItem);
                }
             } else {
                 // Fallback to active column if something goes wrong
                 const originalCol = draft.find(c => c.id === activeColumn.id);
                 if (originalCol) {
                    originalCol.items.push(activeItem);
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
                    editingItemId={editingItemId}
                    setEditingItemId={setEditingItemId}
                    handleItemNameChange={handleItemNameChange}
                    onDeleteColumn={handleDeleteColumn}
                    onDeleteItem={handleDeleteItem}
                    onSelect={setSelectedCategory}
                    isAddingItem={addingToColumnId === column.id}
                    onToggleAddItem={() => handleToggleAddItem(column.id)}
                    newItemName={newItemName}
                    setNewItemName={setNewItemName}
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
