"use client";

import { useState, useMemo } from "react";
import { useShopfloorStore } from "@/store/useShopfloorStore";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { toast } from "sonner";
import { Plus, Check, ChevronsUpDown, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";

export function PPIRequestModal() {
    const { employees, assets, addPpeRequest, consumableTransactions } = useShopfloorStore();
    const [isOpen, setIsOpen] = useState(false);

    // Form State (V2 Multi-item)
    const [employeeId, setEmployeeId] = useState("");
    const [assetId, setAssetId] = useState("");

    // Items state (Max 5)
    type ItemRow = { id: string, itemName: string, partNumber: string, quantity: number, unitCost: number };
    const [items, setItems] = useState<ItemRow[]>([{ id: '1', itemName: '', partNumber: '', quantity: 1, unitCost: 0 }]);

    const [notes, setNotes] = useState("");

    // Combobox Open States
    const [openEmployee, setOpenEmployee] = useState(false);

    // Derived Catalog from History
    const partCatalog = useMemo(() => {
        const map = new Map();
        consumableTransactions.forEach(tx => {
            if (tx.partNumber && !map.has(tx.partNumber)) {
                map.set(tx.partNumber, {
                    partNumber: tx.partNumber,
                    description: tx.partDescription,
                    unitCost: tx.unitCost
                });
            }
        });
        return Array.from(map.values());
    }, [consumableTransactions]);

    const updateItem = (id: string, field: keyof ItemRow, val: any) => {
        setItems(prev => prev.map(item => item.id === id ? { ...item, [field]: val } : item));
    };

    const handleSelectPart = (id: string, part: any) => {
        setItems(prev => prev.map(item => item.id === id ? {
            ...item,
            partNumber: part.partNumber,
            itemName: part.description || "",
            unitCost: part.unitCost || 0
        } : item));
    };

    const addItem = () => {
        if (items.length < 5) {
            setItems([...items, { id: crypto.randomUUID(), itemName: '', partNumber: '', quantity: 1, unitCost: 0 }]);
        }
    };

    const removeItem = (id: string) => {
        if (items.length > 1) {
            setItems(items.filter(i => i.id !== id));
        }
    };

    const handleSubmit = async () => {
        const validItems = items.filter(i => i.itemName && i.quantity > 0);

        if (validItems.length === 0) {
            toast.error("Adicione pelo menos um item válido.");
            return;
        }

        const newRequest = {
            id: crypto.randomUUID(),
            employeeId: employeeId && employeeId !== "none" ? employeeId : undefined,
            assetId: assetId && assetId !== "none" ? assetId : undefined,
            // Legacy fields (First item)
            itemName: validItems[0].itemName,
            partNumber: validItems[0].partNumber,
            quantity: validItems[0].quantity,
            unitCost: validItems[0].unitCost,
            // V2
            items: validItems,
            status: 'pending' as const,
            requestDate: new Date().toISOString(),
            notes
        };

        try {
            await addPpeRequest(newRequest);
            toast.success("Pedido de EPI criado com sucesso!");
            setIsOpen(false);
            // Reset
            setEmployeeId("");
            setAssetId("");
            setItems([{ id: '1', itemName: '', partNumber: '', quantity: 1, unitCost: 0 }]);
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
            <DialogContent className="max-w-md bg-white overflow-y-auto max-h-[90vh]">
                <DialogHeader>
                    <DialogTitle>Novo Pedido de EPI/Consumível</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-2">

                    {/* Employee Combobox */}
                    <div className="space-y-2 flex flex-col">
                        <Label>Funcionário (Opcional)</Label>
                        <Popover open={openEmployee} onOpenChange={setOpenEmployee}>
                            <PopoverTrigger asChild>
                                <Button
                                    variant="outline"
                                    role="combobox"
                                    aria-expanded={openEmployee}
                                    className="w-full justify-between bg-white"
                                >
                                    {employeeId
                                        ? employees.find((emp) => emp.id === employeeId)?.name
                                        : "Selecione o funcionário..."}
                                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-[400px] p-0 bg-white">
                                <Command className="bg-white">
                                    <CommandInput placeholder="Buscar funcionário..." />
                                    <CommandList>
                                        <CommandEmpty>Nenhum funcionário encontrado.</CommandEmpty>
                                        <CommandGroup>
                                            <CommandItem
                                                value="none"
                                                onSelect={() => {
                                                    setEmployeeId("");
                                                    setOpenEmployee(false);
                                                }}
                                            >
                                                <Check
                                                    className={cn(
                                                        "mr-2 h-4 w-4",
                                                        employeeId === "" ? "opacity-100" : "opacity-0"
                                                    )}
                                                />
                                                -- Nenhum --
                                            </CommandItem>
                                            {employees.map((emp) => (
                                                <CommandItem
                                                    key={emp.id}
                                                    value={emp.name}
                                                    onSelect={() => {
                                                        setEmployeeId(emp.id === employeeId ? "" : emp.id);
                                                        setOpenEmployee(false);
                                                    }}
                                                >
                                                    <Check
                                                        className={cn(
                                                            "mr-2 h-4 w-4",
                                                            employeeId === emp.id ? "opacity-100" : "opacity-0"
                                                        )}
                                                    />
                                                    {emp.name}
                                                </CommandItem>
                                            ))}
                                        </CommandGroup>
                                    </CommandList>
                                </Command>
                            </PopoverContent>
                        </Popover>
                    </div>

                    <div className="space-y-2">
                        <Label>Área / Centro de Custo (Opcional)</Label>
                        <Select value={assetId} onValueChange={setAssetId}>
                            <SelectTrigger className="bg-white">
                                <SelectValue placeholder="Selecione a área..." />
                            </SelectTrigger>
                            <SelectContent className="bg-white">
                                <SelectItem value="none">-- Nenhuma --</SelectItem>
                                {assets.map(asset => (
                                    <SelectItem key={asset.id} value={asset.id}>{asset.name}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Items List */}
                    <div className="space-y-4 border rounded p-4 bg-slate-50">
                        <Label>Itens (Máx 5)</Label>
                        {items.map((item, index) => (
                            <div key={item.id} className="space-y-3 pb-3 border-b last:border-0 relative">
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="absolute right-0 top-0 h-6 w-6 p-0 text-slate-400 hover:text-red-500"
                                    onClick={() => removeItem(item.id)}
                                >
                                    <Trash2 className="h-4 w-4" />
                                </Button>

                                <span className="text-xs font-bold text-slate-500">Item {index + 1}</span>

                                <div className="grid grid-cols-2 gap-2">
                                    <div className="space-y-1">
                                        <Label className="text-xs">Part Number (Busca)</Label>
                                        <Popover>
                                            <PopoverTrigger asChild>
                                                <Button
                                                    variant="outline"
                                                    role="combobox"
                                                    size="sm"
                                                    className="w-full justify-between bg-white h-8 text-xs"
                                                >
                                                    {item.partNumber || "Buscar..."}
                                                    <ChevronsUpDown className="ml-2 h-3 w-3 opacity-50" />
                                                </Button>
                                            </PopoverTrigger>
                                            <PopoverContent className="w-[300px] p-0">
                                                <Command>
                                                    <CommandInput placeholder="Buscar..." className="h-8" />
                                                    <CommandList>
                                                        <CommandEmpty>Nad.</CommandEmpty>
                                                        <CommandGroup>
                                                            {partCatalog.map((p) => (
                                                                <CommandItem
                                                                    key={p.partNumber}
                                                                    value={`${p.partNumber} ${p.description}`}
                                                                    onSelect={() => handleSelectPart(item.id, p)}
                                                                    className="text-xs"
                                                                >
                                                                    <Check className={cn("mr-2 h-3 w-3", item.partNumber === p.partNumber ? "opacity-100" : "opacity-0")} />
                                                                    {p.partNumber} - {p.description}
                                                                </CommandItem>
                                                            ))}
                                                        </CommandGroup>
                                                    </CommandList>
                                                </Command>
                                            </PopoverContent>
                                        </Popover>
                                    </div>
                                    <div className="space-y-1">
                                        <Label className="text-xs">Descrição</Label>
                                        <Input
                                            value={item.itemName}
                                            onChange={e => updateItem(item.id, 'itemName', e.target.value)}
                                            className="h-8 text-xs bg-white"
                                        />
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-2">
                                    <div className="space-y-1">
                                        <Label className="text-xs">Qtd</Label>
                                        <Input
                                            type="number"
                                            min={1}
                                            value={item.quantity}
                                            onChange={e => updateItem(item.id, 'quantity', Number(e.target.value))}
                                            className="h-8 text-xs bg-white"
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <Label className="text-xs">Custo Unit.</Label>
                                        <Input
                                            type="number"
                                            value={item.unitCost}
                                            onChange={e => updateItem(item.id, 'unitCost', Number(e.target.value))}
                                            className="h-8 text-xs bg-white"
                                        />
                                    </div>
                                </div>
                            </div>
                        ))}
                        {items.length < 5 && (
                            <Button variant="outline" size="sm" onClick={addItem} className="w-full border-dashed">
                                <Plus className="mr-2 h-3 w-3" /> Adicionar Item
                            </Button>
                        )}
                    </div>

                    <div className="space-y-2">
                        <Label>Observações</Label>
                        <Textarea
                            placeholder="Tamanho, cor, motivo..."
                            value={notes}
                            onChange={e => setNotes(e.target.value)}
                            className="bg-white"
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
