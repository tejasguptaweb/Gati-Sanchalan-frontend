'use client';

import React, { useState, useEffect } from 'react';
import { useWebSocket } from '@/lib/useWebSocket';
import { fetchTopology, fetchTrains, runOptimization, fetchSafetyVerification } from '@/lib/api';
import { RouteTopology, Train, TrainStationSchedule, AdvisoryCard } from '@/lib/types';

import { HeaderBar } from '@/components/HeaderBar';
import { KPIRibbon } from '@/components/KPIRibbon';
import { TimeDistanceChart } from '@/components/TimeDistanceChart';
import { AdvisoryPanel } from '@/components/AdvisoryPanel';
import { WhatIfSandbox } from '@/components/WhatIfSandbox';
import { TrainList } from '@/components/TrainList';
import { TrackTopologyView } from '@/components/TrackTopologyView';

export default function Home() {
  const { data: wsData } = useWebSocket();

  const [topology, setTopology] = useState<RouteTopology | null>(null);
  const [trains, setTrains] = useState<Train[]>([]);
  const [schedules, setSchedules] = useState<TrainStationSchedule[]>([]);
  const [advisories, setAdvisories] = useState<AdvisoryCard[]>([]);
  const [selectedTrainId, setSelectedTrainId] = useState<string | undefined>();

  const refreshAllData = async () => {
    try {
      const topoData = await fetchTopology();
      setTopology(topoData);

      const trainData = await fetchTrains();
      setTrains(trainData);

      const optRes = await runOptimization();
      setSchedules(optRes.schedules);
      setAdvisories(optRes.advisories);
    } catch (err) {
      console.error('Error refreshing Gati-Sanchalan DSS data:', err);
    }
  };

  useEffect(() => {
    refreshAllData();
  }, []);

  useEffect(() => {
    if (wsData) {
      if (wsData.trains) setTrains(wsData.trains);
      if (wsData.solver_result) {
        setSchedules(wsData.solver_result.schedules || []);
        setAdvisories(wsData.solver_result.advisories || []);
      }
    }
  }, [wsData]);

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col font-sans pb-6">
      {/* 1. Top Government Header Bar */}
      <HeaderBar sectionName="Section: Prayagraj - Kanpur Central | Up/Down Trunk Line" />

      {/* Main Content Area */}
      <main className="flex-1 px-6 py-5 max-w-[1800px] w-full mx-auto space-y-5">
        {/* 2. Top KPI Metric Ribbon */}
        <KPIRibbon
          throughputPercent={118.4}
          activeTrainsCount={trains.length > 0 ? trains.length : 14}
          conflictsCount={0}
          punctualityIndex={96.8}
        />

        {/* 3. Main Working Area (2-Column Grid: 70% Left, 30% Right) */}
        <div className="grid grid-cols-1 lg:grid-cols-10 gap-5">
          {/* 70% Left Column */}
          <div className="lg:col-span-7 space-y-5">
            {/* Time-Distance Marey Diagram Chart */}
            <TimeDistanceChart
              topology={topology}
              trains={trains}
              schedules={schedules}
              selectedTrainId={selectedTrainId}
              onSelectTrain={setSelectedTrainId}
            />

            {/* Active Train Telemetry Table */}
            <TrainList
              trains={trains}
              selectedTrainId={selectedTrainId}
              onSelectTrain={setSelectedTrainId}
            />

            {/* Live Track Interlocking View */}
            <TrackTopologyView
              topology={topology}
              trains={trains}
            />
          </div>

          {/* 30% Right Column */}
          <div className="lg:col-span-3">
            <AdvisoryPanel
              advisories={advisories}
              onAdvisoryApplied={refreshAllData}
            />
          </div>
        </div>

        {/* 4. Bottom Operational Sandbox Toolbar */}
        <WhatIfSandbox
          topology={topology}
          trains={trains}
          onSandboxUpdate={refreshAllData}
        />
      </main>
    </div>
  );
}
