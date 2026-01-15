"use client";

import { useState } from "react";
import * as XLSX from 'xlsx';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ToolInventory } from "@/components/tools/ToolInventory";
import { ToolCheckout } from "@/components/tools/ToolCheckout";
import { ToolCheckin } from "@/components/tools/ToolCheckin";
import { ToolMaintenance } from "@/components/tools/ToolMaintenance";
import { ToolReports } from "@/components/tools/ToolReports";
import { ToolDashboard } from "@/components/tools/ToolDashboard";
import { Wrench, Plus, Upload, Download } from "lucide-react";
import { useShopfloorStore } from "@/store/useShopfloorStore";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tool } from "@/types";

export default function ToolsPage() {
    const { addTool, tools } = useShopfloorStore();
    const [isNewToolOpen, setIsNewToolOpen] = useState(false);
    const [newTool, setNewTool] = useState<Partial<Tool>>({
        code: "", name: "", category: "Manual", status: "available", condition: "good"
    });

    const handleSaveTool = async () => {
        if (!newTool.code || !newTool.name) return alert("Preencha código e nome.");
        await addTool({
            id: crypto.randomUUID(),
            code: newTool.code!,
            name: newTool.name!,
            category: newTool.category || 'Manual',
            status: 'available',
            condition: newTool.condition as any || 'good',
            location: 'ferramentaria',
            purchaseDate: new Date().toISOString()
        });
        setIsNewToolOpen(false);
        setNewTool({ code: "", name: "", category: "Manual", status: "available", condition: "good" });
    };

    const handleExportTemplate = () => {
        const wb = XLSX.utils.book_new();
        const ws = XLSX.utils.json_to_sheet([
            { Code: "FER-001", Name: "Furadeira Bosch", Category: "Elétrica", Condition: "good" },
            { Code: "FER-002", Name: "Alicate Universal", Category: "Manual", Condition: "good" }
        ]);
        XLSX.utils.book_append_sheet(wb, ws, "Template");
        XLSX.writeFile(wb, "modelo_importacao_ferramentas.xlsx");
    };

    const handleImportExcel = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (evt) => {
            const bstr = evt.target?.result;
            const wb = XLSX.read(bstr, { type: 'binary' });
            const wsname = wb.SheetNames[0];
            const ws = wb.Sheets[wsname];
            const data: any[] = XLSX.utils.sheet_to_json(ws);

            let count = 0;
            data.forEach(async (row) => {
                if (row.Code && row.Name) {
                    await addTool({
                        id: crypto.randomUUID(),
                        code: String(row.Code),
                        name: String(row.Name),
                        category: row.Category || 'Manual',
                        status: 'available',
                        condition: (row.Condition?.toLowerCase() as any) || 'good',
                        location: 'ferramentaria',
                        purchaseDate: new Date().toISOString()
                    });
                    count++;
                }
            });
            alert(`${count} ferramentas importadas!`);
            setIsNewToolOpen(false);
        };
        reader.readAsBinaryString(file);
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
                        <Wrench className="h-8 w-8 text-blue-600" />
                        Gestão de Ferramentaria
                    </h1>
                    <p className="text-slate-500">Controle de inventário, entregas e manutenção.</p>
                </div>

                <Dialog open={isNewToolOpen} onOpenChange={setIsNewToolOpen}>
                    <DialogTrigger asChild>
                        <Button className="bg-blue-600 hover:bg-blue-700">
                            <Plus className="mr-2 h-4 w-4" /> Cadastrar Ferramenta
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Nova Ferramenta</DialogTitle>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label>Código / Serial</Label>
                                    <Input value={newTool.code} onChange={e => setNewTool({ ...newTool, code: e.target.value })} />
                                </div>
                                <div>
                                    <Label>Nome</Label>
                                    <Input value={newTool.name} onChange={e => setNewTool({ ...newTool, name: e.target.value })} />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label>Categoria</Label>
                                    <Select value={newTool.category} onValueChange={v => setNewTool({ ...newTool, category: v })}>
                                        <SelectTrigger className="bg-white"><SelectValue /></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="Manual">Manual</SelectItem>
                                            <SelectItem value="Elétrica">Elétrica</SelectItem>
                                            <SelectItem value="Bateria">Bateria</SelectItem>
                                            <SelectItem value="Pneumática">Pneumática</SelectItem>
                                            <SelectItem value="Hidráulica">Hidráulica</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div>
                                    <Label>Condição</Label>
                                    <Select value={newTool.condition} onValueChange={v => setNewTool({ ...newTool, condition: v as any })}>
                                        <SelectTrigger className="bg-white"><SelectValue /></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="new">Nova</SelectItem>
                                            <SelectItem value="good">Boa</SelectItem>
                                            <SelectItem value="fair">Razoável</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            <div className="border-t pt-4 mt-2">
                                <Label className="mb-2 block font-semibold">Importação em Massa (Excel)</Label>
                                <div className="flex gap-2">
                                    <Button variant="outline" size="sm" onClick={handleExportTemplate}>
                                        <Download className="mr-2 h-4 w-4" /> Baixar Modelo
                                    </Button>
                                    <div className="relative">
                                        <Input
                                            type="file"
                                            accept=".xlsx, .xls"
                                            onChange={handleImportExcel}
                                            className="absolute inset-0 opacity-0 cursor-pointer"
                                        />
                                        <Button variant="outline" size="sm">
                                            <Upload className="mr-2 h-4 w-4" /> Importar Excel
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <DialogFooter>
                            <Button onClick={handleSaveTool}>Salvar Ferramenta</Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>

            <Tabs defaultValue="dashboard" className="space-y-4">
                <TabsList>
                    <TabsTrigger value="dashboard">Visão Geral</TabsTrigger>
                    <TabsTrigger value="inventory">Inventário ({tools.length})</TabsTrigger>
                    <TabsTrigger value="checkout">Entregas</TabsTrigger>
                    <TabsTrigger value="checkin">Devoluções</TabsTrigger>
                    <TabsTrigger value="maintenance">Manutenção</TabsTrigger>
                    <TabsTrigger value="reports">Relatórios</TabsTrigger>
                </TabsList>

                <TabsContent value="dashboard"><ToolDashboard /></TabsContent>
                <TabsContent value="inventory"><ToolInventory /></TabsContent>
                <TabsContent value="checkout"><div className="max-w-2xl mx-auto"><ToolCheckout /></div></TabsContent>
                <TabsContent value="checkin"><div className="max-w-2xl mx-auto"><ToolCheckin /></div></TabsContent>
                <TabsContent value="maintenance"><ToolMaintenance /></TabsContent>
                <TabsContent value="reports"><ToolReports /></TabsContent>
            </Tabs>
        </div>
    );
}
