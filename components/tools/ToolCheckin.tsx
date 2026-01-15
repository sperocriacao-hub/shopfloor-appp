"use client";

import { useState, useRef } from "react";
import SignatureCanvas from 'react-signature-canvas';
import { useShopfloorStore } from "@/store/useShopfloorStore";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { ArrowDownLeft, AlertTriangle } from "lucide-react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

export function ToolCheckin() {
    const { tools, employees, updateTool, addToolTransaction, addToolMaintenance } = useShopfloorStore();
    const [selectedToolId, setSelectedToolId] = useState("");
    const [returnCondition, setReturnCondition] = useState("good");
    const [notes, setNotes] = useState("");
    const sigPad = useRef<any>(null);

    // Only tools that are currently 'in_use'
    const toolsInUse = tools.filter(t => t.status === 'in_use');

    const getHolderName = (id?: string) => {
        return employees.find(e => e.id === id)?.name || "Desconhecido";
    };

    const handleCheckin = async () => {
        if (!selectedToolId) return alert("Selecione uma ferramenta.");
        if (sigPad.current.isEmpty()) return alert("Assinatura obrigatória.");

        const tool = tools.find(t => t.id === selectedToolId);
        if (!tool) return;

        const signatureData = sigPad.current.getTrimmedCanvas().toDataURL('image/png');
        const needsMaintenance = returnCondition === 'poor' || returnCondition === 'maintenance';

        // 1. Update Tool Status
        const newStatus = needsMaintenance ? 'maintenance' : 'available';
        const newLocation = needsMaintenance ? 'maintenance' : 'ferramentaria';

        await updateTool(selectedToolId, {
            status: newStatus,
            currentHolderId: undefined, // Clears holder (NULL in DB)
            condition: returnCondition as any,
            location: newLocation
        });

        // 2. Create Transaction Log (Check-in)
        await addToolTransaction({
            id: crypto.randomUUID(),
            toolId: selectedToolId,
            employeeId: tool.currentHolderId, // Who is returning
            action: 'checkin',
            signature: signatureData,
            notes: notes + (needsMaintenance ? " (Enviado para Manutenção)" : ""),
            createdAt: new Date().toISOString(),
            createdBy: 'Ferramenteiro'
        });

        // 3. Create Maintenance Record if needed
        if (needsMaintenance) {
            await addToolMaintenance({
                id: crypto.randomUUID(),
                toolId: selectedToolId,
                description: notes || "Devolvida com defeito",
                status: 'pending',
                createdAt: new Date().toISOString()
            });
        }

        alert("Ferramenta devolvida com sucesso!");

        // Reset form
        setSelectedToolId("");
        setReturnCondition("good");
        setNotes("");
        sigPad.current.clear();
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <ArrowDownLeft className="h-5 w-5" />
                    Devolução (Check-in)
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                {toolsInUse.length === 0 ? (
                    <div className="text-center py-8 text-slate-500">
                        Nenhuma ferramenta está em uso no momento.
                    </div>
                ) : (
                    <>
                        <div>
                            <Label>Selecione a Ferramenta a devolver</Label>
                            <Select value={selectedToolId} onValueChange={setSelectedToolId}>
                                <SelectTrigger className="bg-white">
                                    <SelectValue placeholder="Selecione..." />
                                </SelectTrigger>
                                <SelectContent>
                                    {toolsInUse.map(t => (
                                        <SelectItem key={t.id} value={t.id}>
                                            {t.code} - {t.name} (Com: {getHolderName(t.currentHolderId)})
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div>
                            <Label>Condição de Retorno</Label>
                            <RadioGroup value={returnCondition} onValueChange={setReturnCondition} className="flex gap-4 mt-2">
                                <div className="flex items-center space-x-2">
                                    <RadioGroupItem value="good" id="r-good" />
                                    <Label htmlFor="r-good" className="text-green-700">Boa / OK</Label>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <RadioGroupItem value="fair" id="r-fair" />
                                    <Label htmlFor="r-fair" className="text-yellow-700">Razoável</Label>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <RadioGroupItem value="maintenance" id="r-maint" />
                                    <Label htmlFor="r-maint" className="text-red-700 font-bold flex items-center gap-1">
                                        <AlertTriangle className="h-3 w-3" /> Defeito (Manutenção)
                                    </Label>
                                </div>
                            </RadioGroup>
                        </div>

                        <div>
                            <Label>Observações</Label>
                            <Input value={notes} onChange={e => setNotes(e.target.value)} placeholder="Ocorrências durante o uso..." />
                        </div>

                        <div>
                            <Label className="mb-2 block">Assinatura (Conferência)</Label>
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

                        <Button onClick={handleCheckin} className="w-full bg-blue-600 hover:bg-blue-700">
                            Confirmar Devolução
                        </Button>
                    </>
                )}
            </CardContent>
        </Card>
    );
}
