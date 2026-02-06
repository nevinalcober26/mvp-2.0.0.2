'use client';

import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { format } from 'date-fns';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetFooter,
  SheetClose,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { X, AlertTriangle, CheckCircle } from 'lucide-react';
import type { Column, Item, ScheduleRule } from './types';
import { UniqueIdentifier } from '@dnd-kit/core';
import { useToast } from '@/hooks/use-toast';

const scheduleSchema = z.object({
  weekday: z.enum(['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday', 'Everyday']),
  allDay: z.boolean().default(false),
  from: z.string().optional(),
  to: z.string().optional(),
  disableOrder: z.boolean().default(false),
}).refine(data => data.allDay || (data.from && data.to), {
    message: "Start and end times are required if 'All Day' is not checked.",
    path: ['from'],
});

type ScheduleFormValues = z.infer<typeof scheduleSchema>;

interface CategoryScheduleSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  category: Column | Item | null;
  onSave: (id: UniqueIdentifier, schedules: ScheduleRule[]) => void;
}

const weekdays: ScheduleFormValues['weekday'][] = [
    'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday', 'Everyday'
];

export function CategoryScheduleSheet({
  open,
  onOpenChange,
  category,
  onSave,
}: CategoryScheduleSheetProps) {
  const [currentTime, setCurrentTime] = useState('');
  const [schedules, setSchedules] = useState<ScheduleRule[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    if (open) {
      const timer = setInterval(() => {
        setCurrentTime(format(new Date(), 'EEEE, do MMMM yyyy h:mm a'));
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [open]);

  useEffect(() => {
    if (category?.schedules) {
      setSchedules(category.schedules);
    } else {
      setSchedules([]);
    }
  }, [category]);
  
  const form = useForm<ScheduleFormValues>({
    resolver: zodResolver(scheduleSchema),
    defaultValues: {
      weekday: 'Monday',
      allDay: false,
      from: '09:00',
      to: '17:00',
      disableOrder: false,
    },
  });

  const handleAddHours = (values: ScheduleFormValues) => {
    const newRule: ScheduleRule = {
      id: `sch_${Date.now()}`,
      ...values,
      from: values.allDay ? undefined : values.from,
      to: values.allDay ? undefined : values.to,
    };
    setSchedules(prev => [...prev, newRule]);
    toast({
        title: "Rule Added",
        description: `A new display rule for ${values.weekday} has been added.`
    })
    form.reset();
  };
  
  const handleDeleteRule = (id: string) => {
    setSchedules(prev => prev.filter(rule => rule.id !== id));
  };
  
  const handleSaveChanges = () => {
    if (category) {
        onSave(category.id, schedules);
    }
    onOpenChange(false);
  }

  const allDay = form.watch('allDay');

  // Group schedules by weekday for display
  const displayHours = weekdays.slice(0, 7).map(day => {
    const daySchedules = schedules.filter(s => s.weekday === day || s.weekday === 'Everyday');
    return { day, schedules: daySchedules };
  });

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-4xl w-full p-0">
        <div className="flex flex-col h-full">
            <SheetHeader className="p-6 border-b">
                <div className="flex justify-between items-center">
                    <div>
                        <SheetTitle className="text-xl mb-1">Schedule Category: {category?.name}</SheetTitle>
                        <p className="text-sm text-muted-foreground">Currently: {currentTime}. <span className="font-semibold text-green-600">Displaying</span></p>
                    </div>
                </div>
            </SheetHeader>
            <div className="flex-grow overflow-y-auto p-6 grid grid-cols-1 lg:grid-cols-2 gap-6 bg-muted/30">
                <Card className="self-start shadow-sm">
                    <CardHeader>
                        <CardTitle className="text-primary text-lg">Add Restrictions</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={form.handleSubmit(handleAddHours)} className="space-y-6">
                            <div className="space-y-2">
                                <Label>Weekday*</Label>
                                <Select onValueChange={(val) => form.setValue('weekday', val as ScheduleFormValues['weekday'])} defaultValue={form.getValues('weekday')}>
                                    <SelectTrigger><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        {weekdays.map(day => <SelectItem key={day} value={day}>{day}</SelectItem>)}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="flex items-center space-x-2 pt-2">
                                <Checkbox id="allDay" checked={allDay} onCheckedChange={(checked) => form.setValue('allDay', !!checked)} />
                                <Label htmlFor="allDay" className="font-normal cursor-pointer">All Day</Label>
                            </div>
                            
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="from">From Hour*</Label>
                                    <Input id="from" type="time" disabled={allDay} {...form.register('from')} />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="to">To Hour*</Label>
                                    <Input id="to" type="time" disabled={allDay} {...form.register('to')} />
                                </div>
                            </div>
                             {form.formState.errors.from && <p className="text-sm text-destructive">{form.formState.errors.from.message}</p>}


                            <div className="flex items-start space-x-3 pt-2">
                                <Checkbox id="disableOrder" {...form.register('disableOrder')} className="mt-1" />
                                <div className="grid gap-1.5 leading-none">
                                    <Label htmlFor="disableOrder" className="font-normal cursor-pointer">Disable Order</Label>
                                    <p className="text-sm text-muted-foreground">If checked, this category will be displayed, but ordering will be disabled during these hours.</p>
                                </div>
                            </div>
                            
                            <Button type="submit" className="w-full bg-primary hover:bg-primary/90 text-primary-foreground">Add Hours</Button>
                        </form>
                    </CardContent>
                </Card>
                <Card className="shadow-sm">
                    <CardHeader>
                        <CardTitle className="text-primary text-lg">Menu - Display Hours</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {displayHours.map(({ day, schedules }) => (
                            <div key={day}>
                                <p className="font-semibold mb-2">{day}</p>
                                {schedules.length === 0 ? (
                                <div className="flex items-center gap-2 p-3 rounded-lg bg-green-100 text-sm border border-green-200">
                                    <CheckCircle className="h-4 w-4 text-green-600" />
                                    <span className="font-medium text-green-700">Available all day</span>
                                </div>
                                ) : (
                                <div className="space-y-2">
                                    {schedules.map((rule) => (
                                    <div key={rule.id} className="flex items-center justify-between p-3 rounded-lg bg-orange-100 text-sm border border-orange-200">
                                        <div className="flex items-center gap-2">
                                        <AlertTriangle className="h-4 w-4 text-orange-600" />
                                        <div>
                                            <p className="font-medium text-orange-700">
                                            {rule.allDay
                                                ? 'Unavailable all day'
                                                : `Unavailable: ${rule.from} - ${rule.to}`}
                                            </p>
                                            {rule.disableOrder && (
                                            <p className="text-xs text-orange-700 font-semibold">Ordering will be disabled</p>
                                            )}
                                        </div>
                                        </div>
                                        <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-7 w-7 text-muted-foreground hover:bg-orange-100 hover:text-destructive"
                                        onClick={() => handleDeleteRule(rule.id)}
                                        >
                                        <X className="h-4 w-4" />
                                        </Button>
                                    </div>
                                    ))}
                                </div>
                                )}
                            </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>
            <SheetFooter className="p-4 border-t flex justify-end bg-background">
                 <SheetClose asChild><Button variant="outline">Cancel</Button></SheetClose>
                 <Button onClick={handleSaveChanges}>Save Changes</Button>
            </SheetFooter>
        </div>
      </SheetContent>
    </Sheet>
  );
}
