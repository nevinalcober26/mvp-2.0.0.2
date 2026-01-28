'use client';
import React, { useState, useMemo, useRef, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Plus, GripVertical, MoreHorizontal, CornerDownRight, X, LayoutGrid, List, ArrowUpDown } from 'lucide-react';
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
import { CategorySheet, getCategoryOptions } from './category-sheet';
import { cn } from '@/lib/utils';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { DashboardHeader } from '@/components/dashboard/header';


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
        <Card className="mb-2 group/item cursor-pointer" onClick={() => onSelect(item)}>
            <CardContent className="p-2 flex items-center justify-between">
                <div className="flex items-center gap-2 flex-grow">
                 <button {...listeners} className="cursor-grab p-1 text-muted-foreground hover:text-foreground" onClick={(e) => e.stopPropagation()}>
                    <GripVertical className="h-5 w-5" />
                </button>
                {[...Array(depth)].map((_, i) => (
                  <CornerDownRight key={i} className="h-4 w-4 text-muted-foreground" />
                ))}
                 <div className="flex-grow">
                    <span className="font-medium text-sm py-1 px-2 block">{item.name}</span>
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
      <Card>
        <CardHeader {...attributes} className="p-3 flex flex-row items-center justify-between border-b" >
           <div className="flex-grow cursor-pointer" onClick={(e) => { e.stopPropagation(); onTitleClick(); }}>
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
              <CardTitle className="text-base font-semibold py-1 px-2">
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
        <CardContent className={cn(
          'transition-all duration-200', 
          column.items.length > 0 ? 'p-3' : 'p-0',
          isDragging && "min-h-[100px]"
        )}>
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

type ListItem = {
  id: UniqueIdentifier;
  name: string;
  type: 'main' | 'sub';
  depth: number;
  originalItem: Column | Item;
};

const ListView = ({
  board,
  onSelect,
  onDeleteItem,
  onAddCategory,
}: {
  board: Column[];
  onSelect: (item: Column | Item) => void;
  onDeleteItem: (itemId: UniqueIdentifier) => void;
  onAddCategory: () => void;
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState<{ key: keyof ListItem; direction: 'ascending' | 'descending' } | null>({ key: 'name', direction: 'ascending' });
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);

  const flattenedList = useMemo((): ListItem[] => {
    const list: ListItem[] = [];
    board.forEach(column => {
      list.push({ id: column.id, name: column.name, type: 'main', depth: 0, originalItem: column });
      const traverse = (items: Item[], depth: number) => {
        items.forEach(item => {
          list.push({ id: item.id, name: item.name, type: 'sub', depth: depth + 1, originalItem: item });
          if (item.children) {
            traverse(item.children, depth + 1);
          }
        });
      };
      traverse(column.items, 0);
    });
    return list;
  }, [board]);

  const filteredAndSortedList = useMemo(() => {
    let filtered = flattenedList.filter(item => item.name.toLowerCase().includes(searchTerm.toLowerCase()));

    if (sortConfig !== null) {
      filtered.sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key]) {
          return sortConfig.direction === 'ascending' ? -1 : 1;
        }
        if (a[sortConfig.key] > b[sortConfig.key]) {
          return sortConfig.direction === 'ascending' ? 1 : -1;
        }
        return 0;
      });
    }

    return filtered;
  }, [flattenedList, searchTerm, sortConfig]);

  const paginatedList = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredAndSortedList.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredAndSortedList, currentPage, itemsPerPage]);
  
  const totalPages = Math.ceil(filteredAndSortedList.length / itemsPerPage);

  const requestSort = (key: keyof ListItem) => {
    let direction: 'ascending' | 'descending' = 'ascending';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };
  
  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <Input
                placeholder="Search categories..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="max-w-sm"
              />
              <div className="flex items-center space-x-2">
                <p className="text-sm text-muted-foreground">Show</p>
                <Select value={String(itemsPerPage)} onValueChange={(value) => setItemsPerPage(Number(value))}>
                  <SelectTrigger className="w-[80px]">
                    <SelectValue placeholder={itemsPerPage} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="10">10</SelectItem>
                    <SelectItem value="25">25</SelectItem>
                    <SelectItem value="50">50</SelectItem>
                  </SelectContent>
                </Select>
                 <p className="text-sm text-muted-foreground">entries</p>
              </div>
            </div>
             <Button onClick={onAddCategory}>
                <Plus className="mr-2 h-4 w-4" /> Add Category
            </Button>
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>
                <Button variant="ghost" onClick={() => requestSort('name')}>
                  Category Name
                  <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
              </TableHead>
              <TableHead>Type</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedList.map(({ id, name, type, depth, originalItem }) => (
              <TableRow key={id}>
                <TableCell>
                  <div className="flex items-center" style={{ paddingLeft: `${depth * 1.5}rem` }}>
                    {depth > 0 && <CornerDownRight className="h-4 w-4 mr-2 text-muted-foreground" />}
                    <span className="font-medium">{name}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant={type === 'main' ? 'default' : 'outline'}>
                    {type === 'main' ? 'Main Category' : 'Sub Category'}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => onSelect(originalItem)}>Edit</DropdownMenuItem>
                      <DropdownMenuItem onClick={() => onDeleteItem(id)} className="text-red-500">Delete</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
      <CardFooter className="flex items-center justify-between">
         <div className="text-sm text-muted-foreground">
          Showing <strong>{Math.min((currentPage - 1) * itemsPerPage + 1, filteredAndSortedList.length)}</strong> to <strong>{Math.min(currentPage * itemsPerPage, filteredAndSortedList.length)}</strong> of <strong>{filteredAndSortedList.length}</strong> entries
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
          >
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
          >
            Next
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
};

const AddCategoryDialog = ({
  open,
  onOpenChange,
  onAddCategory,
  board,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAddCategory: (name: string, parentId: UniqueIdentifier | 'none') => void;
  board: Column[];
}) => {
  const [name, setName] = useState('');
  const [parentId, setParentId] = useState<string>('none');
  const categoryOptions = useMemo(() => getCategoryOptions(board), [board]);

  const handleSave = () => {
    if (name.trim()) {
      onAddCategory(name, parentId);
      onOpenChange(false);
      setName('');
      setParentId('none');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add New Category</DialogTitle>
          <DialogDescription>
            Enter a name and select a parent for your new category.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="new-category-name">Category Name</Label>
            <Input
              id="new-category-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Desserts"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="parent">Parent</Label>
            <Select value={parentId} onValueChange={setParentId}>
              <SelectTrigger id="parent">
                <SelectValue placeholder="Select a parent category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">None (Top-level)</SelectItem>
                {categoryOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    <span style={{ paddingLeft: `${option.depth * 1.5}rem` }}>
                      {option.depth > 0 && '↳ '}
                      {option.label}
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave}>Save Category</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};


export default function CategoriesPage() {
  const [board, setBoard] = useState<Column[]>(initialBoardData);
  const [activeColumn, setActiveColumn] = useState<Column | null>(null);
  const [activeItem, setActiveItem] = useState<Item | null>(null);
  const [editingColumnId, setEditingColumnId] = useState<UniqueIdentifier | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<Column | Item | null>(null);
  const [addingToColumnId, setAddingToColumnId] = useState<UniqueIdentifier | null>(null);
  const [newItemName, setNewItemName] = useState('');
  const [view, setView] = useState<'board' | 'list'>('board');
  const [isAddCategoryDialogOpen, setIsAddCategoryDialogOpen] = useState(false);
  const { toast } = useToast();

  
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
    const newName = 'New Category';
    const newColumnId = `col-${Date.now()}`;
    setBoard(produce(board => {
        board.push({
            id: newColumnId,
            name: newName,
            items: [],
        });
    }));
    setEditingColumnId(newColumnId);
    toast({
      title: "Category Added",
      description: `"${newName}" has been added.`,
    });
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

  const handleAddCategoryFromDialog = (name: string, parentId: UniqueIdentifier | 'none') => {
    const newItemId = `item-${Date.now()}`;
    const newCategory: Item = { id: newItemId, name, children: [] };

    setBoard(produce(draft => {
      if (parentId === 'none' || !parentId) {
        // Create a new top-level category (column)
        draft.push({
          id: `col-${Date.now()}`,
          name: name,
          items: [],
        });
      } else {
        // Find parent and add as sub-category
        const parentColumn = draft.find(col => col.id === parentId);
        if (parentColumn) {
          parentColumn.items.push(newCategory);
        } else {
          for (const col of draft) {
            const { item: parentItem } = findItemAndParent(parentId, col.items);
            if (parentItem) {
              parentItem.children.push(newCategory);
              break;
            }
          }
        }
      }
    }));
    toast({
      title: "Category Added",
      description: `"${name}" has been successfully added.`,
    });
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
      toast({
        title: "Category Item Added",
        description: `"${newItemName}" has been added.`,
      });
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

     // This function is now only for visual feedback,
     // the actual state change happens in handleDragEnd.
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
        const activeIndex = draft.findIndex(c => c.id === activeId);
        const overIndex = draft.findIndex(c => c.id === overId);
        if (activeIndex !== -1 && overIndex !== -1) {
          const [movedColumn] = draft.splice(activeIndex, 1);
          draft.splice(overIndex, 0, movedColumn);
        }
      }));
      return;
    }
  
    const activeIsItem = active.data.current?.type === 'Item';
    if (activeIsItem) {
      setBoard(produce(draft => {
        let activeItem: Item | null = null;
        let originalParent: Item[] | null = null;
        let originalIndex: number = -1;
  
        // 1. Find and remove the active item from its original position
        for (const col of draft) {
          const { item, parent, index } = findItemAndParent(activeId, col.items);
          if (item) {
            activeItem = item;
            originalParent = parent;
            originalIndex = index;
            parent?.splice(index, 1);
            break;
          }
        }
  
        if (!activeItem) return;
  
        // 2. Find where to drop the item
        
        // Check if dropping on an item (to nest)
        for (const col of draft) {
            const { item: overItem } = findItemAndParent(overId, col.items);
            if (overItem) {
                overItem.children.push(activeItem);
                return; // End the operation
            }
        }

        // Check if dropping into a column
        const targetColumn = draft.find(c => c.id === overId);
        if (targetColumn) {
            targetColumn.items.push(activeItem);
            return;
        }

        // Check if dropping between items (re-ordering)
        for (const col of draft) {
            const { parent, index } = findItemAndParent(overId, col.items);
            if (parent) {
                parent.splice(index, 0, activeItem);
                return;
            }
        }
        
        // If we still haven't dropped it (e.g. invalid drop), return it to its original spot
        if (originalParent) {
            originalParent.splice(originalIndex, 0, activeItem);
        }
      }));
    }
  };
  
  return (
    <>
      <DashboardHeader />
      <main className="p-4 sm:p-6 lg:p-8 flex-grow">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-xl font-semibold flex items-center gap-2">
            Menu Board Editor
            <Badge variant="destructive">BLOOMSBURY'S (RAS AL KHAIMAH)</Badge>
          </h1>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1 rounded-md bg-muted p-1">
              <Button
                variant={view === 'board' ? 'secondary' : 'ghost'}
                size="sm"
                onClick={() => setView('board')}
              >
                <LayoutGrid className="h-4 w-4" />
                <span className="ml-2 hidden sm:inline">Board</span>
              </Button>
              <Button
                variant={view === 'list' ? 'secondary' : 'ghost'}
                size="sm"
                onClick={() => setView('list')}
              >
                <List className="h-4 w-4" />
                <span className="ml-2 hidden sm:inline">List</span>
              </Button>
            </div>
            <Button variant="secondary">PUBLISH</Button>
          </div>
        </div>

        {view === 'board' ? (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
            onDragOver={handleDragOver}
          >
            <div className="flex gap-6 overflow-x-auto pb-4 items-start">
              <SortableContext
                items={columnIds}
                strategy={horizontalListSortingStrategy}
              >
                {board.map((column) => (
                  <BoardColumn
                    key={column.id}
                    column={column}
                    isEditing={editingColumnId === column.id}
                    onTitleClick={() => {
                      setEditingColumnId(column.id);
                      setSelectedCategory(null);
                    }}
                    onTitleChange={(e) =>
                      handleColumnNameChange(column.id, e.target.value)
                    }
                    onTitleBlur={() => setEditingColumnId(null)}
                    onAddItem={() => handleAddNewItem(column.id)}
                    onDeleteColumn={handleDeleteColumn}
                    onDeleteItem={handleDeleteItem}
                    onSelect={(item) => {
                      setEditingColumnId(null);
                      setSelectedCategory(item);
                    }}
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
                      <CardTitle className="text-base font-semibold">
                        {activeColumn.name}
                      </CardTitle>
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
                      <span className="font-medium text-sm">
                        {activeItem.name}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              ) : null}
            </DragOverlay>
          </DndContext>
        ) : (
          <ListView
            board={board}
            onSelect={setSelectedCategory}
            onDeleteItem={handleDeleteItem}
            onAddCategory={() => setIsAddCategoryDialogOpen(true)}
          />
        )}
      </main>
      <CategorySheet
        open={!!selectedCategory}
        onOpenChange={(isOpen) => {
          if (!isOpen) {
            setSelectedCategory(null);
          }
        }}
        category={selectedCategory}
        board={board}
      />
      <AddCategoryDialog
        open={isAddCategoryDialogOpen}
        onOpenChange={setIsAddCategoryDialogOpen}
        onAddCategory={handleAddCategoryFromDialog}
        board={board}
      />
    </>
  );
}