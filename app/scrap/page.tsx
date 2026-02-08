"use client";

import { useState } from "react";
import { useShopfloorStore } from "@/store/useShopfloorStore";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Trash2, AlertTriangle, CheckCircle, XCircle } from "lucide-react";
import { toast } from "sonner";

export default function ScrapPage() {
    const store = useShopfloorStore();
    const [activeTab, setActiveTab] = useState("report");

    // Form State
    const [partNumber, setPartNumber] = useState("");
    const [quantity, setQuantity] = useState("");
    const [reason, setReason] = useState("");
    const [notes, setNotes] = useState("");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        // Simulation
        toast.promise(new Promise(resolve => setTimeout(resolve, 1000)), {
            loading: 'Registrando desperdício...',
            success: 'Scrap reportado com sucesso! Aguardando validação.',
            error: 'Erro ao reportar'
        });
        setPartNumber("");
        setQuantity("");
        setReason("");
        setNotes("");
    };

    return (
        <div className="p-8 space-y-8 fade-in animate-in">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
                    <Trash2 className="w-8 h-8 text-red-600" />
                    Gestão de Scrap (Desperdício)
                </h1>
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
                <TabsList className="bg-slate-100 p-1">
                    <TabsTrigger value="report">Reportar (Produção)</TabsTrigger>
                    <TabsTrigger value="validate">Validar (Armazém)</TabsTrigger>
                    <TabsTrigger value="history">Histórico</TabsTrigger>
                </TabsList>

                {/* 1. REPORT FORM */}
                <TabsContent value="report">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        <Card className="border-slate-200 shadow-sm">
                            <CardHeader>
                                <CardTitle>Novo Registro de Scrap</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <form onSubmit={handleSubmit} className="space-y-4">
                                    <div className="space-y-2">
                                        <Label>Referência (Part Number)</Label>
                                        <div className="flex gap-2">
                                            <Input
                                                placeholder="Ex: 505-CAB-001"
                                                value={partNumber}
                                                onChange={e => setPartNumber(e.target.value)}
                                                required
                                            />
                                            <Button type="button" variant="outline">Buscar</Button>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label>Quantidade</Label>
                                            <Input
                                                type="number"
                                                min="1"
                                                value={quantity}
                                                onChange={e => setQuantity(e.target.value)}
                                                required
                                            />
                                        </div>
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
                                        <Button type="submit" className="w-full bg-red-600 hover:bg-red-700 text-white">
                                            Confirmar Scrap
                                        </Button>
                                    </div>
                                </form>
                            </CardContent>
                        </Card>

                        {/* Cost Preview */}
                        <Card className="bg-slate-50 border-slate-200">
                            <CardHeader>
                                <CardTitle className="text-slate-600 text-sm">Resumo da Perda</CardTitle>
                            </CardHeader>
                            <CardContent className="flex flex-col items-center justify-center py-10 space-y-2 text-center">
                                <AlertTriangle className="w-12 h-12 text-amber-500 mb-2" />
                                <div className="text-4xl font-bold text-slate-900">
                                    {partNumber ? "€ 0,00" : "---"}
                                </div>
                                <p className="text-slate-500 text-sm">Custo Estimado (Baseado no AS400)</p>
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>

                {/* 2. VALIDATION LIST */}
                <TabsContent value="validate">
                    <Card>
                        <CardHeader>
                            <CardTitle>Aguardando Validação do Armazém</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-center text-slate-500 py-10">
                                Nenhum registro pendente para validação.
                            </div>
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
                            <div className="text-center text-slate-500 py-10">
                                Histórico vazio.
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}
