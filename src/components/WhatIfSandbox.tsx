'use client';

import React, { useState } from 'react';
import { RouteTopology, Train } from '@/lib/types';
import { injectTrainBreakdown, injectBlockMaintenance, resetSimulation, runOptimization } from '@/lib/api';
import { AlertOctagon, Wrench, RefreshCw, Sparkles, Play } from 'lucide-react';

interface WhatIfSandboxProps {
  topology: RouteTopology | null;
  trains: Train[];
  onSandboxUpdate?: () => void;
}

export function WhatIfSandbox({ topology, trains, onSandboxUpdate }: WhatIfSandboxProps) {
  const [loading, setLoading] = useState<boolean>(false);
  const [signalBlockInjected, setSignalBlockInjected] = useState<boolean>(false);
  const [locoFailureInjected, setLocoFailureInjected] = useState<boolean>(false);

  const handleInjectSignalBlock = async () => {
    setLoading(true);
    try {
      const targetBlock = "BLK_SRO_FTP"; // Block Section at Sirathu (Stn C)
      await injectBlockMaintenance(targetBlock, !signalBlockInjected);
      setSignalBlockInjected(!signalBlockInjected);
      if (onSandboxUpdate) onSandboxUpdate();
    } catch (err) {
      console.error('Failed to inject signal block:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleInjectLocoFailure = async () => {
    setLoading(true);
    try {
      const targetTrain = "TRN_401"; // Freight 401
      await injectTrainBreakdown(targetTrain, !locoFailureInjected);
      setLocoFailureInjected(!locoFailureInjected);
      if (onSandboxUpdate) onSandboxUpdate();
    } catch (err) {
      console.error('Failed to inject loco failure:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = async () => {
    setLoading(true);
    try {
      await resetSimulation();
      setSignalBlockInjected(false);
      setLocoFailureInjected(false);
      if (onSandboxUpdate) onSandboxUpdate();
    } catch (err) {
      console.error('Failed to reset sandbox:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleReCalculate = async () => {
    setLoading(true);
    try {
      await runOptimization();
      if (onSandboxUpdate) onSandboxUpdate();
    } catch (err) {
      console.error('Failed to recalculate plan:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="gov-card p-4 bg-slate-100 border border-slate-300">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Title */}
        <div className="flex items-center space-x-2">
          <div className="bg-[#0F2C59] text-white p-1.5 rounded">
            <AlertOctagon className="w-4 h-4 text-amber-400" />
          </div>
          <div>
            <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              What-If Disruption Simulation Sandbox
            </h2>
            <p className="text-[11px] text-slate-600">Simulate emergency line blocks & mechanical failures</p>
          </div>
        </div>

        {/* Action Toggle Buttons */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          {/* Signal Block Button */}
          <button
            onClick={handleInjectSignalBlock}
            disabled={loading}
            className={`font-bold px-3 py-2 rounded border transition-all active:scale-95 flex items-center space-x-1.5 ${
              signalBlockInjected
                ? 'bg-[#B71C1C] text-white border-red-800'
                : 'bg-white text-slate-800 border-slate-300 hover:bg-slate-50'
            }`}
          >
            <Wrench className="w-3.5 h-3.5" />
            <span>{signalBlockInjected ? '[ Signal Block Active at Stn C ]' : '[ + Inject 15m Signal Block at Stn C ]'}</span>
          </button>

          {/* Loco Failure Button */}
          <button
            onClick={handleInjectLocoFailure}
            disabled={loading}
            className={`font-bold px-3 py-2 rounded border transition-all active:scale-95 flex items-center space-x-1.5 ${
              locoFailureInjected
                ? 'bg-[#B71C1C] text-white border-red-800'
                : 'bg-white text-slate-800 border-slate-300 hover:bg-slate-50'
            }`}
          >
            <AlertOctagon className="w-3.5 h-3.5" />
            <span>{locoFailureInjected ? '[ Loco Failure Active (Freight 401) ]' : '[ Simulate Loco Failure (Freight 401) ]'}</span>
          </button>

          {/* Reset Button */}
          <button
            onClick={handleReset}
            disabled={loading}
            className="font-semibold bg-white text-slate-700 hover:bg-slate-50 border border-slate-300 px-3 py-2 rounded transition-all flex items-center space-x-1.5"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>[ Reset to Live Feed ]</span>
          </button>

          {/* Re-calculate Solver Button */}
          <button
            onClick={handleReCalculate}
            disabled={loading}
            className="font-bold bg-[#1B5E20] hover:bg-emerald-900 text-white px-4 py-2 rounded border border-emerald-900 transition-all flex items-center space-x-1.5 active:scale-95"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>[ Re-calculate Optimal Plan (3.0s Solver) ]</span>
          </button>
        </div>
      </div>
    </div>
  );
}
