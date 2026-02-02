'use client';

import { useState, useMemo, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
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
import { Users, Circle, Hourglass, CirclePercent, User } from 'lucide-react';
import { OrderDetailsSheet } from '@/app/dashboard/orders/order-details-sheet';
import { mockDataStore } from '@/lib/mock-data-store';
import type { Order } from '@/app/dashboard/orders/types';
import { TablesPageSkeleton } from '@/components/dashboard/skeletons';
import { AiSummary } from '@/components/dashboard/ai-summary';

type Status =
  | 'Vacant'
  | 'Occupied - Unpaid'
  | 'Occupied - Partially Paid'
  | 'Occupied - Fully Paid';

type Table = {
  id: string;
  status: Status;
  floor: string;
  order?: Order;
};

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

const filterOptions: { name: string; status?: Status; color: string }[] = [
  { name: 'All', color: 'bg-muted' },
  { name: 'Vacant', status: 'Vacant', color: 'bg-green-500' },
  { name: 'Occupied', color: 'bg-chart-5' },
  { name: 'Unpaid', status: 'Occupied - Unpaid', color: 'bg-red-500' },
  {
    name: 'Partial',
    status: 'Occupied - Partially Paid',
    color: 'bg-yellow-500',
  },
  { name: 'Paid', status: 'Occupied - Fully Paid', color: 'bg-blue-500' },
];

const TableCard = ({ table, onClick }: { table: Table; onClick: () => void }) => {
  const config = statusConfig[table.status];
  const Icon = config.icon;

  return (
    <Card
      onClick={onClick}
      className={cn(
        'group overflow-hidden transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5',
        'border-2',
        config.colorClasses.split(' ')[0],
        table.status !== 'Vacant' ? 'cursor-pointer' : 'cursor-default'
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
        <p
          className={cn('text-sm font-semibold', config.colorClasses.split(' ')[2])}
        >
          {config.label}
        </p>
        <p className="text-xs text-muted-foreground mt-1">{table.floor}</p>
        {table.order?.staffName && (
          <div className="mt-2 text-xs text-muted-foreground flex items-center gap-1">
            <User className="h-3 w-3" />
            <span>{table.order.staffName}</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default function TablesPage() {
  const [activeFilter, setActiveFilter] = useState('All');
  const [activeFloor, setActiveFloor] = useState('All');
  const [tables, setTables] = useState<Table[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      const allOrders = mockDataStore.orders;
      const uniqueTableIds = [
        ...new Set(allOrders.map((order) => order.table)),
      ].sort((a, b) => parseInt(a.substring(1)) - parseInt(b.substring(1)));

      const tableData: Table[] = uniqueTableIds.map((tableId) => {
        const ordersForTable = allOrders
          .filter((o) => o.table === tableId)
          .sort((a, b) => b.orderTimestamp - a.orderTimestamp);

        const latestActiveOrder = ordersForTable.find(
          (o) => o.orderStatus === 'Open' || o.orderStatus === 'Paid'
        );

        let status: Status = 'Vacant';
        let floor =
          parseInt(tableId.substring(1)) > 12 ? 'First Floor' : 'Ground Floor';
        if (latestActiveOrder) {
          if (latestActiveOrder.paymentState === 'Fully Paid') {
            status = 'Occupied - Fully Paid';
          } else if (latestActiveOrder.paymentState === 'Partial') {
            status = 'Occupied - Partially Paid';
          } else {
            status = 'Occupied - Unpaid';
          }
        }

        return {
          id: tableId,
          status: status,
          floor: floor,
          order: latestActiveOrder,
        };
      });

      const allPossibleTableIds = [...Array(24)].map((_, i) => `T${i + 1}`);
      for (const tableId of allPossibleTableIds) {
        if (!tableData.find((t) => t.id === tableId)) {
          tableData.push({
            id: tableId,
            status: 'Vacant',
            floor:
              parseInt(tableId.substring(1)) > 12
                ? 'First Floor'
                : 'Ground Floor',
          });
        }
      }

      tableData.sort(
        (a, b) => parseInt(a.id.substring(1)) - parseInt(b.id.substring(1))
      );

      setTables(tableData);
      setIsLoading(false);
    }, 1500);

    return () => clearTimeout(timer);
  }, []);

  const handleTableClick = (table: Table) => {
    if (table.order) {
      setSelectedOrder(table.order);
      setIsSheetOpen(true);
    }
  };

  const floors = useMemo(() => ['All', ...new Set(tables.map((t) => t.floor))], [tables]);

  const filteredTables = useMemo(() => {
    return tables.filter((table) => {
      const matchesFloor = activeFloor === 'All' || table.floor === activeFloor;
      if (!matchesFloor) return false;

      if (activeFilter === 'All') return true;
      if (activeFilter === 'Occupied') return table.status !== 'Vacant';
      const filterOption = filterOptions.find((f) => f.name === activeFilter);
      return filterOption?.status
        ? table.status === filterOption.status
        : table.status === activeFilter;
    });
  }, [activeFilter, activeFloor, tables]);

  if (isLoading) {
    return <TablesPageSkeleton />;
  }

  return (
    <>
      <DashboardHeader />
      <main className="p-4 sm:p-6 lg:p-8 space-y-6">
        <AiSummary data={filteredTables} context="live table status" />
        <div>
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-800">Live Table View</h1>
            <p className="text-muted-foreground">
              Monitor the real-time status of all tables across your locations.
            </p>
          </div>

          <Card className="p-4 mb-6 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <span className="text-sm font-medium text-muted-foreground">
                Floor:
              </span>
              <Select value={activeFloor} onValueChange={setActiveFloor}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Select a floor" />
                </SelectTrigger>
                <SelectContent>
                  {floors.map((floor) => (
                    <SelectItem key={floor} value={floor}>
                      {floor}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center flex-wrap gap-1 bg-muted p-1 rounded-lg">
              {filterOptions.map((option) => (
                <Button
                  key={option.name}
                  size="sm"
                  onClick={() => setActiveFilter(option.name)}
                  variant={activeFilter === option.name ? 'secondary' : 'ghost'}
                  className="gap-2 px-3"
                >
                  <div className={cn('h-3 w-3 rounded-full', option.color)} />
                  <span>{option.name}</span>
                </Button>
              ))}
            </div>
          </Card>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {filteredTables.map((table) => (
              <TableCard
                key={table.id}
                table={table}
                onClick={() => handleTableClick(table)}
              />
            ))}
          </div>
        </div>
      </main>
      <OrderDetailsSheet
        order={selectedOrder}
        open={isSheetOpen}
        onOpenChange={setIsSheetOpen}
      />
    </>
  );
}
