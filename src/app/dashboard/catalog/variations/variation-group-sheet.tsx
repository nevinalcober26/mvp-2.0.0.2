'use client';

import { useEffect } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
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
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import { PlusCircle, Trash } from 'lucide-react';
import type { VariationGroup } from './types';
import { useToast } from '@/hooks/use-toast';

const variationGroupSchema = z.object({
  name: z.string().min(1, 'Group name is required'),
  sortOrder: z.coerce.number().default(0),
  multiple: z.boolean().default(false),
  required: z.boolean().default(false),
  maxChoices: z.coerce.number().default(0),
  options: z.array(z.object({
    sortOrder: z.coerce.number().default(0),
    value: z.string().min(1, 'Option value cannot be empty'),
  })).min(1, 'At least one option is required'),
});

type VariationGroupFormValues = z.infer<typeof variationGroupSchema>;

interface VariationGroupSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  group: VariationGroup | null;
  onSave: (data: VariationGroup) => void;
}

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
      options: [{ value: '', sortOrder: 0 }],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'options',
  });

  const multipleSelection = form.watch('multiple');

  useEffect(() => {
    if (group) {
      form.reset({
        name: group.name,
        sortOrder: group.sortOrder,
        multiple: group.multiple,
        required: group.required,
        maxChoices: group.maxChoices || 0,
        options: group.options.map(opt => ({ value: opt.value, sortOrder: opt.sortOrder })),
      });
    } else {
      form.reset({
        name: '',
        sortOrder: 0,
        multiple: false,
        required: false,
        maxChoices: 0,
        options: [{ value: '', sortOrder: 0 }],
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
        id: group?.options[i]?.id || `opt_${Date.now()}_${i}`,
        value: opt.value,
        sortOrder: opt.sortOrder,
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
                  <div className="space-y-2">
                    {fields.map((field, index) => (
                      <div key={field.id} className="flex items-end gap-2 p-3 rounded-md border bg-muted/50">
                        <FormField control={form.control} name={`options.${index}.sortOrder`} render={({ field }) => (<FormItem className="w-24"><FormLabel>Sort</FormLabel><FormControl><Input type="number" placeholder="0" {...field} /></FormControl><FormMessage /></FormItem>)} />
                        <FormField control={form.control} name={`options.${index}.value`} render={({ field }) => (<FormItem className="flex-grow"><FormLabel>Value</FormLabel><FormControl><Input placeholder={`Option ${index + 1}`} {...field} /></FormControl><FormMessage /></FormItem>)} />
                        <Button type="button" variant="ghost" size="icon" onClick={() => remove(index)} disabled={fields.length <= 1}><Trash className="h-4 w-4 text-destructive" /></Button>
                      </div>
                    ))}
                  </div>
                  <Button type="button" variant="outline" size="sm" onClick={() => append({ value: '', sortOrder: fields.length })}>
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
