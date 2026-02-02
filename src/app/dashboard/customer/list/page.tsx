'use client';
import { useState, useMemo, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardHeader,
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
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { MoreHorizontal, PlusCircle, ArrowUpDown } from 'lucide-react';
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
import type { Customer } from './types';
import { mockDataStore } from '@/lib/mock-data-store';
import { CustomerSheet } from './customer-sheet';
import { Input } from '@/components/ui/input';
import { OrdersPageSkeleton } from '@/components/dashboard/skeletons';
import { AiSummary } from '@/components/dashboard/ai-summary';

export default function CustomerListPage() {
  const [allCustomers, setAllCustomers] = useState<Customer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const [sortConfig, setSortConfig] = useState<{
    key: keyof Customer;
    direction: 'ascending' | 'descending';
  } | null>({ key: 'totalSpent', direction: 'descending' });

  useEffect(() => {
    // Simulate fetching data
    setTimeout(() => {
      setAllCustomers(mockDataStore.customers);
      setIsLoading(false);
    }, 1000);
  }, []);

  const filteredAndSortedCustomers = useMemo(() => {
    let filtered = allCustomers.filter(
      (customer) =>
        customer.name.toLowerCase().includes(search.toLowerCase()) ||
        customer.phone.includes(search)
    );

    if (sortConfig !== null) {
      filtered.sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key]) {
          return sortConfig.direction === 'ascending' ? -1 : 1;
        }
        if (a[sortConfig.key] > b[sortConfig.key]) {
          return sortConfig.direction === 'ascending' ? 1 : -1;
        }
        return 0;
      });
    }

    return filtered;
  }, [allCustomers, search, sortConfig]);

  const totalPages = Math.ceil(filteredAndSortedCustomers.length / itemsPerPage);
  const paginatedCustomers = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredAndSortedCustomers.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredAndSortedCustomers, currentPage]);

  const requestSort = (key: keyof Customer) => {
    let direction: 'ascending' | 'descending' = 'ascending';
    if (
      sortConfig &&
      sortConfig.key === key &&
      sortConfig.direction === 'ascending'
    ) {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };

  const handleViewDetails = (customer: Customer) => {
    setSelectedCustomer(customer);
    setIsSheetOpen(true);
  };
  
  const SortableHeader = ({
    tKey,
    label,
    className,
  }: {
    tKey: keyof Customer;
    label: string;
    className?: string;
  }) => (
    <Button variant="ghost" onClick={() => requestSort(tKey)} className={cn("px-2", className)}>
      {label}
      <ArrowUpDown
        className={cn(
          'ml-2 h-4 w-4',
          sortConfig?.key !== tKey && 'text-muted-foreground/50'
        )}
      />
    </Button>
  );

  if (isLoading) {
    return <OrdersPageSkeleton view="list" />;
  }

  return (
    <>
      <DashboardHeader />
      <main className="p-4 sm:p-6 lg:p-8 space-y-6">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold">Customers</h1>
            <p className="text-muted-foreground">
              View and manage your customer profiles.
            </p>
          </div>
          <Button size="sm">
            <PlusCircle className="mr-2 h-4 w-4" />
            Add Customer
          </Button>
        </div>

        <AiSummary data={filteredAndSortedCustomers} context="customer list" />

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <Input
                placeholder="Search by name or phone..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setCurrentPage(1);
                }}
                className="max-w-sm"
              />
            </div>
          </CardHeader>
          <CardContent>
            <div className="relative w-full overflow-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Customer</TableHead>
                    <TableHead><SortableHeader tKey="lastVisit" label="Last Visit" /></TableHead>
                    <TableHead className='text-right'><SortableHeader tKey="totalVisits" label="Total Visits" /></TableHead>
                    <TableHead className='text-right'><SortableHeader tKey="totalSpent" label="Total Spent" /></TableHead>
                    <TableHead className='text-right'><SortableHeader tKey="avgBillValue" label="Avg. Bill Value" /></TableHead>
                    <TableHead>
                      <span className="sr-only">Actions</span>
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedCustomers.map((customer) => (
                    <TableRow
                      key={customer.id}
                      onClick={() => handleViewDetails(customer)}
                      className="cursor-pointer"
                    >
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar>
                            <AvatarFallback>{customer.name.charAt(0)}</AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">{customer.name}</p>
                            <p className="text-sm text-muted-foreground">{customer.phone}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{customer.lastVisit}</TableCell>
                      <TableCell className="text-right">{customer.totalVisits}</TableCell>
                      <TableCell className="text-right font-mono">${customer.totalSpent.toFixed(2)}</TableCell>
                      <TableCell className="text-right font-mono">${customer.avgBillValue.toFixed(2)}</TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button aria-haspopup="true" size="icon" variant="ghost" onClick={(e) => e.stopPropagation()}>
                              <MoreHorizontal className="h-4 w-4" />
                              <span className="sr-only">Toggle menu</span>
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuItem onClick={() => handleViewDetails(customer)}>View Details</DropdownMenuItem>
                            <DropdownMenuItem>Edit</DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="text-destructive">Delete</DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              {paginatedCustomers.length === 0 && (
                <p className="text-center py-10 text-muted-foreground">No customers found.</p>
              )}
            </div>
          </CardContent>
          <CardFooter className="flex items-center justify-between">
            <div className="text-xs text-muted-foreground">
              Showing{' '}
              <strong>
                {filteredAndSortedCustomers.length === 0
                  ? 0
                  : (currentPage - 1) * itemsPerPage + 1}
              </strong>{' '}
              to{' '}
              <strong>
                {Math.min(
                  currentPage * itemsPerPage,
                  filteredAndSortedCustomers.length
                )}
              </strong>{' '}
              of <strong>{filteredAndSortedCustomers.length}</strong> customers
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
      <CustomerSheet
        open={isSheetOpen}
        onOpenChange={setIsSheetOpen}
        customer={selectedCustomer}
      />
    </>
  );
}
