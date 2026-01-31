"use client";

import { useShopfloorStore } from "@/store/useShopfloorStore";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useState, useMemo } from "react";
import { MaterialRequestItem, MaterialRequest } from "@/types";
import { Plus, Trash2, ShoppingCart, Loader2 } from "lucide-react";
import { toast } from "sonner";

export function MaterialRequestForm({ onSuccess }: { onSuccess: () => void }) {
    const { addMaterialRequest, costCenterMappings, assets, products, consumableTransactions } = useShopfloorStore();
    const [selectedArea, setSelectedArea] = useState<string>("");

    // Initial 20 rows
    const [rows, setRows] = useState<MaterialRequestItem[]>(
        Array.from({ length: 20 }).map(() => ({
            id: crypto.randomUUID(),
            partNumber: "",
            description: "",
            quantity: 0,
            unitCost: 0,
            total: 0
        }))
    );

    const [isSubmitting, setIsSubmitting] = useState(false);

    // Get Unique Areas from Assets
    const areas = useMemo(() => Array.from(new Set(assets.map(a => a.area))).sort(), [assets]);

    // Mock Product DB from transactions + products for auto-complete
    const productDb = useMemo(() => {
        const db = new Map<string, { desc: string, cost: number }>();
        // Add from Products
        products.forEach(p => {
            // Assuming product name is part number or related
            db.set(p.name, { desc: p.description, cost: 0 });
        });
        // Add from History
        consumableTransactions.forEach(tx => {
            if (tx.partNumber) {
                db.set(tx.partNumber, { desc: tx.partDescription || "", cost: tx.unitCost });
            }
        });
        return db;
    }, [products, consumableTransactions]);

    const handlePartNumberChange = (id: string, val: string) => {
        const updated = rows.map(r => {
            if (r.id === id) {
                const found = productDb.get(val); // Exact match logic, could be better
                return {
                    ...r,
                    partNumber: val,
                    description: found ? found.desc : r.description,
                    unitCost: found ? found.cost : r.unitCost,
                    total: found ? r.quantity * found.cost : 0
                };
            }
            return r;
        });
        setRows(updated);
    };

    const handleQuantityChange = (id: string, qty: number) => {
        const updated = rows.map(r => {
            if (r.id === id) {
                return { ...r, quantity: qty, total: qty * r.unitCost };
            }
            return r;
        });
        setRows(updated);
    };

    const handleCostChange = (id: string, cost: number) => {
        const updated = rows.map(r => {
            if (r.id === id) {
                return { ...r, unitCost: cost, total: r.quantity * cost };
            }
            return r;
        });
        setRows(updated);
    };

    const addRow = () => {
        setRows([...rows, {
            id: crypto.randomUUID(),
            partNumber: "",
            description: "",
            quantity: 0,
            unitCost: 0,
            total: 0
        }]);
    };

    const handleSubmit = async () => {
        if (!selectedArea) {
            toast.error("Selecione um Centro de Custo/Área obrigatoriamente.");
            return;
        }

        const validItems = rows.filter(r => r.partNumber && r.quantity > 0);
        if (validItems.length === 0) {
            toast.error("Adicione pelo menos um item válido (Part Number e Quantidade).");
            return;
        }

        setIsSubmitting(true);
        try {
            const grandTotal = validItems.reduce((acc, curr) => acc + curr.total, 0);

            const newReq: MaterialRequest = {
                id: crypto.randomUUID(),
                area: selectedArea,
                status: 'pending',
                requestDate: new Date().toISOString(),
                items: validItems,
                totalCost: grandTotal
            };

            await addMaterialRequest(newReq);
            toast.success(`Pedido criado com sucesso! ${validItems.length} itens.`);
            onSuccess();
        } catch (e) {
            toast.error("Erro ao criar pedido.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Card className="w-full">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <ShoppingCart className="h-5 w-5 text-blue-600" />
                    Novo Pedido de Material (AS400)
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Área / Centro de Custo <span className="text-red-500">*</span></label>
                        <Select value={selectedArea} onValueChange={setSelectedArea}>
                            <SelectTrigger>
                                <SelectValue placeholder="Selecione a Área..." />
                            </SelectTrigger>
                            <SelectContent>
                                {areas.map(a => (
                                    <SelectItem key={a} value={a}>{a}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="space-y-2 md:col-span-2 flex justify-end items-end">
                        <div className="text-right">
                            <span className="text-sm text-slate-500 block">Total Estimado</span>
                            <span className="text-2xl font-bold text-green-700">
                                € {rows.reduce((acc, r) => acc + (r.total || 0), 0).toFixed(2)}
                            </span>
                        </div>
                    </div>
                </div>

                <div className="border rounded-md overflow-hidden">
                    <Table>
                        <TableHeader>
                            <TableRow className="bg-slate-50">
                                <TableHead className="w-[50px]">#</TableHead>
                                <TableHead className="w-[180px]">Part Number</TableHead>
                                <TableHead>Descrição (Item)</TableHead>
                                <TableHead className="w-[100px] text-right">Qtd</TableHead>
                                <TableHead className="w-[120px] text-right">Custo Unit.</TableHead>
                                <TableHead className="w-[120px] text-right">Total</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {rows.map((row, index) => (
                                <TableRow key={row.id}>
                                    <TableCell className="font-mono text-xs text-slate-500">{index + 1}</TableCell>
                                    <TableCell>
                                        <Input
                                            value={row.partNumber}
                                            onChange={(e) => handlePartNumberChange(row.id, e.target.value)}
                                            placeholder="Busca..."
                                            className="h-8 font-mono"
                                            list={`parts-${index}`}
                                        />
                                        <datalist id={`parts-${index}`}>
                                            {Array.from(productDb.keys()).slice(0, 50).map(k => (
                                                <option key={k} value={k}>{productDb.get(k)?.desc}</option>
                                            ))}
                                        </datalist>
                                    </TableCell>
                                    <TableCell>
                                        <Input
                                            value={row.description}
                                            readOnly
                                            className="h-8 bg-slate-100 text-slate-600 focus-visible:ring-0 cursor-not-allowed"
                                        />
                                    </TableCell>
                                    <TableCell>
                                        <Input
                                            type="number"
                                            value={row.quantity}
                                            onChange={(e) => handleQuantityChange(row.id, Number(e.target.value))}
                                            className="h-8 text-right"
                                            min={0}
                                        />
                                    </TableCell>
                                    <TableCell>
                                        <Input
                                            type="number"
                                            value={row.unitCost}
                                            readOnly
                                            className="h-8 text-right bg-slate-100 text-slate-600 focus-visible:ring-0 cursor-not-allowed"
                                            min={0}
                                            step={0.01}
                                        />
                                    </TableCell>
                                    <TableCell className="text-right font-medium">
                                        € {row.total.toFixed(2)}
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>

                <div className="flex justify-between">
                    <Button variant="outline" onClick={addRow}>
                        <Plus className="mr-2 h-4 w-4" /> Adicionar Linha
                    </Button>
                    <Button onClick={handleSubmit} disabled={isSubmitting} className="bg-blue-600 hover:bg-blue-700">
                        {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <ShoppingCart className="mr-2 h-4 w-4" />}
                        Finalizar Pedido
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}
