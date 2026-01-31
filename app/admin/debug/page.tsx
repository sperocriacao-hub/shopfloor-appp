"use client";

import { useShopfloorStore } from "@/store/useShopfloorStore";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";

export default function DebugPersistencePage() {
    const store = useShopfloorStore();
    const [status, setStatus] = useState<any>({});
    const [loading, setLoading] = useState(false);
    const [loading, setLoading] = useState(false);
    // const supabase = createClientComponentClient(); -> Removed

    // Auto-hydrate on mount
    useEffect(() => {
        store.syncData();
    }, []);

    const checkTables = async () => {
        setLoading(true);
        const tables = [
            'employees', 'assets', 'products', 'orders',
            'mold_maintenance_orders', 'mold_geometries', 'maintenance_pins',
            'consumable_transactions', 'cost_center_mappings', 'material_requests', 'ppe_requests'
        ];

        // Env Var Check
        const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
        const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
        if (!url || !key) {
            const msg = "ERRO CRÍTICO: Variáveis de Ambiente do Supabase não encontradas!";
            toast.error(msg);
            alert(msg);
            setLoading(false);
            return;
        }

        const results: any = {};

        for (const t of tables) {
            try {
                const { count, error } = await supabase.from(t).select('*', { count: 'exact', head: true });
                results[t] = { ok: !error, count, error: error?.message };
            } catch (e) {
                results[t] = { ok: false, error: String(e) };
            }
        }
        setStatus(results);
        setStatus(results);
        setLoading(false);
    };

    const checkWrite = async () => {
        setLoading(true);
        try {
            // Attempt to write to audit_logs or a safe table
            const { error } = await supabase.from('audit_logs').insert({
                id: `test-write-${Date.now()}`,
                action: 'TEST_WRITE',
                module: 'debug',
                description: 'Testing write permissions via Admin Debug',
                timestamp: new Date().toISOString(),
                user_id: 'debug-user',
                user_name: 'Debug User'
            });

            if (error) {
                toast.error(`Falha de Escrita: ${error.message}`);
                console.error("Write Test Error:", error);
            } else {
                toast.success("Teste de Escrita: SUCESSO! (Tabela audit_logs)");
            }
        } catch (e: any) {
            console.error("Write Exception:", e);
            toast.error(`Exceção de Escrita: ${e.message}`);
            alert(`Exceção de Escrita: ${e.message}`);
        }
        setLoading(false);
    };

    return (
        <div className="p-8 space-y-6">
            <h1 className="text-2xl font-bold">Diagnóstico de Persistência (DB)</h1>
            <p className="text-slate-500">Verifique se as tabelas existem e se o sistema consegue ler os dados.</p>

            <div className="flex gap-4">
                <Button onClick={checkTables} disabled={loading}>
                    {loading ? "Verificando..." : "Testar LEITURA (Select)"}
                </Button>
                <Button onClick={checkWrite} disabled={loading} variant="destructive">
                    {loading ? "Verificando..." : "Testar ESCRITA (Insert)"}
                </Button>
                <Button variant="outline" onClick={() => store.syncData()}>
                    Forçar Sincronização (Store)
                </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Object.entries(status).map(([table, res]: any) => (
                    <Card key={table} className={res.ok ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50"}>
                        <CardHeader className="p-4 py-3">
                            <CardTitle className="text-sm font-mono flex justify-between">
                                {table}
                                <span>{res.ok ? "OK" : "ERRO"}</span>
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-4 pt-0 text-xs">
                            {res.ok ? (
                                <span className="text-green-700">Registros: {res.count}</span>
                            ) : (
                                <span className="text-red-700">{res.error}</span>
                            )}
                        </CardContent>
                    </Card>
                ))}
            </div>

            <Card>
                <CardHeader><CardTitle>Estado Atual da Store (Memória)</CardTitle></CardHeader>
                <CardContent className="space-y-2 text-xs font-mono">
                    <div>Employees: {store.employees.length}</div>
                    <div>Consumables: {store.consumableTransactions.length}</div>
                    <div>Material Requests: {store.materialRequests.length}</div>
                    <div>Mold Configs: {store.moldGeometries?.length || 0}</div>
                    <div>Mold Orders: {store.maintenanceOrders?.length || 0}</div>
                </CardContent>
            </Card>
        </div>
    );
}
