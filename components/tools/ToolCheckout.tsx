"use client";

import { useState, useRef } from "react";
import SignatureCanvas from 'react-signature-canvas';
import { useShopfloorStore } from "@/store/useShopfloorStore";
import { Button } from "@/components/ui/button";
import { SearchableSelect } from "@/components/ui/searchable-select";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Tool } from "@/types";

export function ToolCheckout() {
    const { tools, employees, updateTool, addToolTransaction } = useShopfloorStore();
    const [selectedToolId, setSelectedToolId] = useState("");
    const [selectedEmployeeId, setSelectedEmployeeId] = useState("");
    const [notes, setNotes] = useState("");
    const sigPad = useRef<any>(null);

    const availableTools = tools.filter(t => t.status === 'available');

    const handleCheckout = async () => {
        if (!selectedToolId || !selectedEmployeeId) return alert("Selecione ferramenta e funcionário.");
        if (sigPad.current.isEmpty()) return alert("Assinatura obrigatória.");

        const signatureData = sigPad.current.getTrimmedCanvas().toDataURL('image/png');

        // 1. Update Tool Status
        await updateTool(selectedToolId, {
            status: 'in_use',
            currentHolderId: selectedEmployeeId,
            location: 'employee'
        });

        // 2. Create Transaction Log
        await addToolTransaction({
            id: crypto.randomUUID(),
            toolId: selectedToolId,
            employeeId: selectedEmployeeId,
            action: 'checkout',
            signature: signatureData,
            notes: notes,
            createdAt: new Date().toISOString(),
            createdBy: 'Ferramenteiro' // TODO: Get logged user
        });

        alert("Ferramenta entregue com sucesso!");
        // Reset form
        setSelectedToolId("");
        setSelectedEmployeeId("");
        setNotes("");
        sigPad.current.clear();
    };

    const handleDownloadTemplate = () => {
        import("@/lib/excel-tools-checkout").then(mod => mod.generateCheckoutTemplate());
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        try {
            const mod = await import("@/lib/excel-tools-checkout");
            const data: any[] = await mod.parseCheckoutExcel(file);

            let successCount = 0;
            let errors = [];

            for (const row of data) {
                const toolCode = row["toolCode"]?.toString().trim();
                const empIdentifier = row["employeeId"]?.toString().trim();
                const rowNotes = row["notes"] || "Importação em lote via Excel";

                if (!toolCode || !empIdentifier) continue;

                // Find Tool
                const tool = tools.find(t => t.code === toolCode);
                if (!tool) {
                    errors.push(`Ferramenta ${toolCode} não encontrada.`);
                    continue;
                }
                if (tool.status !== 'available') {
                    errors.push(`Ferramenta ${toolCode} não está disponível (Status: ${tool.status}).`);
                    continue;
                }

                // Find Employee (by ID or exact Name match)
                const employee = employees.find(emp => emp.id === empIdentifier || emp.name.toLowerCase() === empIdentifier.toLowerCase());
                if (!employee) {
                    errors.push(`Funcionário ${empIdentifier} não encontrado.`);
                    continue;
                }

                // Execute Checkout
                await updateTool(tool.id, {
                    status: 'in_use',
                    currentHolderId: employee.id,
                    location: 'employee'
                });

                await addToolTransaction({
                    id: crypto.randomUUID(),
                    toolId: tool.id,
                    employeeId: employee.id,
                    action: 'checkout',
                    signature: "Batch Import", // No signature for batch
                    notes: rowNotes,
                    createdAt: new Date().toISOString(),
                    createdBy: 'Importação Excel'
                });
                successCount++;
            }

            alert(`Importação concluída!\nSucessos: ${successCount}\nErros: ${errors.length}\n${errors.slice(0, 5).join('\n')}${errors.length > 5 ? '...' : ''}`);

        } catch (err) {
            console.error(err);
            alert("Erro ao processar arquivo Excel.");
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={handleDownloadTemplate}>
                    💾 Modelo Excel (Lote)
                </Button>
                <div className="relative">
                    <Button variant="secondary" className="cursor-pointer">
                        📥 Importar Lote
                    </Button>
                    <Input
                        type="file"
                        accept=".xlsx, .xls"
                        className="absolute inset-0 opacity-0 cursor-pointer"
                        onChange={handleFileUpload}
                    />
                </div>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Entrega de Ferramenta (Check-out)</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <Label>Ferramenta Disponível</Label>
                            <SearchableSelect
                                options={availableTools.map(t => ({ value: t.id, label: `${t.code} - ${t.name}` }))}
                                value={selectedToolId}
                                onChange={setSelectedToolId}
                                placeholder="Buscar ferramenta..."
                            />
                        </div>
                        <div>
                            <Label>Funcionário</Label>
                            <SearchableSelect
                                options={employees.map(e => ({ value: e.id, label: e.name }))}
                                value={selectedEmployeeId}
                                onChange={setSelectedEmployeeId}
                                placeholder="Buscar funcionário..."
                            />
                        </div>
                    </div>

                    <div>
                        <Label>Observações</Label>
                        <Input value={notes} onChange={e => setNotes(e.target.value)} placeholder="Estado da ferramenta, acessórios, etc." />
                    </div>

                    <div>
                        <Label className="mb-2 block">Assinatura do Responsável</Label>
                        <div className="border border-slate-300 rounded-md bg-white">
                            <SignatureCanvas
                                ref={sigPad}
                                penColor="black"
                                canvasProps={{ className: 'sigCanvas w-full h-40' }}
                            />
                        </div>
                        <Button variant="ghost" size="sm" onClick={() => sigPad.current.clear()} className="mt-1 text-xs text-red-500">
                            Limpar Assinatura
                        </Button>
                    </div>

                    <Button onClick={handleCheckout} className="w-full bg-blue-600 hover:bg-blue-700">
                        Confirmar Entrega
                    </Button>
                </CardContent>
            </Card>
        </div>
    );
}
