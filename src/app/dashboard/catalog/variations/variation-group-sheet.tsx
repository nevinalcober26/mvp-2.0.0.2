'use client';

import React, { useEffect } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
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
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ChevronDown, GripVertical, PlusCircle, Trash, Upload, Image as ImageIcon } from 'lucide-react';
import type { VariationGroup } from './types';
import { useToast } from '@/hooks/use-toast';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Textarea } from '@/components/ui/textarea';
import Image from 'next/image';
import { Switch } from '@/components/ui/switch';

const variationOptionSchema = z.object({
  id: z.string().optional(),
  value: z.string().min(1, 'Option value cannot be empty'),
  photoUrl: z.string().url().optional().or(z.literal('')),
  regularPrice: z.coerce.number().optional(),
  salePrice: z.coerce.number().optional(),
  stock: z.coerce.number().optional(),
  description: z.string().optional(),
  allowMultiQuantity: z.boolean().default(false),
  maxQuantity: z.coerce.number().optional(),
});

const variationGroupSchema = z.object({
  name: z.string().min(1, 'Group name is required'),
  sortOrder: z.coerce.number().default(0),
  multiple: z.boolean().default(false),
  required: z.boolean().default(false),
  maxChoices: z.coerce.number().default(0),
  options: z.array(variationOptionSchema).min(1, 'At least one option is required'),
});

type VariationGroupFormValues = z.infer<typeof variationGroupSchema>;

interface VariationGroupSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  group: VariationGroup | null;
  onSave: (data: VariationGroup) => void;
}

const SortableOptionItem = ({
  field,
  index,
  remove,
  form,
  fieldsCount,
}: {
  field: any;
  index: number;
  remove: (index: number) => void;
  form: any;
  fieldsCount: number;
}) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: field.id });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 1 : 'auto',
  };
  
  const allowMultiQuantity = form.watch(`options.${index}.allowMultiQuantity`);

  return (
    <div ref={setNodeRef} style={style}>
      <Collapsible key={field.id} asChild>
        <div className="rounded-lg border bg-card p-3">
          <div className="flex items-center gap-2">
            <div {...attributes} {...listeners} className="cursor-grab p-1">
              <GripVertical className="h-5 w-5 text-muted-foreground" />
            </div>
            <FormField
              control={form.control}
              name={`options.${index}.value`}
              render={({ field }) => (
                <FormItem className="flex-grow">
                  <FormControl>
                    <Input placeholder={`Option ${index + 1}`} {...field} className="font-semibold bg-transparent border-0 shadow-none px-1 focus-visible:ring-0" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <CollapsibleTrigger asChild>
              <Button variant="ghost" size="sm" className="w-28 text-muted-foreground">
                Advanced <ChevronDown className="ml-2 h-4 w-4 transition-transform data-[state=open]:rotate-180" />
              </Button>
            </CollapsibleTrigger>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => remove(index)}
              disabled={fieldsCount <= 1}
            >
              <Trash className="h-4 w-4 text-destructive" />
            </Button>
          </div>
          <CollapsibleContent className="space-y-6 pt-4 mt-4 border-t data-[state=open]:animate-collapsible-down data-[state=closed]:animate-collapsible-up">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-1 space-y-2">
                    <FormLabel>Photo</FormLabel>
                    <div className="flex flex-col items-center gap-2">
                    <label className="cursor-pointer block w-full aspect-square rounded-lg border-2 border-dashed flex items-center justify-center bg-muted overflow-hidden hover:bg-muted/80 hover:border-primary transition-colors">
                        {form.watch(`options.${index}.photoUrl`) ? (
                            <Image src={form.watch(`options.${index}.photoUrl`)!} alt="Option photo" width={120} height={120} className="object-cover"/>
                        ) : (
                            <div className="text-center text-muted-foreground p-2">
                                <Upload className="h-6 w-6 mx-auto mb-1" />
                                <p className="text-xs font-semibold">Upload</p>
                            </div>
                        )}
                        <Input type="file" className="hidden" onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                                const reader = new FileReader();
                                reader.onloadend = () => {
                                    form.setValue(`options.${index}.photoUrl`, reader.result as string, { shouldDirty: true });
                                };
                                reader.readAsDataURL(file);
                            }
                        }} accept="image/png, image/jpeg, image/svg+xml" />
                    </label>
                    {form.watch(`options.${index}.photoUrl`) && <Button type="button" size="sm" variant="link" className="text-xs text-destructive h-auto p-0" onClick={() => form.setValue(`options.${index}.photoUrl`, '', { shouldDirty: true })}>Remove</Button>}
                    </div>
                </div>

                <div className="md:col-span-2 grid grid-cols-2 gap-4">
                  <FormField control={form.control} name={`options.${index}.stock`} render={({ field }) => (<FormItem><FormLabel>Stock Quantity</FormLabel><FormControl><Input type="number" placeholder="e.g. 100" {...field} value={field.value ?? ''} /></FormControl></FormItem>)} />
                  <FormField
                    control={form.control}
                    name={`options.${index}.allowMultiQuantity`}
                    render={({ field }) => (
                        <FormItem className="space-y-2">
                            <FormLabel>Allow Quantity</FormLabel>
                            <div className="flex h-10 items-center justify-between rounded-md border bg-background px-3">
                                <p className="text-sm font-medium text-muted-foreground">
                                    Enable
                                </p>
                                <FormControl>
                                    <Switch
                                        checked={field.value}
                                        onCheckedChange={field.onChange}
                                    />
                                </FormControl>
                            </div>
                        </FormItem>
                    )}
                    />
                  <FormField control={form.control} name={`options.${index}.regularPrice`} render={({ field }) => (<FormItem><FormLabel>Regular Price (AED)</FormLabel><FormControl><Input type="number" step="0.01" placeholder="0.00" {...field} value={field.value ?? ''} /></FormControl></FormItem>)} />
                  <FormField control={form.control} name={`options.${index}.salePrice`} render={({ field }) => (<FormItem><FormLabel>Sale Price (AED)</FormLabel><FormControl><Input type="number" step="0.01" placeholder="0.00" {...field} value={field.value ?? ''} /></FormControl></FormItem>)} />
                </div>
            </div>

            {allowMultiQuantity && (
                <div className="pt-4 mt-4 border-t">
                    <FormField
                        control={form.control}
                        name={`options.${index}.maxQuantity`}
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Maximum Quantity</FormLabel>
                                <FormControl><Input type="number" placeholder="No limit" {...field} value={field.value ?? ''} /></FormControl>
                                <FormDescription>Limit the quantity a customer can select for this option. Leave blank for no limit.</FormDescription>
                            </FormItem>
                        )}
                    />
                </div>
            )}
            
            <FormField
              control={form.control}
              name={`options.${index}.description`}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl><Textarea rows={2} placeholder="A short description for this variation option" {...field} /></FormControl>
                </FormItem>
              )}
            />
          </CollapsibleContent>
        </div>
      </Collapsible>
    </div>
  );
};


export function VariationGroupSheet({ open, onOpenChange, group, onSave }: VariationGroupSheetProps) {
  const { toast } = useToast();
  const form = useForm<VariationGroupFormValues>({
    resolver: zodResolver(variationGroupSchema),
    defaultValues: {
      name: '',
      sortOrder: 0,
      multiple: false,
      required: false,
      maxChoices: 0,
      options: [{ 
        value: '', 
        photoUrl: '',
        regularPrice: undefined,
        salePrice: undefined,
        stock: undefined,
        description: '',
        allowMultiQuantity: false,
        maxQuantity: undefined,
      }],
    },
  });

  const { fields, append, remove, move } = useFieldArray({
    control: form.control,
    name: 'options',
  });
  
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = fields.findIndex((item) => item.id === active.id);
      const newIndex = fields.findIndex((item) => item.id === over.id);
      move(oldIndex, newIndex);
    }
  }

  const multipleSelection = form.watch('multiple');

  useEffect(() => {
    if (group) {
      form.reset({
        name: group.name,
        sortOrder: group.sortOrder,
        multiple: group.multiple,
        required: group.required,
        maxChoices: group.maxChoices || 0,
        options: group.options.map(opt => ({
          id: opt.id,
          value: opt.value,
          photoUrl: opt.photoUrl || '',
          regularPrice: opt.regularPrice,
          salePrice: opt.salePrice,
          stock: opt.stock,
          description: opt.description || '',
          allowMultiQuantity: opt.allowMultiQuantity || false,
          maxQuantity: opt.maxQuantity,
        })),
      });
    } else {
      form.reset({
        name: '',
        sortOrder: 0,
        multiple: false,
        required: false,
        maxChoices: 0,
        options: [{ 
          value: '', 
          photoUrl: '',
          regularPrice: undefined,
          salePrice: undefined,
          stock: undefined,
          description: '',
          allowMultiQuantity: false,
          maxQuantity: undefined,
        }],
      });
    }
  }, [group, form, open]);

  const onSubmit = (data: VariationGroupFormValues) => {
    const finalData: VariationGroup = {
      id: group?.id || `group_${Date.now()}`,
      name: data.name,
      sortOrder: data.sortOrder,
      multiple: data.multiple,
      required: data.required,
      maxChoices: data.multiple ? data.maxChoices : undefined,
      options: data.options.map((opt, i) => ({
        id: opt.id || `opt_${Date.now()}_${i}`,
        value: opt.value,
        sortOrder: i,
        photoUrl: opt.photoUrl,
        regularPrice: opt.regularPrice,
        salePrice: opt.salePrice,
        stock: opt.stock,
        description: opt.description,
        allowMultiQuantity: opt.allowMultiQuantity,
        maxQuantity: opt.allowMultiQuantity ? opt.maxQuantity : undefined,
      })),
    };

    onSave(finalData);
    toast({
      title: group ? 'Group Updated' : 'Group Created',
      description: `Variation group "${finalData.name}" has been saved.`,
    });
    onOpenChange(false);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-2xl w-full">
        <SheetHeader>
          <SheetTitle>{group ? 'Edit' : 'Add'} Variation Group</SheetTitle>
          <SheetDescription>
            Manage variation options that can be applied to products.
          </SheetDescription>
        </SheetHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col h-[calc(100%-4rem)]">
            <ScrollArea className="flex-grow p-6">
              <div className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField control={form.control} name="name" render={({ field }) => (<FormItem><FormLabel>Group Name</FormLabel><FormControl><Input placeholder="e.g., Size, Color" {...field} /></FormControl><FormMessage /></FormItem>)} />
                  <FormField control={form.control} name="sortOrder" render={({ field }) => (<FormItem><FormLabel>Sort Order</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>)} />
                </div>
                
                <div className="space-y-4 rounded-lg border p-4">
                  <FormField control={form.control} name="required" render={({ field }) => (<FormItem className="flex flex-row items-start space-x-3 space-y-0"><FormControl><Checkbox checked={field.value} onCheckedChange={field.onChange} /></FormControl><div className="space-y-1 leading-none"><FormLabel>Required</FormLabel><FormDescription>If checked, this variation will be required to be selected before adding to cart.</FormDescription></div></FormItem>)} />
                  <FormField control={form.control} name="multiple" render={({ field }) => (<FormItem className="flex flex-row items-start space-x-3 space-y-0"><FormControl><Checkbox checked={field.value} onCheckedChange={field.onChange} /></FormControl><div className="space-y-1 leading-none"><FormLabel>Enable Multiple Selection</FormLabel></div></FormItem>)} />
                  {multipleSelection && (
                    <FormField
                      control={form.control}
                      name="maxChoices"
                      render={({ field }) => (
                        <FormItem className="pl-6">
                          <FormLabel>Max Choices Allowed</FormLabel>
                          <FormControl>
                            <Input type="number" {...field} />
                          </FormControl>
                          <FormDescription>
                            Allow max choice selection. Set to 0 to allow unlimited.
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}
                </div>

                <div className="space-y-4">
                  <FormLabel>Options</FormLabel>
                  <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                    <SortableContext items={fields.map((field) => field.id)} strategy={verticalListSortingStrategy}>
                      <div className="space-y-2">
                        {fields.map((field, index) => (
                          <SortableOptionItem
                            key={field.id}
                            field={field}
                            index={index}
                            remove={remove}
                            form={form}
                            fieldsCount={fields.length}
                          />
                        ))}
                      </div>
                    </SortableContext>
                  </DndContext>
                  <Button type="button" variant="outline" size="sm" onClick={() => append({ 
                      value: '', 
                      photoUrl: '',
                      regularPrice: undefined,
                      salePrice: undefined,
                      stock: undefined,
                      description: '',
                      allowMultiQuantity: false,
                      maxQuantity: undefined,
                  })}>
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Add Option
                  </Button>
                </div>
              </div>
            </ScrollArea>
            <SheetFooter className="p-6 border-t bg-background">
                <SheetClose asChild><Button variant="ghost">Cancel</Button></SheetClose>
                <Button type="submit">Save Group</Button>
            </SheetFooter>
          </form>
        </Form>
      </SheetContent>
    </Sheet>
  );
}
