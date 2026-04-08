'use client';

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetFooter,
  SheetClose,
  SheetDescription,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import {
  Box,
  Image as ImageIcon,
  DollarSign,
  Package,
  Settings,
  Video,
  Edit,
  Leaf,
} from 'lucide-react';
import type { Product } from './types';
import Image from 'next/image';
import { getStatusBadgeVariant } from './utils';

interface ProductInfoSheetProps {
  product: Product | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onEdit: (product: Product) => void;
}

const initialNutritionItems: { id: string; name: string; unit: 'g' | 'mg' | 'kcal'; enabled: boolean; }[] = [
  { id: '1', name: 'Calories', unit: 'kcal', enabled: true },
  { id: '2', name: 'Protein', unit: 'g', enabled: true },
  { id: '3', name: 'Fat', unit: 'g', enabled: true },
  { id: '4', name: 'Carbohydrates', unit: 'g', enabled: true },
  { id: '5', name: 'Sugar', unit: 'g', enabled: true },
  { id: '6', name: 'Sodium', unit: 'mg', enabled: true },
  { id: '7', name: 'Fiber', unit: 'g', enabled: true },
];


export function ProductInfoSheet({
  product,
  open,
  onOpenChange,
  onEdit,
}: ProductInfoSheetProps) {
  if (!product) return null;

  const handleEditClick = () => {
    onEdit(product);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-lg w-full p-0">
        <div className="flex flex-col h-full">
          <SheetHeader className="p-6 border-b bg-muted/50">
            <div className="flex flex-wrap items-start gap-x-4 gap-y-2">
              {product.mainImage ? (
                <Image
                  src={product.mainImage}
                  alt={product.name}
                  width={64}
                  height={64}
                  className="rounded-md object-cover h-16 w-16 border"
                />
              ) : (
                <div className="flex items-center justify-center h-16 w-16 rounded-md bg-muted border text-muted-foreground">
                  <ImageIcon className="h-8 w-8" />
                </div>
              )}
              <div className="flex-1">
                <SheetTitle className="text-2xl">{product.name}</SheetTitle>
                <SheetDescription>{product.smallDescription}</SheetDescription>
                <div className="flex items-center gap-2 mt-2">
                  <Badge variant={getStatusBadgeVariant(product.status)}>
                    {product.status}
                  </Badge>
                  <Badge variant="outline">{product.category}</Badge>
                  <Badge variant="outline">{product.branch}</Badge>
                </div>
              </div>
            </div>
          </SheetHeader>
          <div className="flex-grow overflow-y-auto p-6 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <DollarSign className="h-5 w-5" />
                  Pricing & Stock
                </CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-2 gap-4 pt-4 text-sm">
                <div className="space-y-1">
                  <p className="text-muted-foreground">Base Price</p>
                  <p className="font-mono text-base font-semibold">
                    ${product.price.toFixed(2)}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-muted-foreground">Discounted Price</p>
                  <p
                    className={`font-mono text-base font-semibold ${
                      product.discountedPrice
                        ? 'text-green-600'
                        : 'text-muted-foreground'
                    }`}
                  >
                    {product.discountedPrice
                      ? `$${product.discountedPrice.toFixed(2)}`
                      : 'N/A'}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-muted-foreground">Stock</p>
                  <p className="font-medium">{product.stock} units</p>
                </div>
                <div className="space-y-1">
                  <p className="text-muted-foreground">Status</p>
                  <p className="font-medium">{product.status}</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Box className="h-5 w-5" />
                  Description
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  {product.description || 'No detailed description provided.'}
                </p>
              </CardContent>
            </Card>

            {product.nutrition && Object.keys(product.nutrition).length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Leaf className="h-5 w-5" />
                    Nutritional Information
                  </CardTitle>
                  <CardDescription>Values per serving.</CardDescription>
                </CardHeader>
                <CardContent className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                  {Object.entries(product.nutrition)
                    .filter(([, value]) => typeof value === 'number' && !isNaN(value))
                    .map(([key, value]) => {
                      const nutritionItem = initialNutritionItems.find(item => item.name.toLowerCase().replace(/\s/g, '_') === key);
                      const unit = nutritionItem ? nutritionItem.unit : '';
                      const formattedKey = key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());

                      return (
                        <div key={key} className="flex justify-between border-b pb-2">
                          <span className="text-muted-foreground">{formattedKey}</span>
                          <span className="font-semibold">{value}{unit}</span>
                        </div>
                      );
                    })}
                </CardContent>
              </Card>
            )}

            {product.variations && product.variations.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Package className="h-5 w-5" />
                    Variations
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {product.variations.map((variation, index) => (
                      <div
                        key={index}
                        className="flex justify-between items-center text-sm p-2 rounded-md bg-muted/50"
                      >
                        <div>
                          <p className="font-medium">{variation.value}</p>
                          <p className="text-xs text-muted-foreground">
                            Matrix: {variation.matrix || 'N/A'}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-mono font-semibold">
                            ${variation.priceValue.toFixed(2)}
                          </p>
                          <Badge
                            variant={variation.hidden ? 'secondary' : 'default'}
                          >
                            {variation.hidden ? 'Hidden' : 'Visible'}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  Display Settings
                </CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-2 gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <span
                    className={
                      product.recommend
                        ? 'text-green-500'
                        : 'text-muted-foreground'
                    }
                  >
                    ✓
                  </span>
                  <span>Recommend</span>
                </div>
                <div className="flex items-center gap-2">
                  <span
                    className={
                      product.outOfStock
                        ? 'text-red-500'
                        : 'text-muted-foreground'
                    }
                  >
                    ✓
                  </span>
                  <span>Out of Stock</span>
                </div>
                <div className="flex items-center gap-2">
                  <span
                    className={
                      product.hidden ? 'text-red-500' : 'text-muted-foreground'
                    }
                  >
                    ✓
                  </span>
                  <span>Hidden</span>
                </div>
              </CardContent>
            </Card>

            {product.videoUrl && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Video className="h-5 w-5" />
                    Video
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <a
                    href={product.videoUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-blue-600 hover:underline break-all"
                  >
                    {product.videoUrl}
                  </a>
                </CardContent>
              </Card>
            )}
          </div>
          <SheetFooter className="p-6 border-t bg-background flex-row justify-between w-full">
            <Button variant="default" onClick={handleEditClick}>
              <Edit className="mr-2 h-4 w-4" /> Edit Product
            </Button>
            <SheetClose asChild>
              <Button variant="outline">Close</Button>
            </SheetClose>
          </SheetFooter>
        </div>
      </SheetContent>
    </Sheet>
  );
}
