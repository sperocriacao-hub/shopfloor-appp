"use client";

import { EightDData, QualityCase, QualityAction } from "@/types";
import { useConfigStore } from "@/store/useConfigStore";
import { useShopfloorStore } from "@/store/useShopfloorStore";

interface PrintableEightDProps {
    data: QualityCase;
}

export function PrintableEightD({ data }: PrintableEightDProps) {
    const { config } = useConfigStore();
    const { assets, qualityActions } = useShopfloorStore();
    const methodologyData = data.methodologyData as EightDData;
    const asset = assets.find(a => a.id === data.assetId);

    // Fetch related actions
    const caseActions = qualityActions.filter(a => a.caseId === data.id);

    if (!methodologyData) return null;

    return (
        <div className="hidden print:block p-8 bg-white text-black font-serif max-w-A4 mx-auto text-sm leading-tight">
            {/* DOCUMENT HEADER */}
            <div className="border-2 border-black mb-6">
                <div className="flex border-b border-black">
                    <div className="w-1/4 p-4 border-r border-black flex items-center justify-center">
                        {config.logoUrl ? (
                            <img src={config.logoUrl} alt="Logo" className="max-h-20 max-w-full object-contain" />
                        ) : (
                            <h1 className="text-xl font-bold">{config.companyName}</h1>
                        )}
                    </div>
                    <div className="w-3/4 p-4 flex flex-col justify-center text-center">
                        <h2 className="text-2xl font-bold uppercase tracking-wider">Relatório de Ação Corretiva (8D)</h2>
                        <p className="text-xs uppercase mt-1 text-slate-600">Gestão da Qualidade e Melhoria Contínua</p>
                    </div>
                </div>
                <div className="flex bg-slate-100/50 text-xs">
                    <div className="w-1/3 p-2 border-r border-black">
                        <span className="font-bold">ID do Caso:</span> {data.id}
                    </div>
                    <div className="w-1/3 p-2 border-r border-black">
                        <span className="font-bold">Data Abertura:</span> {new Date(data.createdAt).toLocaleDateString()}
                    </div>
                    <div className="w-1/3 p-2">
                        <span className="font-bold">Status Atual:</span> {data.status.toUpperCase()}
                    </div>
                </div>
            </div>

            {/* D1: TEAM */}
            <section className="mb-4 border border-black">
                <h3 className="bg-slate-200 font-bold p-1 px-2 border-b border-black text-xs uppercase">D1: Equipe de Resolução</h3>
                <div className="p-2 min-h-[30px]">
                    {methodologyData.team || "Equipe não definida."}
                </div>
            </section>

            {/* D2: PROBLEM DESCRIPTION */}
            <section className="mb-4 border border-black">
                <h3 className="bg-slate-200 font-bold p-1 px-2 border-b border-black text-xs uppercase">D2: Descrição do Problema</h3>
                <div className="grid grid-cols-2 text-xs border-b border-black divide-x divide-black">
                    <div className="p-2"><strong>Ativo:</strong> {asset?.name || data.assetId}</div>
                    <div className="p-2"><strong>Área/Local:</strong> {asset?.area || "N/A"}</div>
                </div>
                <div className="p-3 border-b border-black min-h-[50px] whitespace-pre-wrap font-mono text-xs">
                    {data.description}
                </div>
                <div className="grid grid-cols-6 divide-x divide-black text-center text-xs bg-slate-50 border-b border-black">
                    <div className="p-1 font-bold">O QUE</div>
                    <div className="p-1 font-bold">ONDE</div>
                    <div className="p-1 font-bold">QUANDO</div>
                    <div className="p-1 font-bold">QUEM</div>
                    <div className="p-1 font-bold">COMO</div>
                    <div className="p-1 font-bold">MÉTRICAS</div>
                </div>
                <div className="grid grid-cols-6 divide-x divide-black text-center text-xs min-h-[30px]">
                    <div className="p-1 break-words">{methodologyData.problemDetails?.what}</div>
                    <div className="p-1 break-words">{methodologyData.problemDetails?.where}</div>
                    <div className="p-1 break-words">{methodologyData.problemDetails?.when}</div>
                    <div className="p-1 break-words">{methodologyData.problemDetails?.who}</div>
                    <div className="p-1 break-words">{methodologyData.problemDetails?.how}</div>
                    <div className="p-1 break-words">{methodologyData.problemDetails?.metrics}</div>
                </div>
            </section>

            {/* D3: CONTAINMENT */}
            <section className="mb-4 border border-black">
                <h3 className="bg-slate-200 font-bold p-1 px-2 border-b border-black text-xs uppercase">D3: Ações de Contenção (Imediatas)</h3>
                <div className="p-2 min-h-[40px] whitespace-pre-wrap text-sm">
                    {methodologyData.containmentActions || "Nenhuma ação imediata registrada."}
                </div>
            </section>

            {/* D4: ROOT CAUSE */}
            <section className="mb-4 border border-black">
                <h3 className="bg-slate-200 font-bold p-1 px-2 border-b border-black text-xs uppercase">D4: Análise de Causa Raiz</h3>

                {/* Ishikawa Grid */}
                <div className="grid grid-cols-3 gap-0 border-b border-black text-xs">
                    {methodologyData.ishikawa && Object.entries(methodologyData.ishikawa).map(([k, v], i) => (
                        <div key={k} className={`p-1 border-b border-r ${i >= 3 ? 'border-b-0' : ''} border-gray-300`}>
                            <span className="font-bold uppercase text-[10px] text-slate-500 block">{k}</span>
                            <span>{v}</span>
                        </div>
                    ))}
                </div>

                <div className="p-2 border-b border-black bg-slate-50">
                    <span className="font-bold text-xs uppercase mr-2">5 Porquês:</span>
                    <ul className="list-decimal list-inside text-xs mt-1 ml-2">
                        {methodologyData.fiveWhys?.map((why, i) => (
                            why ? <li key={i}>{why}</li> : null
                        ))}
                    </ul>
                </div>

                <div className="p-2 bg-slate-100 font-bold text-sm">
                    <span className="uppercase text-xs text-slate-500 block">Declaração da Causa Raiz:</span>
                    {methodologyData.rootCause || "Causa Raiz ainda em análise."}
                </div>
            </section>

            {/* D5/D6: CORRECTIVE ACTIONS */}
            <section className="mb-4 border border-black">
                <div className="flex justify-between bg-slate-200 border-b border-black items-center px-2 py-1">
                    <h3 className="font-bold text-xs uppercase">D5/D6: Plano de Ação Corretiva & Implementação</h3>
                </div>
                {caseActions.length > 0 ? (
                    <table className="w-full text-xs">
                        <thead className="bg-slate-50 border-b border-black text-left">
                            <tr>
                                <th className="p-2 w-1/2 border-r border-black">Ação</th>
                                <th className="p-2 w-1/4 border-r border-black">Responsável</th>
                                <th className="p-2 w-1/8 border-r border-black">Prazo</th>
                                <th className="p-2 w-1/8">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-black">
                            {caseActions.map(action => (
                                <tr key={action.id}>
                                    <td className="p-2 border-r border-black">{action.description}</td>
                                    <td className="p-2 border-r border-black">{action.responsible}</td>
                                    <td className="p-2 border-r border-black">{action.deadline ? new Date(action.deadline).toLocaleDateString() : '-'}</td>
                                    <td className="p-2 font-bold">{action.status === 'completed' ? 'CONCLUÍDO' : 'PENDENTE'}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                ) : (
                    <div className="p-4 text-center text-xs italic">Nenhuma ação vinculada a este caso.</div>
                )}
            </section>

            {/* D7/D8: CLOSURE */}
            <div className="flex gap-4 mb-4">
                <section className="border border-black flex-1">
                    <h3 className="bg-slate-200 font-bold p-1 px-2 border-b border-black text-xs uppercase">D7: Prevenção de Recorrência</h3>
                    <div className="p-2 min-h-[50px] text-xs">
                        {/* Placeholder as we don't have a specific field for this in store yet, using Lesson Learned or generic */}
                        {(methodologyData as any).lessonLearned || "Standardização e atualização de documentação necessária."}
                    </div>
                </section>
                <section className="border border-black flex-1">
                    <h3 className="bg-slate-200 font-bold p-1 px-2 border-b border-black text-xs uppercase">D8: Reconhecimento</h3>
                    <div className="p-2 min-h-[50px] text-xs">
                        Equipe notificada e parabenizada pelo esforço.
                    </div>
                </section>
            </div>

            {/* SIGNATURES */}
            <div className="mt-8 grid grid-cols-3 gap-8">
                <div className="border-t border-black pt-2 text-center text-xs">
                    <p className="font-bold">Responsável Qualidade</p>
                    <p className="text-[10px] text-slate-500 mt-4">(Data e Assinatura)</p>
                </div>
                <div className="border-t border-black pt-2 text-center text-xs">
                    <p className="font-bold">Gerente de Área</p>
                    <p className="text-[10px] text-slate-500 mt-4">(Data e Assinatura)</p>
                </div>
                <div className="border-t border-black pt-2 text-center text-xs">
                    <p className="font-bold">Encerramento do Caso</p>
                    <p className="text-[10px] text-slate-500 mt-4">(Data e Assinatura)</p>
                </div>
            </div>

            <div className="text-[9px] text-center mt-8 text-slate-400">
                Gerado por Shopfloor Hub ({config.companyName}) em {new Date().toLocaleString()}. Ref: {data.id}
            </div>
        </div>
    );
}
