'use client';

import React from 'react';
import { RouteTopology, Train } from '@/lib/types';
import { MapPin, Train as TrainIcon } from 'lucide-react';

interface TrackTopologyViewProps {
  topology: RouteTopology | null;
  trains: Train[];
}

export function TrackTopologyView({ topology, trains }: TrackTopologyViewProps) {
  if (!topology) return null;

  return (
    <div className="gov-card p-4">
      <div className="flex items-center justify-between mb-3 border-b border-slate-200 pb-2">
        <div className="flex items-center space-x-2">
          <div className="bg-[#0F2C59] text-white p-1 rounded">
            <MapPin className="w-4 h-4" />
          </div>
          <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
            Live Track Interlocking & Station Loop Layout (Prayagraj - Kanpur Section)
          </h2>
        </div>
        <span className="text-xs text-slate-600 font-mono">Total Length: 120 KM</span>
      </div>

      <div className="bg-slate-50 border border-slate-200 rounded p-6 overflow-x-auto">
        <div className="min-w-[800px] flex items-center justify-between relative py-6">
          {/* Main Line Track */}
          <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 h-2 bg-slate-300 rounded border border-slate-400"></div>

          {/* Stations */}
          {topology.stations.map((stn) => {
            const trainsAtStn = trains.filter((t) => Math.abs(t.current_km - stn.km_mark) < 3.0);

            return (
              <div key={stn.id} className="relative z-10 flex flex-col items-center">
                <div className="bg-white border-2 border-[#0F2C59] px-4 py-2 rounded text-center shadow-sm">
                  <div className="text-xs font-extrabold text-[#0F2C59]">{stn.name}</div>
                  <div className="text-[10px] font-mono text-slate-600 font-bold">{stn.code} (km {stn.km_mark})</div>
                  <div className="flex space-x-1 mt-1 justify-center">
                    {stn.sidings.map((s) => (
                      <span
                        key={s.id}
                        title={`${s.name} (${s.length_m}m)`}
                        className="w-2 h-2 rounded-full bg-slate-400 border border-slate-600"
                      ></span>
                    ))}
                  </div>
                </div>

                {trainsAtStn.length > 0 && (
                  <div className="absolute -top-10 flex flex-col items-center space-y-1">
                    {trainsAtStn.map((t) => (
                      <span
                        key={t.train_id}
                        className={`text-[10px] font-extrabold px-2 py-0.5 rounded shadow flex items-center space-x-1 ${
                          t.is_breakdown
                            ? 'bg-[#B71C1C] text-white'
                            : 'bg-[#0F2C59] text-white'
                        }`}
                      >
                        <TrainIcon className="w-3 h-3" />
                        <span>#{t.number}</span>
                      </span>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
