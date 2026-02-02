'use client';
import { useState, useMemo, useEffect } from 'react';
import Image from 'next/image';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  GripVertical,
  MoreHorizontal,
  PlusCircle,
  ListFilter,
  FileDown,
  Image as ImageIcon,
  ChevronDown,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { DashboardHeader } from '@/components/dashboard/header';
import { cn } from '@/lib/utils';
import type { Product } from './types';
import { mockDataStore } from '@/lib/mock-data-store';
import { ProductSheet } from './product-sheet';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { getStatusBadgeVariant } from './utils';
import { ProductInfoSheet } from './product-info-sheet';

const SortableProductRow = ({
  product,
  onEdit,
  isSelected,
  onRowSelect,
  onRowClick,
}: {
  product: Product;
  onEdit: (product: Product) => void;
  isSelected: boolean;
  onRowSelect: (id: string) => void;
  onRowClick: (product: Product) => void;
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: product.id });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition: transition || undefined,
    position: 'relative',
  };

  return (
    <TableRow
      ref={setNodeRef}
      style={style}
      data-state={isSelected ? 'selected' : undefined}
      onClick={() => onRowClick(product)}
      className={cn(
        "cursor-pointer bg-card transition-shadow",
        isDragging && "z-10 opacity-60 shadow-lg"
      )}
    >
      <TableCell
        className="w-12 px-2"
        onClick={(e) => e.stopPropagation()}
      >
        <div
          className="cursor-grab touch-none p-2"
          {...attributes}
          {...listeners}
        >
          <GripVertical className="h-5 w-5 text-muted-foreground" />
        </div>
      </TableCell>
      <TableCell onClick={(e) => e.stopPropagation()} className="px-4">
        <Checkbox
          checked={isSelected}
          onCheckedChange={() => onRowSelect(product.id)}
          aria-label="Select row"
        />
      </TableCell>
      <TableCell className="w-16 p-2">
        {product.mainImage ? (
          <Image
            src={product.mainImage}
            alt={product.name}
            width={48}
            height={48}
            className="rounded-md object-cover h-12 w-12"
          />
        ) : (
          <div className="flex items-center justify-center h-12 w-12 rounded-md bg-muted text-muted-foreground">
            <ImageIcon className="h-6 w-6" />
          </div>
        )}
      </TableCell>
      <TableCell className="font-medium">{product.name}</TableCell>
      <TableCell>{product.category}</TableCell>
      <TableCell>${product.price.toFixed(2)}</TableCell>
      <TableCell>{product.stock}</TableCell>
      <TableCell>
        <Badge variant={getStatusBadgeVariant(product.status)}>
          {product.status}
        </Badge>
      </TableCell>
      <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button aria-haspopup="true" size="icon" variant="ghost">
              <MoreHorizontal className="h-4 w-4" />
              <span className="sr-only">Toggle menu</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuItem onClick={() => onEdit(product)}>
              Edit
            </DropdownMenuItem>
            <DropdownMenuItem>Duplicate</DropdownMenuItem>
            <DropdownMenuItem className="text-destructive">
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </TableCell>
    </TableRow>
  );
};

export default function ProductsPage() {
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isInfoSheetOpen, setIsInfoSheetOpen] = useState(false);
  const [selectedInfoProduct, setSelectedInfoProduct] = useState<Product | null>(
    null
  );
  const [search, setSearch] = useState('');
  const [selectedRows, setSelectedRows] = useState<string[]>([]);
  const { toast } = useToast();
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    // Simulate fetching data
    setTimeout(() => {
      setAllProducts(mockDataStore.products);
      setIsLoading(false);
    }, 1000);
  }, []);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const filteredProducts = useMemo(() => {
    return allProducts.filter((product) =>
      product.name.toLowerCase().includes(search.toLowerCase())
    );
  }, [allProducts, search]);

  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
  const paginatedProducts = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredProducts.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredProducts, currentPage]);

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      setAllProducts((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over.id);
        if (oldIndex === -1 || newIndex === -1) return items;
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  const handleAddProduct = () => {
    setSelectedProduct(null);
    setIsSheetOpen(true);
  };

  const handleEditProduct = (product: Product) => {
    setSelectedProduct(product);
    setIsSheetOpen(true);
  };

  const handleSaveProduct = (productData: Product) => {
    if (selectedProduct) {
      // Update existing product
      setAllProducts(
        allProducts.map((p) => (p.id === productData.id ? productData : p))
      );
    } else {
      // Add new product
      setAllProducts([
        { ...productData, id: `prod_${Date.now()}` },
        ...allProducts,
      ]);
    }
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedRows(paginatedProducts.map((p) => p.id));
    } else {
      setSelectedRows([]);
    }
  };

  const handleRowSelect = (rowId: string) => {
    setSelectedRows((prev) =>
      prev.includes(rowId)
        ? prev.filter((id) => id !== rowId)
        : [...prev, rowId]
    );
  };

  const handleBulkDelete = () => {
    setAllProducts((products) =>
      products.filter((p) => !selectedRows.includes(p.id))
    );
    toast({
      title: `${selectedRows.length} products deleted.`,
    });
    setSelectedRows([]);
  };

  const handleBulkSetStatus = (status: Product['status']) => {
    setAllProducts((products) =>
      products.map((p) =>
        selectedRows.includes(p.id) ? { ...p, status } : p
      )
    );
    toast({
      title: `${selectedRows.length} products updated to "${status}".`,
    });
    setSelectedRows([]);
  };

  const handleViewDetails = (product: Product) => {
    setSelectedInfoProduct(product);
    setIsInfoSheetOpen(true);
  };

  const handleEditFromInfoSheet = (product: Product) => {
    setIsInfoSheetOpen(false);
    // A slight delay to allow the sheet to close before opening the new one, preventing UI jank
    setTimeout(() => {
      handleEditProduct(product);
    }, 150);
  };

  return (
    <>
      <DashboardHeader />
      <main className="p-4 sm:p-6 lg:p-8 space-y-6">
        <Card>
          <CardHeader>
            <div className="flex items-start justify-between">
              <div>
                <CardTitle>Products</CardTitle>
                <CardDescription>
                  Manage your menu items and their variations.
                </CardDescription>
              </div>
              {selectedRows.length > 0 ? (
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">
                    {selectedRows.length} selected
                  </span>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline">
                        Actions
                        <ChevronDown className="ml-2 h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem
                        onClick={() => handleBulkSetStatus('Draft')}
                      >
                        Set to Draft
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => handleBulkSetStatus('Active')}
                      >
                        Set to Active
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => handleBulkSetStatus('Archived')}
                      >
                        Deactivate (Archive)
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        className="text-destructive"
                        onClick={handleBulkDelete}
                      >
                        Delete products
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm">
                    <FileDown className="mr-2 h-4 w-4" />
                    Export
                  </Button>
                  <Button onClick={handleAddProduct} size="sm">
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Add Product
                  </Button>
                </div>
              )}
            </div>
            <div className="pt-4 flex items-center justify-between">
              <Input
                placeholder="Search products..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setCurrentPage(1);
                }}
                className="max-w-sm"
              />
              <Button variant="outline" size="sm">
                <ListFilter className="mr-2 h-4 w-4" />
                Filter
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="relative w-full overflow-auto">
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
              >
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-12 px-2">
                        <span className="sr-only">Drag Handle</span>
                      </TableHead>
                      <TableHead className="w-12 px-4">
                        <Checkbox
                          checked={
                            paginatedProducts.length > 0 &&
                            selectedRows.length === paginatedProducts.length
                          }
                          onCheckedChange={(value) => handleSelectAll(!!value)}
                          aria-label="Select all"
                        />
                      </TableHead>
                      <TableHead className="w-16 p-2">
                        <span className="sr-only">Image</span>
                      </TableHead>
                      <TableHead>Product</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Price</TableHead>
                      <TableHead>Stock</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>
                        <span className="sr-only">Actions</span>
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <SortableContext
                    items={paginatedProducts.map((p) => p.id)}
                    strategy={verticalListSortingStrategy}
                  >
                    <TableBody>
                      {isLoading ? (
                        [...Array(5)].map((_, i) => (
                          <TableRow key={i}>
                            {[...Array(9)].map((_, j) => (
                              <TableCell key={j}>
                                <div className="h-4 bg-muted rounded animate-pulse"></div>
                              </TableCell>
                            ))}
                          </TableRow>
                        ))
                      ) : paginatedProducts.length > 0 ? (
                        paginatedProducts.map((product) => (
                          <SortableProductRow
                            key={product.id}
                            product={product}
                            onEdit={handleEditProduct}
                            isSelected={selectedRows.includes(product.id)}
                            onRowSelect={handleRowSelect}
                            onRowClick={handleViewDetails}
                          />
                        ))
                      ) : (
                        <TableRow>
                          <TableCell
                            colSpan={9}
                            className="h-24 text-center text-muted-foreground"
                          >
                            No products found.
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </SortableContext>
                </Table>
              </DndContext>
            </div>
          </CardContent>
          <CardFooter className="flex items-center justify-between">
            <div className="text-xs text-muted-foreground">
              Showing{' '}
              <strong>
                {filteredProducts.length === 0
                  ? 0
                  : (currentPage - 1) * itemsPerPage + 1}
              </strong>{' '}
              to{' '}
              <strong>
                {Math.min(
                  currentPage * itemsPerPage,
                  filteredProducts.length
                )}
              </strong>{' '}
              of <strong>{filteredProducts.length}</strong> products
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                disabled={currentPage === 1}
              >
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  setCurrentPage((p) => Math.min(p + 1, totalPages))
                }
                disabled={currentPage === totalPages}
              >
                Next
              </Button>
            </div>
          </CardFooter>
        </Card>
      </main>
      <ProductSheet
        key={selectedProduct?.id || 'new'}
        open={isSheetOpen}
        onOpenChange={setIsSheetOpen}
        product={selectedProduct}
        onSave={handleSaveProduct}
      />
      <ProductInfoSheet
        open={isInfoSheetOpen}
        onOpenChange={setIsInfoSheetOpen}
        product={selectedInfoProduct}
        onEdit={handleEditFromInfoSheet}
      />
    </>
  );
}
