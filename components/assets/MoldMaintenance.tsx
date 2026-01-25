"use client";

import { useState } from "react";
import { useShopfloorStore } from "@/store/useShopfloorStore";
import { Asset, MoldMaintenanceLog } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Wrench, CheckCircle, AlertTriangle, Clock } from "lucide-react";
import { format } from "date-fns";

interface MoldMaintenanceProps {
    asset: Asset;
}

export function MoldMaintenanceLogs({ asset }: MoldMaintenanceProps) {
    const { moldMaintenanceLogs, addMoldMaintenanceLog, updateMoldMaintenanceLog, updateAssetStatus } = useShopfloorStore();

    // Form State
    const [description, setDescription] = useState("");
    const [severity, setSeverity] = useState<'Low' | 'Medium' | 'High' | 'Critical'>("Medium");

    // Filter logs for this mold
    const logs = moldMaintenanceLogs.filter(l => l.moldId === asset.id).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    const handleReport = async () => {
        if (!description) return;

        // Auto-change status if Critical/High
        if (severity === 'Critical' || severity === 'High') {
            await updateAssetStatus(asset.id, 'maintenance');
        }

        await addMoldMaintenanceLog({
            id: `log-${Date.now()}`,
            moldId: asset.id,
            description,
            severity,
            status: 'Open',
            images: [], // Placeholder for future upload
            createdAt: new Date().toISOString()
        });

        setDescription("");
        setSeverity("Medium");
    };

    const handleResolve = async (logId: string) => {
        if (!confirm("Marcar manutenção como resolvida?")) return;
        await updateMoldMaintenanceLog(logId, { status: 'Resolved' });

        // Optional: Ask to set asset back to available
        // Simple logic: If no other open High/Critical logs, suggest Available.
        // For now, let user manually change status in the header if they want.
    };

    return (
        <div className="space-y-6">
            {/* New Log Form */}
            <div className="bg-slate-50 p-4 rounded-md border border-slate-200">
                <h3 className="text-sm font-semibold text-slate-800 flex items-center mb-3">
                    <Wrench className="h-4 w-4 mr-2" /> Reportar Problema / Manutenção
                </h3>
                <div className="space-y-3">
                    <div>
                        <Label className="text-xs">Descrição do Dano</Label>
                        <Textarea
                            value={description}
                            onChange={e => setDescription(e.target.value)}
                            placeholder="Descreva o problema (ex: Trinca no casco, Gelcoat danificado...)"
                            className="bg-white"
                        />
                    </div>
                    <div className="flex gap-2 items-end">
                        <div className="w-1/3">
                            <Label className="text-xs">Severidade</Label>
                            <Select value={severity} onValueChange={(v: any) => setSeverity(v)}>
                                <SelectTrigger className="bg-white">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Low">Baixa (Estético)</SelectItem>
                                    <SelectItem value="Medium">Média</SelectItem>
                                    <SelectItem value="High">Alta (Bloqueante)</SelectItem>
                                    <SelectItem value="Critical">Crítica (Risco)</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <Button onClick={handleReport} disabled={!description}>Registrar</Button>
                    </div>
                    {(severity === 'High' || severity === 'Critical') && (
                        <p className="text-xs text-red-600 flex items-center">
                            <AlertTriangle className="h-3 w-3 mr-1" />
                            O status do molde será alterado para "Manutenção" automaticamente.
                        </p>
                    )}
                </div>
            </div>

            {/* Logs List */}
            <div className="space-y-2 max-h-[300px] overflow-y-auto">
                {logs.length === 0 && <p className="text-sm text-slate-400 text-center py-4">Nenhum registro de manutenção.</p>}

                {logs.map(log => (
                    <Card key={log.id} className="border-l-4 border-l-slate-300 shadow-sm relative overflow-hidden">
                        {/* Status Stripe */}
                        <div className={`absolute top-0 left-0 w-1 h-full ${log.status === 'Resolved' ? 'bg-green-500' :
                                log.severity === 'Critical' ? 'bg-red-500' : 'bg-yellow-500'
                            }`} />

                        <CardContent className="p-3 pl-4">
                            <div className="flex justify-between items-start">
                                <div>
                                    <div className="flex items-center gap-2 mb-1">
                                        <Badge variant={log.status === 'Resolved' ? 'outline' : 'default'} className={
                                            log.status === 'Open' ? 'bg-red-100 text-red-700 hover:bg-red-100 border-none' :
                                                log.status === 'In Progress' ? 'bg-blue-100 text-blue-700 border-none' : ''
                                        }>
                                            {log.status === 'Resolved' ? 'Resolvido' : log.severity === 'Critical' ? 'Crítico - Aberto' : 'Aberto'}
                                        </Badge>
                                        <span className="text-xs text-slate-400 flex items-center">
                                            <Clock className="h-3 w-3 mr-1" />
                                            {format(new Date(log.createdAt), 'dd/MM/yyyy HH:mm')}
                                        </span>
                                    </div>
                                    <p className="text-sm text-slate-700">{log.description}</p>
                                </div>
                                {log.status !== 'Resolved' && (
                                    <Button size="sm" variant="ghost" onClick={() => handleResolve(log.id)} title="Marcar como Resolvido">
                                        <CheckCircle className="h-4 w-4 text-green-600" />
                                    </Button>
                                )}
                            </div>
                            {log.resolvedAt && (
                                <p className="text-xs text-green-600 mt-2 border-t pt-1">
                                    Resolvido em {format(new Date(log.resolvedAt), 'dd/MM/yyyy HH:mm')}
                                </p>
                            )}
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
}
