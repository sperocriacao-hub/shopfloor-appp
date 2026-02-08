"use client";

import { useState, useMemo } from "react";
import { useShopfloorStore } from "@/store/useShopfloorStore";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Trash2, AlertTriangle, CheckCircle, XCircle, Search, Save } from "lucide-react";
import { toast } from "sonner";
import { ScrapTransaction } from "@/types";

export default function ScrapPage() {
    const store = useShopfloorStore();
    const [activeTab, setActiveTab] = useState("report");

    // Form State
    const [partNumber, setPartNumber] = useState("");
    const [quantity, setQuantity] = useState("");
    const [reason, setReason] = useState("");
    const [costCenter, setCostCenter] = useState("");
    const [notes, setNotes] = useState("");

    // Computed Cost
    const selectedItem = useMemo(() => {
        return store.as400Items.find(i => i.partNumber === partNumber);
    }, [partNumber, store.as400Items]);

    const estimatedCost = useMemo(() => {
        const qty = parseFloat(quantity) || 0;
        const unitCost = selectedItem?.unitCost || 0;
        return qty * unitCost;
    }, [quantity, selectedItem]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!selectedItem) {
            toast.error("Part Number não encontrado no cache do AS400.");
            return;
        }

        const newScrap: ScrapTransaction = {
            id: `scrap-${Date.now()}`,
            date: new Date().toISOString(),
            partNumber,
            partDescription: selectedItem.description,
            quantity: parseFloat(quantity),
            reasonCode: reason as any,
            costCenter: costCenter || 'PROD-GERAL',
            unitCost: selectedItem.unitCost,
            totalCost: estimatedCost,
            status: 'pending',
            reportedBy: store.currentUser?.name || 'Operador',
            notes
        };

        try {
            await store.addScrapTransaction(newScrap);
            toast.success("Scrap reportado com sucesso! Aguardando validação.");
            // Reset
            setPartNumber("");
            setQuantity("");
            setReason("");
            setNotes("");
        } catch (error) {
            toast.error("Erro ao salvar scrap.");
        }
    };

    const handleApprove = async (id: string) => {
        try {
            await store.updateScrapTransaction(id, {
                status: 'approved',
                approvedBy: store.currentUser?.name || 'Armazém'
            });
            toast.success("Scrap aprovado!");
        } catch (error) {
            toast.error("Erro ao aprovar scrap.");
        }
    };

    const handleReject = async (id: string) => {
        try {
            await store.updateScrapTransaction(id, { status: 'rejected' });
            toast.error("Scrap rejeitado.");
        } catch (error) {
            toast.error("Erro ao rejeitar scrap.");
        }
    };

    const formatCurrency = (val?: number) => new Intl.NumberFormat('pt-PT', { style: 'currency', currency: 'EUR' }).format(val || 0);

    const pendingScrap = store.scrapTransactions.filter(t => t.status === 'pending');
    const historyScrap = store.scrapTransactions.filter(t => t.status !== 'pending');

    return (
        <div className="p-8 space-y-8 fade-in animate-in">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
                        <Trash2 className="w-8 h-8 text-red-600" />
                        Gestão de Scrap (Desperdício)
                    </h1>
                    <p className="text-slate-500 mt-2">
                        Integração AS400: Custos atualizados via Sync Center.
                    </p>
                </div>
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
                <TabsList className="bg-slate-100 p-1">
                    <TabsTrigger value="report">Reportar (Produção)</TabsTrigger>
                    <TabsTrigger value="validate">Validar (Armazém)
                        {pendingScrap.length > 0 && <span className="ml-2 bg-red-100 text-red-600 px-2 rounded-full text-xs font-bold">{pendingScrap.length}</span>}
                    </TabsTrigger>
                    <TabsTrigger value="history">Histórico</TabsTrigger>
                </TabsList>

                {/* 1. REPORT FORM */}
                <TabsContent value="report">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        <div className="lg:col-span-2">
                            <Card className="border-slate-200 shadow-sm h-full">
                                <CardHeader>
                                    <CardTitle>Novo Registro de Scrap</CardTitle>
                                    <CardDescription>Preencha os dados do material desperdiçado.</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <form onSubmit={handleSubmit} className="space-y-4">
                                        <div className="space-y-2">
                                            <Label>Referência (Part Number)</Label>
                                            <div className="relative w-full">
                                                <Input
                                                    placeholder="Ex: 505-CAB-001"
                                                    value={partNumber}
                                                    onChange={e => setPartNumber(e.target.value.toUpperCase())}
                                                    required
                                                />
                                                {selectedItem && (
                                                    <span className="absolute right-3 top-2.5 text-xs text-green-600 font-bold flex items-center gap-1 bg-green-50 px-2 rounded">
                                                        <CheckCircle className="w-3 h-3" /> Encontrado
                                                    </span>
                                                )}
                                            </div>
                                            {selectedItem && (
                                                <div className="text-xs text-slate-500 bg-slate-50 p-2 rounded border border-slate-100">
                                                    {selectedItem.description}
                                                </div>
                                            )}
                                            {!selectedItem && partNumber.length > 3 && (
                                                <div className="text-xs text-red-500 flex items-center gap-1">
                                                    <XCircle className="w-3 h-3" /> Não encontrado no cache. Verifique o Sync Center.
                                                </div>
                                            )}
                                        </div>

                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <Label>Quantidade</Label>
                                                <Input
                                                    type="number"
                                                    min="0.01"
                                                    step="0.01"
                                                    value={quantity}
                                                    onChange={e => setQuantity(e.target.value)}
                                                    required
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label>Custo Unitário (AS400)</Label>
                                                <Input
                                                    value={selectedItem ? formatCurrency(selectedItem.unitCost) : '---'}
                                                    disabled
                                                    className="bg-slate-50"
                                                />
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <Label>Motivo</Label>
                                                <Select value={reason} onValueChange={setReason} required>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Selecione..." />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="defect">Defeito de Material</SelectItem>
                                                        <SelectItem value="setup">Setup / Ajuste</SelectItem>
                                                        <SelectItem value="operator">Erro Operacional</SelectItem>
                                                        <SelectItem value="obsolete">Obsolescência</SelectItem>
                                                        <SelectItem value="testing">Testes de Qualidade</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                            <div className="space-y-2">
                                                <Label>Centro de Custo</Label>
                                                <Input
                                                    value={costCenter}
                                                    onChange={e => setCostCenter(e.target.value)}
                                                    placeholder="Opcional"
                                                />
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <Label>Observações</Label>
                                            <Textarea
                                                placeholder="Detalhes adicionais..."
                                                value={notes}
                                                onChange={e => setNotes(e.target.value)}
                                            />
                                        </div>

                                        <div className="pt-4">
                                            <Button
                                                type="submit"
                                                className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold shadow-sm"
                                                disabled={!selectedItem}
                                            >
                                                <Save className="w-4 h-4 mr-2" />
                                                Confirmar Scrap
                                            </Button>
                                        </div>
                                    </form>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Cost Preview */}
                        <div className="lg:col-span-1">
                            <Card className="bg-slate-50 border-slate-200 h-full border-l-4 border-l-amber-400">
                                <CardHeader>
                                    <CardTitle className="text-slate-600 text-sm font-semibold uppercase tracking-wide">Resumo da Perda Financeira</CardTitle>
                                </CardHeader>
                                <CardContent className="flex flex-col items-center justify-center py-10 space-y-4 text-center">
                                    <AlertTriangle className="w-16 h-16 text-amber-500 mb-2 drop-shadow-sm" />
                                    <div>
                                        <div className="text-5xl font-bold text-slate-900 tracking-tight">
                                            {formatCurrency(estimatedCost)}
                                        </div>
                                        <p className="text-slate-500 text-sm mt-2">Custo Total Estimado</p>
                                    </div>
                                    <div className="w-full border-t border-slate-200 my-4 pt-4 text-left text-xs text-slate-400">
                                        <p>O custo é calculado com base no <strong>Standard Cost</strong> sincronizado do AS400.</p>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </TabsContent>

                {/* 2. VALIDATION LIST */}
                <TabsContent value="validate">
                    <Card>
                        <CardHeader>
                            <CardTitle>Aguardando Validação do Armazém</CardTitle>
                            <CardDescription>Estes itens requerem aprovação antes de serem exportados para a contabilidade.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            {pendingScrap.length === 0 ? (
                                <div className="text-center text-slate-500 py-20 bg-slate-50 rounded border border-dashed border-slate-200">
                                    <CheckCircle className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                                    Nenhum registro pendente para validação.
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {pendingScrap.map(scrap => (
                                        <div key={scrap.id} className="flex flex-col md:flex-row justify-between items-start md:items-center p-4 bg-white border border-slate-200 rounded-lg shadow-sm hover:shadow-md transition-shadow">
                                            <div className="mb-4 md:mb-0">
                                                <div className="flex items-center gap-3 mb-1">
                                                    <span className="font-bold text-lg text-slate-900">{scrap.partNumber}</span>
                                                    <span className="text-xs font-semibold text-slate-600 bg-slate-100 px-2 py-0.5 rounded border border-slate-200 uppercase tracking-wide">
                                                        {scrap.reasonCode}
                                                    </span>
                                                </div>
                                                <div className="text-sm text-slate-600">{scrap.partDescription}</div>
                                                <div className="text-xs text-slate-400 mt-1 flex items-center gap-2">
                                                    <span>Reportado por <strong>{scrap.reportedBy}</strong></span>
                                                    <span>•</span>
                                                    <span>{new Date(scrap.date).toLocaleString()}</span>
                                                </div>
                                                {scrap.notes && (
                                                    <div className="mt-2 text-xs text-slate-500 italic bg-amber-50 p-2 rounded border border-amber-100 inline-block">
                                                        "{scrap.notes}"
                                                    </div>
                                                )}
                                            </div>
                                            <div className="flex items-center gap-8 w-full md:w-auto justify-between md:justify-end">
                                                <div className="text-right">
                                                    <div className="font-bold text-xl text-slate-800">{scrap.quantity} un</div>
                                                    <div className="text-xs text-slate-500">Total: {formatCurrency(scrap.totalCost)}</div>
                                                </div>
                                                <div className="flex gap-2">
                                                    <Button size="sm" variant="outline" className="text-red-600 hover:text-red-700 hover:bg-red-50" onClick={() => handleReject(scrap.id)}>
                                                        <XCircle className="w-4 h-4 mr-1" /> Rejeitar
                                                    </Button>
                                                    <Button size="sm" className="bg-green-600 hover:bg-green-700 text-white shadow-sm" onClick={() => handleApprove(scrap.id)}>
                                                        <CheckCircle className="w-4 h-4 mr-1" /> Aprovar
                                                    </Button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* 3. HISTORY */}
                <TabsContent value="history">
                    <Card>
                        <CardHeader>
                            <CardTitle>Histórico de Scrap</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="rounded-md border border-slate-200 overflow-hidden">
                                <table className="w-full text-sm text-left">
                                    <thead className="bg-slate-50 text-slate-500 font-medium border-b border-slate-200">
                                        <tr>
                                            <th className="p-3">Data</th>
                                            <th className="p-3">Part Number</th>
                                            <th className="p-3">Motivo</th>
                                            <th className="p-3 text-right">Qtd</th>
                                            <th className="p-3 text-right">Custo Total</th>
                                            <th className="p-3 text-center">Status</th>
                                            <th className="p-3">Aprovado Por</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {historyScrap.map(scrap => (
                                            <tr key={scrap.id} className="hover:bg-slate-50 transition-colors">
                                                <td className="p-3 text-slate-600">{new Date(scrap.date).toLocaleDateString()}</td>
                                                <td className="p-3">
                                                    <div className="font-medium text-slate-900">{scrap.partNumber}</div>
                                                    <div className="text-xs text-slate-500 truncate max-w-[200px]">{scrap.partDescription}</div>
                                                </td>
                                                <td className="p-3 capitalize text-slate-600">{scrap.reasonCode}</td>
                                                <td className="p-3 text-right font-mono">{scrap.quantity}</td>
                                                <td className="p-3 text-right font-mono text-slate-700">{formatCurrency(scrap.totalCost)}</td>
                                                <td className="p-3 text-center">
                                                    <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider 
                                                        ${scrap.status === 'approved' ? 'bg-green-100 text-green-700' :
                                                            scrap.status === 'rejected' ? 'bg-red-100 text-red-700' :
                                                                scrap.status === 'exported' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-slate-600'}`}>
                                                        {scrap.status}
                                                    </span>
                                                </td>
                                                <td className="p-3 text-slate-500 text-xs">{scrap.approvedBy || '-'}</td>
                                            </tr>
                                        ))}
                                        {historyScrap.length === 0 && (
                                            <tr>
                                                <td colSpan={7} className="p-12 text-center text-slate-500">
                                                    Histórico vazio.
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}
