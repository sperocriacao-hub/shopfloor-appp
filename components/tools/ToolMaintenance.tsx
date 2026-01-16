"use client";

import { useShopfloorStore } from "@/store/useShopfloorStore";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState } from "react";
import { ToolMaintenance as IToolMaintenance } from "@/types";
import { Wrench, CheckCircle, Trash2 } from "lucide-react";

export function ToolMaintenance() {
    const { tools, toolMaintenances, updateTool, updateToolMaintenance } = useShopfloorStore();
    const [selectedMaintenance, setSelectedMaintenance] = useState<IToolMaintenance | null>(null);
    const [statusUpdate, setStatusUpdate] = useState("");
    const [techNotes, setTechNotes] = useState("");

    const [searchTerm, setSearchTerm] = useState("");

    // Join Maintenance records with Tool details
    const activeMaintenance = toolMaintenances
        .filter(m => m.status !== 'completed' && m.status !== 'condemned')
        .map(m => ({ ...m, tool: tools.find(t => t.id === m.toolId) }))
        .filter(m =>
            m.tool?.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
            m.tool?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            m.description.toLowerCase().includes(searchTerm.toLowerCase())
        );

    const historyMaintenance = toolMaintenances
        .filter(m => m.status === 'completed' || m.status === 'condemned')
        .sort((a, b) => new Date(b.completedAt || '').getTime() - new Date(a.completedAt || '').getTime())
        .map(m => ({ ...m, tool: tools.find(t => t.id === m.toolId) }))
        .filter(m =>
            m.tool?.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
            m.tool?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            m.description.toLowerCase().includes(searchTerm.toLowerCase())
        );

    const handleUpdate = async () => {
        if (!selectedMaintenance) return;

        await updateToolMaintenance(selectedMaintenance.id, {
            status: statusUpdate as any,
            technicianNotes: techNotes
        });

        // If completed or condemned, update the tool status as well
        if (statusUpdate === 'completed') {
            await updateTool(selectedMaintenance.toolId, {
                status: 'available',
                location: 'ferramentaria',
                condition: 'good',
                lastMaintenance: new Date().toISOString()
            });
        } else if (statusUpdate === 'condemned') {
            await updateTool(selectedMaintenance.toolId, {
                status: 'scrapped',
                location: 'ferramentaria', // disposed
                condition: 'poor'
            });
        }

        setSelectedMaintenance(null);
        alert("Manutenção atualizada!");
    };

    return (
        <div className="space-y-8">
            {/* Filters */}
            <div className="flex gap-4 p-4 border rounded-md bg-slate-50">
                <div className="flex-1 max-w-sm">
                    <Label className="mb-1 block text-xs">Busca Rápida</Label>
                    <Input
                        placeholder="Buscar ferramenta, defeito..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="bg-white"
                    />
                </div>
            </div>
            {/* Active Repairs */}
            <div className="space-y-4">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                    <Wrench className="h-5 w-5 text-orange-600" /> Em Reparo (Ativo)
                </h3>
                <div className="border rounded-md">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Ferramenta</TableHead>
                                <TableHead>Problema</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Entrada</TableHead>
                                <TableHead>Ações</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {activeMaintenance.map((m) => (
                                <TableRow key={m.id}>
                                    <TableCell>
                                        <div className="font-medium">{m.tool?.code}</div>
                                        <div className="text-xs text-muted-foreground">{m.tool?.name}</div>
                                    </TableCell>
                                    <TableCell>{m.description}</TableCell>
                                    <TableCell><Badge variant="outline">{m.status}</Badge></TableCell>
                                    <TableCell>{new Date(m.createdAt).toLocaleDateString()}</TableCell>
                                    <TableCell>
                                        <Sheet>
                                            <SheetTrigger asChild>
                                                <Button size="sm" variant="outline" onClick={() => {
                                                    setSelectedMaintenance(m);
                                                    setStatusUpdate(m.status);
                                                    setTechNotes(m.technicianNotes || "");
                                                }}>Atualizar</Button>
                                            </SheetTrigger>
                                            <SheetContent>
                                                <SheetHeader>
                                                    <SheetTitle>Atualizar Manutenção</SheetTitle>
                                                </SheetHeader>
                                                <div className="grid gap-4 py-4">
                                                    <div>
                                                        <Label>Status</Label>
                                                        <Select value={statusUpdate} onValueChange={setStatusUpdate}>
                                                            <SelectTrigger className="bg-white"><SelectValue /></SelectTrigger>
                                                            <SelectContent>
                                                                <SelectItem value="pending">Pendente</SelectItem>
                                                                <SelectItem value="in_progress">Em Progresso</SelectItem>
                                                                <SelectItem value="waiting_parts">Aguardando Peças</SelectItem>
                                                                <SelectItem value="completed" className="text-green-600 font-bold">Concluído (Disponibilizar)</SelectItem>
                                                                <SelectItem value="condemned" className="text-red-600 font-bold">Lixo / Inativar (Sem Conserto)</SelectItem>
                                                            </SelectContent>
                                                        </Select>
                                                    </div>
                                                    <div>
                                                        <Label>Notas do Técnico</Label>
                                                        <Input value={techNotes} onChange={e => setTechNotes(e.target.value)} />
                                                    </div>
                                                    <Button onClick={handleUpdate}>Salvar Alterações</Button>
                                                </div>
                                            </SheetContent>
                                        </Sheet>
                                    </TableCell>
                                </TableRow>
                            ))}
                            {activeMaintenance.length === 0 && (
                                <TableRow><TableCell colSpan={5} className="text-center text-muted-foreground">Nenhuma ferramenta em manutenção.</TableCell></TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>
            </div>

            {/* History */}
            <div className="space-y-4">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-green-600" /> Histórico
                </h3>
                <div className="border rounded-md bg-slate-50">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Ferramenta</TableHead>
                                <TableHead>Descrição</TableHead>
                                <TableHead>Status Final</TableHead>
                                <TableHead>Concluído em</TableHead>
                                <TableHead>Notas</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {historyMaintenance.map((m) => (
                                <TableRow key={m.id}>
                                    <TableCell>{m.tool?.code} - {m.tool?.name}</TableCell>
                                    <TableCell>{m.description}</TableCell>
                                    <TableCell>
                                        {m.status === 'condemned' ?
                                            <Badge variant="destructive">Lixo / Descarte</Badge> :
                                            <Badge className="bg-green-100 text-green-800">Concluída</Badge>
                                        }
                                    </TableCell>
                                    <TableCell>{m.completedAt ? new Date(m.completedAt).toLocaleDateString() : '-'}</TableCell>
                                    <TableCell className="text-sm text-muted-foreground">{m.technicianNotes}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            </div>
        </div>
    );
}
