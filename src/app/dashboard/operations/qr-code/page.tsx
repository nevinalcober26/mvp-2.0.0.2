
'use client';

import React, { useState, useMemo } from 'react';
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
  Trash2,
  Pencil,
  Ban,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
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
  { id: '1', name: 'Table 1', hasQr: true, status: 'Active', floor: 'Main Dining', lastUpdated: 'Jul 15, 2024 at 1:05 PM' },
  { id: '2', name: 'Table 2', hasQr: false, status: 'Inactive', floor: 'Main Dining', lastUpdated: 'Jul 15, 2024 at 1:05 PM' },
  { id: '3', name: 'Table 3', hasQr: false, status: 'Active', floor: 'Main Dining', lastUpdated: 'Jul 15, 2024 at 1:05 PM' },
  { id: '4', name: 'Table 4', hasQr: true, status: 'Active', floor: 'Main Dining', lastUpdated: 'Jul 15, 2024 at 1:05 PM' },
  { id: '5', name: 'Table 5', hasQr: true, status: 'Active', floor: 'Main Dining', lastUpdated: 'Jul 15, 2024 at 1:05 PM' },
  { id: '6', name: 'Table 6', hasQr: true, status: 'Active', floor: 'Patio', lastUpdated: 'Jul 15, 2024 at 1:05 PM' },
  { id: '7', name: 'Table 7', hasQr: true, status: 'Active', floor: 'Patio', lastUpdated: 'Jul 15, 2024 at 1:05 PM' },
  { id: '8', name: 'Table 8', hasQr: true, status: 'Active', floor: 'Patio', lastUpdated: 'Jul 15, 2024 at 1:05 PM' },
  { id: '9', name: 'Table 9', hasQr: true, status: 'Active', floor: 'Patio', lastUpdated: 'Jul 15, 2024 at 1:05 PM' },
  { id: '10', name: 'Table 10', hasQr: true, status: 'Active', floor: 'Patio', lastUpdated: 'Jul 15, 2024 at 1:05 PM' },
];

const ActionMenuContent = ({ 
  table, 
  onGenerate,
  onEdit
}: { 
  table: TableQrData; 
  onGenerate: (name: string) => void;
  onEdit: (table: TableQrData) => void;
}) => (
  <DropdownMenuContent align="end" className="w-64 p-2 rounded-[24px] shadow-2xl border-gray-100 animate-in zoom-in-95 duration-200">
    <DropdownMenuLabel className="px-4 py-3 text-xl font-black text-[#142424]">Actions</DropdownMenuLabel>
    <DropdownMenuSeparator className="mb-2" />
    
    {table.hasQr ? (
      <>
        {/* Edit Action - Teal Highlight as per screenshot */}
        <DropdownMenuItem 
          className="flex items-center gap-3 px-4 py-3.5 text-[15px] font-bold text-[#142424] bg-[#f0fdfa] hover:bg-[#e6fcf5] focus:bg-[#e6fcf5] rounded-xl cursor-pointer mb-1 transition-colors"
          onSelect={(e) => {
            e.stopPropagation();
            onEdit(table);
          }}
        >
          <Pencil className="h-5 w-5 text-[#18B4A6]" />
          Edit
        </DropdownMenuItem>

        {/* Download Action */}
        <DropdownMenuItem 
          className="flex items-center gap-3 px-4 py-3.5 text-[15px] font-bold text-[#142424] hover:bg-gray-50 focus:bg-gray-50 rounded-xl cursor-pointer mb-1 transition-colors"
          onSelect={(e) => e.stopPropagation()}
        >
          <Download className="h-5 w-5 text-gray-500" />
          Download
        </DropdownMenuItem>

        {/* Deactivate Action */}
        <DropdownMenuItem 
          className="flex items-center gap-3 px-4 py-3.5 text-[15px] font-bold text-[#142424] hover:bg-gray-50 focus:bg-gray-50 rounded-xl cursor-pointer transition-colors"
          onSelect={(e) => e.stopPropagation()}
        >
          <Ban className="h-5 w-5 text-gray-500" />
          Deactivate
        </DropdownMenuItem>
      </>
    ) : (
      <DropdownMenuItem 
        className="flex items-center gap-3 px-4 py-3.5 text-[15px] font-bold text-[#142424] bg-[#f0fdfa] hover:bg-[#e6fcf5] focus:bg-[#e6fcf5] rounded-xl cursor-pointer mb-1 transition-colors"
        onSelect={(e) => {
          e.stopPropagation();
          onGenerate(table.name);
        }}
      >
        <Sparkles className="h-5 w-5 text-[#18B4A6]" />
        Generate
      </DropdownMenuItem>
    )}
    
    <DropdownMenuSeparator className="my-1" />

    <DropdownMenuItem 
      className="flex items-center gap-3 px-4 py-3.5 text-[15px] font-bold text-red-500 hover:bg-red-50 focus:bg-red-50 rounded-xl cursor-pointer transition-colors"
      onSelect={(e) => {
        e.stopPropagation();
      }}
    >
      <Trash2 className="h-5 w-5" />
      Delete
    </DropdownMenuItem>
  </DropdownMenuContent>
);

const QrGalleryCard = ({ table, onClick, onGenerate, onEdit }: { table: TableQrData; onClick: () => void; onGenerate: (name: string) => void; onEdit: (table: TableQrData) => void }) => {
  return (
    <Card 
      className="group relative bg-white border border-gray-100 shadow-sm rounded-xl overflow-hidden hover:shadow-md transition-all duration-300 cursor-pointer"
      onClick={onClick}
    >
      <div className="p-4">
        {/* Checkbox Top Left */}
        <div className="absolute top-4 left-4 z-10" onClick={(e) => e.stopPropagation()}>
          <Checkbox className="h-5 w-5 border-gray-200 rounded-md" />
        </div>

        {/* QR Area */}
        <div className="aspect-square flex items-center justify-center bg-white rounded-lg mb-4">
          {table.hasQr ? (
            <div className="w-full h-full flex items-center justify-center p-4">
               <QrCode className="w-full h-full text-black" strokeWidth={1.5} />
            </div>
          ) : (
            <div className={cn(
                "w-full h-full border-2 border-dashed rounded-2xl flex flex-col items-center justify-center gap-3 transition-colors",
                table.status === 'Inactive' ? "border-red-100 bg-red-50/10" : "border-[#18B4A6]/20 bg-teal-50/10"
            )}>
              <div className={cn(
                  "h-10 w-10 rounded-lg flex items-center justify-center",
                  table.status === 'Inactive' ? "bg-red-50 text-red-500" : "bg-teal-50 text-[#18B4A6]"
              )}>
                <QrCode className="h-6 w-6" strokeWidth={2} />
              </div>
              <p className={cn(
                  "text-[10px] font-black uppercase tracking-widest",
                  table.status === 'Inactive' ? "text-red-500/60" : "text-[#18B4A6]/60"
              )}>Generate QR</p>
            </div>
          )}
        </div>

        {/* Divider */}
        <div className="border-t border-gray-50 -mx-4 mb-4" />

        {/* Bottom Info */}
        <div className="flex items-center justify-between">
          <div className="space-y-1 text-left">
            <h4 className="text-[13px] font-black text-[#142424]">{table.name}</h4>
            <Badge 
              variant="outline"
              className={cn(
                "font-black text-[9px] uppercase tracking-widest px-2 h-5 rounded-full border-0 shadow-none",
                table.status === 'Active' 
                  ? "bg-green-100 text-green-700" 
                  : "bg-red-100 text-red-700"
              )}
            >
              {table.status}
            </Badge>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-8 w-8 rounded-full bg-gray-50 text-gray-400 hover:bg-gray-100" 
                onClick={(e) => e.stopPropagation()}
              >
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <ActionMenuContent table={table} onGenerate={onGenerate} onEdit={onEdit} />
          </DropdownMenu>
        </div>
      </div>
    </Card>
  );
};

export default function QrCodePage() {
  const { toast } = useToast();
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('grid');
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

  const handleOpenDetail = (table: TableQrData) => {
    setSelectedTable(table);
    setIsDetailOpen(true);
  };

  const groupedTables = useMemo(() => {
    const groups: Record<string, TableQrData[]> = {};
    MOCK_TABLES.forEach(table => {
      if (!groups[table.floor]) groups[table.floor] = [];
      groups[table.floor].push(table);
    });
    return groups;
  }, []);

  return (
    <>
      <DashboardHeader />
      <main className="p-4 sm:p-6 lg:p-10 bg-[#F7F9FB] min-h-[calc(100vh-4rem)] text-left">
        <div className="max-w-7xl mx-auto space-y-8">
          
          {/* Page Title & Top Actions */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <h1 className="text-3xl font-black tracking-tight text-[#142424]">Manage QR Codes</h1>
              <p className="text-muted-foreground text-sm font-medium">Create, edit, and manage QR codes for your tables.</p>
            </div>
            <div className="flex items-center gap-3">
              <Button variant="outline" className="gap-2 font-bold text-gray-700 bg-white border-gray-200 h-11 px-6 rounded-xl shadow-sm">
                <Download className="h-4 w-4" />
                Download All
              </Button>
              <Button 
                onClick={handleCreateNew}
                className="gap-2 font-black uppercase tracking-wider bg-[#18B4A6] hover:bg-[#149d94] text-white rounded-xl h-11 px-6 shadow-md"
              >
                <Plus className="h-4 w-4" />
                Create QR Code
              </Button>
            </div>
          </div>

          {/* Filter Bar */}
          <Card className="border-0 shadow-sm rounded-2xl overflow-hidden bg-white">
            <CardContent className="p-4 flex flex-wrap items-center gap-3">
              <div className="relative flex-1 min-w-[200px] max-w-xs">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input 
                  placeholder="Search Tables" 
                  className="pl-9 h-11 bg-muted/10 border-muted focus-visible:ring-primary rounded-xl"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              
              <Select defaultValue="sushi">
                <SelectTrigger className="w-[200px] h-11 bg-white border-muted font-bold rounded-xl">
                  <SelectValue placeholder="Branch" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="sushi">Sushi Restaurant</SelectItem>
                  <SelectItem value="rak">Bloomsbury's Ras..</SelectItem>
                </SelectContent>
              </Select>

              <Select defaultValue="all">
                <SelectTrigger className="w-[140px] h-11 bg-white border-muted font-bold rounded-xl">
                  <SelectValue placeholder="All Floors" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Floors</SelectItem>
                  <SelectItem value="ground">Ground Floor</SelectItem>
                </SelectContent>
              </Select>

              <Select defaultValue="all">
                <SelectTrigger className="w-[140px] h-11 bg-white border-muted font-bold rounded-xl">
                  <SelectValue placeholder="All Statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                </SelectContent>
              </Select>

              <div className="relative ml-auto flex items-center gap-3">
                <Button 
                  variant="outline" 
                  className="h-11 border-[#18B4A6]/20 text-[#18B4A6] hover:bg-[#18B4A6]/5 gap-2 font-black uppercase tracking-wider px-6 rounded-xl"
                >
                  <Sparkles className="h-4 w-4" />
                  Generate Missing QR
                  <span className="absolute -top-1.5 -right-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] text-white font-black border-2 border-white">2</span>
                </Button>

                <div className="flex items-center gap-1 bg-muted/30 p-1 rounded-xl border">
                  <Button 
                    variant={viewMode === 'list' ? 'secondary' : 'ghost'} 
                    size="icon" 
                    className={cn("h-9 w-9 rounded-lg", viewMode === 'list' ? "bg-white shadow-sm" : "text-gray-400")}
                    onClick={() => setViewMode('list')}
                  >
                    <List className="h-4 w-4" />
                  </Button>
                  <Button 
                    variant={viewMode === 'grid' ? 'secondary' : 'ghost'} 
                    size="icon" 
                    className={cn("h-9 w-9 rounded-lg", viewMode === 'grid' ? "bg-white shadow-sm" : "text-gray-400")}
                    onClick={() => setViewMode('grid')}
                  >
                    <LayoutGrid className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {viewMode === 'list' ? (
            <Card className="border-0 shadow-sm rounded-2xl overflow-hidden bg-white">
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
                        onClick={() => handleOpenDetail(table)}
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
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full hover:bg-muted">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <ActionMenuContent table={table} onGenerate={handleGenerate} onEdit={handleOpenDetail} />
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </Card>
          ) : (
            <div className="space-y-10">
              {Object.entries(groupedTables).map(([floor, tables]) => (
                <div key={floor} className="space-y-6">
                  <div className="flex items-center gap-3">
                    <h2 className="text-xl font-black text-[#142424]">{floor}</h2>
                    <Badge variant="secondary" className="bg-gray-200/50 text-gray-500 font-bold text-[11px] h-6 px-3 rounded-full">
                      {tables.length} Tables
                    </Badge>
                    <div className="flex-1 border-t border-dashed border-gray-200 ml-2" />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                    {tables.map(table => (
                      <QrGalleryCard 
                        key={table.id} 
                        table={table} 
                        onClick={() => handleOpenDetail(table)} 
                        onGenerate={handleGenerate}
                        onEdit={handleOpenDetail}
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Pagination */}
          <Card className="border-0 shadow-sm rounded-2xl bg-white p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <Select defaultValue="10">
                <SelectTrigger className="w-[120px] h-10 bg-white border-muted font-bold text-xs rounded-xl">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="10">10 per page</SelectItem>
                  <SelectItem value="25">25 per page</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-[13px] text-muted-foreground font-medium">
                Showing <span className="text-foreground font-bold">1 to 10</span> of <span className="text-foreground font-bold">{MOCK_TABLES.length}</span> results
              </p>
            </div>

            <div className="flex items-center gap-1">
              <Button variant="outline" size="icon" className="h-10 w-10 text-muted-foreground rounded-xl border-gray-200" disabled>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button className="h-10 w-10 p-0 text-sm font-black bg-[#18B4A6] hover:bg-[#149d94] text-white rounded-xl">1</Button>
              <Button variant="outline" size="icon" className="h-10 w-10 text-muted-foreground rounded-xl border-gray-200" disabled>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
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
