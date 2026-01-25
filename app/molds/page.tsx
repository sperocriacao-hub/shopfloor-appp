"use client";

import { useState } from "react";
import { useShopfloorStore } from "@/store/useShopfloorStore";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Search, Filter } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MoldCompatibilityManager } from "@/components/assets/MoldCompatibility";
import { MoldMaintenanceLogs } from "@/components/assets/MoldMaintenance";
import { Asset } from "@/types";

export default function MoldsPage() {
    const { assets, addAsset, updateAsset } = useShopfloorStore();
    const [searchTerm, setSearchTerm] = useState("");
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [editingAsset, setEditingAsset] = useState<Asset | null>(null);
    const [editForm, setEditForm] = useState<Partial<Asset>>({});

    // Filter only Molds
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

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-purple-900">Gestão de Moldes</h1>
                    <p className="text-slate-500">Controle de compatibilidade, manutenção e ciclos de vida.</p>
                </div>
                <Button onClick={handleNewClick} className="bg-purple-600 hover:bg-purple-700">
                    <Plus className="mr-2 h-4 w-4" /> Novo Molde
                </Button>
            </div>

            {/* Filter */}
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
            </div>

            {/* Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {molds.map(mold => (
                    <Card key={mold.id} className="cursor-pointer hover:border-purple-300 transition-colors" onClick={() => handleEditClick(mold)}>
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
                        </CardContent>
                    </Card>
                ))}
                {molds.length === 0 && (
                    <div className="col-span-full text-center py-10 text-slate-400 border-2 border-dashed rounded-lg">
                        Nenhum molde encontrado.
                    </div>
                )}
            </div>

            {/* Edit Dialog - Reusing Logic from Assets Page */}
            <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
                <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>{editingAsset ? "Editar Molde" : "Novo Molde"}</DialogTitle>
                        <DialogDescription>Gerencie dados, pares e manutenção.</DialogDescription>
                    </DialogHeader>

                    <Tabs defaultValue="geral" className="w-full">
                        <TabsList className="grid w-full grid-cols-3">
                            <TabsTrigger value="geral">Geral</TabsTrigger>
                            <TabsTrigger value="compatibility">Compatibilidade</TabsTrigger>
                            <TabsTrigger value="maintenance">Manutenção</TabsTrigger>
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

                        <TabsContent value="maintenance" className="space-y-4 py-4">
                            {editingAsset && <MoldMaintenanceLogs asset={editingAsset} />}
                            {!editingAsset && <p className="text-sm text-slate-400 text-center">Salve o molde antes de registrar manutenção.</p>}
                        </TabsContent>
                    </Tabs>
                </DialogContent>
            </Dialog>
        </div>
    );
}
