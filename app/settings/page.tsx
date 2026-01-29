"use client";

import { useShopfloorStore } from "@/store/useShopfloorStore";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { User, Volume2, Calendar, Moon, Sun, Shield } from "lucide-react";
import { toast } from "sonner";
import { useEffect, useState } from "react";

export default function SettingsPage() {
    const { currentUser, updateUserSettings } = useShopfloorStore();

    // Local state for immediate feedback before persisting
    const [theme, setTheme] = useState(currentUser?.settings?.theme || 'light');

    useEffect(() => {
        if (currentUser?.settings) {
            setTheme(currentUser.settings.theme);
            // Apply theme logic here (e.g., document.documentElement.classList...)
            if (currentUser.settings.theme === 'dark') {
                document.documentElement.classList.add('dark');
            } else {
                document.documentElement.classList.remove('dark');
            }
        }
    }, [currentUser]);

    const handleThemeChange = (val: string) => {
        updateUserSettings({ theme: val as any });
        toast.success("Tema atualizado!");
    };

    const handleUnitsChange = (val: string) => {
        updateUserSettings({ units: val as any });
        toast.success("Unidades atualizadas!");
    };

    const handleSoundChange = (checked: boolean) => {
        updateUserSettings({ soundEnabled: checked });
        toast.success(checked ? "Sons ativados" : "Sons desativados");
    };

    if (!currentUser) {
        return <div className="p-8">Por favor faça login.</div>;
    }

    return (
        <div className="space-y-6 max-w-4xl mx-auto p-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
                    <User className="h-8 w-8" />
                    As Minhas Definições
                </h1>
                <p className="text-slate-500">Personalize a sua experiência no Antigravity.</p>
            </div>

            <div className="grid gap-6">
                {/* Visual Preferences */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2"><Sun className="h-5 w-5" /> Aparência</CardTitle>
                        <CardDescription>Ajuste o esquema de cores e layout.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-center justify-between">
                            <div className="space-y-0.5">
                                <Label>Tema do Sistema</Label>
                                <p className="text-sm text-slate-500">Alternar entre modo claro e escuro.</p>
                            </div>
                            <Select value={theme} onValueChange={handleThemeChange}>
                                <SelectTrigger className="w-[180px]">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="light">
                                        <div className="flex items-center gap-2"><Sun className="h-4 w-4" /> Claro</div>
                                    </SelectItem>
                                    <SelectItem value="dark">
                                        <div className="flex items-center gap-2"><Moon className="h-4 w-4" /> Escuro</div>
                                    </SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </CardContent>
                </Card>

                {/* Regional & Formats */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2"><Calendar className="h-5 w-5" /> Formatos Regionais</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-center justify-between">
                            <div className="space-y-0.5">
                                <Label>Unidades de Medida</Label>
                                <p className="text-sm text-slate-500">Sistema métrico ou imperial para dimensões.</p>
                            </div>
                            <Select
                                value={currentUser.settings?.units || 'metric'}
                                onValueChange={handleUnitsChange}
                            >
                                <SelectTrigger className="w-[180px]">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="metric">Métrico (m, cm)</SelectItem>
                                    <SelectItem value="imperial">Imperial (ft, in)</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="flex items-center justify-between border-t pt-4">
                            <div className="space-y-0.5">
                                <Label>Formato de Data</Label>
                                <p className="text-sm text-slate-500">Como as datas são exibidas.</p>
                            </div>
                            <Select
                                value={currentUser.settings?.dateFormat || 'DD/MM/YYYY'}
                                onValueChange={(v) => updateUserSettings({ dateFormat: v as any })}
                            >
                                <SelectTrigger className="w-[180px]">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="DD/MM/YYYY">DD/MM/AAAA</SelectItem>
                                    <SelectItem value="MM/DD/YYYY">MM/DD/AAAA</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </CardContent>
                </Card>

                {/* Notifications */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2"><Volume2 className="h-5 w-5" /> Som e Alertas</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-center justify-between">
                            <div className="space-y-0.5">
                                <Label>Alertas Sonoros (Andon)</Label>
                                <p className="text-sm text-slate-500">Reproduzir som ao receber alertas críticos.</p>
                            </div>
                            <Switch
                                checked={currentUser.settings?.soundEnabled ?? true}
                                onCheckedChange={handleSoundChange}
                            />
                        </div>
                    </CardContent>
                </Card>

                {/* Security */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2"><Shield className="h-5 w-5" /> Segurança</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-center justify-between">
                            <div className="space-y-0.5">
                                <Label>Pin Rápido</Label>
                                <p className="text-sm text-slate-500">Definir PIN para aprovações rápidas.</p>
                            </div>
                            <Button variant="outline">Alterar PIN</Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
