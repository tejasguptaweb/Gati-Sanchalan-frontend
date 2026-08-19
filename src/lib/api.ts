import { RouteTopology, Train, OptimizationResult, SafetyVerificationResult } from './types';

const API_BASE = 'http://127.0.0.1:8000';

export async function fetchTopology(): Promise<RouteTopology> {
  const res = await fetch(`${API_BASE}/api/topology`);
  if (!res.ok) throw new Error('Failed to fetch topology');
  return res.json();
}

export async function fetchTrains(): Promise<Train[]> {
  const res = await fetch(`${API_BASE}/api/trains`);
  if (!res.ok) throw new Error('Failed to fetch trains');
  return res.json();
}

export async function runOptimization(): Promise<OptimizationResult> {
  const res = await fetch(`${API_BASE}/api/dispatch/optimize`, { method: 'POST' });
  if (!res.ok) throw new Error('Failed to run solver optimization');
  return res.json();
}

export async function fetchSafetyVerification(): Promise<SafetyVerificationResult> {
  const res = await fetch(`${API_BASE}/api/dispatch/verify-safety`);
  if (!res.ok) throw new Error('Failed safety verification');
  return res.json();
}

export async function applyAdvisoryCard(advisoryId: string, trainId: string, actionType: string, targetTrack: string, durationMin: number) {
  const res = await fetch(`${API_BASE}/api/dispatch/apply-advisory`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      advisory_id: advisoryId,
      train_id: trainId,
      action_type: actionType,
      target_track: targetTrack,
      duration_min: durationMin
    })
  });
  return res.json();
}

export async function injectTrainBreakdown(trainId: string, isBreakdown: boolean = true) {
  const res = await fetch(`${API_BASE}/api/sandbox/breakdown`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ train_id: trainId, is_breakdown: isBreakdown })
  });
  return res.json();
}

export async function injectBlockMaintenance(blockId: string, isBlocked: boolean = true) {
  const res = await fetch(`${API_BASE}/api/sandbox/block-maintenance`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ block_id: blockId, is_blocked: isBlocked })
  });
  return res.json();
}

export async function resetSimulation() {
  const res = await fetch(`${API_BASE}/api/sandbox/reset`, { method: 'POST' });
  return res.json();
}
