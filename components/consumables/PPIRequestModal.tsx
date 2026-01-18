"use client";

import { useState } from "react";
import { useShopfloorStore } from "@/store/useShopfloorStore";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Plus } from "lucide-react";

export function PPIRequestModal() {
    const { employees, assets, ppeRequests, addPpeRequest } = useShopfloorStore();
    const [isOpen, setIsOpen] = useState(false);
    
    // Form State
    const [employeeId, setEmployeeId] = useState("");
    const [assetId, setAssetId] = useState("");
    const [itemName, setItemName] = useState("");
    const [partNumber, setPartNumber] = useState("");
    const [quantity, setQuantity] = useState(1);
    const [notes, setNotes] = useState("");

    const handleSubmit = async () => {
        if (!itemName || !quantity) {
            toast.error("Por favor, preencha o nome do item e a quantidade.");
            return;
        }

        const newRequest = {
            id: crypto.randomUUID(),
            employeeId: employeeId !== "none" ? employeeId : undefined,
            assetId: assetId !== "none" ? assetId : undefined,
            itemName,
            partNumber,
            quantity: Number(quantity),
            status: 'pending' as const,
            requestDate: new Date().toISOString(),
            notes
        };

        try {
            await addPpeRequest(newRequest);
            toast.success("Pedido de EPI criado com sucesso!");
            setIsOpen(false);
            // Reset form
            setItemName("");
            setPartNumber("");
            setQuantity(1);
            setNotes("");
        } catch (error) {
            toast.error("Erro ao criar pedido.");
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                    <Plus className="mr-2 h-4 w-4" /> Novo Pedido (EPI)
                </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <DialogTitle>Novo Pedido de EPI/Consumível</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-2">
                    <div className="space-y-2">
                        <Label>Funcionário (Opcional)</Label>
                        <Select value={employeeId} onValueChange={setEmployeeId}>
                            <SelectTrigger>
                                <SelectValue placeholder="Selecione o funcionário..." />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="none">-- Nenhum --</SelectItem>
                                {employees.map(emp => (
                                    <SelectItem key={emp.id} value={emp.id}>{emp.name}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <Label>Área / Centro de Custo (Opcional)</Label>
                        <Select value={assetId} onValueChange={setAssetId}>
                            <SelectTrigger>
                                <SelectValue placeholder="Selecione a área..." />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="none">-- Nenhuma --</SelectItem>
                                {assets.map(asset => (
                                    <SelectItem key={asset.id} value={asset.id}>{asset.name}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>Item (Descrição)</Label>
                            <Input 
                                placeholder="Ex: Luvas Nitrílicas" 
                                value={itemName}
                                onChange={e => setItemName(e.target.value)}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Part Number (Se souber)</Label>
                            <Input 
                                placeholder="Ex: 12345" 
                                value={partNumber}
                                onChange={e => setPartNumber(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label>Quantidade</Label>
                        <Input 
                            type="number" 
                            min={1} 
                            value={quantity}
                            onChange={e => setQuantity(Number(e.target.value))}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label>Observações</Label>
                        <Textarea 
                            placeholder="Tamanho, cor, motivo..." 
                            value={notes} 
                            onChange={e => setNotes(e.target.value)}
                        />
                    </div>

                    <Button className="w-full bg-blue-600 hover:bg-blue-700" onClick={handleSubmit}>
                        Criar Pedido
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
