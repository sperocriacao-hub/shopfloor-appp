"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useConfigStore } from "@/store/useConfigStore";
import { useState, useEffect } from "react";
import { toast } from "sonner";

interface SystemConfigModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function SystemConfigModal({ open, onOpenChange }: SystemConfigModalProps) {
    const { config, updateConfig } = useConfigStore();
    const [formData, setFormData] = useState(config);

    useEffect(() => {
        if (open) setFormData(config);
    }, [open, config]);

    const handleSave = () => {
        updateConfig(formData);
        toast.success("Configurações salvas com sucesso!");
        onOpenChange(false);
    };

    const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setFormData({ ...formData, logoUrl: reader.result as string });
            };
            reader.readAsDataURL(file);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Configuração do Sistema</DialogTitle>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                        <Label htmlFor="name">Nome da Empresa</Label>
                        <Input
                            id="name"
                            value={formData.companyName}
                            onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                        />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="logo">Logotipo</Label>
                        <div className="flex items-center gap-4">
                            <div className="h-16 w-16 border rounded flex items-center justify-center overflow-hidden bg-slate-50 relative">
                                {formData.logoUrl ? (
                                    <img src={formData.logoUrl} alt="Logo" className="w-full h-full object-contain" />
                                ) : (
                                    <span className="text-xs text-slate-400">Sem Logo</span>
                                )}
                            </div>
                            <div className="flex-1">
                                <Input
                                    id="logo"
                                    type="file"
                                    accept="image/*"
                                    onChange={handleLogoUpload}
                                    className="text-xs"
                                />
                                <p className="text-[10px] text-slate-500 mt-1">Recomendado: PNG Transparente</p>
                            </div>
                        </div>
                    </div>
                    {/* Colors - Future Proofing */}
                    {/* <div className="grid gap-2">
                        <Label htmlFor="color">Cor Primária</Label>
                        <div className="flex gap-2">
                             <Input 
                                id="color" 
                                type="color" 
                                className="w-12 h-10 p-1"
                                value={formData.primaryColor}
                                onChange={(e) => setFormData({...formData, primaryColor: e.target.value})}
                             />
                             <Input 
                                value={formData.primaryColor}
                                onChange={(e) => setFormData({...formData, primaryColor: e.target.value})}
                             />
                        </div>
                    </div> */}
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
                    <Button onClick={handleSave}>Salvar Alterações</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
