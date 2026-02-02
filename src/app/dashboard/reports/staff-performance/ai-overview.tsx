'use client';
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { StatCards, type StatCardData } from "@/components/dashboard/stat-cards";
import { AlertTriangle, DollarSign, TrendingUp, Eye } from "lucide-react";
import { OrderDetailsSheet } from '@/app/dashboard/orders/order-details-sheet';
import type { Order } from '@/app/dashboard/orders/types';
import { generateMockOrders } from '@/app/dashboard/orders/mock';

const kpis: StatCardData[] = [
    { title: "Risky Tables", value: "3", icon: AlertTriangle, color: 'pink' },
    { title: "Revenue at Risk", value: "$245.50", icon: DollarSign, color: 'orange' },
    { title: "Tips Trend (7d)", value: "+5.2%", icon: TrendingUp, color: 'green', change: "+5.2%" },
];

const alerts = [
    { type: "High-risk Table", timestamp: "2m ago", reference: "Waiter: John, Table: T5", severity: "High", waiter: "John" },
    { type: "Unusual Tip Drop", timestamp: "1h ago", reference: "Waiter: Maria", severity: "Medium", waiter: "Maria" },
    { type: "Ending Shift with Open Balance", timestamp: "8h ago", reference: "Waiter: David", severity: "Low", waiter: "David" },
]

export function AiOverview() {
    const [orders, setOrders] = useState<Order[]>([]);
    const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
    const [isSheetOpen, setIsSheetOpen] = useState(false);

    useEffect(() => {
        setOrders(generateMockOrders(50));
    }, []);

    const handleViewDetails = (waiterName: string) => {
        // For demonstration, find the first order associated with the waiter
        const order = orders.find(o => o.staffName === waiterName);
        if (order) {
            setSelectedOrder(order);
            setIsSheetOpen(true);
        }
    };

    return (
        <>
            <div className="space-y-6">
                <StatCards cards={kpis} />

                <Card>
                    <CardHeader>
                        <CardTitle>Notable AI Alerts</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Type</TableHead>
                                    <TableHead>Timestamp</TableHead>
                                    <TableHead>Reference</TableHead>
                                    <TableHead>Severity</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {alerts.map((alert, index) => (
                                    <TableRow key={index}>
                                        <TableCell className="font-medium">{alert.type}</TableCell>
                                        <TableCell>{alert.timestamp}</TableCell>
                                        <TableCell>{alert.reference}</TableCell>
                                        <TableCell><Badge variant={alert.severity === 'High' ? 'destructive' : alert.severity === 'Medium' ? 'secondary' : 'outline'}>{alert.severity}</Badge></TableCell>
                                        <TableCell className="text-right">
                                            <Button variant="ghost" size="icon" onClick={() => handleViewDetails(alert.waiter)}>
                                                <Eye className="h-5 w-5" />
                                                <span className="sr-only">View details</span>
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </div>
            <OrderDetailsSheet
                order={selectedOrder}
                open={isSheetOpen}
                onOpenChange={setIsSheetOpen}
            />
        </>
    )
}
