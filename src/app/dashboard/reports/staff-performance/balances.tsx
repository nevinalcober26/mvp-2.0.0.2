'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { StatCards, type StatCardData } from "@/components/dashboard/stat-cards";
import { Clock } from "lucide-react";

const balancesData = [
  { waiter: 'John', amount: 22.50, openTables: 1, oldestAge: "45m", recoveredVsLost: "$50 / $5" },
  { waiter: 'David', amount: 40.80, openTables: 2, oldestAge: "1h 15m", recoveredVsLost: "$20 / $15" },
  { waiter: 'Maria', amount: 5.50, openTables: 1, oldestAge: "8m", recoveredVsLost: "$10 / $0" },
];

const balanceCards: StatCardData[] = [
    { title: "0-10 min", value: "$5.50", icon: Clock, color: 'green' },
    { title: "10-30 min", value: "$0.00", icon: Clock, color: 'orange' },
    { title: "30+ min", value: "$63.30", icon: Clock, color: 'pink' }
];


export function Balances() {
    return (
        <div className="space-y-6">
             <Card>
                <CardHeader>
                    <CardTitle>Outstanding Balances by Waiter</CardTitle>
                    <CardDescription>Monitor waiters with open balances.</CardDescription>
                </CardHeader>
                 <CardContent>
                    <StatCards cards={balanceCards} />
                </CardContent>
            </Card>
            <Card>
                <CardContent className="pt-6">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Waiter</TableHead>
                                <TableHead>Outstanding Amount</TableHead>
                                <TableHead># Open Tables</TableHead>
                                <TableHead>Oldest Balance Age</TableHead>
                                <TableHead>Recovered vs Lost</TableHead>
                                <TableHead className="text-right"></TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {balancesData.map((row) => (
                                <TableRow key={row.waiter} className={cn(row.amount > 25 && "bg-destructive/10")}>
                                    <TableCell className="font-medium">{row.waiter}</TableCell>
                                    <TableCell className="font-semibold text-destructive">${row.amount.toFixed(2)}</TableCell>
                                    <TableCell>{row.openTables}</TableCell>
                                    <TableCell>{row.oldestAge}</TableCell>
                                    <TableCell>{row.recoveredVsLost}</TableCell>
                                    <TableCell className="text-right"><Button variant="link" size="sm">View open tables</Button></TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}
