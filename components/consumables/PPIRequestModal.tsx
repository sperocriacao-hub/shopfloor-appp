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
import { Plus, Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";

export function PPIRequestModal() {
    const { employees, assets, ppeRequests, addPpeRequest, consumableTransactions } = useShopfloorStore();
    const [isOpen, setIsOpen] = useState(false);

    // Form State
    const [employeeId, setEmployeeId] = useState("");
    const [assetId, setAssetId] = useState("");
    const [itemName, setItemName] = useState("");
    const [partNumber, setPartNumber] = useState("");
    const [quantity, setQuantity] = useState(1);
    const [unitCost, setUnitCost] = useState(0);
    const [notes, setNotes] = useState("");

    // Combobox Open States
    const [openEmployee, setOpenEmployee] = useState(false);
    const [openPart, setOpenPart] = useState(false);

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

    const handleSelectPart = (part: any) => {
        setPartNumber(part.partNumber);
        setItemName(part.description || "");
        setUnitCost(part.unitCost || 0);
        setOpenPart(false);
    };

    const handleSubmit = async () => {
        if (!itemName || !quantity) {
            toast.error("Por favor, preencha o nome do item e a quantidade.");
            return;
        }

        const newRequest = {
            id: crypto.randomUUID(),
            employeeId: employeeId && employeeId !== "none" ? employeeId : undefined,
            assetId: assetId && assetId !== "none" ? assetId : undefined,
            itemName,
            partNumber,
            quantity: Number(quantity),
            unitCost: Number(unitCost),
            status: 'pending' as const,
            requestDate: new Date().toISOString(),
            notes
        };

        try {
            await addPpeRequest(newRequest);
            toast.success("Pedido de EPI criado com sucesso!");
            setIsOpen(false);
            // Reset form
            setEmployeeId("");
            setAssetId("");
            setItemName("");
            setPartNumber("");
            setQuantity(1);
            setUnitCost(0);
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
            <DialogContent className="max-w-md bg-white">
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

                    {/* Part Number Combobox */}
                    <div className="space-y-2 flex flex-col">
                        <Label>Buscar Item (Part Number / Descrição)</Label>
                        <Popover open={openPart} onOpenChange={setOpenPart}>
                            <PopoverTrigger asChild>
                                <Button
                                    variant="outline"
                                    role="combobox"
                                    aria-expanded={openPart}
                                    className="w-full justify-between bg-white text-slate-600 font-normal hover:text-slate-900"
                                >
                                    {partNumber
                                        ? `${partNumber} - ${itemName}`
                                        : "Buscar no histórico..."}
                                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-[400px] p-0 bg-white">
                                <Command className="bg-white">
                                    <CommandInput placeholder="Buscar item..." />
                                    <CommandList>
                                        <CommandEmpty>Nenhum item encontrado.</CommandEmpty>
                                        <CommandGroup>
                                            {partCatalog.map((part) => (
                                                <CommandItem
                                                    key={part.partNumber}
                                                    value={`${part.partNumber} ${part.description}`}
                                                    onSelect={() => handleSelectPart(part)}
                                                >
                                                    <Check
                                                        className={cn(
                                                            "mr-2 h-4 w-4",
                                                            partNumber === part.partNumber ? "opacity-100" : "opacity-0"
                                                        )}
                                                    />
                                                    <div className="flex flex-col">
                                                        <span className="font-medium">{part.partNumber}</span>
                                                        <span className="text-xs text-slate-500">{part.description}</span>
                                                    </div>
                                                </CommandItem>
                                            ))}
                                        </CommandGroup>
                                    </CommandList>
                                </Command>
                            </PopoverContent>
                        </Popover>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>Item (Descrição)</Label>
                            <Input
                                placeholder="Ex: Luvas Nitrílicas"
                                value={itemName}
                                onChange={e => setItemName(e.target.value)}
                                className="bg-white"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Part Number</Label>
                            <Input
                                placeholder="Ex: 12345"
                                value={partNumber}
                                onChange={e => setPartNumber(e.target.value)}
                                className="bg-white"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>Quantidade</Label>
                            <Input
                                type="number"
                                min={1}
                                value={quantity}
                                onChange={e => setQuantity(Number(e.target.value))}
                                className="bg-white"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Custo Unit. (€)</Label>
                            <Input
                                type="number"
                                min={0}
                                step={0.01}
                                value={unitCost}
                                onChange={e => setUnitCost(Number(e.target.value))}
                                className="bg-white bg-slate-50"
                                readOnly
                            />
                        </div>
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
