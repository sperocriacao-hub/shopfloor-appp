"use client";

import { EightDData, QualityCase } from "@/types";
import { useConfigStore } from "@/store/useConfigStore";
import { useShopfloorStore } from "@/store/useShopfloorStore";

interface PrintableEightDProps {
    data: QualityCase;
}

export function PrintableEightD({ data }: PrintableEightDProps) {
    const { config } = useConfigStore();
    const { assets } = useShopfloorStore();
    const methodologyData = data.methodologyData as EightDData;
    const asset = assets.find(a => a.id === data.assetId);

    if (!methodologyData) return null;

    return (
        <div className="hidden print:block p-8 bg-white text-slate-900 font-serif max-w-A4 mx-auto">
            {/* Header */}
            <div className="flex border-b-2 border-slate-800 pb-4 mb-6">
                <div className="w-1/4 flex items-center justify-center border-r border-slate-200 pr-4">
                    {config.logoUrl ? (
                        <img src={config.logoUrl} alt="Logo" className="max-h-16 max-w-full object-contain" />
                    ) : (
                        <h1 className="text-xl font-bold">{config.companyName}</h1>
                    )}
                </div>
                <div className="w-3/4 pl-4">
                    <h2 className="text-2xl font-bold uppercase tracking-wide">Relatório de Não-Conformidade (8D)</h2>
                    <div className="text-sm mt-1 flex gap-4">
                        <span><strong>Ref:</strong> {data.id}</span>
                        <span><strong>Data:</strong> {new Date(data.createdAt).toLocaleDateString()}</span>
                        <span><strong>Status:</strong> {data.status.toUpperCase()}</span>
                    </div>
                </div>
            </div>

            {/* D1: Team */}
            <section className="mb-6">
                <h3 className="text-sm font-bold bg-slate-100 p-1 mb-2 uppercase border-l-4 border-slate-400 pl-2">D1: Equipe</h3>
                <p className="text-sm border p-2 min-h-[40px]">{methodologyData.team || "Não definido"}</p>
            </section>

            {/* D2: Description */}
            <section className="mb-6">
                <h3 className="text-sm font-bold bg-slate-100 p-1 mb-2 uppercase border-l-4 border-slate-400 pl-2">D2: Descrição do Problema</h3>
                <div className="grid grid-cols-2 gap-4 text-sm mb-2">
                    <p><strong>Ativo/Origem:</strong> {asset?.name || data.assetId} - {asset?.area}</p>
                    <p><strong>Severidade:</strong> {data.severity}</p>
                </div>
                <div className="border p-2 min-h-[40px] mb-2 font-mono text-sm whitespace-pre-wrap">
                    {data.description}
                </div>
                <div className="grid grid-cols-3 gap-2 text-xs">
                    {methodologyData.problemDetails && Object.entries(methodologyData.problemDetails).map(([k, v]) => (
                        <div key={k} className="border p-1">
                            <span className="font-bold uppercase">{k}:</span> {v}
                        </div>
                    ))}
                </div>
            </section>

            {/* D3: Containment */}
            <section className="mb-6">
                <h3 className="text-sm font-bold bg-slate-100 p-1 mb-2 uppercase border-l-4 border-slate-400 pl-2">D3: Ações de Contenção</h3>
                <p className="text-sm border p-2 min-h-[40px]">{methodologyData.containmentActions || "Nenhuma ação imediata registrada."}</p>
            </section>

            {/* D4: Root Cause */}
            <section className="mb-6">
                <h3 className="text-sm font-bold bg-slate-100 p-1 mb-2 uppercase border-l-4 border-slate-400 pl-2">D4: Causa Raiz</h3>
                <div className="mb-2">
                    <h4 className="text-xs font-bold mb-1">Ishikawa (Resumo)</h4>
                    <div className="grid grid-cols-3 gap-2 text-xs border p-2">
                        {methodologyData.ishikawa && Object.entries(methodologyData.ishikawa).map(([k, v]) => (
                            <div key={k}>{k.toUpperCase()}: {v}</div>
                        ))}
                    </div>
                </div>
                <p className="text-sm border p-2 font-bold mb-1">Causa Raiz Identificada: {methodologyData.rootCause || "Em análise"}</p>
            </section>

            {/* Footer */}
            <div className="text-[10px] text-center border-t pt-2 mt-8 text-slate-400">
                Gerado automaticamente pelo Sistema Shopfloor Hub em {new Date().toLocaleString()}.
            </div>
        </div>
    );
}
