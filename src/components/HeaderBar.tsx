'use client';

import React, { useState, useEffect } from 'react';
import { ShieldCheck, Clock, User, Signal } from 'lucide-react';

interface HeaderBarProps {
  sectionName?: string;
}

export function HeaderBar({
  sectionName = "Section: Prayagraj - Kanpur Central | Up/Down Trunk Line"
}: HeaderBarProps) {
  const [timeStr, setTimeStr] = useState<string>('');

  useEffect(() => {
    const updateTime = () => {
      const d = new Date();
      setTimeStr(d.toLocaleTimeString('en-US', { hour12: true }) + ' IST');
    };
    updateTime();
    const timer = setInterval(updateTime, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <header className="bg-[#0F2C59] text-white border-b-2 border-amber-500 px-6 py-3 shadow-sm">
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4">
        {/* Left: Emblem & Ministry Branding */}
        <div className="flex items-center space-x-4">
          {/* Ashoka Emblem SVG Placeholder */}
          <div className="bg-white/10 p-2 rounded border border-white/20 flex items-center justify-center">
            <svg className="w-8 h-8 text-amber-400 fill-current" viewBox="0 0 24 24">
              <path d="M12 2L15 8H9L12 2ZM12 22C6.48 22 2 17.52 2 12C2 6.48 6.48 2 12 2C17.52 2 22 6.48 22 12C22 17.52 17.52 22 12 22ZM12 4C7.58 4 4 7.58 4 12C4 16.42 7.58 20 12 20C16.42 20 20 16.42 20 12C20 7.58 16.42 4 12 4ZM12 6L13.5 9.5H17.5L14 12L15.5 15.5L12 13.5L8.5 15.5L10 12L6.5 9.5H10.5L12 6Z" />
            </svg>
          </div>

          <div>
            <div className="flex items-center space-x-2">
              <h1 className="font-bold text-lg tracking-wide text-white font-serif">
                रेल मंत्रालय | MINISTRY OF RAILWAYS
              </h1>
              <span className="bg-amber-400/20 text-amber-300 text-[10px] font-bold px-2 py-0.5 rounded border border-amber-400/30 uppercase tracking-wider">
                GOVT OF INDIA
              </span>
            </div>
            <p className="text-xs text-slate-300 font-medium">
              Gati-Sanchalan DSS (AI-Powered Train Traffic Controller) — Dynamic Section Throughput & Dispatch System
            </p>
          </div>
        </div>

        {/* Center: Active Section Badge */}
        <div className="bg-white/10 border border-white/20 rounded-md px-4 py-2 text-center">
          <span className="text-[11px] uppercase font-bold text-slate-300 tracking-wider block">Active Corridor</span>
          <span className="text-xs font-bold text-amber-300 font-mono">{sectionName}</span>
        </div>

        {/* Right: Operational Status, Clock & Shift Profile */}
        <div className="flex items-center space-x-4 text-xs">
          {/* SIL-4 Safe Status */}
          <div className="flex items-center space-x-2 bg-emerald-950/60 text-emerald-300 border border-emerald-500/40 px-3 py-1.5 rounded-md font-semibold">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Connected (SIL-4 Safe)</span>
          </div>

          {/* Clock */}
          <div className="flex items-center space-x-2 bg-white/10 text-white border border-white/20 px-3 py-1.5 rounded-md font-mono font-bold">
            <Clock className="w-4 h-4 text-amber-400" />
            <span>{timeStr || '10:42:15 AM IST'}</span>
          </div>

          {/* Operator Profile */}
          <div className="flex items-center space-x-2 bg-white/10 text-slate-200 border border-white/20 px-3 py-1.5 rounded-md">
            <User className="w-4 h-4 text-slate-300" />
            <span className="font-semibold">Shift: Sec-Controller-04</span>
          </div>
        </div>
      </div>
    </header>
  );
}
