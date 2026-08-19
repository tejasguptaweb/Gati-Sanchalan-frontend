export type TrainCategory = 'VANDE_BHARAT' | 'MAIL_EXPRESS' | 'FREIGHT';

export interface Siding {
  id: string;
  name: string;
  length_m: number;
  is_electrified: boolean;
  is_occupied: boolean;
  occupied_by_train_id?: string;
}

export interface Station {
  id: string;
  name: string;
  code: string;
  km_mark: number;
  sidings: Siding[];
  has_crossover: boolean;
}

export interface BlockSection {
  id: string;
  from_station_id: string;
  to_station_id: string;
  distance_km: number;
  max_speed_kmh: number;
  num_tracks: number;
  is_blocked: boolean;
  block_reason?: string;
  tsr_kmh?: number;
}

export interface RouteTopology {
  corridor_name: string;
  stations: Station[];
  block_sections: BlockSection[];
}

export interface Train {
  train_id: string;
  number: string;
  name: string;
  category: TrainCategory;
  priority_weight: number;
  length_m: number;
  max_speed_kmh: number;
  direction: number;
  scheduled_start_min: number;
  current_km: number;
  current_speed_kmh: number;
  current_delay_min: number;
  current_block_id?: string;
  current_station_id?: string;
  assigned_loop_id?: string;
  is_breakdown: boolean;
  status: string;
}

export interface TrainStationSchedule {
  train_id: string;
  train_number: string;
  station_id: string;
  station_code: string;
  scheduled_arrival_min: number;
  scheduled_departure_min: number;
  optimized_arrival_min: number;
  optimized_departure_min: number;
  assigned_track: string;
  dwell_time_min: number;
  is_holding: boolean;
  holding_reason?: string;
}

export interface AdvisoryCard {
  id: string;
  train_id: string;
  train_number: string;
  train_name: string;
  action_type: string;
  title: string;
  station_code: string;
  target_track: string;
  duration_min: number;
  delay_saved_min: number;
  rationale: string;
  gain_pill: string;
  priority_level: 'CRITICAL' | 'HIGH' | 'MEDIUM';
}

export interface OptimizationResult {
  solver_status: string;
  solver_latency_ms: number;
  total_delay_reduction_min: number;
  throughput_improvement_percent: number;
  schedules: TrainStationSchedule[];
  advisories: AdvisoryCard[];
}

export interface SafetyViolation {
  rule_id: string;
  rule_name: string;
  severity: string;
  affected_train_ids: string[];
  description: string;
  location: string;
}

export interface SafetyVerificationResult {
  is_safe: boolean;
  total_checks_run: number;
  passed_checks: number;
  violations: SafetyViolation[];
  verification_time_ms: number;
}
