"use client";

import { useState } from "react";
import { useShopfloorStore } from "@/store/useShopfloorStore";
import { ProductPart } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Trash2, Plus } from "lucide-react";
import { toast } from "sonner";

interface ProductPartsManagerProps {
    productModelId: string;
}

export function ProductPartsManager({ productModelId }: ProductPartsManagerProps) {
    const { productParts, addProductPart } = useShopfloorStore();

    // Filter parts for this model
    const parts = productParts.filter(p => p.productModelId === productModelId);

    const [newName, setNewName] = useState("");
    const [newCategory, setNewCategory] = useState<ProductPart['category']>("Big");
    const [rfidRequired, setRfidRequired] = useState(false);

    const handleAdd = async () => {
        if (!newName) return;

        const newPart: ProductPart = {
            id: crypto.randomUUID(),
            productModelId,
            name: newName,
            category: newCategory,
            rfidRequired: rfidRequired
        };

        await addProductPart(newPart);
        toast.success("Parte adicionada!");
        setNewName("");
        setRfidRequired(false);
    };

    return (
        <Card>
            <CardHeader className="py-3">
                <CardTitle className="text-sm font-medium">Composição do Produto (Big Parts)</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                {/* Add Form */}
                <div className="grid grid-cols-4 gap-2 items-end">
                    <div className="col-span-2 space-y-1">
                        <Label className="text-xs">Nome da Parte</Label>
                        <Input
                            value={newName}
                            onChange={e => setNewName(e.target.value)}
                            placeholder="Ex: Casco, Coberta..."
                            className="h-8 text-xs"
                        />
                    </div>
                    <div className="space-y-1">
                        <Label className="text-xs">Categoria</Label>
                        <Select value={newCategory} onValueChange={(v: any) => setNewCategory(v)}>
                            <SelectTrigger className="h-8 text-xs">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="Big">Big Part</SelectItem>
                                <SelectItem value="Medium">Medium</SelectItem>
                                <SelectItem value="Small">Small</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="flex items-center gap-2 pb-2">
                        <Checkbox id="rfid" checked={rfidRequired} onCheckedChange={(c) => setRfidRequired(!!c)} />
                        <Label htmlFor="rfid" className="text-xs">RFID?</Label>
                        <Button size="sm" onClick={handleAdd} disabled={!newName} className="ml-auto h-8 w-8 p-0">
                            <Plus className="h-4 w-4" />
                        </Button>
                    </div>
                </div>

                {/* List */}
                <div className="border rounded-md">
                    <table className="w-full text-sm">
                        <thead className="bg-slate-50 text-xs text-slate-500 font-medium">
                            <tr>
                                <th className="px-3 py-2 text-left">Nome</th>
                                <th className="px-3 py-2 text-left">Categoria</th>
                                <th className="px-3 py-2 text-center">RFID</th>
                                <th className="px-3 py-2 w-[40px]"></th>
                            </tr>
                        </thead>
                        <tbody>
                            {parts.length === 0 ? (
                                <tr>
                                    <td colSpan={4} className="px-3 py-4 text-center text-slate-400 text-xs">
                                        Nenhuma parte definida.
                                    </td>
                                </tr>
                            ) : (
                                parts.map(part => (
                                    <tr key={part.id} className="border-t">
                                        <td className="px-3 py-2">{part.name}</td>
                                        <td className="px-3 py-2">
                                            <span className={`text-[10px] px-1.5 py-0.5 rounded ${part.category === 'Big' ? 'bg-purple-100 text-purple-700' :
                                                    part.category === 'Medium' ? 'bg-blue-100 text-blue-700' :
                                                        'bg-slate-100 text-slate-700'
                                                }`}>
                                                {part.category}
                                            </span>
                                        </td>
                                        <td className="px-3 py-2 text-center">
                                            {part.rfidRequired ? "✅" : "—"}
                                        </td>
                                        <td className="px-3 py-2">
                                            <Button variant="ghost" size="sm" className="h-6 w-6 p-0 text-red-400 hover:text-red-600">
                                                <Trash2 className="h-3 w-3" />
                                            </Button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </CardContent>
        </Card>
    );
}
