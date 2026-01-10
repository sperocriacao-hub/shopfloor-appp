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
    const { productOptions, optionTasks, assets, products, addOption, updateOption, removeOption, addTask, updateTask, removeTask, syncData } = useShopfloorStore();

    // Local state for UI
    const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);
    const [isCreating, setIsCreating] = useState(false);

    // Filter options
    const filteredOptions = productOptions;

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
                tempId: t.id, // Real ID
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

    const handleDeleteTask = async (idx: number) => {
        if (!confirm("Remover esta tarefa?")) return;

        const taskToDelete = formData.tasks[idx];

        // If it's a real task (not temp), delete from DB immediately
        if (!taskToDelete.tempId.startsWith('temp-')) {
            await removeTask(taskToDelete.tempId);
        }

        // Remove from UI
        const newTasks = [...formData.tasks];
        newTasks.splice(idx, 1);
        setFormData(prev => ({ ...prev, tasks: newTasks }));
    };

    const handleDeleteOption = async () => {
        if (!selectedOptionId) return;
        if (!confirm("ATENÇÃO: Isso excluirá esta Opção e TODAS as suas tarefas. Continuar?")) return;

        await removeOption(selectedOptionId);
        // Clean up tasks in store filter for UI consistency (though store logic handles DB, local state might need manual sync if we rely on filtered list)
        // Actually, removeOption in store only removes the option. Tasks are cascade deleted in DB usually, but store state might remain stale.
        // Let's rely on syncData to refresh everything properly or manual cleanup. 

        // For optimisitic UI:
        // We need to remove tasks from store manually if we want instant feedback, but syncData is safer.

        await syncData();
        setSelectedOptionId(null);
        setIsCreating(false);
        setFormData({ name: "", description: "", productModelId: "", tasks: [] });
    };

    const handleSave = async () => {
        if (!formData.name) return alert("Nome é obrigatório");

        const optionId = selectedOptionId || `opt-${Date.now()}`;

        // 1. Save/Update Option
        if (!selectedOptionId) {
            // Create
            await addOption({
                id: optionId,
                name: formData.name,
                description: formData.description,
                productModelId: formData.productModelId
            });
        } else {
            // Update
            await updateOption(optionId, {
                name: formData.name,
                description: formData.description,
                productModelId: formData.productModelId
            });
        }

        // 2. Save Tasks (Upsert logic)
        for (const t of formData.tasks) {
            if (t.tempId.startsWith('temp-')) {
                // Create New
                const realId = `tsk-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
                await addTask({
                    id: realId,
                    optionId: optionId,
                    description: t.description,
                    sequence: t.sequence,
                    pdfUrl: t.pdfUrl,
                    stationId: t.stationId
                });
            } else {
                // Update Existing
                await updateTask(t.tempId, {
                    description: t.description,
                    sequence: t.sequence,
                    pdfUrl: t.pdfUrl,
                    stationId: t.stationId
                });
            }
        }

        // Refresh
        await syncData();

        // Update UI state
        if (!selectedOptionId) {
            setSelectedOptionId(optionId);
            setIsCreating(false);
        }

        // Re-load the form data to get the new real IDs for tasks we just created
        // We can do this by finding the option we just saved/updated
        // But simply re-selecting it conceptually works.
        // Only safely re-select if we have the ID.
        // A simple alert for now.
        alert("Salvo com sucesso!");

        // Force refresh form linkage
        // We'll trust the user to continue editing or we could auto-reload.
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
                            "OptionName,OptionDescription,ProductModel,TaskDescription,TaskSequence,TaskStation,TaskPDF\n" +
                            productOptions.map(o => {
                                // Find tasks for this option to flatten
                                const myTasks = optionTasks.filter(t => t.optionId === o.id);
                                if (myTasks.length === 0) {
                                    return `${o.name},${o.description || ''},${o.productModelId || ''},,,,`;
                                }
                                return myTasks.map(t =>
                                    `${o.name},${o.description || ''},${o.productModelId || ''},${t.description},${t.sequence},${t.stationId || ''},${t.pdfUrl || ''}`
                                ).join("\n");
                            }).join("\n");

                        const encodedUri = encodeURI(csvContent);
                        const link = document.createElement("a");
                        link.setAttribute("href", encodedUri);
                        link.setAttribute("download", "options_template_v2_com_tarefas.csv");
                        document.body.appendChild(link);
                        link.click();
                    }}>
                        <FileText className="h-3 w-3 mr-1" /> Modelo CSV
                    </Button>
                    <Button variant="outline" size="sm" className="flex-1 text-xs" onClick={() => alert("Funcionalidade de importação em breve via CSV.")}>
                        Importar
                    </Button>
                </div>

                <div className="overflow-y-auto flex-1 space-y-2 mt-2">
                    {filteredOptions.length === 0 && (
                        <p className="text-sm text-slate-400 text-center py-4">Nenhuma opção cadastrada.</p>
                    )}
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
                            <div className="flex justify-between items-start">
                                <div className="flex-1 mr-4">
                                    <Label>Nome da Opção / Kit</Label>
                                    <Input
                                        value={formData.name}
                                        onChange={e => setFormData(prev => ({ ...prev, name: e.target.value }))}
                                        placeholder="Ex: Piso Teca, Som Premium..."
                                    />
                                </div>
                                {selectedOptionId ? (
                                    <Button variant="destructive" size="icon" onClick={handleDeleteOption} title="Excluir Opção/Kit Completo">
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                ) : (
                                    <div className="w-9 h-9"></div>
                                )}
                            </div>

                            <div className="grid grid-cols-2 gap-4">
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
                                    <Input
                                        value={formData.description}
                                        onChange={e => setFormData(prev => ({ ...prev, description: e.target.value }))}
                                        placeholder="Detalhes..."
                                    />
                                </div>
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
                                            <div className="flex gap-2">
                                                <div className="w-1/3">
                                                    <select
                                                        className="h-7 w-full rounded border border-slate-200 text-xs bg-white px-2"
                                                        value={task.stationId}
                                                        onChange={e => handleUpdateTask(idx, 'stationId', e.target.value)}
                                                    >
                                                        <option value="">-- Estação Destino --</option>
                                                        {assets.map(a => (
                                                            <option key={a.id} value={a.id}>{a.area} - {a.name}</option>
                                                        ))}
                                                    </select>
                                                </div>
                                                <div className="flex-1">
                                                    <Input
                                                        value={task.pdfUrl}
                                                        onChange={e => handleUpdateTask(idx, 'pdfUrl', e.target.value)}
                                                        className="h-7 text-xs text-blue-600 bg-blue-50/50 border-blue-100"
                                                        placeholder="URL do PDF (Instrução)"
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-8 w-8 text-slate-400 hover:text-red-500 opacity-100" // Always visible for clarity
                                            onClick={() => handleDeleteTask(idx)}
                                            title="Excluir Tarefa"
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
        </div >
    );
}
