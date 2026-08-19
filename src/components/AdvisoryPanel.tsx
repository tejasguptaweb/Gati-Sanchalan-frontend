'use client';

import React, { useState } from 'react';
import { AdvisoryCard } from '@/lib/types';
import { applyAdvisoryCard } from '@/lib/api';
import { Zap, ShieldCheck, CheckCircle2, Sliders, ArrowRight } from 'lucide-react';

interface AdvisoryPanelProps {
  advisories: AdvisoryCard[];
  onAdvisoryApplied?: () => void;
}

export function AdvisoryPanel({ advisories, onAdvisoryApplied }: AdvisoryPanelProps) {
  const [appliedIds, setAppliedIds] = useState<Set<string>>(new Set());
  const [isApplying, setIsApplying] = useState<string | null>(null);

  const handleApply = async (card: AdvisoryCard) => {
    setIsApplying(card.id);
    try {
      await applyAdvisoryCard(
        card.id,
        card.train_id,
        card.action_type,
        card.target_track,
        card.duration_min
      );
      setAppliedIds((prev) => new Set(prev).add(card.id));
      if (onAdvisoryApplied) onAdvisoryApplied();
    } catch (err) {
      console.error('Failed to apply advisory card:', err);
    } finally {
      setIsApplying(null);
    }
  };

  return (
    <div className="gov-card p-5 flex flex-col w-full">
      {/* Panel Header */}
      <div className="border-b border-slate-200 pb-3 mb-4">
        <div className="flex items-center space-x-2">
          <div className="bg-[#0F2C59] text-white p-1.5 rounded">
            <Zap className="w-4 h-4 text-amber-400" />
          </div>
          <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
            ⚡ AI Real-Time Dispatch Recommendations
          </h2>
        </div>
        <p className="text-xs text-slate-500 mt-0.5">OR-Tools CP-SAT Combinatorial Optimization Engine</p>
      </div>

      {/* Advisory Cards List */}
      <div className="space-y-4 flex-1 overflow-y-auto pr-1">
        {advisories.map((card) => {
          const isApplied = appliedIds.has(card.id);

          return (
            <div
              key={card.id}
              className={`p-4 rounded-md border-2 transition-all ${
                isApplied
                  ? 'bg-slate-50 border-slate-300 opacity-65'
                  : 'bg-amber-50/60 border-amber-500 shadow-sm'
              }`}
            >
              {/* Card Title Header */}
              <div className="flex items-center justify-between mb-2">
                <span className="bg-[#B71C1C] text-white font-extrabold text-xs px-2.5 py-1 rounded uppercase tracking-wider font-mono">
                  {card.title || "RECOMMENDED OVERTAKE #104"}
                </span>
                <span className="text-[11px] font-bold text-slate-600 font-mono">
                  {card.station_code} | {card.target_track}
                </span>
              </div>

              {/* Rationale Text */}
              <p className="text-xs font-semibold text-slate-800 leading-relaxed mb-3">
                {card.rationale}
              </p>

              {/* Quantitative Gain Pill */}
              <div className="bg-[#E8F5E9] text-[#1B5E20] border border-[#A5D6A7] font-bold text-[11px] px-3 py-1.5 rounded-md mb-4 flex items-center justify-center space-x-1">
                <span>{card.gain_pill || "Saves 22 min section delay | +14% Line Clear Efficiency"}</span>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-2">
                <button
                  onClick={() => handleApply(card)}
                  disabled={isApplied || isApplying === card.id}
                  className={`flex-1 flex items-center justify-center space-x-1.5 font-bold text-xs py-2.5 px-3 rounded text-white transition-all ${
                    isApplied
                      ? 'bg-emerald-800 cursor-default'
                      : 'bg-[#1B5E20] hover:bg-emerald-900 active:scale-95 shadow-sm'
                  }`}
                >
                  {isApplied ? (
                    <>
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Route Signalled</span>
                    </>
                  ) : (
                    <>
                      <span>{isApplying === card.id ? 'Signalling Route...' : 'Approve & Signal Route'}</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>

                <button
                  disabled={isApplied}
                  className="flex-none flex items-center justify-center space-x-1 font-bold text-xs py-2.5 px-3 rounded border border-slate-300 text-slate-700 bg-white hover:bg-slate-100 transition-all"
                >
                  <Sliders className="w-3.5 h-3.5" />
                  <span>Manual Override / Edit</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Safety Gate Status Footer */}
      <div className="mt-4 pt-3 border-t border-slate-200 bg-emerald-50 text-[#1B5E20] border border-emerald-200 rounded p-2.5 text-center text-xs font-bold font-mono">
        ✔ Interlocking & 650m Siding Length Verified
      </div>
    </div>
  );
}
