import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface SystemConfig {
    companyName: string;
    logoUrl: string; // Base64 or URL
    primaryColor: string;
    secondaryColor: string;
}

interface ConfigState {
    config: SystemConfig;
    updateConfig: (settings: Partial<SystemConfig>) => void;
}

export const useConfigStore = create<ConfigState>()(
    persist(
        (set) => ({
            config: {
                companyName: "Minha Empresa S.A.",
                logoUrl: "",
                primaryColor: "#2563eb", // blue-600
                secondaryColor: "#475569" // slate-600
            },
            updateConfig: (settings) => set((state) => ({
                config: { ...state.config, ...settings }
            })),
        }),
        {
            name: 'shopfloor-config',
        }
    )
);
