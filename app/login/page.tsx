"use client";

import { useState, useEffect } from "react";
import { useShopfloorStore } from "@/store/useShopfloorStore";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Ship, Radio, UserCheck, KeyRound, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { EmployeeWithPermissions } from "@/types";

export default function LoginPage() {
    const { login, currentUser, employees } = useShopfloorStore();
    const router = useRouter();

    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [rfidScanning, setRfidScanning] = useState(false);

    useEffect(() => {
        if (currentUser) {
            router.push('/');
        }
    }, [currentUser, router]);

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        // --- Master User Check ---
        if (username === "MASTER" && password === "Admin123") {
            const masterUser: EmployeeWithPermissions = {
                id: "master-admin",
                workerNumber: "000",
                name: "Administrador Master",
                contractType: "Admin",
                jobTitle: "System Admin",
                group: "IT",
                area: "Plant",
                workstation: "Server Room",
                shift: "All",
                supervisor: "",
                leader: "",
                manager: "",
                admissionDate: new Date().toISOString(),
                contractStartDate: new Date().toISOString(),
                birthday: new Date().toISOString(),
                talentMatrix: "N/A",
                iluo: 'O',
                hrStatus: 'active',
                hasSystemAccess: true,
                role: 'admin',
                permissions: {
                    dashboard: 'admin',
                    orders: 'admin',
                    assets: 'admin',
                    products: 'admin',
                    engineering: 'admin',
                    consumables: 'admin',
                    staff: 'admin',
                    quality: 'admin',
                    tools: 'admin',
                    molds: 'admin',
                    supervisor: 'admin',
                    mobile: 'admin',
                    admin: 'admin',
                },
                settings: {
                    theme: 'light',
                    units: 'metric',
                    dateFormat: 'DD/MM/YYYY',
                    soundEnabled: true,
                    soundVolume: 100
                }
            };

            setTimeout(() => {
                login(masterUser);
                toast.success("Bem-vindo, Master!");
                router.push('/');
            }, 500);
            return;
        }

        // --- Standard Employee Check (Demo) ---
        // In real app, this verifies password against hash.
        // For demo, we just check if employee exists and has system access.
        const found = employees.find(e => e.workerNumber === username && e.hasSystemAccess);

        if (found) {
            // Use stored permissions (mapped from DB)
            const userWithPerms = found as EmployeeWithPermissions;

            // Ensure role exists (fallback)
            if (!userWithPerms.role) userWithPerms.role = 'operator';
            if (!userWithPerms.permissions) userWithPerms.permissions = { mobile: 'read' };

            login(userWithPerms);
            toast.success(`Bem-vindo, ${found.name}!`);
            router.push('/');
        } else {
            toast.error("Credenciais inválidas.");
            setIsLoading(false);
        }
    };

    const simulateRfid = () => {
        setRfidScanning(true);
        setTimeout(() => {
            // Simulate 'Produção' admin user found by RFID
            const rfidUser: EmployeeWithPermissions = {
                id: "rfid-prod-lead",
                workerNumber: "999",
                name: "João Supervisor",
                contractType: "Permanent",
                jobTitle: "Chefe de Produção",
                group: "Production",
                area: "Laminação",
                workstation: "Office",
                shift: "1",
                supervisor: "",
                leader: "",
                manager: "",
                admissionDate: new Date().toISOString(),
                contractStartDate: new Date().toISOString(),
                birthday: new Date().toISOString(),
                talentMatrix: "Top Talent",
                iluo: 'O',
                hrStatus: 'active',
                hasSystemAccess: true,
                role: 'leader',
                permissions: {
                    dashboard: 'read',
                    orders: 'write',
                    assets: 'admin',
                    products: 'read',
                    engineering: 'read',
                    molds: 'admin',
                    supervisor: 'admin',
                    quality: 'write',
                    mobile: 'read'
                },
                settings: {
                    theme: 'dark',
                    units: 'metric',
                    dateFormat: 'DD/MM/YYYY',
                    soundEnabled: true,
                    soundVolume: 100
                }
            };

            login(rfidUser);
            toast.success("Cartão RFID Reconhecido: João Supervisor");
            router.push('/');
            setRfidScanning(false);
        }, 1500);
    };

    return (
        <div
            className="min-h-screen flex items-center justify-center p-4 bg-cover bg-center bg-no-repeat relative"
            style={{ backgroundImage: "url('/login-bg.png')" }}
        >
            {/* Overlay for better text readability */}
            <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px]"></div>

            <div className="absolute top-8 left-8 text-white flex items-center gap-3 z-10 opacity-90">
                <div className="bg-white/10 p-2 rounded-full backdrop-blur-md border border-white/20">
                    <Ship className="h-6 w-6 text-blue-200" />
                </div>
                <div>
                    <span className="font-bold tracking-widest text-lg block leading-none">BRUNSWICK</span>
                    <span className="text-[10px] tracking-[0.3em] font-light text-blue-100 block">BOAT GROUP</span>
                </div>
            </div>

            <Card className="w-full max-w-md border-white/10 bg-black/60 backdrop-blur-md text-slate-100 shadow-2xl relative z-10 animate-in fade-in zoom-in duration-500">
                <CardHeader className="space-y-1 text-center pb-2">
                    <CardTitle className="text-3xl font-bold tracking-tight text-white">Bem-vindo</CardTitle>
                    <CardDescription className="text-slate-300 text-sm">
                        Sistema Integrado de Gestão de Produção
                    </CardDescription>
                </CardHeader>
                <CardContent className="grid gap-6 pt-4">
                    <div className="grid grid-cols-2 gap-4">
                        <Button
                            variant="outline"
                            className={`h-24 flex flex-col items-center justify-center gap-3 border-white/10 bg-white/5 hover:bg-white/20 hover:text-white transition-all text-slate-300 ${rfidScanning ? 'animate-pulse ring-2 ring-blue-500 bg-blue-500/20 text-blue-300' : ''}`}
                            onClick={simulateRfid}
                        >
                            <Radio className="h-8 w-8" />
                            <span className="text-xs font-medium">Cartão RFID</span>
                        </Button>
                        <Button variant="outline" className="h-24 flex flex-col items-center justify-center gap-3 border-white/10 bg-white/5 hover:bg-white/20 hover:text-white transition-all text-slate-300 opacity-50 cursor-not-allowed">
                            <UserCheck className="h-8 w-8" />
                            <span className="text-xs font-medium">Face ID</span>
                        </Button>
                    </div>

                    <div className="relative">
                        <div className="absolute inset-0 flex items-center">
                            <span className="w-full border-t border-white/10" />
                        </div>
                        <div className="relative flex justify-center text-[10px] uppercase tracking-wider font-semibold">
                            <span className="bg-transparent px-2 text-slate-400">Ou entre com credenciais</span>
                        </div>
                    </div>

                    <form onSubmit={handleLogin} className="grid gap-4">
                        <div className="grid gap-2">
                            <Label htmlFor="username" className="text-slate-200 text-xs uppercase font-bold tracking-wider ml-1">Utilizador</Label>
                            <Input
                                id="username"
                                type="text"
                                placeholder="Nº Mecanográfico ou User"
                                className="bg-black/40 border-white/10 focus:border-blue-500 text-white placeholder:text-slate-600 h-11"
                                value={username}
                                onChange={e => setUsername(e.target.value)}
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="password" className="text-slate-200 text-xs uppercase font-bold tracking-wider ml-1">Password</Label>
                            <Input
                                id="password"
                                type="password"
                                placeholder="••••••••"
                                className="bg-black/40 border-white/10 focus:border-blue-500 text-white placeholder:text-slate-600 h-11"
                                value={password}
                                onChange={e => setPassword(e.target.value)}
                            />
                        </div>
                        <Button className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold h-11 shadow-lg shadow-blue-900/50 transition-all hover:scale-[1.02] active:scale-[0.98]" disabled={isLoading}>
                            {isLoading ? "Validando..." : "ACEDER AO SISTEMA"} <KeyRound className="ml-2 h-4 w-4" />
                        </Button>
                    </form>
                </CardContent>
                <CardFooter className="flex flex-col gap-4 pb-6">
                    <p className="text-xs text-center text-slate-500 hover:text-slate-300 cursor-pointer transition-colors">
                        Esqueceu a senha? Contacte o suporte.
                    </p>
                </CardFooter>
            </Card>

            <div className="absolute bottom-4 right-6 text-white/30 text-[10px] font-mono">
                v10.2.4-stable • Brunswick Corp
            </div>
        </div>
    );
}
