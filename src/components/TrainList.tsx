'use client';

import React from 'react';
import { Train } from '@/lib/types';
import { Train as TrainIcon, AlertTriangle } from 'lucide-react';

interface TrainListProps {
  trains: Train[];
  selectedTrainId?: string;
  onSelectTrain?: (trainId: string) => void;
}

export function TrainList({ trains, selectedTrainId, onSelectTrain }: TrainListProps) {
  const getBadge = (category: string) => {
    if (category === 'VANDE_BHARAT') {
      return <span className="bg-blue-100 text-blue-900 border border-blue-300 text-[10px] font-bold px-2 py-0.5 rounded">Vande Bharat</span>;
    }
    if (category === 'MAIL_EXPRESS') {
      return <span className="bg-amber-100 text-amber-900 border border-amber-300 text-[10px] font-bold px-2 py-0.5 rounded">Mail / Express</span>;
    }
    return <span className="bg-red-100 text-red-900 border border-red-300 text-[10px] font-bold px-2 py-0.5 rounded">Freight Container</span>;
  };

  return (
    <div className="gov-card p-4">
      <div className="flex items-center justify-between mb-3 border-b border-slate-200 pb-2">
        <div className="flex items-center space-x-2">
          <div className="bg-[#0F2C59] text-white p-1 rounded">
            <TrainIcon className="w-4 h-4" />
          </div>
          <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
            Active Section Train Movement Telemetry
          </h2>
        </div>
        <span className="text-xs font-mono font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
          {trains.length} Active Trains
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="border-b border-slate-300 text-slate-600 font-bold uppercase tracking-wider text-[10px] bg-slate-50">
              <th className="py-2 px-3">Train No. & Name</th>
              <th className="py-2 px-3">Category</th>
              <th className="py-2 px-3">Priority</th>
              <th className="py-2 px-3">Position</th>
              <th className="py-2 px-3">Speed</th>
              <th className="py-2 px-3">Delay</th>
              <th className="py-2 px-3 text-right">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 text-slate-800">
            {trains.map((t) => {
              const isSelected = selectedTrainId === t.train_id;

              return (
                <tr
                  key={t.train_id}
                  onClick={() => onSelectTrain && onSelectTrain(t.train_id)}
                  className={`hover:bg-slate-50 cursor-pointer transition-colors ${
                    isSelected ? 'bg-slate-100 font-semibold' : ''
                  }`}
                >
                  <td className="py-2.5 px-3 font-bold text-slate-900">
                    <span className="font-mono text-[#0F2C59] mr-1.5">#{t.number}</span>
                    <span>{t.name}</span>
                  </td>
                  <td className="py-2.5 px-3">{getBadge(t.category)}</td>
                  <td className="py-2.5 px-3 font-mono font-bold text-slate-700">
                    W={t.priority_weight}
                  </td>
                  <td className="py-2.5 px-3 font-mono text-slate-700">
                    km {t.current_km.toFixed(1)} <span className="text-slate-500">({t.current_block_id || 'Station'})</span>
                  </td>
                  <td className="py-2.5 px-3 font-mono font-bold text-slate-900">
                    {t.current_speed_kmh.toFixed(0)} <span className="text-[10px] font-normal text-slate-500">km/h</span>
                  </td>
                  <td className="py-2.5 px-3 font-mono font-bold">
                    <span className={t.current_delay_min > 10 ? 'text-[#B71C1C]' : 'text-[#1B5E20]'}>
                      +{t.current_delay_min.toFixed(1)}m
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-right">
                    {t.is_breakdown ? (
                      <span className="gov-badge-crimson text-[10px] px-2 py-0.5 rounded inline-flex items-center space-x-1">
                        <AlertTriangle className="w-3 h-3" />
                        <span>HALTED</span>
                      </span>
                    ) : t.status === 'HOLDING' ? (
                      <span className="gov-badge-amber text-[10px] px-2 py-0.5 rounded">
                        HOLDING AT LOOP
                      </span>
                    ) : (
                      <span className="gov-badge-green text-[10px] px-2 py-0.5 rounded">
                        RUNNING ON-TIME
                      </span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
