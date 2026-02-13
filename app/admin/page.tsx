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
import { Trash, Plus, Monitor, Activity, Server } from "lucide-react";

export default function AdminPage() {
    const { assets, employees, syncData, rfidReaders, addRfidReader, deleteRfidReader, iotEvents, updateAsset, updateEmployee } = useShopfloorStore();
    const [dbStatus, setDbStatus] = useState<"ok" | "error" | "loading">("loading");
    const [lastSync, setLastSync] = useState<string | null>(null);

    // Local state for Writer
    const [writerType, setWriterType] = useState('asset');
    const [writerTargetId, setWriterTargetId] = useState('');
    const [writerTagId, setWriterTagId] = useState('');

    const handleWriteTag = async () => {
        if (!writerTargetId || !writerTagId) return toast.error("Selecione o Alvo e informe a Tag");

        try {
            if (writerType === 'asset') {
                await updateAsset(writerTargetId, { rfidTag: writerTagId });
                toast.success(`Tag gravada no Ativo!`);
            } else if (writerType === 'employee') {
                await updateEmployee(writerTargetId, { rfidTag: writerTagId });
                toast.success(`Tag gravada no Funcionário!`);
            }
            setWriterTagId('');
        } catch (e) {
            toast.error("Erro ao gravar Tag");
        }
    };

    // Auto-generate tag helper
    const generateTag = () => {
        const prefix = writerType === 'asset' ? 'AST' : 'EMP';
        setWriterTagId(`${prefix}-${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`);
    };

    // Local state for new reader form
    const [newReader, setNewReader] = useState({ name: '', ip: '', station: '' });

    const handleAddReader = () => {
        if (!newReader.name || !newReader.ip) return toast.error("Nome e IP obrigatórios");
        addRfidReader({
            id: `rdr-${Date.now()}`,
            name: newReader.name,
            ipAddress: newReader.ip,
            stationId: newReader.station,
            status: 'offline'
        });
        setNewReader({ name: '', ip: '', station: '' });
        toast.success("Leitor adicionado");
    };

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
                <div className="flex justify-between items-center">
                    <p className="text-slate-500">Ferramentas para técnicos e gestão do sistema.</p>
                    <Button variant="outline" onClick={() => window.location.href = '/admin/debug'}>
                        Abrir Diagnóstico Full Screen
                    </Button>
                </div>
            </div>

            <Tabs defaultValue="health" className="space-y-4">
                <TabsList>
                    <TabsTrigger value="health">Diagnóstico do Sistema</TabsTrigger>
                    <TabsTrigger value="provisioning">Hardware (IoT)</TabsTrigger>
                    <TabsTrigger value="rfid">Ferramentas RFID</TabsTrigger>
                    <TabsTrigger value="manual">Manual do Sistema</TabsTrigger>
                    <TabsTrigger value="advanced" onClick={() => window.location.href = '/admin/database'}>Diagnóstico Avançado (DB)</TabsTrigger>
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
                                    <h3 className="text-sm font-semibold mb-2">Gravador de Tags (Atribuição)</h3>

                                    <div className="space-y-3">
                                        <div className="space-y-1">
                                            <label className="text-xs text-slate-500">Tipo de Item</label>
                                            <select
                                                className="w-full flex h-10 w-full items-center justify-between rounded-md border border-slate-200 bg-white px-3 py-2 text-sm placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-slate-950 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                                value={writerType}
                                                onChange={e => { setWriterType(e.target.value); setWriterTargetId(''); }}
                                            >
                                                <option value="asset">Ativo / Máquina / Molde</option>
                                                <option value="employee">Funcionário (Badge)</option>
                                            </select>
                                        </div>

                                        <div className="space-y-1">
                                            <label className="text-xs text-slate-500">Selecione o Item</label>
                                            <select
                                                className="w-full flex h-10 w-full items-center justify-between rounded-md border border-slate-200 bg-white px-3 py-2 text-sm placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-slate-950 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                                value={writerTargetId}
                                                onChange={e => setWriterTargetId(e.target.value)}
                                            >
                                                <option value="">Selecione...</option>
                                                {writerType === 'asset'
                                                    ? assets.map(a => <option key={a.id} value={a.id}>{a.name} ({a.rfidTag || 'Sem Tag'})</option>)
                                                    : employees.map(e => <option key={e.id} value={e.id}>{e.name} ({e.rfidTag || 'Sem Tag'})</option>)
                                                }
                                            </select>
                                        </div>

                                        <div className="space-y-1">
                                            <label className="text-xs text-slate-500">ID da Tag (Novo)</label>
                                            <div className="flex gap-2">
                                                <Input
                                                    placeholder="Lendo..."
                                                    value={writerTagId}
                                                    onChange={e => setWriterTagId(e.target.value)}
                                                />
                                                <Button variant="outline" onClick={generateTag} title="Gerar Aleatório">🎲</Button>
                                            </div>
                                        </div>

                                        <Button className="w-full" onClick={handleWriteTag} disabled={!writerTargetId || !writerTagId}>
                                            <Radio className="mr-2 h-4 w-4" />
                                            Gravar / Associar
                                        </Button>
                                    </div>

                                    <div className="bg-slate-100 p-2 rounded text-xs mt-4">
                                        <p className="font-semibold text-slate-700">Instruções:</p>
                                        <ul className="list-disc pl-4 text-slate-500 mt-1 space-y-1">
                                            <li>Selecione o Item (Ativo ou Pessoa).</li>
                                            <li>Aproxima a Tag virgem do Leitor 1.</li>
                                            <li>Clique em Gravar para vincular no Banco.</li>
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* INPUT DEBUGGER */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Activity className="h-5 w-5" /> Debugger (Live Log)
                            </CardTitle>
                            <CardDescription>Eventos brutos recebidos via MQTT/WebSocket ou Hardware Local.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="bg-slate-950 text-green-500 font-mono text-xs p-4 rounded-md h-[300px] overflow-y-auto">
                                {iotEvents.length === 0 && <span className="opacity-50">// Nenhum evento registrado. Escaneie uma tag...</span>}
                                {iotEvents.map((evt) => (
                                    <div key={evt.id} className="mb-1 border-b border-green-900/30 pb-1">
                                        <span className="text-slate-500">[{new Date(evt.timestamp).toLocaleTimeString()}]</span>{' '}
                                        <span className="font-bold text-green-400">{evt.type}</span>{' '}
                                        <span className="text-yellow-300">TAG:{evt.tagId}</span>{' '}
                                        <span className="text-blue-400">RDR:{evt.readerId}</span>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* PROVISIONING TAB */}
                <TabsContent value="provisioning">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Server className="h-5 w-5" /> Leitores RFID & Controladores
                            </CardTitle>
                            <CardDescription>Gerencie os dispositivos físicos conectados à rede da fábrica.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-6">
                                {/* Form */}
                                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end bg-slate-50 p-4 rounded-lg border">
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium">Nome do Leitor</label>
                                        <Input
                                            placeholder="Ex: Leitor Linha A"
                                            value={newReader.name}
                                            onChange={e => setNewReader({ ...newReader, name: e.target.value })}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium">IP Address</label>
                                        <Input
                                            placeholder="192.168.1.100"
                                            value={newReader.ip}
                                            onChange={e => setNewReader({ ...newReader, ip: e.target.value })}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium">Estação Vinculada (Opcional)</label>
                                        <Input
                                            placeholder="ID Estação"
                                            value={newReader.station}
                                            onChange={e => setNewReader({ ...newReader, station: e.target.value })}
                                        />
                                    </div>
                                    <Button onClick={handleAddReader}><Plus className="mr-2 h-4 w-4" /> Adicionar</Button>
                                </div>

                                {/* List */}
                                <div className="border rounded-md">
                                    <div className="bg-slate-100 p-3 text-xs font-semibold text-slate-500 uppercase flex justify-between">
                                        <div>Dispositivo</div>
                                        <div>Rede / Status</div>
                                        <div>Ações</div>
                                    </div>
                                    {rfidReaders.length === 0 ? (
                                        <div className="p-8 text-center text-slate-500 text-sm">Nenhum leitor configurado.</div>
                                    ) : (
                                        rfidReaders.map(r => (
                                            <div key={r.id} className="p-3 border-t flex items-center justify-between hover:bg-slate-50">
                                                <div>
                                                    <div className="font-medium text-slate-900">{r.name}</div>
                                                    <div className="text-xs text-slate-500">ID: {r.id} | Estação: {r.stationId || '-'}</div>
                                                </div>
                                                <div className="flex items-center gap-4">
                                                    <Badge variant="outline" className="font-mono">{r.ipAddress}</Badge>
                                                    <Badge variant={r.status === 'online' ? 'default' : 'destructive'} className="uppercase text-[10px]">
                                                        {r.status}
                                                    </Badge>
                                                </div>
                                                <Button size="icon" variant="ghost" className="h-8 w-8 text-red-500 hover:text-red-700 hover:bg-red-50" onClick={() => deleteRfidReader(r.id)}>
                                                    <Trash className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        ))
                                    )}
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

                {/* ADVANCED DEBUG */}
                <TabsContent value="advanced">
                    <Card>
                        <CardHeader>
                            <CardTitle>Diagnóstico de Persistência (Banco de Dados)</CardTitle>
                            <CardDescription>Verifique se as tabelas existem e se as permissões de escrita estão ativas.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                <Button onClick={async () => {
                                    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
                                    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

                                    if (!url || !key) {
                                        toast.error("ERRO CRÍTICO: Variáveis de Ambiente do Supabase não encontradas!");
                                        alert("Faltam as variáveis NEXT_PUBLIC_SUPABASE_URL e NEXT_PUBLIC_SUPABASE_ANON_KEY no Vercel/Ambiente.");
                                        return;
                                    }

                                    const tables = ['employees', 'consumable_transactions', 'cost_center_mappings', 'material_requests', 'mold_maintenance_orders', 'mold_geometries'];
                                    let hasError = false;
                                    for (const t of tables) {
                                        const { error } = await supabase.from(t).select('id').limit(1);
                                        if (error) {
                                            toast.error(`Erro na tabela ${t}: ${error.message}`);
                                            hasError = true;
                                        } else {
                                            toast.success(`Tabela ${t}: OK`);
                                        }
                                    }
                                    if (!hasError) toast.success("Todas as tabelas críticas acessíveis!");
                                }}>
                                    <Activity className="mr-2 h-4 w-4" />
                                    Testar Conexão com Tabelas Críticas
                                </Button>

                                <div className="p-4 bg-slate-100 rounded text-sm font-mono mt-4">
                                    <p className="font-bold text-slate-700 mb-2">Logs de Erro Recentes (Console):</p>
                                    <p className="text-slate-500">Abra o Console do Navegador (F12) para ver detalhes de erro de "Access Denied" se houver.</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div >
    );
}
