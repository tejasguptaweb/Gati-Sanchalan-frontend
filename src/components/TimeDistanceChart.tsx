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

// Fallback Station Topology
const DEFAULT_STATIONS = [
  { id: 'STN_PRYJ', name: 'Prayagraj Jn', code: 'PRYJ', km_mark: 0 },
  { id: 'STN_SFG', name: 'Subedarganj', code: 'SFG', km_mark: 10 },
  { id: 'STN_SRO', name: 'Sirathu', code: 'SRO', km_mark: 45 },
  { id: 'STN_FTP', name: 'Fatehpur', code: 'FTP', km_mark: 75 },
  { id: 'STN_CNB', name: 'Kanpur Central', code: 'CNB', km_mark: 120 },
];

// Fallback Train Schedules
const DEFAULT_SCHEDULES: TrainStationSchedule[] = [
  // Vande Bharat #201 (Blue Line) - Fast Down
  { train_id: 'TRN_201', train_number: '201', station_id: 'STN_PRYJ', station_code: 'PRYJ', scheduled_arrival_min: 0, scheduled_departure_min: 2, optimized_arrival_min: 2, optimized_departure_min: 4, assigned_track: 'Main Line', dwell_time_min: 2, is_holding: false },
  { train_id: 'TRN_201', train_number: '201', station_id: 'STN_SFG', station_code: 'SFG', scheduled_arrival_min: 8, scheduled_departure_min: 10, optimized_arrival_min: 9, optimized_departure_min: 11, assigned_track: 'Main Line (Pass)', dwell_time_min: 2, is_holding: false },
  { train_id: 'TRN_201', train_number: '201', station_id: 'STN_SRO', station_code: 'SRO', scheduled_arrival_min: 28, scheduled_departure_min: 30, optimized_arrival_min: 27, optimized_departure_min: 29, assigned_track: 'Main Line', dwell_time_min: 2, is_holding: false },
  { train_id: 'TRN_201', train_number: '201', station_id: 'STN_FTP', station_code: 'FTP', scheduled_arrival_min: 46, scheduled_departure_min: 48, optimized_arrival_min: 45, optimized_departure_min: 47, assigned_track: 'Main Line', dwell_time_min: 2, is_holding: false },
  { train_id: 'TRN_201', train_number: '201', station_id: 'STN_CNB', station_code: 'CNB', scheduled_arrival_min: 70, scheduled_departure_min: 72, optimized_arrival_min: 68, optimized_departure_min: 70, assigned_track: 'Main Line', dwell_time_min: 2, is_holding: false },

  // Freight #401 (Crimson Line) - Holds at Subedarganj Loop 1 for Overtake
  { train_id: 'TRN_401', train_number: '401', station_id: 'STN_PRYJ', station_code: 'PRYJ', scheduled_arrival_min: 0, scheduled_departure_min: 2, optimized_arrival_min: 0, optimized_departure_min: 2, assigned_track: 'Main Line', dwell_time_min: 2, is_holding: false },
  { train_id: 'TRN_401', train_number: '401', station_id: 'STN_SFG', station_code: 'SFG', scheduled_arrival_min: 7, scheduled_departure_min: 9, optimized_arrival_min: 8, optimized_departure_min: 22, assigned_track: 'Loop Siding 1', dwell_time_min: 14, is_holding: true, holding_reason: 'Diverted to Loop Siding 1 for Vande Bharat #201 overtake' },
  { train_id: 'TRN_401', train_number: '401', station_id: 'STN_SRO', station_code: 'SRO', scheduled_arrival_min: 42, scheduled_departure_min: 44, optimized_arrival_min: 50, optimized_departure_min: 52, assigned_track: 'Main Line', dwell_time_min: 2, is_holding: false },
  { train_id: 'TRN_401', train_number: '401', station_id: 'STN_FTP', station_code: 'FTP', scheduled_arrival_min: 68, scheduled_departure_min: 70, optimized_arrival_min: 74, optimized_departure_min: 76, assigned_track: 'Main Line', dwell_time_min: 2, is_holding: false },

  // Passenger #302 (Amber Line)
  { train_id: 'TRN_302', train_number: '302', station_id: 'STN_PRYJ', station_code: 'PRYJ', scheduled_arrival_min: 15, scheduled_departure_min: 17, optimized_arrival_min: 16, optimized_departure_min: 18, assigned_track: 'Main Line', dwell_time_min: 2, is_holding: false },
  { train_id: 'TRN_302', train_number: '302', station_id: 'STN_SFG', station_code: 'SFG', scheduled_arrival_min: 24, scheduled_departure_min: 26, optimized_arrival_min: 25, optimized_departure_min: 27, assigned_track: 'Main Line', dwell_time_min: 2, is_holding: false },
  { train_id: 'TRN_302', train_number: '302', station_id: 'STN_SRO', station_code: 'SRO', scheduled_arrival_min: 52, scheduled_departure_min: 54, optimized_arrival_min: 53, optimized_departure_min: 55, assigned_track: 'Main Line', dwell_time_min: 2, is_holding: false },
  { train_id: 'TRN_302', train_number: '302', station_id: 'STN_FTP', station_code: 'FTP', scheduled_arrival_min: 78, scheduled_departure_min: 80, optimized_arrival_min: 77, optimized_departure_min: 79, assigned_track: 'Main Line', dwell_time_min: 2, is_holding: false },
];

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

  const stationsData = (topology && topology.stations && topology.stations.length > 0)
    ? topology.stations
    : DEFAULT_STATIONS;

  const activeSchedules = (schedules && schedules.length > 0)
    ? schedules
    : DEFAULT_SCHEDULES;

  useEffect(() => {
    if (!svgRef.current || !containerRef.current) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    const clientW = containerRef.current.clientWidth;
    const width = Math.max(clientW || 850, 750);
    const height = 480;
    const margin = { top: 40, right: 40, bottom: 50, left: 160 };

    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    const g = svg
      .attr('width', '100%')
      .attr('height', height)
      .attr('viewBox', `0 0 ${width} ${height}`)
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    // X Scale: 0 to 90 minutes (10:00 to 11:30)
    const xScale = d3.scaleLinear().domain([0, 90]).range([0, innerWidth]);

    // Y Scale: 0 to 120 KM (Prayagraj to Kanpur)
    const yScale = d3.scaleLinear().domain([0, 120]).range([0, innerHeight]);

    // Background Grid
    const xGrid = d3.axisBottom(xScale).ticks(6).tickSize(innerHeight).tickFormat(() => '');
    const yGrid = d3.axisLeft(yScale).tickValues(stationsData.map((s) => s.km_mark)).tickSize(-innerWidth).tickFormat(() => '');

    g.append('g').attr('class', 'grid stroke-slate-200 stroke-dashed opacity-70').call(xGrid);
    g.append('g').attr('class', 'grid stroke-slate-200 stroke-dashed opacity-70').call(yGrid);

    // Axes
    const timeLabels = ['10:00', '10:15', '10:30', '10:45', '11:00', '11:15', '11:30'];
    const xAxis = d3
      .axisBottom(xScale)
      .tickValues([0, 15, 30, 45, 60, 75, 90])
      .tickFormat((d, i) => timeLabels[i] || `T+${d}`);

    const yAxis = d3.axisLeft(yScale).tickValues(stationsData.map((s) => s.km_mark)).tickFormat((d) => {
      const stn = stationsData.find((s) => s.km_mark === d);
      return stn ? `${stn.code} (${stn.name}) km ${d}` : `km ${d}`;
    });

    const xAxisG = g.append('g').attr('transform', `translate(0,${innerHeight})`).call(xAxis);
    xAxisG.selectAll('text').attr('fill', '#334155').attr('font-size', '11px').attr('font-weight', '700');
    xAxisG.select('.domain').attr('stroke', '#94A3B8');

    const yAxisG = g.append('g').call(yAxis);
    yAxisG.selectAll('text').attr('fill', '#0F172A').attr('font-size', '11px').attr('font-weight', '700');
    yAxisG.select('.domain').attr('stroke', '#94A3B8');

    // Station Line Bands
    stationsData.forEach((stn) => {
      const yPos = yScale(stn.km_mark);
      g.append('line')
        .attr('x1', 0)
        .attr('y1', yPos)
        .attr('x2', innerWidth)
        .attr('y2', yPos)
        .attr('stroke', '#CBD5E1')
        .attr('stroke-width', 1.5);
    });

    // Color logic
    const getTrajectoryColor = (trnId: string, number: string) => {
      if (number === '201' || trnId.includes('201')) return '#1D4ED8'; // Blue for Vande Bharat 201
      if (number === '401' || trnId.includes('401')) return '#B71C1C'; // Crimson for Freight 401
      return '#B76E00'; // Amber for Passenger 302
    };

    // Group active schedules by train
    const groupedMap: { [trnId: string]: TrainStationSchedule[] } = {};
    activeSchedules.forEach((sch) => {
      if (!groupedMap[sch.train_id]) groupedMap[sch.train_id] = [];
      groupedMap[sch.train_id].push(sch);
    });

    // Draw string chart paths
    Object.entries(groupedMap).forEach(([trnId, trnSchedules]) => {
      const firstSch = trnSchedules[0];
      const trnNumber = firstSch?.train_number || trnId.replace('TRN_', '');
      const color = getTrajectoryColor(trnId, trnNumber);
      const isSelected = selectedTrainId === trnId;

      // Sort points chronologically
      const sortedPoints = [...trnSchedules].sort((a, b) => a.optimized_arrival_min - b.optimized_arrival_min);

      if (sortedPoints.length > 0) {
        const lineGen = d3
          .line<TrainStationSchedule>()
          .x((d) => xScale(d.optimized_arrival_min))
          .y((d) => {
            const stn = stationsData.find((s) => s.code === d.station_code);
            return yScale(stn ? stn.km_mark : 0);
          })
          .curve(d3.curveLinear);

        // Path
        g.append('path')
          .datum(sortedPoints)
          .attr('fill', 'none')
          .attr('stroke', color)
          .attr('stroke-width', isSelected ? 4.5 : 3)
          .attr('stroke-dasharray', trnNumber === '401' ? '6 3' : 'none')
          .attr('cursor', 'pointer')
          .on('click', () => onSelectTrain && onSelectTrain(trnId));

        // Station Nodes
        sortedPoints.forEach((sch) => {
          const stn = stationsData.find((s) => s.code === sch.station_code);
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
                  <div className="bg-slate-900 text-white text-xs p-3 rounded shadow-xl border border-slate-700">
                    <div className="font-bold flex items-center space-x-1 mb-1">
                      <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: color }}></span>
                      <span>Train #{trnNumber}</span>
                    </div>
                    <div>Station: <strong>{stn.name} ({stn.code})</strong></div>
                    <div>Track: <strong className="text-amber-300">{sch.assigned_track}</strong></div>
                    <div>Time: <strong>T+{sch.optimized_arrival_min}m</strong></div>
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

        // Train Badge Label on first point
        const firstPoint = sortedPoints[0];
        const firstStn = stationsData.find((s) => s.code === firstPoint.station_code);
        if (firstStn) {
          const badgeX = xScale(firstPoint.optimized_arrival_min);
          const badgeY = yScale(firstStn.km_mark);

          const badgeGroup = g.append('g').attr('transform', `translate(${badgeX},${badgeY})`);
          badgeGroup
            .append('rect')
            .attr('x', -4)
            .attr('y', -10)
            .attr('width', 48)
            .attr('height', 20)
            .attr('rx', 4)
            .attr('fill', color)
            .attr('stroke', '#FFFFFF')
            .attr('stroke-width', 1.5);

          badgeGroup
            .append('text')
            .attr('x', 20)
            .attr('y', 4)
            .attr('fill', '#FFFFFF')
            .attr('font-size', '10px')
            .attr('font-weight', 'bold')
            .attr('text-anchor', 'middle')
            .text(`#${trnNumber}`);
        }
      }
    });
  }, [topology, trains, schedules, selectedTrainId, stationsData, activeSchedules]);

  return (
    <div ref={containerRef} className="gov-card p-5 relative flex flex-col w-full">
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
        <div className="flex flex-wrap items-center gap-4 text-xs font-semibold">
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
      <svg ref={svgRef} className="w-full h-[480px] bg-slate-50 border border-slate-200 rounded"></svg>

      {/* Floating Tooltip */}
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
