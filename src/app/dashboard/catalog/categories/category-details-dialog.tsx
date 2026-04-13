
'use client';

import React, { useEffect, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from '@/components/ui/form';
import type { Column } from '@/app/dashboard/categories/types';
import { Upload, ImageIcon, X } from 'lucide-react';
import Image from 'next/image';

const categoryDetailsSchema = z.object({
  id: z.string(),
  name: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  imageUrl: z.string().optional().nullable(),
  enableSpecial: z.boolean().default(false),
});

export type CategoryColumnFormValues = z.infer<typeof categoryDetailsSchema>;

interface CategoryDetailsDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  category: Column | null;
  onUpdate: (data: CategoryColumnFormValues) => void;
}

export function CategoryDetailsDialog({
  isOpen,
  onOpenChange,
  category,
  onUpdate,
}: CategoryDetailsDialogProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const form = useForm<CategoryColumnFormValues>({
    resolver: zodResolver(categoryDetailsSchema),
    defaultValues: {
      id: '',
      name: '',
      description: '',
      imageUrl: null,
      enableSpecial: false,
    },
  });

  useEffect(() => {
    if (category && isOpen) {
      form.reset({
        id: category.id.toString(),
        name: category.name,
        description: category.description || '',
        imageUrl: category.imageUrl || null,
        enableSpecial: category.enableSpecial || false,
      });
      setImagePreview(category.imageUrl || null);
    }
  }, [category, isOpen, form]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setImagePreview(result);
        form.setValue('imageUrl', result, { shouldDirty: true });
      };
      reader.readAsDataURL(file);
    }
  };

  const clearImage = () => {
    setImagePreview(null);
    form.setValue('imageUrl', null, { shouldDirty: true });
    if (fileInputRef.current) fileInputRef.current.value = '';
  }

  const onSubmit = (data: CategoryColumnFormValues) => {
    onUpdate(data);
    onOpenChange(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Category Column</DialogTitle>
          <DialogDescription>
            Update the details for this category column.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Identifier</FormLabel>
                  <FormControl>
                    <Input {...field} disabled className="font-mono bg-muted" />
                  </FormControl>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="imageUrl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Image</FormLabel>
                   <FormControl>
                      <div className="space-y-2">
                          <label className="cursor-pointer block w-full aspect-video max-w-[200px] rounded-lg border-2 border-dashed flex items-center justify-center bg-muted overflow-hidden hover:bg-muted/80 hover:border-primary transition-colors">
                              {imagePreview ? (
                                  <Image src={imagePreview} alt="Category image preview" width={200} height={112} className="object-contain" />
                              ) : (
                                  <div className="text-center text-muted-foreground p-4">
                                      <Upload className="h-8 w-8 mx-auto mb-2" />
                                      <p className="text-sm font-semibold">Click to upload</p>
                                      <p className="text-xs mt-1">16:9 recommended</p>
                                  </div>
                              )}
                              <Input 
                                  type="file" 
                                  className="hidden" 
                                  ref={fileInputRef} 
                                  onChange={handleImageUpload}
                                  accept="image/png, image/jpeg, image/svg+xml"
                              />
                          </label>
                          {imagePreview && (
                              <Button type="button" variant="link" size="sm" className="text-destructive font-semibold px-0 hover:no-underline" onClick={clearImage}>
                                  <X className="mr-1 h-4 w-4" /> Remove Image
                              </Button>
                          )}
                      </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="enableSpecial"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                  <div className="space-y-0.5">
                    <FormLabel>Mark as Special</FormLabel>
                    <FormDescription>
                      Highlight this category on the menu.
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            <DialogFooter className="pt-4">
              <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>Cancel</Button>
              <Button type="submit">Update Category</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
