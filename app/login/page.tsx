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
        <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
            <div className="absolute top-8 left-8 text-white flex items-center gap-2 opacity-50">
                <Ship className="h-6 w-6" />
                <span className="font-bold tracking-widest">NAVAL SHOPFLOOR</span>
            </div>

            <Card className="w-full max-w-md border-slate-800 bg-slate-950/50 backdrop-blur text-slate-100 shadow-2xl">
                <CardHeader className="space-y-1">
                    <CardTitle className="text-2xl font-bold flex flex-col gap-2">
                        <span>Acesso ao Sistema</span>
                    </CardTitle>
                    <CardDescription className="text-slate-400">
                        Insira as suas credenciais ou aproxime o cartão.
                    </CardDescription>
                </CardHeader>
                <CardContent className="grid gap-4">
                    <div className="grid grid-cols-2 gap-6">
                        <Button
                            variant="outline"
                            className={`h-24 flex flex-col items-center justify-center gap-2 border-slate-700 hover:bg-slate-800 hover:text-white transition-all ${rfidScanning ? 'animate-pulse border-blue-500 text-blue-400' : ''}`}
                            onClick={simulateRfid}
                        >
                            <Radio className="h-8 w-8" />
                            <span className="text-xs">Login RFID</span>
                        </Button>
                        <Button variant="outline" className="h-24 flex flex-col items-center justify-center gap-2 border-slate-700 hover:bg-slate-800 hover:text-white transition-all opacity-50 cursor-not-allowed">
                            <UserCheck className="h-8 w-8" />
                            <span className="text-xs">Face ID</span>
                        </Button>
                    </div>

                    <div className="relative">
                        <div className="absolute inset-0 flex items-center">
                            <span className="w-full border-t border-slate-800" />
                        </div>
                        <div className="relative flex justify-center text-xs uppercase">
                            <span className="bg-slate-950 px-2 text-slate-500">Ou utilize password</span>
                        </div>
                    </div>

                    <form onSubmit={handleLogin} className="grid gap-4">
                        <div className="grid gap-2">
                            <Label htmlFor="username">Utilizador / Nº Mecanográfico</Label>
                            <Input
                                id="username"
                                type="text"
                                placeholder="ex: MASTER"
                                className="bg-slate-900 border-slate-800 focus:border-blue-700"
                                value={username}
                                onChange={e => setUsername(e.target.value)}
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="password">Password</Label>
                            <Input
                                id="password"
                                type="password"
                                className="bg-slate-900 border-slate-800 focus:border-blue-700"
                                value={password}
                                onChange={e => setPassword(e.target.value)}
                            />
                        </div>
                        <Button className="w-full bg-blue-700 hover:bg-blue-600" disabled={isLoading}>
                            {isLoading ? "Validando..." : "Entrar"} <KeyRound className="ml-2 h-4 w-4" />
                        </Button>
                    </form>
                </CardContent>
                <CardFooter className="flex flex-col gap-2">
                    <p className="text-xs text-center text-slate-500">
                        Esqueceu a senha? Contacte o suporte de TI.
                    </p>
                    <div className="flex items-center justify-center gap-2 text-[10px] text-slate-600 bg-slate-900/50 p-2 rounded w-full opacity-0 hover:opacity-100 transition-opacity cursor-default">
                        <AlertCircle className="h-3 w-3" />
                        <span>System Stable v9.0</span>
                    </div>
                </CardFooter>
            </Card>
        </div>
    );
}
