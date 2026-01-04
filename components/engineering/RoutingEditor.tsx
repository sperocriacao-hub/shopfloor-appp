"use client";

import { useState, useEffect } from "react";
import { Plus, Trash2, Save, MoveUp, MoveDown, Clock, Archive } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { OperationDefinition } from "@/types";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface RoutingEditorProps {
    initialOperations: OperationDefinition[];
    onSave: (operations: OperationDefinition[]) => void;
}

export function RoutingEditor({ initialOperations, onSave }: RoutingEditorProps) {
    const [operations, setOperations] = useState<OperationDefinition[]>(initialOperations || []);

    // Ensure operations are sorted by sequence
    useEffect(() => {
        if (initialOperations) {
            setOperations([...initialOperations].sort((a, b) => a.sequence - b.sequence));
        }
    }, [initialOperations]);

    const handleAddOperation = () => {
        const newOp: OperationDefinition = {
            id: `op-${Date.now()}`,
            name: "Nova Operação",
            sequence: (operations.length + 1) * 10,
            standardTimeMinutes: 60,
            requiredAssetType: "Workstation",
            instructions: ""
        };
        setOperations([...operations, newOp]);
    };

    const handleUpdateOperation = (id: string, field: keyof OperationDefinition, value: any) => {
        setOperations(ops => ops.map(op => {
            if (op.id === id) {
                return { ...op, [field]: value };
            }
            return op;
        }));
    };

    const handleDeleteOperation = (id: string) => {
        setOperations(ops => ops.filter(op => op.id !== id));
    };

    const handleSave = () => {
        // Sort before saving
        const sorted = [...operations].sort((a, b) => a.sequence - b.sequence);
        onSave(sorted);
    };

    const assetTypes = ["Machine", "Workstation", "Mold", "Area", "Line"];

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-slate-800">Definição do Roteiro</h3>
                <Button onClick={handleAddOperation} size="sm" className="gap-2">
                    <Plus className="h-4 w-4" /> Adicionar Operação
                </Button>
            </div>

            <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-2">
                {operations.length === 0 && (
                    <div className="text-center py-8 text-slate-400 border-2 border-dashed rounded-lg">
                        Nenhuma operação definida. Adicione passos ao roteiro.
                    </div>
                )}
                
                {operations.map((op, index) => (
                    <div key={op.id} className="flex gap-3 items-start bg-slate-50 p-3 rounded-lg border border-slate-200 shadow-sm hover:border-blue-200 transition-colors">
                         {/* Sequence */}
                        <div className="w-20">
                            <label className="text-xs text-slate-500 font-medium ml-1">Seq.</label>
                            <Input 
                                type="number" 
                                value={op.sequence} 
                                onChange={(e) => handleUpdateOperation(op.id, 'sequence', parseInt(e.target.value))}
                                className="h-8 font-mono text-center text-blue-700 font-bold"
                            />
                        </div>

                        {/* Name */}
                        <div className="flex-1">
                             <label className="text-xs text-slate-500 font-medium ml-1">Nome da Operação</label>
                            <Input 
                                value={op.name} 
                                onChange={(e) => handleUpdateOperation(op.id, 'name', e.target.value)}
                                className="h-8 font-medium"
                                placeholder="Ex: Laminar Casco"
                            />
                        </div>

                        {/* Asset Type */}
                        <div className="w-40">
                             <label className="text-xs text-slate-500 font-medium ml-1">Tipo de Recurso</label>
                            <Select 
                                value={op.requiredAssetType} 
                                onValueChange={(val) => handleUpdateOperation(op.id, 'requiredAssetType', val)}
                            >
                                <SelectTrigger className="h-8">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {assetTypes.map(t => (
                                        <SelectItem key={t} value={t}>{t}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                         {/* Time */}
                         <div className="w-24">
                            <label className="text-xs text-slate-500 font-medium ml-1">Minutos</label>
                            <div className="relative">
                                <Clock className="h-3 w-3 absolute left-2 top-2.5 text-slate-400" />
                                <Input 
                                    type="number" 
                                    value={op.standardTimeMinutes} 
                                    onChange={(e) => handleUpdateOperation(op.id, 'standardTimeMinutes', parseInt(e.target.value))}
                                    className="h-8 pl-6 text-right"
                                />
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="pt-5">
                            <Button 
                                variant="ghost" 
                                size="icon" 
                                className="h-8 w-8 text-red-500 hover:text-red-700 hover:bg-red-50"
                                onClick={() => handleDeleteOperation(op.id)}
                            >
                                <Trash2 className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                ))}
            </div>

            <div className="flex justify-end pt-4 border-t border-slate-100">
                <Button onClick={handleSave} className="bg-blue-600 hover:bg-blue-700">
                    <Save className="h-4 w-4 mr-2" /> Salvar Roteiro
                </Button>
            </div>
        </div>
    );
}
