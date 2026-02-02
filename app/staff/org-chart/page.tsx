"use client";

import { useState, useMemo, useRef } from "react";
import { useRouter } from "next/navigation";
import { useShopfloorStore } from "@/store/useShopfloorStore";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Minus, Plus, Maximize, Search, MoreHorizontal, User } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { Employee } from "@/types";

// --- Types & Helper Components ---

type TreeNode = {
    id: string;
    role: string;
    name: string;
    level: number;
    children: TreeNode[];
    employees: Employee[]; // Leaf employees
};

export default function OrgChartPage() {
    const router = useRouter();
    const { employees } = useShopfloorStore();
    const [zoom, setZoom] = useState(1);
    const [pan, setPan] = useState({ x: 0, y: 0 });
    const [isDragging, setIsDragging] = useState(false);
    const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

    // Build Tree Structure (Manager -> Supervisor -> Leader -> Staff)
    const treeData = useMemo(() => {
        const active = employees.filter(e => e.hrStatus === 'active');
        const root: TreeNode = { id: 'root', role: 'Gestor de Fábrica', name: 'Direção Industrial', level: 0, children: [], employees: [] };

        // Group by Manager
        const managers = Array.from(new Set(active.map(e => e.manager || 'Sem Gestor')));

        managers.forEach(manName => {
            const manNode: TreeNode = { id: manName, role: 'Gestor de Área', name: manName, level: 1, children: [], employees: [] };

            // Group by Supervisor under Manager
            const manEmps = active.filter(e => (e.manager || 'Sem Gestor') === manName);
            const supervisors = Array.from(new Set(manEmps.map(e => e.supervisor || 'Sem Supervisor')));

            supervisors.forEach(supName => {
                const supNode: TreeNode = { id: `${manName}-${supName}`, role: 'Supervisor', name: supName, level: 2, children: [], employees: [] };

                // Group by Leader under Supervisor
                const supEmps = manEmps.filter(e => (e.supervisor || 'Sem Supervisor') === supName);
                const leaders = Array.from(new Set(supEmps.map(e => e.leader || 'Sem Líder')));

                leaders.forEach(leadName => {
                    const leadEmps = supEmps.filter(e => (e.leader || 'Sem Líder') === leadName);
                    // Decide if Leader separates node or not. Let's make Leader a node.
                    const leadNode: TreeNode = {
                        id: `${manName}-${supName}-${leadName}`,
                        role: 'Líder de Equipa',
                        name: leadName,
                        level: 3,
                        children: [],
                        employees: leadEmps
                    };
                    supNode.children.push(leadNode);
                });
                manNode.children.push(supNode);
            });
            root.children.push(manNode);
        });

        return root;
    }, [employees]);

    // Pan/Zoom Handlers
    const handleMouseDown = (e: React.MouseEvent) => {
        setIsDragging(true);
        setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
    };

    const handleMouseMove = (e: React.MouseEvent) => {
        if (!isDragging) return;
        setPan({ x: e.clientX - dragStart.x, y: e.clientY - dragStart.y });
    };

    const handleMouseUp = () => setIsDragging(false);

    return (
        <div className="h-screen w-full bg-slate-50 flex flex-col overflow-hidden relative selection:bg-none">
            {/* Header Toolbar */}
            <div className="absolute top-4 left-4 z-50 flex gap-2">
                <Button variant="outline" size="icon" className="bg-white shadow-md border-slate-200" onClick={() => router.push('/staff')} title="Voltar">
                    <ArrowLeft className="w-5 h-5 text-slate-700" />
                </Button>
                <div className="bg-white px-4 py-2 rounded-lg shadow-md border border-slate-200 flex items-center gap-3">
                    <h1 className="font-bold text-slate-800">Organograma</h1>
                    <span className="text-xs bg-slate-100 px-2 py-0.5 rounded-full text-slate-500">{employees.length} Colaboradores</span>
                </div>
            </div>

            {/* Zoom Controls */}
            <div className="absolute bottom-6 right-6 z-50 flex flex-col gap-2 bg-white p-2 rounded-lg shadow-lg border border-slate-200">
                <Button variant="ghost" size="icon" onClick={() => setZoom(z => Math.min(z + 0.1, 2))}>
                    <Plus className="w-5 h-5" />
                </Button>
                <div className="text-center text-xs font-mono text-slate-400">{(zoom * 100).toFixed(0)}%</div>
                <Button variant="ghost" size="icon" onClick={() => setZoom(z => Math.max(z - 0.1, 0.3))}>
                    <Minus className="w-5 h-5" />
                </Button>
                <Button variant="ghost" size="icon" onClick={() => { setZoom(1); setPan({ x: 0, y: 0 }); }}>
                    <Maximize className="w-4 h-4" />
                </Button>
            </div>

            {/* Canvas Area */}
            <div
                className={cn("flex-1 cursor-grab active:cursor-grabbing overflow-hidden bg-[radial-gradient(#e2e8f0_1px,transparent_1px)] [background-size:20px_20px]")}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
            >
                <motion.div
                    className="w-full h-full flex justify-center pt-20 origin-top"
                    style={{
                        x: pan.x,
                        y: pan.y,
                        scale: zoom
                    }}
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                >
                    <TreeNodeView node={treeData} />
                </motion.div>
            </div>
        </div>
    );
}

// Recursive Tree Node Component
const TreeNodeView = ({ node }: { node: TreeNode }) => {
    const [collapsed, setCollapsed] = useState(false);

    const hasChildren = node.children.length > 0;
    const isLeaf = node.employees.length > 0 && !hasChildren; // Bottom level team

    // Color logic
    const bgClass =
        node.level === 0 ? "bg-slate-900 text-white border-slate-900" :
            node.level === 1 ? "bg-blue-600 text-white border-blue-600" :
                node.level === 2 ? "bg-white text-slate-800 border-slate-200 hover:border-blue-300" :
                    "bg-slate-50 text-slate-700 border-slate-200";

    return (
        <div className="flex flex-col items-center mx-4">

            {/* The Node Card */}
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={cn(
                    "relative z-10 flex flex-col items-center justify-center p-3 rounded-lg shadow-sm border-2 w-48 transition-all hover:shadow-md cursor-pointer",
                    bgClass
                )}
                onClick={(e) => { e.stopPropagation(); setCollapsed(!collapsed); }}
            >
                {node.level === 0 ? <MoreHorizontal className="w-5 h-5 mb-1" /> : <User className="w-4 h-4 mb-1 opacity-70" />}
                <span className="text-[10px] uppercase font-bold tracking-wider opacity-80">{node.role}</span>
                <span className="font-bold text-sm text-center leading-tight truncate w-full">{node.name}</span>

                {/* Count Badge */}
                {(hasChildren || node.employees.length > 0) && (
                    <span className="absolute -top-2 -right-2 w-5 h-5 flex items-center justify-center rounded-full bg-amber-400 text-amber-900 text-[9px] font-bold border-2 border-white">
                        {hasChildren ? node.children.length : node.employees.length}
                    </span>
                )}
            </motion.div>

            {/* Connecting Lines & Children */}
            {!collapsed && (hasChildren || isLeaf) && (
                <div className="flex flex-col items-center animate-in fade-in slide-in-from-top-2 duration-300">
                    {/* Vertical Line Down */}
                    <div className="h-6 w-px bg-slate-300"></div>

                    {/* Children Container */}
                    <div className="flex relative items-start pt-6 border-t border-slate-300">
                        {/* If leaf (Team List), show simpler grid */}
                        {isLeaf ? (
                            <div className="grid grid-cols-2 gap-2 w-64 -mt-6 pt-8 justify-items-center">
                                {node.employees.map(emp => (
                                    <div key={emp.id} className="bg-white border rounded p-1.5 flex items-center gap-2 w-full text-left shadow-sm hover:scale-105 transition-transform">
                                        <div className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center text-[9px] font-bold text-slate-500">
                                            {emp.name.charAt(0)}
                                        </div>
                                        <span className="text-[10px] font-medium text-slate-700 truncate">{emp.name}</span>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            // Normal Recursive Children
                            node.children.map((child, idx) => (
                                <TreeNodeView key={child.id} node={child} />
                            ))
                        )}
                    </div>
                </div>
            )}

            {/* Collapsed Indicator */}
            {collapsed && (hasChildren || isLeaf) && (
                <div className="h-4 w-px bg-slate-300"></div>
            )}
        </div>
    );
};
