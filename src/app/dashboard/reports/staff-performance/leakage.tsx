'use client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { StatCards, type StatCardData } from "@/components/dashboard/stat-cards";
import { DollarSign, FileText, AlertCircle } from "lucide-react";

const leakageData = [
  { id: "#3215", waiter: "John", type: "Closed w/o Settlement", amount: 22.50, status: "Unresolved" },
  { id: "#3211", waiter: "David", type: "Order w/o Payment", amount: 18.30, status: "Unresolved" },
  { id: "#3205", waiter: "Maria", type: "Tip Discrepancy", amount: 2.50, status: "Reviewed" },
];

const leakageKpiCards: StatCardData[] = [
    {
        title: 'Estimated Leakage',
        value: '$40.80',
        icon: DollarSign,
        color: 'pink',
    },
    {
        title: 'Tickets Involved',
        value: '2',
        icon: FileText,
        color: 'orange',
    },
    {
        title: 'Leakage Types',
        value: '2',
        icon: AlertCircle,
        color: 'green',
    }
];

export function Leakage() {
    return (
         <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>Revenue Leakage</CardTitle>
                    <CardDescription>Identify and track potential revenue loss.</CardDescription>
                </CardHeader>
                <CardContent>
                    <StatCards cards={leakageKpiCards} />
                </CardContent>
            </Card>

            <Card>
                <CardContent className="pt-6">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Order ID</TableHead>
                                <TableHead>Waiter</TableHead>
                                <TableHead>Leak Type</TableHead>
                                <TableHead>Amount at Risk</TableHead>
                                <TableHead>Status</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {leakageData.map((row) => (
                                <TableRow key={row.id}>
                                    <TableCell className="font-medium">{row.id}</TableCell>
                                    <TableCell>{row.waiter}</TableCell>
                                    <TableCell>{row.type}</TableCell>
                                    <TableCell className="font-semibold text-destructive">${row.amount.toFixed(2)}</TableCell>
                                    <TableCell>
                                        <Badge variant={row.status === 'Unresolved' ? 'destructive' : 'outline'}>{row.status}</Badge>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}
