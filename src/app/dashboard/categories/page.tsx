'use client';
import React, { useState, useMemo, useEffect } from 'react';
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
import {
  Plus,
  MoreHorizontal,
  CornerDownRight,
  LayoutGrid,
  List,
  ArrowUpDown,
} from 'lucide-react';
import type { UniqueIdentifier } from '@dnd-kit/core';
import { produce } from 'immer';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { CategorySheet, getCategoryOptions } from './category-sheet';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { DashboardHeader } from '@/components/dashboard/header';
import { CategoriesPageSkeleton } from '@/components/dashboard/skeletons';
import Image from 'next/image';

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
      {
        id: 'item-2',
        name: 'Pancakes & French Toast',
        children: [
          { id: 'item-2-1', name: 'Classic Pancakes', children: [] },
          { id: 'item-2-2', name: 'Blueberry Pancakes', children: [] },
        ],
      },
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
  const [sortConfig, setSortConfig] = useState<{
    key: keyof ListItem;
    direction: 'ascending' | 'descending';
  } | null>({ key: 'name', direction: 'ascending' });
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);

  const flattenedList = useMemo((): ListItem[] => {
    const list: ListItem[] = [];
    board.forEach((column) => {
      list.push({
        id: column.id,
        name: column.name,
        type: 'main',
        depth: 0,
        originalItem: column,
      });
      const traverse = (items: Item[], depth: number) => {
        items.forEach((item) => {
          list.push({
            id: item.id,
            name: item.name,
            type: 'sub',
            depth: depth + 1,
            originalItem: item,
          });
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
    let filtered = flattenedList.filter((item) =>
      item.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

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
    if (
      sortConfig &&
      sortConfig.key === key &&
      sortConfig.direction === 'ascending'
    ) {
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
              <Select
                value={String(itemsPerPage)}
                onValueChange={(value) => setItemsPerPage(Number(value))}
              >
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
                  <div
                    className="flex items-center"
                    style={{ paddingLeft: `${depth * 1.5}rem` }}
                  >
                    {depth > 0 && (
                      <CornerDownRight className="h-4 w-4 mr-2 text-muted-foreground" />
                    )}
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
                      <DropdownMenuItem onClick={() => onSelect(originalItem)}>
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => onDeleteItem(id)}
                        className="text-red-500"
                      >
                        Delete
                      </DropdownMenuItem>
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
          Showing{' '}
          <strong>
            {Math.min(
              (currentPage - 1) * itemsPerPage + 1,
              filteredAndSortedList.length
            )}
          </strong>{' '}
          to{' '}
          <strong>
            {Math.min(
              currentPage * itemsPerPage,
              filteredAndSortedList.length
            )}
          </strong>{' '}
          of <strong>{filteredAndSortedList.length}</strong> entries
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
          >
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() =>
              setCurrentPage((prev) => Math.min(prev + 1, totalPages))
            }
            disabled={currentPage === totalPages}
          >
            Next
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
};

type GalleryItem = {
  id: UniqueIdentifier;
  name: string;
  type: 'main' | 'sub';
  originalItem: Column | Item;
  childrenCount: number;
  parentName?: string;
};

const CategoryCard = ({
  item,
  onSelect,
  onDeleteItem,
}: {
  item: GalleryItem;
  onSelect: (item: Column | Item) => void;
  onDeleteItem: (id: UniqueIdentifier) => void;
}) => {
  const isMainCategory = item.type === 'main';

  return (
    <Card className="group/item hover:shadow-lg transition-shadow flex flex-col">
      <CardHeader className="flex flex-row items-start justify-between pb-2">
        <CardTitle className="text-base font-semibold leading-tight">
          {item.name}
        </CardTitle>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 -mt-2 -mr-2 opacity-0 group-hover/item:opacity-100"
            >
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => onSelect(item.originalItem)}>
              Edit
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => onDeleteItem(item.id)}
              className="text-red-500"
            >
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </CardHeader>
      <CardContent
        onClick={() => onSelect(item.originalItem)}
        className="cursor-pointer flex-grow pb-4"
      >
        <div className="aspect-video bg-muted rounded-md mb-4 flex items-center justify-center">
          <Image
            src={`https://picsum.photos/seed/${item.id}/300/200`}
            width={300}
            height={200}
            alt={item.name}
            className="rounded-md object-cover w-full h-full"
          />
        </div>
        <Badge variant={isMainCategory ? 'default' : 'outline'}>
          {isMainCategory ? 'Main Category' : `Sub-category`}
        </Badge>
      </CardContent>
      <CardFooter className="text-sm text-muted-foreground pt-0 pb-4">
        <p>{item.childrenCount} items</p>
      </CardFooter>
    </Card>
  );
};

const AddCategoryCard = ({ onClick }: { onClick: () => void }) => (
  <Button
    variant="outline"
    className="w-full h-full border-dashed flex-col py-12 justify-center aspect-[4/5] sm:aspect-auto"
    onClick={onClick}
  >
    <Plus className="h-8 w-8 mb-2" />
    Add New Category
  </Button>
);

const GalleryView = ({
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

  const galleryList = useMemo((): GalleryItem[] => {
    const list: GalleryItem[] = [];
    board.forEach((column) => {
      list.push({
        id: column.id,
        name: column.name,
        type: 'main',
        originalItem: column,
        childrenCount: column.items.length,
      });
      const traverse = (items: Item[], parentName: string) => {
        items.forEach((item) => {
          list.push({
            id: item.id,
            name: item.name,
            type: 'sub',
            originalItem: item,
            childrenCount: item.children.length,
            parentName: parentName,
          });
          if (item.children.length > 0) {
            traverse(item.children, item.name);
          }
        });
      };
      traverse(column.items, column.name);
    });
    return list;
  }, [board]);
  
  const filteredList = useMemo(() => {
     return galleryList.filter((item) =>
      item.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [galleryList, searchTerm]);

  return (
    <div>
       <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-4">
            <Input
              placeholder="Search categories..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-sm"
            />
          </div>
           <Button onClick={onAddCategory}>
              <Plus className="mr-2 h-4 w-4" /> Add Category
          </Button>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
        {filteredList.map((item) => (
          <CategoryCard
            key={item.id}
            item={item}
            onSelect={onSelect}
            onDeleteItem={onDeleteItem}
          />
        ))}
        <AddCategoryCard onClick={onAddCategory} />
      </div>
    </div>
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
  const [board, setBoard] = useState<Column[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<Column | Item | null>(
    null
  );
  const [view, setView] = useState<'gallery' | 'list'>('gallery');
  const [isAddCategoryDialogOpen, setIsAddCategoryDialogOpen] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const timer = setTimeout(() => {
      setBoard(initialBoardData);
      setIsLoading(false);
    }, 1500);
    return () => clearTimeout(timer);
  }, []);

  const findItemAndParent = (
    itemId: UniqueIdentifier,
    items: Item[]
  ): { item: Item | null; parent: Item[] | null; index: number } => {
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

  const handleDeleteCategory = (id: UniqueIdentifier) => {
    setBoard(
      produce((draft) => {
        // Try to delete as a column (main category)
        const colIndex = draft.findIndex((c) => c.id === id);
        if (colIndex !== -1) {
          draft.splice(colIndex, 1);
          return;
        }

        // Try to delete as an item (sub-category)
        const findAndRemove = (items: Item[]): boolean => {
          for (let i = 0; i < items.length; i++) {
            if (items[i].id === id) {
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
            return;
          }
        }
      })
    );
    toast({
      title: 'Category Deleted',
      description: 'The category has been removed.',
    });
  };

  const handleAddCategoryFromDialog = (
    name: string,
    parentId: UniqueIdentifier | 'none'
  ) => {
    const newItemId = `item-${Date.now()}`;
    const newCategory: Item = { id: newItemId, name, children: [] };

    setBoard(
      produce((draft) => {
        if (parentId === 'none' || !parentId) {
          // Create a new top-level category (column)
          draft.push({
            id: `col-${Date.now()}`,
            name: name,
            items: [],
          });
        } else {
          // Find parent and add as sub-category
          const parentColumn = draft.find((col) => col.id === parentId);
          if (parentColumn) {
            parentColumn.items.push(newCategory);
          } else {
            for (const col of draft) {
              const { item: parentItem } = findItemAndParent(
                parentId,
                col.items
              );
              if (parentItem) {
                parentItem.children.push(newCategory);
                break;
              }
            }
          }
        }
      })
    );
    toast({
      title: 'Category Added',
      description: `"${name}" has been successfully added.`,
    });
  };

  if (isLoading) {
    return <CategoriesPageSkeleton view={view} />;
  }

  return (
    <>
      <DashboardHeader />
      <main className="p-4 sm:p-6 lg:p-8 flex-grow">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-xl font-semibold flex items-center gap-2">
            Categories
            <Badge variant="destructive">BLOOMSBURY'S (RAS AL KHAIMAH)</Badge>
          </h1>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1 rounded-md bg-muted p-1">
              <Button
                variant={view === 'gallery' ? 'secondary' : 'ghost'}
                size="sm"
                onClick={() => setView('gallery')}
              >
                <LayoutGrid className="h-4 w-4" />
                <span className="ml-2 hidden sm:inline">Gallery</span>
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

        {view === 'gallery' ? (
          <GalleryView
            board={board}
            onSelect={setSelectedCategory}
            onDeleteItem={handleDeleteCategory}
            onAddCategory={() => setIsAddCategoryDialogOpen(true)}
          />
        ) : (
          <ListView
            board={board}
            onSelect={setSelectedCategory}
            onDeleteItem={handleDeleteCategory}
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
