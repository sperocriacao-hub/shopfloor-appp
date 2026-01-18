"use client";

import { useShopfloorStore } from "@/store/useShopfloorStore";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Check, X, Truck, Archive } from "lucide-react";
import { toast } from "sonner";
import { PpeRequest } from "@/types";

export function PPIWarehouseView() {
    const { ppeRequests, updatePpeRequest, employees, assets } = useShopfloorStore();

    // Show Pending first, then Processed
    const sortedRequests = [...ppeRequests].sort((a, b) => {
        // Sort by Status Priority: Pending > Processed > Delivered > Rejected
        const statusPriority = { pending: 0, processed: 1, delivered: 2, rejected: 3 };
        if (statusPriority[a.status] !== statusPriority[b.status]) {
            return statusPriority[a.status] - statusPriority[b.status];
        }
        // Then by Date (Oldest first for pending, Newest for others)
        const dateA = new Date(a.requestDate).getTime();
        const dateB = new Date(b.requestDate).getTime();
        return a.status === 'pending' ? dateA - dateB : dateB - dateA;
    });

    const handleUpdateStatus = async (id: string, status: PpeRequest['status']) => {
        try {
            await updatePpeRequest(id, {
                status,
                processedBy: 'Warehouse' // Placeholder for now
            });
            toast.success(`Pedido atualizado para: ${status}`);
        } catch (error) {
            toast.error("Erro ao atualizar pedido.");
        }
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>Gestão de Pedidos (Armazém)</CardTitle>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Data</TableHead>
                            <TableHead>Funcionário</TableHead>
                            <TableHead>Área</TableHead>
                            <TableHead>Item / Qtd</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Ações</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {sortedRequests.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={6} className="text-center py-8 text-slate-500">
                                    Nenhum pedido registrado.
                                </TableCell>
                            </TableRow>
                        ) : (
                            sortedRequests.map(req => {
                                const empName = req.employeeId ? employees.find(e => e.id === req.employeeId)?.name : '-';
                                const assetName = req.assetId ? assets.find(a => a.id === req.assetId)?.name : '-';

                                return (
                                    <TableRow key={req.id}>
                                        <TableCell className="text-xs">
                                            {new Date(req.requestDate).toLocaleString('pt-PT')}
                                        </TableCell>
                                        <TableCell>{empName}</TableCell>
                                        <TableCell>{assetName}</TableCell>
                                        <TableCell>
                                            <div className="font-medium">{req.itemName}</div>
                                            <div className="text-xs text-slate-500">
                                                Qtd: {req.quantity} {req.partNumber && `(PN: ${req.partNumber})`}
                                            </div>
                                            {req.notes && <div className="text-xs italic text-slate-400 mt-1">"{req.notes}"</div>}
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant={
                                                req.status === 'pending' ? 'default' : // uses primary color (usually black/blue)
                                                    req.status === 'processed' ? 'secondary' : // gray/blue
                                                        req.status === 'delivered' ? 'outline' : // green border ideally
                                                            'destructive' // red
                                            } className={
                                                req.status === 'pending' ? 'bg-yellow-500 hover:bg-yellow-600' :
                                                    req.status === 'processed' ? 'bg-blue-500 hover:bg-blue-600 text-white' :
                                                        req.status === 'delivered' ? 'bg-green-600 text-white' : ''
                                            }>
                                                {req.status.toUpperCase()}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex gap-1">
                                                {req.status === 'pending' && (
                                                    <>
                                                        <Button size="sm" className="h-7 px-2 bg-blue-600 hover:bg-blue-700" title="Processar (AS400)" onClick={() => handleUpdateStatus(req.id, 'processed')}>
                                                            <Check className="h-3 w-3 mr-1" /> Processar
                                                        </Button>
                                                        <Button size="sm" variant="destructive" className="h-7 px-2" title="Rejeitar" onClick={() => handleUpdateStatus(req.id, 'rejected')}>
                                                            <X className="h-3 w-3" />
                                                        </Button>
                                                    </>
                                                )}
                                                {req.status === 'processed' && (
                                                    <Button size="sm" className="h-7 px-2 bg-green-600 hover:bg-green-700" title="Marcar como Entregue" onClick={() => handleUpdateStatus(req.id, 'delivered')}>
                                                        <Truck className="h-3 w-3 mr-1" /> Entregar
                                                    </Button>
                                                )}
                                                {(req.status === 'delivered' || req.status === 'rejected') && (
                                                    <span className="text-xs text-slate-400 flex items-center">
                                                        <Archive className="h-3 w-3 mr-1" /> Arquivado
                                                    </span>
                                                )}
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                );
                            })
                        )}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    );
}
