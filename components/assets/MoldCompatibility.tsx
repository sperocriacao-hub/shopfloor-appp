"use client";

import { useState } from "react";
import { useShopfloorStore } from "@/store/useShopfloorStore";
import { Asset, MoldCompatibility } from "@/types";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Trash2, Link as LinkIcon, AlertCircle } from "lucide-react";

interface MoldCompatibilityProps {
    asset: Asset;
}

export function MoldCompatibilityManager({ asset }: MoldCompatibilityProps) {
    const { assets, moldCompatibility, addMoldCompatibility, removeMoldCompatibility } = useShopfloorStore();

    // We only pair Hull <-> Deck.
    // Ideally, we should know if 'asset' is Hull or Deck. 
    // For now, let's assume the user selects the "Other Half".

    const [selectedPartnerId, setSelectedPartnerId] = useState<string>("");
    const [notes, setNotes] = useState("");

    // Identify current mold pairings
    const myPairings = moldCompatibility.filter(
        bc => bc.hullMoldId === asset.id || bc.deckMoldId === asset.id
    );

    const handleAddPair = async () => {
        if (!selectedPartnerId) return;

        // Basic Logic: If I am Hull, Partner is Deck (or vice versa).
        // We don't have explicit 'subtype', so we trust user pairing or allow generic pairing.
        // Let's assume (arbitrarily) that the current one is 'hull' and selected is 'deck' 
        // OR we check if the pair already exists in either direction.

        // Prevent duplicates
        const exists = moldCompatibility.find(
            bc => (bc.hullMoldId === asset.id && bc.deckMoldId === selectedPartnerId) ||
                (bc.deckMoldId === asset.id && bc.hullMoldId === selectedPartnerId)
        );

        if (exists) return alert("Par já existe.");

        await addMoldCompatibility({
            id: `pair-${Date.now()}`,
            hullMoldId: asset.id,
            deckMoldId: selectedPartnerId,
            notes: notes,
            compatibilityScore: 100
        });

        setSelectedPartnerId("");
        setNotes("");
    };

    // Filter potential partners: Must be Type 'Mold' and not me.
    const availableMolds = assets.filter(a => a.type === 'Mold' && a.id !== asset.id);

    return (
        <div className="space-y-6">
            <div className="bg-blue-50 p-4 rounded-md border border-blue-100">
                <h3 className="text-sm font-semibold text-blue-900 flex items-center mb-2">
                    <LinkIcon className="h-4 w-4 mr-2" />
                    Matriz de Compatibilidade (Casco & Coberta)
                </h3>
                <p className="text-xs text-blue-700 mb-4">
                    Defina quais moldes podem ser utilizados em conjunto.
                    Isso previne erros de agendamento na laminação e montagem.
                </p>

                <div className="flex gap-2 items-end">
                    <div className="flex-1">
                        <Label className="text-xs">Molde Parceiro</Label>
                        <Select value={selectedPartnerId} onValueChange={setSelectedPartnerId}>
                            <SelectTrigger className="h-8 bg-white">
                                <SelectValue placeholder="Selecione o molde..." />
                            </SelectTrigger>
                            <SelectContent>
                                {availableMolds.map(m => (
                                    <SelectItem key={m.id} value={m.id}>{m.name}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="flex-1">
                        <Label className="text-xs">Observações</Label>
                        <Input
                            value={notes}
                            onChange={e => setNotes(e.target.value)}
                            className="h-8 bg-white"
                            placeholder="Ex: Ajuste perfeito..."
                        />
                    </div>
                    <Button size="sm" onClick={handleAddPair} disabled={!selectedPartnerId}>
                        Adicionar
                    </Button>
                </div>
            </div>

            <div className="border rounded-md">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Parceiro</TableHead>
                            <TableHead>Score</TableHead>
                            <TableHead>Obs</TableHead>
                            <TableHead className="w-[50px]"></TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {myPairings.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={4} className="text-center text-slate-400 py-4">
                                    Nenhum vínculo registrado.
                                </TableCell>
                            </TableRow>
                        )}
                        {myPairings.map(pair => {
                            const partnerId = pair.hullMoldId === asset.id ? pair.deckMoldId : pair.hullMoldId;
                            const partner = assets.find(a => a.id === partnerId);

                            return (
                                <TableRow key={pair.id}>
                                    <TableCell className="font-medium">
                                        {partner?.name || "Desconhecido"}
                                        <span className="block text-xs text-slate-400">{partner?.area}</span>
                                    </TableCell>
                                    <TableCell>
                                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                                            {pair.compatibilityScore}%
                                        </span>
                                    </TableCell>
                                    <TableCell className="text-xs text-slate-500">{pair.notes}</TableCell>
                                    <TableCell>
                                        <Button variant="ghost" size="icon" onClick={() => removeMoldCompatibility(pair.id)}>
                                            <Trash2 className="h-4 w-4 text-slate-400 hover:text-red-500" />
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            );
                        })}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}
