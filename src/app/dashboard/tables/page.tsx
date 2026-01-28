'use client';

import { useState, useMemo } from 'react';
import {
  Card,
  CardContent,
} from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { DashboardHeader } from '@/components/dashboard/header';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import {
  Users,
  Circle,
  Hourglass,
  CirclePercent,
} from 'lucide-react';

type Status =
  | 'Vacant'
  | 'Occupied - Unpaid'
  | 'Occupied - Partially Paid'
  | 'Occupied - Fully Paid';
  
type Table = {
  id: string;
  status: Status;
  floor: string;
};

const tables: Table[] = [
  { id: 'T1', status: 'Vacant', floor: 'Ground Floor' },
  { id: 'T2', status: 'Occupied - Unpaid', floor: 'Ground Floor' },
  { id: 'T3', status: 'Vacant', floor: 'Ground Floor' },
  { id: 'T4', status: 'Occupied - Partially Paid', floor: 'Ground Floor' },
  { id: 'T5', status: 'Occupied - Fully Paid', floor: 'Ground Floor' },
  { id: 'T6', status: 'Vacant', floor: 'Ground Floor' },
  { id: 'T7', status: 'Occupied - Unpaid', floor: 'Ground Floor' },
  { id: 'T8', status: 'Vacant', floor: 'Ground Floor' },
  { id: 'T9', status: 'Vacant', floor: 'Ground Floor' },
  { id: 'T10', status: 'Occupied - Partially Paid', floor: 'Ground Floor' },
  { id: 'T11', status: 'Vacant', floor: 'Ground Floor' },
  { id: 'T12', status: 'Occupied - Unpaid', floor: 'Ground Floor' },
  { id: 'T13', status: 'Vacant', floor: 'First Floor' },
  { id: 'T14', status: 'Occupied - Unpaid', floor: 'First Floor' },
  { id: 'T15', status: 'Vacant', floor: 'First Floor' },
  { id: 'T16', status: 'Occupied - Partially Paid', floor: 'First Floor' },
  { id: 'T17', status: 'Occupied - Fully Paid', floor: 'First Floor' },
  { id: 'T18', status: 'Vacant', floor: 'First Floor' },
  { id: 'T19', status: 'Occupied - Unpaid', floor: 'First Floor' },
  { id: 'T20', status: 'Vacant', floor: 'First Floor' },
  { id: 'T21', status: 'Occupied - Fully Paid', floor: 'First Floor' },
  { id: 'T22', status: 'Vacant', floor: 'First Floor' },
  { id: 'T23', status: 'Occupied - Unpaid', floor: 'First Floor' },
  { id: 'T24', status: 'Vacant', floor: 'First Floor' },
];

const statusConfig: Record<
  Status,
  { label: string; icon: React.ElementType; colorClasses: string }
> = {
  'Vacant': {
    label: 'Vacant',
    icon: Circle,
    colorClasses: 'border-green-500/50 bg-green-50 text-green-700',
  },
  'Occupied - Unpaid': {
    label: 'Unpaid',
    icon: Hourglass,
    colorClasses: 'border-red-500/50 bg-red-50 text-red-700',
  },
  'Occupied - Partially Paid': {
    label: 'Partial',
    icon: CirclePercent,
    colorClasses: 'border-yellow-500/50 bg-yellow-50 text-yellow-700',
  },
  'Occupied - Fully Paid': {
    label: 'Paid',
    icon: Users,
    colorClasses: 'border-blue-500/50 bg-blue-50 text-blue-700',
  },
};

const filterOptions: {name: string, status?: Status, color: string}[] = [
  { name: 'All', color: 'bg-muted' },
  { name: 'Vacant', color: 'bg-green-500' },
  { name: 'Occupied', color: 'bg-chart-5' },
  { name: 'Unpaid', status: 'Occupied - Unpaid', color: 'bg-red-500' },
  { name: 'Partial', status: 'Occupied - Partially Paid', color: 'bg-yellow-500' },
  { name: 'Paid', status: 'Occupied - Fully Paid', color: 'bg-blue-500' },
];

const TableCard = ({ table }: { table: Table }) => {
  const config = statusConfig[table.status];
  const Icon = config.icon;

  return (
    <Card
      className={cn(
        'group cursor-pointer overflow-hidden transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5',
        'border-2',
        config.colorClasses.split(' ')[0]
      )}
    >
      <CardContent className="p-4 flex flex-col items-center justify-center aspect-square text-center">
        <div
          className={cn(
            'h-12 w-12 rounded-full flex items-center justify-center mb-3 transition-colors duration-200',
            config.colorClasses.split(' ')[1] // bg color
          )}
        >
          <Icon className={cn('h-6 w-6', config.colorClasses.split(' ')[2])} />
        </div>
        <p className="text-3xl font-bold tracking-tight text-foreground">
          {table.id}
        </p>
        <p className={cn('text-sm font-semibold', config.colorClasses.split(' ')[2])}>
          {config.label}
        </p>
        <p className="text-xs text-muted-foreground mt-1">{table.floor}</p>
      </CardContent>
    </Card>
  );
};

export default function TablesPage() {
  const [activeFilter, setActiveFilter] = useState('All');
  const [activeFloor, setActiveFloor] = useState('All');

  const floors = useMemo(() => ['All', ...new Set(tables.map((t) => t.floor))], []);

  const filteredTables = useMemo(() => {
    return tables.filter((table) => {
      const matchesFloor = activeFloor === 'All' || table.floor === activeFloor;
      if (!matchesFloor) return false;

      if (activeFilter === 'All') return true;
      if (activeFilter === 'Occupied') return table.status !== 'Vacant';
      const filterOption = filterOptions.find((f) => f.name === activeFilter);
      return filterOption?.status ? table.status === filterOption.status : table.status === activeFilter;
    });
  }, [activeFilter, activeFloor]);

  return (
    <>
      <DashboardHeader />
      <main className="p-4 sm:p-6 lg:p-8">
        <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-800">Live Table View</h1>
            <p className="text-muted-foreground">Monitor the real-time status of all tables across your locations.</p>
        </div>
        
        <Card className="p-4 mb-6 flex flex-wrap items-center justify-between gap-4">
           <div className="flex items-center gap-4">
              <span className="text-sm font-medium text-muted-foreground">Floor:</span>
               <Select value={activeFloor} onValueChange={setActiveFloor}>
                    <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Select a floor" />
                    </SelectTrigger>
                    <SelectContent>
                        {floors.map(floor => <SelectItem key={floor} value={floor}>{floor}</SelectItem>)}
                    </SelectContent>
                </Select>
           </div>
            <div className="flex items-center flex-wrap gap-1 bg-muted p-1 rounded-lg">
              {filterOptions.map((option) => (
                <Button
                  key={option.name}
                  size="sm"
                  onClick={() => setActiveFilter(option.name)}
                  variant={activeFilter === option.name ? "secondary" : "ghost"}
                  className="gap-2 px-3"
                >
                  <div className={cn('h-3 w-3 rounded-full', option.color)} />
                  <span>{option.name}</span>
                </Button>
              ))}
            </div>
        </Card>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-5 gap-4">
          {filteredTables.map((table) => (
            <TableCard key={table.id} table={table} />
          ))}
        </div>
      </main>
    </>
  );
}
