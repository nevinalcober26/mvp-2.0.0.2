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
import { useToast } from '@/hooks/use-toast';

const kpis: StatCardData[] = [
    { title: "Risky Tables", value: "3", icon: AlertTriangle, color: 'pink' },
    { title: "Revenue at Risk", value: "$245.50", icon: DollarSign, color: 'orange' },
    { title: "Tips Trend (7d)", value: "+5.2%", icon: TrendingUp, color: 'green', change: "+5.2%" },
];

const alerts = [
    { type: "High-risk Table", timestamp: "2m ago", reference: "Waiter: John, Table: T5", severity: "High", orderId: "#3214" },
    { type: "Unusual Tip Drop", timestamp: "1h ago", reference: "Waiter: Maria", severity: "Medium", orderId: "#3211" },
    { type: "Ending Shift with Open Balance", timestamp: "8h ago", reference: "Waiter: David", severity: "Low", orderId: "#3210" },
];

export function AiOverview() {
    const [orders, setOrders] = useState<Order[]>([]);
    const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
    const [isSheetOpen, setIsSheetOpen] = useState(false);
    const { toast } = useToast();

    useEffect(() => {
        setOrders(generateMockOrders(50));
    }, []);

    const handleViewDetails = (orderId: string) => {
        const order = orders.find(o => o.orderId === orderId);
        if (order) {
            setSelectedOrder(order);
            setIsSheetOpen(true);
        } else {
            toast({
                variant: "destructive",
                title: "Order Details Not Found",
                description: `Could not find the details for order ${orderId}.`,
            });
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
                                            <Button variant="ghost" size="icon" onClick={() => handleViewDetails(alert.orderId)}>
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
