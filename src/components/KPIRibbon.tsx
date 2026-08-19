'use client';

import React from 'react';
import { Activity, Train, CheckCircle2, Clock } from 'lucide-react';

interface KPIRibbonProps {
  throughputPercent?: number;
  activeTrainsCount?: number;
  conflictsCount?: number;
  punctualityIndex?: number;
}

export function KPIRibbon({
  throughputPercent = 118.4,
  activeTrainsCount = 14,
  conflictsCount = 0,
  punctualityIndex = 96.8
}: KPIRibbonProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* Card 1: Throughput Rate */}
      <div className="gov-card p-4 flex items-center justify-between">
        <div>
          <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
            Section Throughput Rate
          </div>
          <div className="text-[22px] font-extrabold text-slate-900 font-mono mt-1">
            {throughputPercent}%
          </div>
        </div>
        <div className="flex flex-col items-end">
          <div className="w-9 h-9 rounded-full bg-emerald-100 text-[#1B5E20] flex items-center justify-center mb-1">
            <Activity className="w-5 h-5" />
          </div>
          <span className="gov-badge-green text-[10px] px-2 py-0.5 rounded">
            +18.4% vs Baseline
          </span>
        </div>
      </div>

      {/* Card 2: Active Trains in Block */}
      <div className="gov-card p-4 flex items-center justify-between">
        <div>
          <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
            Active Trains in Block
          </div>
          <div className="text-[22px] font-extrabold text-slate-900 font-mono mt-1">
            {activeTrainsCount} Trains
          </div>
        </div>
        <div className="flex flex-col items-end">
          <div className="w-9 h-9 rounded-full bg-blue-100 text-blue-800 flex items-center justify-center mb-1">
            <Train className="w-5 h-5" />
          </div>
          <span className="text-[10px] font-bold text-slate-600">
            6 Express, 5 Freight, 3 Suburban
          </span>
        </div>
      </div>

      {/* Card 3: Active Line Conflicts */}
      <div className="gov-card p-4 flex items-center justify-between">
        <div>
          <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
            Active Line Conflicts
          </div>
          <div className="text-[22px] font-extrabold text-[#1B5E20] font-mono mt-1">
            {conflictsCount} Conflicts
          </div>
        </div>
        <div className="flex flex-col items-end">
          <div className="w-9 h-9 rounded-full bg-emerald-100 text-[#1B5E20] flex items-center justify-center mb-1">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <span className="gov-badge-green text-[10px] px-2 py-0.5 rounded">
            0 Resolved / 0 Pending
          </span>
        </div>
      </div>

      {/* Card 4: Punctuality Index */}
      <div className="gov-card p-4 flex items-center justify-between">
        <div>
          <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
            Punctuality Index
          </div>
          <div className="text-[22px] font-extrabold text-slate-900 font-mono mt-1">
            {punctualityIndex}%
          </div>
        </div>
        <div className="flex flex-col items-end">
          <div className="w-9 h-9 rounded-full bg-amber-100 text-[#B76E00] flex items-center justify-center mb-1">
            <Clock className="w-5 h-5" />
          </div>
          <span className="gov-badge-amber text-[10px] px-2 py-0.5 rounded">
            96.8% On-Time Adherence
          </span>
        </div>
      </div>
    </div>
  );
}
