"use client";

import { useNavigate } from "react-router-dom";
import { Zap } from "lucide-react";

export function MobileNavBar() {
    const navigate = useNavigate();

    return (
        <div className="w-full h-16 px-4 flex items-center justify-between bg-white/95 backdrop-blur-md border-b border-slate-100/60 sticky top-0 z-[100]">
            <button
                type="button"
                onClick={() => navigate("/")}
                className="flex items-center gap-2.5 min-w-0"
                aria-label="Home"
            >
                <div className="w-9 h-9 bg-slate-900 rounded-[11px] flex items-center justify-center p-2 shadow-lg shadow-slate-200 flex-shrink-0">
                    <img src="/logo.svg" alt="HexaCV" className="w-full h-full brightness-0 invert" />
                </div>
                <div className="flex flex-col -space-y-1 min-w-0">
                    <span className="text-[14px] font-black text-slate-900 tracking-tight truncate">HEXACV</span>
                    <span className="text-[8px] font-black text-blue-600 uppercase tracking-widest leading-none">AI Suite</span>
                </div>
            </button>

            <button
                type="button"
                onClick={() => navigate("/free-tools")}
                className="flex items-center gap-1.5 min-h-[44px] px-3 py-2 rounded-xl text-slate-700 hover:bg-slate-100 active:scale-95 transition-all touch-manipulation font-semibold text-[13px]"
                aria-label="Free Tools"
            >
                <Zap size={18} strokeWidth={2} className="text-blue-600 shrink-0" />
                <span>Tools</span>
            </button>
        </div>
    );
}
