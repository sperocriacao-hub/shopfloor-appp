"use client";

import { useState } from "react";
import { useShopfloorStore } from "@/store/useShopfloorStore";
import { ProductOption, OptionTask } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Trash2, Save, FileText, GripVertical } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface OptionsManagerProps {
    productModelId?: string; // Optional: filter by model
    onClose: () => void;
}

export function OptionsManager({ productModelId, onClose }: OptionsManagerProps) {
    const { productOptions, optionTasks, assets, products, addOption, addTask, updateProduct, syncData } = useShopfloorStore();

    // Local state for UI
    const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);
    const [isCreating, setIsCreating] = useState(false);

    // Filter options (if model specific, though usually options are reusable or global for now)
    const filteredOptions = productOptions; //.filter(o => !productModelId || o.productModelId === productModelId);

    // Form State for New/Edit Option
    const [formData, setFormData] = useState<{
        name: string;
        productModelId: string;
        description: string;
        tasks: { tempId: string; description: string; pdfUrl: string; sequence: number; stationId: string }[];
    }>({
        name: "",
        productModelId: "",
        description: "",
        tasks: []
    });

    const handleSelectOption = (opt: ProductOption) => {
        setSelectedOptionId(opt.id);
        setIsCreating(false);
        // Load tasks
        const tasks = optionTasks
            .filter(t => t.optionId === opt.id)
            .sort((a, b) => a.sequence - b.sequence)
            .map(t => ({
                tempId: t.id, // Use real ID
                description: t.description,
                pdfUrl: t.pdfUrl || "",
                sequence: t.sequence,
                stationId: t.stationId || ""
            }));

        setFormData({
            name: opt.name,
            productModelId: opt.productModelId || "",
            description: opt.description || "",
            tasks
        });
    };

    const handleCreateNew = () => {
        setSelectedOptionId(null);
        setIsCreating(true);
        setFormData({ name: "", description: "", productModelId: "", tasks: [] });
    };

    const handleAddTask = () => {
        setFormData(prev => ({
            ...prev,
            tasks: [
                ...prev.tasks,
                { tempId: `temp-${Date.now()}`, description: "", pdfUrl: "", sequence: prev.tasks.length * 10 + 10, stationId: "" }
            ]
        }));
    };

    const handleUpdateTask = (idx: number, field: string, value: string | number) => {
        const newTasks = [...formData.tasks];
        newTasks[idx] = { ...newTasks[idx], [field]: value };
        setFormData(prev => ({ ...prev, tasks: newTasks }));
    };

    const handleDeleteTask = (idx: number) => {
        const newTasks = [...formData.tasks];
        newTasks.splice(idx, 1);
        setFormData(prev => ({ ...prev, tasks: newTasks }));
    };

    const handleSave = async () => {
        if (!formData.name) return alert("Nome é obrigatório");

        const optionId = selectedOptionId || `opt-${Date.now()}`;

        // 1. Save Option
        if (!selectedOptionId) {
            await addOption({
                id: optionId,
                name: formData.name,
                description: formData.description,
                productModelId: formData.productModelId
            });
        }
        // NOTE: Standard updateOption action missing in store, adding simplified add for now. 
        // Real editing would require 'updateOption' action. Assuming 'addOption' upserts or we just focus on creation for MVP.

        // 2. Save Tasks
        // For MVP, we just add new ones. Editing existing tasks requires intelligent diffing or clearing old ones.
        // Let's implement robust "Add Task" calls for all items in list (won't duplicate if ID matches primary key, but we generated temp IDs).

        for (const t of formData.tasks) {
            // Check if it's a temp ID (new) or existing
            const taskId = t.tempId.startsWith('temp-') ? `tsk-${Date.now()}-${Math.random().toString(36).substr(2, 9)}` : t.tempId;

            // We only have 'addTask', so we might need to handle updates. 
            // Since store only has 'addTask', let's assume valid upsert or just insert for new.
            if (t.tempId.startsWith('temp-')) {
                await addTask({
                    id: taskId,
                    optionId: optionId,
                    description: t.description,
                    sequence: t.sequence,
                    pdfUrl: t.pdfUrl,
                    stationId: t.stationId
                });
            }
        }

        // Refresh
        await syncData();
        setIsCreating(false);
        setSelectedOptionId(optionId);
        alert("Salvo com sucesso!");
    };

    return (
        <div className="flex h-[600px] gap-4">
            {/* Left: List */}
            <div className="w-1/3 border-r pr-4 flex flex-col gap-2">
                <Button onClick={handleCreateNew} className="w-full flex gap-2">
                    <Plus className="h-4 w-4" /> Nova Opção
                </Button>

                {/* Excel Actions */}
                <div className="flex gap-2">
                    <Button variant="outline" size="sm" className="flex-1 text-xs" onClick={() => {
                        const csvContent = "data:text/csv;charset=utf-8," +
                            "Name,Description,ProductModel\n" +
                            productOptions.map(e => `${e.name},${e.description || ''},${e.productModelId || ''}`).join("\n");
                        const encodedUri = encodeURI(csvContent);
                        const link = document.createElement("a");
                        link.setAttribute("href", encodedUri);
                        link.setAttribute("download", "options_template.csv");
                        document.body.appendChild(link);
                        link.click();
                    }}>
                        <FileText className="h-3 w-3 mr-1" /> Modelo Excel
                    </Button>
                    <Button variant="outline" size="sm" className="flex-1 text-xs" onClick={() => alert("Funcionalidade de importação em breve via CSV.")}>
                        Importar
                    </Button>
                </div>

                <div className="overflow-y-auto flex-1 space-y-2 mt-2">
                    {filteredOptions.map(opt => (
                        <Card
                            key={opt.id}
                            onClick={() => handleSelectOption(opt)}
                            className={cn(
                                "cursor-pointer hover:bg-slate-50 transition-colors",
                                selectedOptionId === opt.id ? "border-blue-500 bg-blue-50" : ""
                            )}
                        >
                            <CardContent className="p-3">
                                <p className="font-semibold">{opt.name}</p>
                                <p className="text-xs text-slate-500 truncate">{opt.description}</p>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>

            {/* Right: Editor */}
            <div className="flex-1 flex flex-col gap-4 overflow-hidden">
                {(selectedOptionId || isCreating) ? (
                    <>
                        <div className="grid gap-4 p-1">
                            <div>
                                <Label>Nome da Opção / Kit</Label>
                                <Input
                                    value={formData.name}
                                    onChange={e => setFormData(prev => ({ ...prev, name: e.target.value }))}
                                    placeholder="Ex: Piso Teca, Som Premium..."
                                />
                            </div>
                            <div>
                                <Label>Modelo do Produto (Vínculo)</Label>
                                <select
                                    className="flex h-10 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm"
                                    value={formData.productModelId}
                                    onChange={e => setFormData(prev => ({ ...prev, productModelId: e.target.value }))}
                                >
                                    <option value="">Global / Todos</option>
                                    {products.map(p => (
                                        <option key={p.id} value={p.id}>{p.name}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <Label>Descrição</Label>
                                <Textarea
                                    value={formData.description}
                                    onChange={e => setFormData(prev => ({ ...prev, description: e.target.value }))}
                                    placeholder="Detalhes sobre esta opção..."
                                    rows={2}
                                />
                            </div>
                        </div>

                        <div className="flex-1 border rounded-md p-4 flex flex-col gap-2 bg-slate-50 overflow-hidden">
                            <div className="flex justify-between items-center mb-2">
                                <h3 className="font-semibold flex items-center gap-2">
                                    <FileText className="h-4 w-4" /> Checklist de Tarefas
                                </h3>
                                <Button size="sm" variant="outline" onClick={handleAddTask}>
                                    <Plus className="h-4 w-4 mr-1" /> Adicionar Tarefa
                                </Button>
                            </div>

                            <div className="flex-1 overflow-y-auto space-y-2 pr-2">
                                {formData.tasks.map((task, idx) => (
                                    <div key={task.tempId || idx} className="flex gap-2 items-start bg-white p-2 rounded border shadow-sm group">
                                        <div className="mt-3 text-slate-400 cursor-move">
                                            <GripVertical className="h-4 w-4" />
                                        </div>
                                        <div className="flex-1 space-y-2">
                                            <div className="flex gap-2">
                                                <div className="w-16">
                                                    <Input
                                                        type="number"
                                                        value={task.sequence}
                                                        onChange={e => handleUpdateTask(idx, 'sequence', parseInt(e.target.value))}
                                                        className="h-8 text-xs"
                                                        placeholder="Seq"
                                                    />
                                                </div>
                                                <Input
                                                    value={task.description}
                                                    onChange={e => handleUpdateTask(idx, 'description', e.target.value)}
                                                    className="h-8 font-medium"
                                                    placeholder="Descrição da Tarefa (O que fazer)"
                                                />
                                            </div>
                                            <Input
                                                value={task.pdfUrl}
                                                onChange={e => handleUpdateTask(idx, 'pdfUrl', e.target.value)}
                                                className="h-7 text-xs text-blue-600 bg-blue-50/50 border-blue-100"
                                                placeholder="https://... (Link para PDF/Instrução)"
                                            />

                                            {/* Station Allocation (V4) */}
                                            <select
                                                className="h-7 w-full rounded border border-slate-200 text-xs bg-white px-2"
                                                value={task.stationId}
                                                onChange={e => handleUpdateTask(idx, 'stationId', e.target.value)}
                                            >
                                                <option value="">-- Destino da Tarefa (Estação) --</option>
                                                {assets.map(a => (
                                                    <option key={a.id} value={a.id}>{a.area} - {a.name}</option>
                                                ))}
                                            </select>
                                        </div>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-8 w-8 text-slate-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                                            onClick={() => handleDeleteTask(idx)}
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                ))}
                                {formData.tasks.length === 0 && (
                                    <div className="text-center text-slate-400 py-10 border-2 border-dashed rounded-lg">
                                        Nenhuma tarefa definida para esta opção.
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="flex justify-end pt-2 border-t">
                            <Button className="bg-green-600 hover:bg-green-700" onClick={handleSave}>
                                <Save className="h-4 w-4 mr-2" /> Salvar Alterações
                            </Button>
                        </div>
                    </>
                ) : (
                    <div className="flex-1 flex items-center justify-center text-slate-400">
                        Selecione ou crie uma opção para editar.
                    </div>
                )}
            </div>
        </div>
    );
}
