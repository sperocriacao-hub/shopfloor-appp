"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Scan, Radio, Wifi } from "lucide-react";

interface RFIDSimulatorProps {
    onScan: (tag: string) => void;
    lastScanned?: string | null;
}

export function RFIDSimulator({ onScan, lastScanned }: RFIDSimulatorProps) {
    const [tagInput, setTagInput] = useState("");
    const [scannedHistory, setScannedHistory] = useState<string[]>([]);

    const handleSimulateScan = (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        if (!tagInput.trim()) return;

        const tag = tagInput.trim().toUpperCase();
        onScan(tag);
        setScannedHistory(prev => [tag, ...prev].slice(0, 5));
        setTagInput("");
    };

    return (
        <Card className="w-full max-w-sm border-2 border-dashed border-blue-200 bg-blue-50/50">
            <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center justify-between text-blue-800">
                    <span className="flex items-center gap-2">
                        <Wifi className="h-4 w-4" />
                        RFID / NFC Simulator
                    </span>
                    <Badge variant="outline" className="bg-white text-blue-600 border-blue-200">
                        DEBUG MODE
                    </Badge>
                </CardTitle>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSimulateScan} className="space-y-4">
                    <div className="flex gap-2">
                        <Input
                            placeholder="Enter Tag ID (e.g., EMP-001)"
                            value={tagInput}
                            onChange={(e) => setTagInput(e.target.value)}
                            className="bg-white font-mono uppercase"
                            autoFocus
                        />
                        <Button type="submit" size="icon" className="shrink-0 bg-blue-600 hover:bg-blue-700">
                            <Scan className="h-4 w-4" />
                        </Button>
                    </div>

                    <div className="text-xs text-muted-foreground">
                        <p className="font-semibold mb-1">Recent Scans:</p>
                        {scannedHistory.length > 0 ? (
                            <ul className="space-y-1">
                                {scannedHistory.map((tag, i) => (
                                    <li key={i} className="flex items-center justify-between bg-white px-2 py-1 rounded border border-blue-100">
                                        <span className="font-mono">{tag}</span>
                                        {i === 0 && <span className="text-[10px] text-blue-600 font-bold">LATEST</span>}
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <p className="italic text-gray-400">No tags scanned yet...</p>
                        )}
                    </div>
                </form>
            </CardContent>
        </Card>
    );
}
