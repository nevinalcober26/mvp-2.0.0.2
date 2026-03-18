'use client';

import { useEffect, useState, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
  SheetClose,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import Image from 'next/image';
import { Upload, ImageIcon, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import type { Property } from './types';

const propertySchema = z.object({
  name: z.string().min(1, 'Property name is required'),
  imageUrl: z.string().nullable().optional(),
});

type PropertyFormValues = z.infer<typeof propertySchema>;

interface PropertySheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  property: Property | null;
  onSave: (data: Property) => void;
}

export function PropertySheet({ open, onOpenChange, property, onSave }: PropertySheetProps) {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const form = useForm<PropertyFormValues>({
    resolver: zodResolver(propertySchema),
    defaultValues: {
      name: '',
      imageUrl: null,
    },
  });
  
  useEffect(() => {
      if (open) {
          if (property) {
              form.reset({
                  name: property.name,
                  imageUrl: property.imageUrl,
              });
              setImagePreview(property.imageUrl);
          } else {
              form.reset({
                  name: '',
                  imageUrl: null,
              });
              setImagePreview(null);
          }
      }
  }, [property, open, form]);

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
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

  const onSubmit = (data: PropertyFormValues) => {
    const finalData: Property = {
      id: property?.id || `prop_${Date.now()}`,
      name: data.name,
      imageUrl: data.imageUrl || null,
    };

    onSave(finalData);
    toast({
      title: property ? 'Property Updated' : 'Property Created',
      description: `Property "${finalData.name}" has been saved.`,
    });
    onOpenChange(false);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-lg">
        <SheetHeader>
          <SheetTitle>{property ? 'Edit' : 'Add'} Property</SheetTitle>
          <SheetDescription>
            Manage a property tag and its associated icon.
          </SheetDescription>
        </SheetHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8 pt-6">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Property Name</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Spicy" {...field} />
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
                  <FormLabel>Property Icon</FormLabel>
                   <FormControl>
                      <div className="space-y-2">
                          <label className="cursor-pointer block w-full aspect-square max-w-[160px] rounded-lg border-2 border-dashed flex items-center justify-center bg-muted overflow-hidden hover:bg-muted/80 hover:border-primary transition-colors">
                              {imagePreview ? (
                                  <Image src={imagePreview} alt="Property icon preview" width={160} height={160} className="object-contain" />
                              ) : (
                                  <div className="text-center text-muted-foreground p-4">
                                      <Upload className="h-8 w-8 mx-auto mb-2" />
                                      <p className="text-sm font-semibold">Click to upload an image</p>
                                      <p className="text-xs mt-1">100x100 pixels recommended</p>
                                  </div>
                              )}
                              <Input 
                                  type="file" 
                                  className="hidden" 
                                  ref={fileInputRef} 
                                  onChange={handleLogoUpload}
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
                  <FormDescription>
                    Use a transparent PNG or SVG for best results.
                  </FormDescription>
                   <FormMessage />
                </FormItem>
              )}
            />

            <SheetFooter>
              <SheetClose asChild><Button type="button" variant="ghost">Cancel</Button></SheetClose>
              <Button type="submit">Save Property</Button>
            </SheetFooter>
          </form>
        </Form>
      </SheetContent>
    </Sheet>
  );
}
