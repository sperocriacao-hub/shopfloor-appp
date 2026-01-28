"use client";

import { useState } from "react";
import { useShopfloorStore } from "@/store/useShopfloorStore";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Search, Hammer, AlertTriangle, FileUp } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MoldCompatibilityManager } from "@/components/assets/MoldCompatibility";
import { MoldMaintenanceLogs } from "@/components/assets/MoldMaintenance";
import { Asset } from "@/types";
import { toast } from "sonner";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

// --- Sub-component: Quick Report Dialog ---
function QuickReportDialog({ open, onOpenChange, assetId }: { open: boolean, onOpenChange: (o: boolean) => void, assetId: string }) {
    const { addMaintenanceOrder, employees } = useShopfloorStore();
    const [defectType, setDefectType] = useState("scratch");
    const [priority, setPriority] = useState("medium");

    const handleSubmit = () => {
        addMaintenanceOrder({
            id: `mo-${Date.now()}`,
            assetId,
            status: 'pending',
            priority: priority as any,
            createdAt: new Date().toISOString(),
            reportedBy: 'Escritório/Admin',
            description: `Defeito reportado via Módulo de Moldes: ${defectType}`,
            totalTimeMinutes: 0
        });
        toast.success("Ordem de Manutenção criada com sucesso!");
        onOpenChange(false);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Reportar Avaria (Escritório)</DialogTitle>
                    <DialogDescription>Gere uma OS diretamente para a Manutenção.</DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                    <div className="space-y-2">
                        <Label>Tipo de Necessidade</Label>
                        <Select value={defectType} onValueChange={setDefectType}>
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="wax">Cera Extra</SelectItem>
                                <SelectItem value="polish">Polimento</SelectItem>
                                <SelectItem value="gelcoat">Reparação Gelcoat</SelectItem>
                                <SelectItem value="structural">Dano Estrutural</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <Label>Urgência</Label>
                        <RadioGroup value={priority} onValueChange={setPriority} className="flex gap-4">
                            <div className="flex items-center space-x-2">
                                <RadioGroupItem value="low" id="r1" className="text-yellow-500 border-yellow-500" />
                                <Label htmlFor="r1">Baixa</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                                <RadioGroupItem value="medium" id="r2" className="text-orange-500 border-orange-500" />
                                <Label htmlFor="r2">Média</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                                <RadioGroupItem value="critical" id="r3" className="text-red-500 border-red-500" />
                                <Label htmlFor="r3">Crítica</Label>
                            </div>
                        </RadioGroup>
                    </div>
                </div>
                <DialogFooter>
                    <Button onClick={handleSubmit} className="w-full">Gerar OS</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

export function MoldRegistry({ onSwitchToGeometry }: { onSwitchToGeometry: () => void }) {
    const { assets, addAsset, updateAsset } = useShopfloorStore();
    const [searchTerm, setSearchTerm] = useState("");
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [editingAsset, setEditingAsset] = useState<Asset | null>(null);
    const [editForm, setEditForm] = useState<Partial<Asset>>({});

    // Quick Report state
    const [reportOpen, setReportOpen] = useState(false);
    const [reportAssetId, setReportAssetId] = useState("");

    const molds = assets.filter(a =>
        a.type.toLowerCase() === 'mold' || a.type.toLowerCase() === 'molde'
    ).filter(a =>
        a.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleNewClick = () => {
        setEditingAsset(null);
        setEditForm({ type: 'Molde', status: 'available' });
        setIsEditOpen(true);
    };

    const handleEditClick = (asset: Asset) => {
        setEditingAsset(asset);
        setEditForm({ ...asset });
        setIsEditOpen(true);
    };

    const handleSave = async () => {
        if (editingAsset) {
            await updateAsset(editingAsset.id, editForm);
        } else {
            await addAsset({
                id: `MOLD-${Date.now()}`,
                name: editForm.name || 'Novo Molde',
                type: 'Molde',
                area: 'Laminação',
                status: 'available',
                ...editForm
            } as Asset);
        }
        setIsEditOpen(false);
    };

    const openQuickReport = (e: React.MouseEvent, id: string) => {
        e.stopPropagation();
        setReportAssetId(id);
        setReportOpen(true);
    };

    return (
        <div className="space-y-6">
            <div className="flex gap-4">
                <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-slate-400" />
                    <Input
                        placeholder="Buscar moldes..."
                        className="pl-8"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <Button onClick={handleNewClick} variant="outline">
                    <Plus className="mr-2 h-4 w-4" /> Novo
                </Button>
                <Button onClick={onSwitchToGeometry} variant="secondary">
                    <FileUp className="mr-2 h-4 w-4" /> Gestão de SVGs
                </Button>
            </div>

            {/* Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {molds.map(mold => (
                    <Card key={mold.id} className="cursor-pointer hover:border-purple-300 transition-colors group relative" onClick={() => handleEditClick(mold)}>
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium">{mold.name}</CardTitle>
                            <span className={`px-2 py-1 rounded-full text-xs font-bold ${mold.status === 'available' ? 'bg-green-100 text-green-700' :
                                mold.status === 'maintenance' ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'
                                }`}>
                                {mold.status === 'available' ? 'Disponível' : mold.status === 'maintenance' ? 'Manutenção' : 'Em Uso'}
                            </span>
                        </CardHeader>
                        <CardContent>
                            <div className="text-xs text-slate-500 space-y-1">
                                <p>RFID: {mold.rfidTag || 'N/A'}</p>
                                <p>Área: {mold.area}</p>
                            </div>

                            {/* Actions Overlay */}
                            <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                <Button size="sm" variant="ghost" className="h-8 w-8 p-0" title="Reportar Avaria" onClick={(e) => openQuickReport(e, mold.id)}>
                                    <AlertTriangle className="h-4 w-4 text-orange-500" />
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            <QuickReportDialog open={reportOpen} onOpenChange={setReportOpen} assetId={reportAssetId} />

            {/* Edit Dialog */}
            <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
                <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>{editingAsset ? "Detalhes do Molde" : "Novo Molde"}</DialogTitle>
                    </DialogHeader>

                    <Tabs defaultValue="geral" className="w-full">
                        <TabsList className="grid w-full grid-cols-3">
                            <TabsTrigger value="geral">Geral</TabsTrigger>
                            <TabsTrigger value="compatibility">Compatibilidade</TabsTrigger>
                            <TabsTrigger value="history">Histórico</TabsTrigger>
                        </TabsList>

                        <TabsContent value="geral" className="space-y-4 py-4">
                            <div className="grid gap-4">
                                <div className="space-y-2">
                                    <Label>Nome do Molde</Label>
                                    <Input value={editForm.name || ''} onChange={e => setEditForm({ ...editForm, name: e.target.value })} />
                                </div>
                                <div className="space-y-2">
                                    <Label>RFID Tag (Fixo)</Label>
                                    <Input value={editForm.rfidTag || ''} onChange={e => setEditForm({ ...editForm, rfidTag: e.target.value })} />
                                </div>
                                <div className="space-y-2">
                                    <Label>Status</Label>
                                    <Select value={editForm.status} onValueChange={(v: any) => setEditForm({ ...editForm, status: v })}>
                                        <SelectTrigger><SelectValue /></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="available">Disponível</SelectItem>
                                            <SelectItem value="maintenance">Manutenção</SelectItem>
                                            <SelectItem value="in_use">Em Uso</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                            <DialogFooter>
                                <Button onClick={handleSave}>Salvar</Button>
                            </DialogFooter>
                        </TabsContent>

                        <TabsContent value="compatibility" className="space-y-4 py-4">
                            {editingAsset && <MoldCompatibilityManager asset={editingAsset} />}
                            {!editingAsset && <p className="text-sm text-slate-400 text-center">Salve o molde antes de configurar compatibilidade.</p>}
                        </TabsContent>

                        <TabsContent value="history" className="space-y-4 py-4">
                            {editingAsset && <MoldMaintenanceLogs asset={editingAsset} />}
                        </TabsContent>
                    </Tabs>
                </DialogContent>
            </Dialog>
        </div>
    );
}
