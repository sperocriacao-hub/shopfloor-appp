"use client";

import { useShopfloorStore } from "@/store/useShopfloorStore";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { CheckCircle, XCircle, Printer, Eye } from "lucide-react";
import { useState } from "react";
import { MaterialRequest } from "@/types";
import { toast } from "sonner";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale/pt-BR";

export function MaterialWarehouseView() {
    const { materialRequests, updateMaterialRequest } = useShopfloorStore();
    const [filterStatus, setFilterStatus] = useState<'pending' | 'all'>('pending');

    const filtered = materialRequests
        .filter(r => filterStatus === 'all' ? true : r.status === 'pending')
        .sort((a, b) => new Date(b.requestDate).getTime() - new Date(a.requestDate).getTime());

    const handleApprove = async (id: string) => {
        await updateMaterialRequest(id, {
            status: 'approved',
            processedAt: new Date().toISOString(),
            processedBy: 'Warehouse'
        });
        toast.success("Pedido aprovado!");
    };

    const handleReject = async (id: string) => {
        await updateMaterialRequest(id, {
            status: 'rejected',
            processedAt: new Date().toISOString(),
            processedBy: 'Warehouse'
        });
        toast.error("Pedido rejeitado.");
    };

    const handlePrint = (req: MaterialRequest) => {
        // Simple Print Window
        const win = window.open('', '', 'width=800,height=600');
        if (!win) return;

        const content = `
            <html>
            <head>
                <title>Pedido Mat. ${req.id.slice(0, 8)}</title>
                <style>
                    body { font-family: sans-serif; padding: 20px; }
                    .header { display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #ccc; padding-bottom: 10px; margin-bottom: 20px; }
                    .logo { font-size: 24px; font-weight: bold; color: #003366; }
                    .info { font-size: 12px; }
                    table { width: 100%; border-collapse: collapse; margin-top: 20px; }
                    th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
                    th { background-color: #f2f2f2; }
                    .totals { margin-top: 20px; text-align: right; font-weight: bold; }
                </style>
            </head>
            <body>
                <div class="header">
                    <div>
                        <div class="logo">Brunswick Shopfloor</div>
                        <div class="info">Vila Nova de Cerveira</div>
                    </div>
                    <div style="text-align: right;">
                        <h3>Requisição de Material</h3>
                        <p>ID: ${req.id.slice(0, 8)}</p>
                        <p>Data: ${new Date(req.requestDate).toLocaleDateString('pt-BR')}</p>
                         <p>Área: ${req.area}</p>
                    </div>
                </div>

                <table>
                    <thead>
                        <tr>
                            <th>#</th>
                            <th>Part Number</th>
                            <th>Descrição</th>
                            <th style="text-align: right;">Qtd</th>
                            <th style="text-align: right;">Custo Unit.</th>
                            <th style="text-align: right;">Total</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${req.items.map((item, i) => `
                            <tr>
                                <td>${i + 1}</td>
                                <td>${item.partNumber}</td>
                                <td>${item.description}</td>
                                <td style="text-align: right;">${item.quantity}</td>
                                <td style="text-align: right;">€ ${item.unitCost.toFixed(2)}</td>
                                <td style="text-align: right;">€ ${item.total.toFixed(2)}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>

                <div class="totals">
                    <p>Total Estimado: € ${req.totalCost.toFixed(2)}</p>
                </div>

                <div style="margin-top: 50px; display: flex; justify-content: space-between;">
                    <div style="border-top: 1px solid #000; width: 40%; text-align: center; padding-top: 5px;">Requisitante</div>
                    <div style="border-top: 1px solid #000; width: 40%; text-align: center; padding-top: 5px;">Armazém (Aprovado)</div>
                </div>
            </body>
            </html>
        `;

        win.document.write(content);
        win.document.close();
        win.print();
    };

    return (
        <Card className="w-full">
            <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Gestão de Pedidos (Armazém)</CardTitle>
                <div className="flex gap-2">
                    <Button variant={filterStatus === 'pending' ? 'default' : 'outline'} onClick={() => setFilterStatus('pending')}>Pendentes</Button>
                    <Button variant={filterStatus === 'all' ? 'default' : 'outline'} onClick={() => setFilterStatus('all')}>Todos</Button>
                </div>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Data</TableHead>
                            <TableHead>Área</TableHead>
                            <TableHead>Itens</TableHead>
                            <TableHead>Valor Total</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="text-right">Ações</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filtered.length === 0 && <TableRow><TableCell colSpan={6} className="text-center py-8 text-slate-500">Nenhum pedido encontrado.</TableCell></TableRow>}
                        {filtered.map(req => (
                            <TableRow key={req.id}>
                                <TableCell>{format(new Date(req.requestDate), 'dd/MM/yyyy HH:mm')}</TableCell>
                                <TableCell className="font-medium text-blue-900">{req.area}</TableCell>
                                <TableCell>{req.items.length} itens</TableCell>
                                <TableCell className="font-bold">€ {req.totalCost.toFixed(2)}</TableCell>
                                <TableCell>
                                    <Badge variant={
                                        req.status === 'pending' ? 'outline' :
                                            req.status === 'approved' ? 'default' :
                                                'destructive'
                                    }>
                                        {req.status === 'pending' ? 'Pendente' :
                                            req.status === 'approved' ? 'Aprovado' : 'Rejeitado'}
                                    </Badge>
                                </TableCell>
                                <TableCell className="text-right flex justify-end gap-2">
                                    <Button variant="ghost" size="icon" onClick={() => handlePrint(req)}>
                                        <Printer className="h-4 w-4" />
                                    </Button>

                                    <Dialog>
                                        <DialogTrigger asChild>
                                            <Button variant="outline" size="sm"><Eye className="h-4 w-4 mr-1" /> Ver</Button>
                                        </DialogTrigger>
                                        <DialogContent className="max-w-2xl">
                                            <div className="space-y-4">
                                                <h3 className="font-bold">Detalhes do Pedido</h3>
                                                <Table>
                                                    <TableHeader><TableRow><TableHead>Item</TableHead><TableHead>Qtd</TableHead><TableHead>Total</TableHead></TableRow></TableHeader>
                                                    <TableBody>
                                                        {req.items?.map((i: any) => (
                                                            <TableRow key={i.id}>
                                                                <TableCell>
                                                                    <div className="font-bold">{i.partNumber}</div>
                                                                    <div className="text-xs text-slate-500">{i.description}</div>
                                                                </TableCell>
                                                                <TableCell>{i.quantity}</TableCell>
                                                                <TableCell>€ {i.total.toFixed(2)}</TableCell>
                                                            </TableRow>
                                                        ))}
                                                    </TableBody>
                                                </Table>
                                            </div>
                                        </DialogContent>
                                    </Dialog>

                                    {req.status === 'pending' && (
                                        <>
                                            <Button size="icon" className="bg-green-600 hover:bg-green-700" onClick={() => handleApprove(req.id)}>
                                                <CheckCircle className="h-4 w-4" />
                                            </Button>
                                            <Button size="icon" variant="destructive" onClick={() => handleReject(req.id)}>
                                                <XCircle className="h-4 w-4" />
                                            </Button>
                                        </>
                                    )}
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    );
}
