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
                  <div className="flex items-center gap-4">
                    <div className="w-24 h-24 rounded-lg border-2 border-dashed flex items-center justify-center bg-muted overflow-hidden">
                      {imagePreview ? (
                        <Image src={imagePreview} alt="Property icon preview" width={96} height={96} className="object-contain" />
                      ) : (
                        <ImageIcon className="h-10 w-10 text-muted-foreground" />
                      )}
                    </div>
                    <div className="flex flex-col gap-2">
                        <Button type="button" variant="outline" onClick={() => fileInputRef.current?.click()}>
                            <Upload className="mr-2 h-4 w-4" /> Upload Image
                        </Button>
                        <Input 
                            type="file" 
                            className="hidden" 
                            ref={fileInputRef} 
                            onChange={handleLogoUpload}
                            accept="image/png, image/jpeg, image/svg+xml"
                        />
                        {imagePreview && (
                            <Button type="button" variant="ghost" className="text-destructive" onClick={clearImage}>
                                <X className="mr-2 h-4 w-4" /> Remove Image
                            </Button>
                        )}
                    </div>
                  </div>
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