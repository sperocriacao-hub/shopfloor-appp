"use client";

import { useShopfloorStore } from "@/store/useShopfloorStore";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Label } from "@/components/ui/label";
import { Wrench, User, AlertTriangle, Search, Trash2, Pencil, Printer } from "lucide-react";
import { useState } from "react";
import { Tool } from "@/types";

export function ToolInventory() {
    const { tools, employees, updateTool, removeTool } = useShopfloorStore();
    const [searchTerm, setSearchTerm] = useState("");
    const [editingTool, setEditingTool] = useState<Tool | null>(null);
    const [editForm, setEditForm] = useState<Partial<Tool>>({});
    const [categoryFilter, setCategoryFilter] = useState("all");
    const [statusFilter, setStatusFilter] = useState("all");
    const [conditionFilter, setConditionFilter] = useState("all");

    const [areaFilter, setAreaFilter] = useState("all");
    const [stationFilter, setStationFilter] = useState("all");

    // Extract unique areas and stations from employees for filters
    const uniqueAreas = Array.from(new Set(employees.map(e => e.area).filter(Boolean)));
    // For station, we might want to filter based on selected area, but global unique list is fine for now
    const uniqueStations = Array.from(new Set(employees.map(e => e.workstation).filter(Boolean)));

    const filteredTools = tools.filter(tool => {
        const holder = employees.find(e => e.id === tool.currentHolderId);

        const matchesSearch =
            tool.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
            tool.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (holder?.name || "").toLowerCase().includes(searchTerm.toLowerCase());

        const matchesCategory = categoryFilter === "all" || tool.category === categoryFilter;
        const matchesStatus = statusFilter === "all" || tool.status === statusFilter;
        const matchesCondition = conditionFilter === "all" || tool.condition === conditionFilter;

        // Location Filters (Automatic link to Employee Data)
        const matchesArea = areaFilter === "all" || (holder && holder.area === areaFilter);
        const matchesStation = stationFilter === "all" || (holder && holder.workstation === stationFilter);

        return matchesSearch && matchesCategory && matchesStatus && matchesCondition && matchesArea && matchesStation;
    });

    const handlePrint = () => {
        const printContent = document.getElementById("tool-inventory-table");
        if (printContent) {
            const win = window.open("", "", "height=700,width=1000");
            if (win) {
                win.document.write("<html><head><title>Inventário de Ferramentas</title>");
                // Minimal CSS for print
                win.document.write(`<style>
                    body { font-family: sans-serif; }
                    table { width: 100%; border-collapse: collapse; margin-top: 20px; }
                    th, td { border: 1px solid #ddd; padding: 8px; text-align: left; font-size: 12px; }
                    th { background-color: #f2f2f2; }
                    .no-print { display: none; }
                </style>`);
                win.document.write("</head><body>");
                win.document.write("<h1>Inventário de Ferramentas</h1>");
                win.document.write(`<p>Filtros: Categoria=${categoryFilter}, Status=${statusFilter}, Área=${areaFilter}</p>`);
                win.document.write(printContent.outerHTML);
                win.document.write("</body></html>");
                win.document.close();
                win.print();
            }
        }
    };

    const getHolderName = (id?: string) => {
        if (!id) return "-";
        return employees.find(e => e.id === id)?.name || "Desconhecido";
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'available': return <Badge className="bg-green-100 text-green-800">Disponível</Badge>;
            case 'in_use': return <Badge className="bg-blue-100 text-blue-800">Em Uso</Badge>;
            case 'maintenance': return <Badge className="bg-orange-100 text-orange-800">Manutenção</Badge>;
            case 'scrapped': return <Badge variant="destructive">Descartada</Badge>;
            default: return <Badge variant="outline">{status}</Badge>;
        }
    };

    const handleDelete = async (id: string) => {
        if (confirm("Tem certeza que deseja excluir esta ferramenta?")) {
            await removeTool(id);
        }
    };

    const handleSaveEdit = async () => {
        if (!editingTool) return;
        await updateTool(editingTool.id, editForm);
        setEditingTool(null);
    };

    return (
        <div className="space-y-4">
            <div className="flex flex-wrap gap-4 p-4 border rounded-md bg-slate-50">
                <div className="flex-1 min-w-[200px]">
                    <Input
                        placeholder="Buscar por código, nome ou responsável..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="bg-white"
                    />
                </div>
                <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                    <SelectTrigger className="w-[150px] bg-white"><SelectValue placeholder="Categoria" /></SelectTrigger>
                    <SelectContent className="bg-white">
                        <SelectItem value="all">Todas Cat.</SelectItem>
                        <SelectItem value="Manual">Manual</SelectItem>
                        <SelectItem value="Elétrica">Elétrica</SelectItem>
                        <SelectItem value="Bateria">Bateria</SelectItem>
                        <SelectItem value="Pneumática">Pneumática</SelectItem>
                    </SelectContent>
                </Select>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-[150px] bg-white"><SelectValue placeholder="Status" /></SelectTrigger>
                    <SelectContent className="bg-white">
                        <SelectItem value="all">Todos Status</SelectItem>
                        <SelectItem value="available">Disponível</SelectItem>
                        <SelectItem value="in_use">Em Uso</SelectItem>
                        <SelectItem value="maintenance">Manutenção</SelectItem>
                    </SelectContent>
                </Select>
                <Select value={conditionFilter} onValueChange={setConditionFilter}>
                    <SelectTrigger className="w-[150px] bg-white"><SelectValue placeholder="Condição" /></SelectTrigger>
                    <SelectContent className="bg-white">
                        <SelectItem value="all">Todas Cond.</SelectItem>
                        <SelectItem value="new">Nova</SelectItem>
                        <SelectItem value="good">Boa</SelectItem>
                        <SelectItem value="fair">Razoável</SelectItem>
                        <SelectItem value="poor">Ruim</SelectItem>
                    </SelectContent>
                </Select>

                <Select value={areaFilter} onValueChange={setAreaFilter}>
                    <SelectTrigger className="w-[150px] bg-white"><SelectValue placeholder="Área (RH)" /></SelectTrigger>
                    <SelectContent className="bg-white">
                        <SelectItem value="all">Todas Áreas</SelectItem>
                        {uniqueAreas.map(area => (
                            <SelectItem key={area} value={area}>{area}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>

                <Select value={stationFilter} onValueChange={setStationFilter}>
                    <SelectTrigger className="w-[150px] bg-white"><SelectValue placeholder="Estação (RH)" /></SelectTrigger>
                    <SelectContent className="bg-white">
                        <SelectItem value="all">Todas Estações</SelectItem>
                        {uniqueStations.map(st => (
                            <SelectItem key={st} value={st}>{st}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>

                <Button variant="outline" onClick={handlePrint}>
                    <Printer className="mr-2 h-4 w-4" />
                    Imprimir
                </Button>
            </div>

            <div className="border rounded-md">
                <Table id="tool-inventory-table">
                    <TableHeader>
                        <TableRow>
                            <TableHead>Código</TableHead>
                            <TableHead>Ferramenta</TableHead>
                            <TableHead>Categoria</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Responsável & Localização (RH)</TableHead>
                            <TableHead>Condição</TableHead>
                            <TableHead className="text-right">Ações</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filteredTools.map((tool) => (
                            <TableRow key={tool.id}>
                                <TableCell className="font-mono text-xs">{tool.code}</TableCell>
                                <TableCell className="font-medium">{tool.name}</TableCell>
                                <TableCell>{tool.category}</TableCell>
                                <TableCell>{getStatusBadge(tool.status)}</TableCell>
                                <TableCell>
                                    {tool.currentHolderId ? (
                                        <div className="flex items-center gap-2 text-blue-600">
                                            <User className="h-3 w-3" />
                                            {getHolderName(tool.currentHolderId)}
                                        </div>
                                    ) : (
                                        <span className="text-slate-500">{tool.location}</span>
                                    )}
                                </TableCell>
                                <TableCell className="capitalize">{tool.condition}</TableCell>
                                <TableCell className="text-right">
                                    <div className="flex justify-end gap-2">
                                        <Sheet open={editingTool?.id === tool.id} onOpenChange={(open) => {
                                            if (open) {
                                                setEditingTool(tool);
                                                setEditForm({
                                                    name: tool.name,
                                                    category: tool.category,
                                                    condition: tool.condition,
                                                    location: tool.location
                                                });
                                            } else {
                                                setEditingTool(null);
                                            }
                                        }}>
                                            <SheetTrigger asChild>
                                                <Button variant="ghost" size="sm"><Pencil className="h-4 w-4 text-blue-500" /></Button>
                                            </SheetTrigger>
                                            <SheetContent>
                                                <SheetHeader>
                                                    <SheetTitle>Editar Ferramenta</SheetTitle>
                                                </SheetHeader>
                                                <div className="grid gap-4 py-4">
                                                    <div>
                                                        <Label>Nome</Label>
                                                        <Input value={editForm.name || ""} onChange={e => setEditForm({ ...editForm, name: e.target.value })} />
                                                    </div>
                                                    <div>
                                                        <Label>Categoria</Label>
                                                        <Select value={editForm.category} onValueChange={v => setEditForm({ ...editForm, category: v })}>
                                                            <SelectTrigger className="bg-white"><SelectValue /></SelectTrigger>
                                                            <SelectContent className="bg-white">
                                                                <SelectItem value="Manual">Manual</SelectItem>
                                                                <SelectItem value="Elétrica">Elétrica</SelectItem>
                                                                <SelectItem value="Bateria">Bateria</SelectItem>
                                                                <SelectItem value="Pneumática">Pneumática</SelectItem>
                                                            </SelectContent>
                                                        </Select>
                                                    </div>
                                                    <div>
                                                        <Label>Condição</Label>
                                                        <Select value={editForm.condition} onValueChange={v => setEditForm({ ...editForm, condition: v as any })}>
                                                            <SelectTrigger className="bg-white"><SelectValue /></SelectTrigger>
                                                            <SelectContent className="bg-white">
                                                                <SelectItem value="new">Nova</SelectItem>
                                                                <SelectItem value="good">Boa</SelectItem>
                                                                <SelectItem value="fair">Razoável</SelectItem>
                                                                <SelectItem value="poor">Ruim</SelectItem>
                                                            </SelectContent>
                                                        </Select>
                                                    </div>
                                                    <div>
                                                        <Label>Localização (Padrão)</Label>
                                                        <Input value={editForm.location || ""} onChange={e => setEditForm({ ...editForm, location: e.target.value })} />
                                                    </div>
                                                    <Button onClick={handleSaveEdit}>Salvar</Button>
                                                </div>
                                            </SheetContent>
                                        </Sheet>

                                        <Button variant="ghost" size="sm" onClick={() => handleDelete(tool.id)}>
                                            <Trash2 className="h-4 w-4 text-red-500" />
                                        </Button>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ))}
                        {filteredTools.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={6} className="text-center py-8 text-slate-500">
                                    {tools.length === 0 ? "Nenhuma ferramenta cadastrada." : "Nenhuma ferramenta encontrada com os filtros atuais."}
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}
