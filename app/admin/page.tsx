"use client";

import { useState, useEffect } from "react";
import { useShopfloorStore } from "@/store/useShopfloorStore";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, AlertTriangle, RefreshCw, Radio, Database, FileText } from "lucide-react";
import { RFIDSimulator } from "@/components/iot/RFIDSimulator";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";

export default function AdminPage() {
    const { assets, employees, syncData } = useShopfloorStore();
    const [dbStatus, setDbStatus] = useState<"ok" | "error" | "loading">("loading");
    const [lastSync, setLastSync] = useState<string | null>(null);

    const checkDb = async () => {
        setDbStatus("loading");
        const start = performance.now();
        const { error } = await supabase.from('assets').select('count', { count: 'exact', head: true });
        const end = performance.now();
        if (error) {
            setDbStatus("error");
            toast.error("Erro na conexão DB: " + error.message);
        } else {
            setDbStatus("ok");
            toast.success(`Conexão OK (${(end - start).toFixed(1)}ms)`);
        }
    };

    const handleSync = async () => {
        try {
            await syncData();
            setLastSync(new Date().toLocaleTimeString());
            toast.success("Dados sincronizados com sucesso!");
        } catch (e) {
            toast.error("Erro na sincronização.");
        }
    };

    useEffect(() => {
        checkDb();
    }, []);

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight text-slate-900">Admin & Suporte</h1>
                <p className="text-slate-500">Ferramentas para técnicos e gestão do sistema.</p>
            </div>

            <Tabs defaultValue="health" className="space-y-4">
                <TabsList>
                    <TabsTrigger value="health">Diagnóstico do Sistema</TabsTrigger>
                    <TabsTrigger value="rfid">Ferramentas RFID</TabsTrigger>
                    <TabsTrigger value="manual">Manual do Sistema</TabsTrigger>
                </TabsList>

                {/* SYSTEM HEALTH */}
                <TabsContent value="health">
                    <div className="grid gap-4 md:grid-cols-3">
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Status do Banco de Dados</CardTitle>
                                <Database className="h-4 w-4 text-slate-500" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold flex items-center gap-2">
                                    {dbStatus === 'ok' ? (
                                        <span className="text-green-600 flex items-center gap-2"><CheckCircle /> Conectado</span>
                                    ) : dbStatus === 'loading' ? (
                                        <span className="text-yellow-600">Verificando...</span>
                                    ) : (
                                        <span className="text-red-600">Erro</span>
                                    )}
                                </div>
                                <Button variant="link" size="sm" onClick={checkDb} className="px-0">Testar Conexão</Button>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Sincronização Local (Store)</CardTitle>
                                <RefreshCw className="h-4 w-4 text-slate-500" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">
                                    {assets.length + employees.length} <span className="text-sm font-normal text-slate-500">objetos</span>
                                </div>
                                <p className="text-xs text-slate-500">Última sync: {lastSync || 'Ao iniciar'}</p>
                                <Button variant="link" size="sm" onClick={handleSync} className="px-0">Forçar Sync Agora</Button>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Versão</CardTitle>
                                <FileText className="h-4 w-4 text-slate-500" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">v6.0.1</div>
                                <p className="text-xs text-slate-500">Build: {new Date().toLocaleDateString()}</p>
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>

                {/* RFID TOOLS */}
                <TabsContent value="rfid" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Simulador & Programador RFID</CardTitle>
                            <CardDescription>
                                Utilize para testar leitura de tags ou programar novos dispositivos (Emulação).
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div>
                                    <h3 className="text-sm font-semibold mb-2">Simulador de Leitura (Eventos)</h3>
                                    <RFIDSimulator onScan={(tag) => toast.info(`Tag Escaneada: ${tag}`)} />
                                </div>
                                <div className="space-y-4 border-l pl-4">
                                    <h3 className="text-sm font-semibold mb-2">Gravador de Tags (Mock)</h3>
                                    <div className="space-y-2">
                                        <label className="text-xs text-slate-500">ID do Dispositivo / Peça</label>
                                        <Input placeholder="Ex: PART-123-CASCO" />
                                        <Button className="w-full">
                                            <Radio className="mr-2 h-4 w-4" />
                                            Gravar Próxima Tag
                                        </Button>
                                    </div>
                                    <div className="bg-slate-100 p-2 rounded text-xs">
                                        <p>Log de Gravação:</p>
                                        <p className="font-mono text-slate-400 mt-1">Esperando aproximação...</p>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* MANUAL */}
                <TabsContent value="manual">
                    <Card>
                        <CardHeader>
                            <CardTitle>Manual de Utilização - NavalShop V6</CardTitle>
                            <CardDescription>Guia rápido de operações.</CardDescription>
                        </CardHeader>
                        <CardContent className="prose max-w-none">
                            <h3>1. Módulos Principais</h3>
                            <ul>
                                <li><strong>Ordens de Produção:</strong> Gerenciamento de filas e status dos barcos.</li>
                                <li><strong>Modo Operador:</strong> Tela de chão de fábrica para Check-in/Check-out.</li>
                                <li><strong>Supervisor:</strong> Visão geral de alocação de recursos e mapa da fábrica.</li>
                            </ul>

                            <h3>2. Rastreamento de Partes (Novidade V7)</h3>
                            <p>Agora é possível definir "Partes" (Ex: Casco, Coberta) dentro do cadastro de Produtos. Ao abrir uma Ordem, você pode associar tags RFID específicas para cada parte.</p>

                            <h3>3. IoT e Andon</h3>
                            <p>O sistema aceita eventos via API (mqtt-bridge) ou pelo Simulador RFID nesta tela. O Andon (Alertas) pode ser acionado pelo Mobile App.</p>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}
