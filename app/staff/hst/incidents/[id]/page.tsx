"use client";

import { useParams, useRouter } from "next/navigation";
import { useShopfloorStore } from "@/store/useShopfloorStore";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, ArrowLeft, Save, CheckCircle, Clock } from "lucide-react";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { DailyEvaluation, SafetyIncident } from "@/types";

export default function IncidentDetailsPage() {
    const params = useParams();
    const router = useRouter();
    const { safetyIncidents, updateIncident } = useShopfloorStore();

    // Find incident
    const incidentId = params.id as string;
    const initialIncident = safetyIncidents.find(i => i.id === incidentId);

    const [incident, setIncident] = useState<SafetyIncident | undefined>(initialIncident);
    const [whys, setWhys] = useState<string[]>(Array(5).fill(""));
    const [actions, setActions] = useState("");

    // Initialize from existing data
    useEffect(() => {
        if (!initialIncident) {
            // Wait for sync, or redirect if not found after timeout?
            // For now, rely on syncData being fast or user entering from list
        } else {
            setIncident(initialIncident);
            // Parse rootCause if it's stored as JSON or delimited string?
            // The schema says `root_cause: text`. Let's assume user writes free text or we format it.
            // Let's check schema: `root_cause TEXT`.
            // For UI, we split into 5 inputs. If stored as "1. Why... 2. Why...", we might want to just parse it or keep one big text area.
            // User requested "5 Whys" specifically.
            // Let's manage 5 inputs locally and join them on save.
            if (initialIncident.rootCause) {
                // Try to split if it follows our pattern
                if (initialIncident.rootCause.includes("1. ")) {
                    // Primitive parser
                    // For now, just load into the first box if it doesn't match?
                    // Better: Just use a single text area if it's already set, OR provide the 5 inputs for editing.
                }
            }
            if (initialIncident.actionsTaken) {
                setActions(initialIncident.actionsTaken);
            }
        }
    }, [initialIncident]);

    if (!incident) {
        return (
            <div className="p-8 flex flex-col items-center justify-center">
                <p className="text-slate-500 mb-4">Incidente não encontrado ou a carregar...</p>
                <Button onClick={() => router.push('/staff/hst')}>Voltar</Button>
            </div>
        );
    }

    const handleWhyChange = (index: number, value: string) => {
        const newWhys = [...whys];
        newWhys[index] = value;
        setWhys(newWhys);
    };

    const handleSave = () => {
        if (!incident) return;

        // Join Whys
        const rootCauseText = whys
            .map((w, i) => w.trim() ? `${i + 1}. ${w.trim()}` : null)
            .filter(Boolean)
            .join("\n");

        const updatedIncident: SafetyIncident = {
            ...incident,
            rootCause: rootCauseText || incident.rootCause, // Keep old if not editing? Or overwrite.
            actionsTaken: actions,
            status: 'investigating' // Auto move to investigating
        };

        updateIncident(incident.id, updatedIncident);
        toast.success("Análise salva com sucesso!");
        router.push('/staff/hst');
    };

    return (
        <div className="p-6 space-y-6 max-w-4xl mx-auto pb-32">
            <div className="flex items-center gap-4">
                <Button variant="ghost" onClick={() => router.back()}>
                    <ArrowLeft className="w-5 h-5 mr-2" /> Voltar
                </Button>
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        Relatório de Incidente (8D)
                        <Badge variant={incident.status === 'open' ? 'destructive' : 'outline'}>
                            {incident.status === 'open' ? 'Aberto' : incident.status}
                        </Badge>
                    </h1>
                    <p className="text-slate-500 text-sm">ID: {incident.id}</p>
                </div>
            </div>

            {/* D1/D2: Description */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-lg">D1 & D2: Descrição do Problema</CardTitle>
                </CardHeader>
                <CardContent className="grid md:grid-cols-2 gap-6">
                    <div>
                        <label className="text-sm font-medium text-slate-500">Tipo</label>
                        <p className="text-lg capitalize font-semibold">{incident.type.replace('_', ' ')}</p>
                    </div>
                    <div>
                        <label className="text-sm font-medium text-slate-500">Severidade</label>
                        <p className="text-lg capitalize font-semibold text-red-600">{incident.severity}</p>
                    </div>
                    <div className="md:col-span-2">
                        <label className="text-sm font-medium text-slate-500">Descrição do Evento</label>
                        <p className="p-3 bg-slate-50 rounded-md border mt-1">{incident.description}</p>
                    </div>
                    {incident.area && (
                        <div>
                            <label className="text-sm font-medium text-slate-500">Local</label>
                            <p className="font-medium">{incident.area}</p>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* D4: Root Cause (5 Whys) */}
            <Card className="border-l-4 border-l-blue-500">
                <CardHeader>
                    <CardTitle className="text-lg">D4: Análise de Causa Raiz (5 Porquês)</CardTitle>
                    <p className="text-sm text-slate-500">Pergunte "Por quê?" recursivamente até encontrar a causa fundamental.</p>
                </CardHeader>
                <CardContent className="space-y-3">
                    {whys.map((why, index) => (
                        <div key={index} className="flex gap-3 items-center">
                            <div className="flex-none w-8 h-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-sm">
                                {index + 1}
                            </div>
                            <Input
                                placeholder={`Por que isso aconteceu? ${index === 0 ? '(Causa direta)' : ''}`}
                                value={why}
                                onChange={(e) => handleWhyChange(index, e.target.value)}
                            />
                        </div>
                    ))}

                    {incident.rootCause && (
                        <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded text-sm text-yellow-800">
                            <strong>Análise Salva Anteriormente:</strong>
                            <pre className="whitespace-pre-wrap font-sans mt-1">{incident.rootCause}</pre>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* D5/D6: Actions */}
            <Card className="border-l-4 border-l-green-500">
                <CardHeader>
                    <CardTitle className="text-lg">D5 & D6: Ações Corretivas e Preventivas</CardTitle>
                </CardHeader>
                <CardContent>
                    <Textarea
                        placeholder="Descreva as ações para eliminar a causa raiz e prevenir recorrência..."
                        className="h-32"
                        value={actions}
                        onChange={(e) => setActions(e.target.value)}
                    />
                </CardContent>
            </Card>

            <div className="flex justify-end gap-3">
                <Button variant="outline" onClick={() => router.back()}>Cancelar</Button>
                <Button onClick={handleSave} className="bg-slate-900 text-white hover:bg-slate-800">
                    <Save className="w-4 h-4 mr-2" /> Salvar Análise (8D)
                </Button>
            </div>
        </div>
    );
}
