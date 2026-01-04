
"use client";

import { useEffect } from "react";
import { useShopfloorStore } from "@/store/useShopfloorStore";

export default function StoreSync() {
    const { syncData } = useShopfloorStore();

    useEffect(() => {
        console.log("🔄 Syncing with Supabase...");
        syncData();
    }, [syncData]);

    return null; // This component renders nothing
}
