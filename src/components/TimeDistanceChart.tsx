'use client';

import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import { RouteTopology, Train, TrainStationSchedule } from '@/lib/types';

interface TimeDistanceChartProps {
  topology: RouteTopology | null;
  trains: Train[];
  schedules: TrainStationSchedule[];
  selectedTrainId?: string;
  onSelectTrain?: (trainId: string) => void;
}

export function TimeDistanceChart({
  topology,
  trains,
  schedules,
  selectedTrainId,
  onSelectTrain
}: TimeDistanceChartProps) {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [tooltip, setTooltip] = useState<{ x: number; y: number; content: React.ReactNode } | null>(null);

  useEffect(() => {
    if (!svgRef.current || !containerRef.current || !topology) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    const width = containerRef.current.clientWidth || 900;
    const height = 460;
    const margin = { top: 40, right: 30, bottom: 50, left: 140 };

    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    const g = svg
      .attr('width', width)
      .attr('height', height)
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    // X Scale: Time in 15-minute intervals (10:00 to 11:15, mapping 0 to 75 min)
    const xScale = d3.scaleLinear().domain([0, 75]).range([0, innerWidth]);

    // Y Scale: Distance along Prayagraj - Kanpur section (0 to 120 km)
    const yScale = d3.scaleLinear().domain([0, 120]).range([0, innerHeight]);

    // Background Grid
    const xGrid = d3.axisBottom(xScale).ticks(5).tickSize(innerHeight).tickFormat(() => '');
    const yGrid = d3.axisLeft(yScale).tickValues(topology.stations.map((s) => s.km_mark)).tickSize(-innerWidth).tickFormat(() => '');

    g.append('g').attr('class', 'grid stroke-slate-200 stroke-dashed').call(xGrid);
    g.append('g').attr('class', 'grid stroke-slate-200 stroke-dashed').call(yGrid);

    // Time ticks: 10:00, 10:15, 10:30, 10:45, 11:00, 11:15
    const timeLabels = ['10:00', '10:15', '10:30', '10:45', '11:00', '11:15'];
    const xAxis = d3
      .axisBottom(xScale)
      .tickValues([0, 15, 30, 45, 60, 75])
      .tickFormat((d, i) => timeLabels[i] || `T+${d}`);

    const yAxis = d3.axisLeft(yScale).tickValues(topology.stations.map((s) => s.km_mark)).tickFormat((d) => {
      const stn = topology.stations.find((s) => s.km_mark === d);
      return stn ? `${stn.code} (${stn.name}) km ${d}` : `km ${d}`;
    });

    const xAxisG = g.append('g').attr('transform', `translate(0,${innerHeight})`).call(xAxis);
    xAxisG.selectAll('text').attr('fill', '#334155').attr('font-size', '11px').attr('font-weight', '700');
    xAxisG.select('.domain').attr('stroke', '#94A3B8');

    const yAxisG = g.append('g').call(yAxis);
    yAxisG.selectAll('text').attr('fill', '#0F172A').attr('font-size', '11px').attr('font-weight', '700');
    yAxisG.select('.domain').attr('stroke', '#94A3B8');

    // Station Line Bands
    topology.stations.forEach((stn) => {
      const yPos = yScale(stn.km_mark);
      g.append('line')
        .attr('x1', 0)
        .attr('y1', yPos)
        .attr('x2', innerWidth)
        .attr('y2', yPos)
        .attr('stroke', '#CBD5E1')
        .attr('stroke-width', 1.5);
    });

    // Specific Color Palette for Trajectories:
    // - Blue (#0F2C59 / #1D4ED8) for Vande Bharat Express 201
    // - Crimson (#B71C1C) for Freight 401 holding at STA B loop siding
    // - Amber (#B76E00) for Passenger 302
    const getTrajectoryColor = (train: Train) => {
      if (train.number === '201' || train.category === 'VANDE_BHARAT') return '#1D4ED8'; // Blue
      if (train.number === '401' || train.category === 'FREIGHT') return '#B71C1C'; // Crimson
      return '#B76E00'; // Amber
    };

    // Group Schedules by Train
    const trainSchedulesMap: { [trainId: string]: TrainStationSchedule[] } = {};
    schedules.forEach((sch) => {
      if (!trainSchedulesMap[sch.train_id]) trainSchedulesMap[sch.train_id] = [];
      trainSchedulesMap[sch.train_id].push(sch);
    });

    // Draw Paths for Trains
    trains.forEach((train) => {
      const trnSchedules = trainSchedulesMap[train.train_id] || [];
      const color = getTrajectoryColor(train);
      const isSelected = selectedTrainId === train.train_id;

      if (trnSchedules.length > 0) {
        const lineGen = d3
          .line<TrainStationSchedule>()
          .x((d) => xScale(d.optimized_arrival_min))
          .y((d) => {
            const stn = topology.stations.find((s) => s.code === d.station_code);
            return yScale(stn ? stn.km_mark : 0);
          })
          .curve(d3.curveLinear);

        // Path Line
        g.append('path')
          .datum(trnSchedules)
          .attr('fill', 'none')
          .attr('stroke', color)
          .attr('stroke-width', isSelected ? 4.5 : 3)
          .attr('stroke-dasharray', train.number === '401' ? '6 3' : 'none')
          .attr('cursor', 'pointer')
          .on('click', () => onSelectTrain && onSelectTrain(train.train_id));

        // Station Nodes & Dwell Points
        trnSchedules.forEach((sch) => {
          const stn = topology.stations.find((s) => s.code === sch.station_code);
          if (!stn) return;

          const cx = xScale(sch.optimized_arrival_min);
          const cy = yScale(stn.km_mark);

          const circle = g
            .append('circle')
            .attr('cx', cx)
            .attr('cy', cy)
            .attr('r', sch.is_holding ? 7 : 5)
            .attr('fill', sch.is_holding ? '#B71C1C' : color)
            .attr('stroke', '#FFFFFF')
            .attr('stroke-width', 2)
            .attr('cursor', 'pointer');

          circle
            .on('mouseover', (event) => {
              const bounds = containerRef.current?.getBoundingClientRect();
              setTooltip({
                x: event.clientX - (bounds?.left || 0) + 12,
                y: event.clientY - (bounds?.top || 0) - 35,
                content: (
                  <div className="bg-slate-900 text-white text-xs p-2.5 rounded shadow-xl border border-slate-700">
                    <div className="font-bold flex items-center space-x-1 mb-1">
                      <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: color }}></span>
                      <span>{train.name} (#{train.number})</span>
                    </div>
                    <div>Station: <strong>{stn.name} ({stn.code})</strong></div>
                    <div>Track: <strong>{sch.assigned_track}</strong></div>
                    <div>Arr Time: <strong>T+{sch.optimized_arrival_min}m</strong></div>
                    {sch.is_holding && (
                      <div className="bg-red-500/30 text-red-200 px-2 py-0.5 rounded text-[10px] font-bold mt-1">
                        HOLDING AT LOOP SIDING
                      </div>
                    )}
                  </div>
                )
              });
            })
            .on('mouseout', () => setTooltip(null));
        });
      }

      // Train Location Point Indicator
      const liveY = yScale(train.current_km);
      const liveX = xScale(Math.min(72, Math.max(2, train.scheduled_start_min + (train.current_km * 0.4))));

      const badgeGroup = g.append('g').attr('transform', `translate(${liveX},${liveY})`);

      badgeGroup
        .append('rect')
        .attr('x', -4)
        .attr('y', -10)
        .attr('width', 52)
        .attr('height', 20)
        .attr('rx', 4)
        .attr('fill', color)
        .attr('stroke', '#FFFFFF')
        .attr('stroke-width', 1.5);

      badgeGroup
        .append('text')
        .attr('x', 22)
        .attr('y', 4)
        .attr('fill', '#FFFFFF')
        .attr('font-size', '10px')
        .attr('font-weight', 'bold')
        .attr('text-anchor', 'middle')
        .text(`#${train.number}`);
    });
  }, [topology, trains, schedules, selectedTrainId]);

  return (
    <div ref={containerRef} className="gov-card p-5 relative flex flex-col h-full">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3 border-b border-slate-200 pb-3">
        <div>
          <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
            Time-Distance Marey Diagram (Live Train Graph)
          </h2>
          <p className="text-xs text-slate-500">
            Cartesian Plot: Y-Axis = Station Distance (km), X-Axis = Time (15-min Intervals)
          </p>
        </div>

        {/* Legend */}
        <div className="flex items-center space-x-4 text-xs font-semibold">
          <div className="flex items-center space-x-1.5">
            <span className="w-3 h-3 rounded-full bg-[#1D4ED8]"></span>
            <span className="text-slate-700">Vande Bharat #201 (Blue)</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <span className="w-3 h-3 rounded-full bg-[#B71C1C]"></span>
            <span className="text-slate-700">Freight #401 (Crimson)</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <span className="w-3 h-3 rounded-full bg-[#B76E00]"></span>
            <span className="text-slate-700">Passenger #302 (Amber)</span>
          </div>
        </div>
      </div>

      {/* SVG Canvas */}
      <svg ref={svgRef} className="w-full h-[460px] bg-slate-50 border border-slate-200 rounded"></svg>

      {/* Floating Hover Tooltip */}
      {tooltip && (
        <div
          className="absolute z-50 pointer-events-none transition-all duration-75"
          style={{ top: tooltip.y, left: tooltip.x }}
        >
          {tooltip.content}
        </div>
      )}
    </div>
  );
}
