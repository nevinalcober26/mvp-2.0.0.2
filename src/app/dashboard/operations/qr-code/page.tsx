
'use client';

import React, { useState } from 'react';
import { DashboardHeader } from '@/components/dashboard/header';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Search,
  Download,
  Plus,
  QrCode,
  MoreHorizontal,
  ChevronLeft,
  ChevronRight,
  LayoutGrid,
  List,
  Sparkles,
  ArrowUpDown,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { QrDetailSheet } from './qr-detail-sheet';

interface TableQrData {
  id: string;
  name: string;
  hasQr: boolean;
  status: 'Active' | 'Inactive';
  floor: string;
  lastUpdated: string;
}

const MOCK_TABLES: TableQrData[] = [
  { id: '1', name: 'T1', hasQr: false, status: 'Inactive', floor: 'Booths', lastUpdated: 'Jul 15, 2024 at 1:05 PM' },
  { id: '2', name: 'T2', hasQr: false, status: 'Inactive', floor: 'Main Dining', lastUpdated: 'Jul 15, 2024 at 1:05 PM' },
  { id: '3', name: 'T3', hasQr: true, status: 'Active', floor: 'Main Dining', lastUpdated: 'Jul 15, 2024 at 1:05 PM' },
  { id: '4', name: 'T4', hasQr: true, status: 'Active', floor: 'Bar', lastUpdated: 'Jul 15, 2024 at 1:05 PM' },
  { id: '5', name: 'T5', hasQr: true, status: 'Active', floor: 'Booths', lastUpdated: 'Jul 15, 2024 at 1:05 PM' },
  { id: '6', name: 'T6', hasQr: true, status: 'Active', floor: 'Booths', lastUpdated: 'Jul 15, 2024 at 1:05 PM' },
  { id: '7', name: 'T7', hasQr: true, status: 'Active', floor: 'Booths', lastUpdated: 'Jul 15, 2024 at 1:05 PM' },
];

export default function QrCodePage() {
  const { toast } = useToast();
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTable, setSelectedTable] = useState<TableQrData | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  const handleGenerate = (tableName: string) => {
    toast({
      title: 'Generating QR Code',
      description: `Creating secure digital link for table ${tableName}...`,
    });
  };

  const handleCreateNew = () => {
    setSelectedTable(null);
    setIsDetailOpen(true);
  };

  const handleRowClick = (table: TableQrData) => {
    setSelectedTable(table);
    setIsDetailOpen(true);
  };

  return (
    <>
      <DashboardHeader />
      <main className="p-4 sm:p-6 lg:p-10 bg-muted/20 min-h-[calc(100vh-4rem)] text-left">
        <div className="max-w-7xl mx-auto space-y-8">
          
          {/* Page Title & Top Actions */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <h1 className="text-3xl font-bold tracking-tight text-[#142424]">Manage QR Codes</h1>
              <p className="text-muted-foreground text-sm font-medium">Create, edit, and manage QR codes for your tables.</p>
            </div>
            <div className="flex items-center gap-3">
              <Button variant="outline" className="gap-2 font-bold text-gray-700 bg-white">
                <Download className="h-4 w-4" />
                Download All
              </Button>
              <Button 
                onClick={handleCreateNew}
                className="gap-2 font-bold bg-[#18B4A6] hover:bg-[#149d94] text-white rounded-md"
              >
                <Plus className="h-4 w-4" />
                Create QR Code
              </Button>
            </div>
          </div>

          <Card className="border-0 shadow-smooth rounded-2xl overflow-hidden bg-white">
            <CardContent className="p-0">
              {/* Filter Bar */}
              <div className="p-4 flex flex-wrap items-center gap-3 border-b bg-white">
                <div className="relative flex-1 min-w-[200px] max-w-xs">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input 
                    placeholder="Search Tables" 
                    className="pl-9 h-11 bg-muted/10 border-muted focus-visible:ring-primary"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                
                <Select defaultValue="rak">
                  <SelectTrigger className="w-[200px] h-11 bg-white border-muted font-medium">
                    <SelectValue placeholder="Branch" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="rak">Bloomsbury's Ras..</SelectItem>
                    <SelectItem value="dubai">Dubai Mall</SelectItem>
                  </SelectContent>
                </Select>

                <Select defaultValue="all">
                  <SelectTrigger className="w-[140px] h-11 bg-white border-muted font-medium">
                    <SelectValue placeholder="All Floors" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Floors</SelectItem>
                    <SelectItem value="ground">Ground Floor</SelectItem>
                    <SelectItem value="first">First Floor</SelectItem>
                  </SelectContent>
                </Select>

                <Select defaultValue="all">
                  <SelectTrigger className="w-[140px] h-11 bg-white border-muted font-medium">
                    <SelectValue placeholder="All Statuses" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>

                <div className="relative ml-auto flex items-center gap-3">
                  <Button 
                    variant="outline" 
                    className="h-11 border-primary/20 text-primary hover:bg-primary/5 gap-2 font-bold px-4"
                  >
                    <Sparkles className="h-4 w-4" />
                    Generate Missing QR
                    <span className="absolute -top-1.5 -right-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] text-white font-black border-2 border-white">2</span>
                  </Button>

                  <div className="flex items-center gap-1 bg-muted/30 p-1 rounded-lg border">
                    <Button 
                      variant={viewMode === 'list' ? 'secondary' : 'ghost'} 
                      size="icon" 
                      className="h-9 w-9"
                      onClick={() => setViewMode('list')}
                    >
                      <List className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant={viewMode === 'grid' ? 'secondary' : 'ghost'} 
                      size="icon" 
                      className="h-9 w-9"
                      onClick={() => setViewMode('grid')}
                    >
                      <LayoutGrid className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>

              {/* Table */}
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader className="bg-muted/10">
                    <TableRow className="hover:bg-transparent h-14">
                      <TableHead className="w-12 px-6">
                        <Checkbox />
                      </TableHead>
                      <TableHead className="font-bold text-[13px] text-muted-foreground uppercase tracking-wider">
                        <div className="flex items-center gap-1 cursor-pointer hover:text-foreground transition-colors">
                          Table <ArrowUpDown className="h-3 w-3" />
                        </div>
                      </TableHead>
                      <TableHead className="font-bold text-[13px] text-muted-foreground uppercase tracking-wider">
                        <div className="flex items-center gap-1 cursor-pointer hover:text-foreground transition-colors">
                          QR Preview <ArrowUpDown className="h-3 w-3" />
                        </div>
                      </TableHead>
                      <TableHead className="font-bold text-[13px] text-muted-foreground uppercase tracking-wider">
                        <div className="flex items-center gap-1 cursor-pointer hover:text-foreground transition-colors">
                          Status <ArrowUpDown className="h-3 w-3" />
                        </div>
                      </TableHead>
                      <TableHead className="font-bold text-[13px] text-muted-foreground uppercase tracking-wider">
                        <div className="flex items-center gap-1 cursor-pointer hover:text-foreground transition-colors">
                          Floor <ArrowUpDown className="h-3 w-3" />
                        </div>
                      </TableHead>
                      <TableHead className="font-bold text-[13px] text-muted-foreground uppercase tracking-wider">
                        <div className="flex items-center gap-1 cursor-pointer hover:text-foreground transition-colors">
                          Last updated <ArrowUpDown className="h-3 w-3" />
                        </div>
                      </TableHead>
                      <TableHead className="text-right pr-6 font-bold text-[13px] text-muted-foreground uppercase tracking-wider">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {MOCK_TABLES.map((table) => (
                      <TableRow 
                        key={table.id} 
                        className="h-20 group hover:bg-muted/5 transition-colors border-b cursor-pointer"
                        onClick={() => handleRowClick(table)}
                      >
                        <TableCell className="px-6" onClick={(e) => e.stopPropagation()}>
                          <Checkbox />
                        </TableCell>
                        <TableCell className="font-black text-base text-[#142424]">{table.name}</TableCell>
                        <TableCell>
                          {table.hasQr ? (
                            <div className="h-10 w-10 border rounded p-1 bg-white shadow-sm flex items-center justify-center">
                              <QrCode className="h-full w-full text-black" strokeWidth={1.5} />
                            </div>
                          ) : (
                            <Button 
                              variant="outline" 
                              size="sm" 
                              className="h-8 text-[10px] font-bold uppercase tracking-wider gap-1.5"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleGenerate(table.name);
                              }}
                            >
                              <QrCode className="h-3 w-3" />
                              Generate
                            </Button>
                          )}
                        </TableCell>
                        <TableCell>
                          <Badge 
                            variant="outline"
                            className={cn(
                              "font-black text-[10px] uppercase tracking-widest px-3 h-6 rounded-full border shadow-none",
                              table.status === 'Active' 
                                ? "bg-green-50 text-green-600 border-green-100" 
                                : "bg-red-50 text-red-500 border-red-100"
                            )}
                          >
                            {table.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="font-bold text-sm text-[#142424]">{table.floor}</TableCell>
                        <TableCell className="text-muted-foreground text-sm font-medium">{table.lastUpdated}</TableCell>
                        <TableCell className="text-right pr-6" onClick={(e) => e.stopPropagation()}>
                          <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full hover:bg-muted">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Pagination */}
              <div className="p-4 flex flex-col sm:flex-row items-center justify-between gap-4 border-t bg-white">
                <div className="flex items-center gap-4">
                  <Select defaultValue="10">
                    <SelectTrigger className="w-[120px] h-9 bg-white border-muted font-medium text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="10">10 per page</SelectItem>
                      <SelectItem value="25">25 per page</SelectItem>
                      <SelectItem value="50">50 per page</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-[13px] text-muted-foreground font-medium">
                    Showing <span className="text-foreground font-bold">1 to 6</span> of <span className="text-foreground font-bold">124</span> results
                  </p>
                </div>

                <div className="flex items-center gap-1">
                  <Button variant="outline" size="icon" className="h-8 w-8 text-muted-foreground" disabled>
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <Button className="h-8 w-8 p-0 text-xs font-bold bg-[#18B4A6] hover:bg-[#149d94] text-white">1</Button>
                  <Button variant="outline" className="h-8 w-8 p-0 text-xs font-medium text-muted-foreground hover:bg-muted">2</Button>
                  <Button variant="outline" className="h-8 w-8 p-0 text-xs font-medium text-muted-foreground hover:bg-muted">3</Button>
                  <span className="px-2 text-muted-foreground text-xs">...</span>
                  <Button variant="outline" className="h-8 w-8 p-0 text-xs font-medium text-muted-foreground hover:bg-muted">21</Button>
                  <Button variant="outline" size="icon" className="h-8 w-8 text-muted-foreground">
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>

      <QrDetailSheet 
        open={isDetailOpen}
        onOpenChange={setIsDetailOpen}
        table={selectedTable}
      />
    </>
  );
}
