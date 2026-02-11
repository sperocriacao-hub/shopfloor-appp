"use client";

import React from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { ArrowDown } from 'lucide-react';

interface FiveWhysInputProps {
    data: string[];
    onChange: (newData: string[]) => void;
    readOnly?: boolean;
}

export function FiveWhysInput({ data = [], onChange, readOnly = false }: FiveWhysInputProps) {
    // Ensure we always have 5 slots
    const whys = [...data];
    while (whys.length < 5) whys.push('');

    const handleChange = (index: number, value: string) => {
        if (readOnly) return;
        const newWhys = [...whys];
        newWhys[index] = value;
        // Trim empty trailing whys for storage, but keep structure in UI
        onChange(newWhys);
    };

    return (
        <div className="space-y-2">
            <h3 className="font-semibold text-slate-700 mb-4">5 Porquês (5 Whys) Analysis</h3>
            {whys.map((why, idx) => (
                <div key={idx} className="relative">
                    <div className="flex items-center gap-3">
                        <div className="flex flex-col items-center justify-center w-8 h-8 rounded-full bg-blue-100 text-blue-700 font-bold text-sm shrink-0 border border-blue-200">
                            {idx + 1}
                        </div>
                        <div className="flex-1">
                            {idx === 0 && <Label className="text-xs text-slate-500 mb-1 block">Por que o problema ocorreu?</Label>}
                            <Input
                                value={why}
                                onChange={(e) => handleChange(idx, e.target.value)}
                                placeholder={idx === 0 ? "O problema aconteceu porque..." : "Por que isso ocorreu?"}
                                disabled={readOnly}
                                className={readOnly ? "bg-slate-50" : ""}
                            />
                        </div>
                    </div>
                    {/* Arrow Connector */}
                    {idx < 4 && (
                        <div className="ml-4 h-4 border-l-2 border-dashed border-slate-300 my-1" />
                    )}
                </div>
            ))}
            <div className="bg-slate-100 p-3 rounded-md mt-4 border border-slate-200">
                <Label className="text-xs font-bold text-slate-500 uppercase">Causa Raiz Identificada</Label>
                <p className="text-sm font-medium text-slate-800 italic">
                    {whys.filter(w => w.trim()).pop() || "Preencha os porquês para identificar a causa raiz."}
                </p>
            </div>
        </div>
    );
}
