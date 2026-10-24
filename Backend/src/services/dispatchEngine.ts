import type { GeoLocation, Vehicle, DispatchScoreCandidate, IncidentUrgency } from '../types/jeevan.js';

/**
 * Calculates Haversine distance in kilometers between two geo-coordinates.
 */
export function calculateHaversineDistanceKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth radius in km
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Number((R * c).toFixed(2));
}

/**
 * Calculates estimated road distance and travel time.
 * Uses a road curvature winding factor (1.28x) and typical urban emergency speed (38 km/h).
 */
export function calculateRoadTravelMetrics(start: GeoLocation, end: GeoLocation): { roadDistanceKm: number; etaMinutes: number } {
  const straightLine = calculateHaversineDistanceKm(start.lat, start.lng, end.lat, end.lng);
  // Urban road network factor: ~1.28x to 1.35x of crow-fly distance
  const roadDistanceKm = Number((straightLine * 1.32).toFixed(1));
  // Average emergency response speed: ~36 km/h in city traffic (0.6 km/min) + 1.5 min dispatch startup
  const travelMinutes = Math.ceil((roadDistanceKm / 36) * 60) + 1;
  const etaMinutes = Math.max(2, travelMinutes);

  return { roadDistanceKm, etaMinutes };
}

/**
 * Generates intermediate road waypoints for polyline mapping simulation.
 */
export function generateRouteWaypoints(start: GeoLocation, end: GeoLocation, stepsCount = 10): GeoLocation[] {
  const waypoints: GeoLocation[] = [start];
  for (let i = 1; i < stepsCount; i++) {
    const fraction = i / stepsCount;
    // Add subtle curvature to simulate road network
    const curveOffset = Math.sin(fraction * Math.PI) * 0.003;
    const lat = start.lat + (end.lat - start.lat) * fraction + curveOffset;
    const lng = start.lng + (end.lng - start.lng) * fraction + curveOffset;
    waypoints.push({
      lat: Number(lat.toFixed(6)),
      lng: Number(lng.toFixed(6)),
      address: `Road segment ${i}`
    });
  }
  waypoints.push(end);
  return waypoints;
}

/**
 * Vehicle Selection & Candidate Scoring Algorithm
 * Enforces hard clinical constraints:
 * 1. Must be ONLINE and AVAILABLE.
 * 2. If critical emergency, MUST be AMBULANCE_ALS or AMBULANCE_BLS (never standard taxi).
 * 3. Ranks candidates by capability tier, road ETA, and distance.
 */
export function rankEligibleVehicles(
  vehicles: Vehicle[],
  pickup: GeoLocation,
  urgency: IncidentUrgency,
  preferredType?: string
): DispatchScoreCandidate[] {
  const candidates: DispatchScoreCandidate[] = [];

  for (const v of vehicles) {
    const reasons: string[] = [];

    // HARD CONSTRAINT 1: Status check
    if (v.status !== 'AVAILABLE') {
      continue;
    }

    // HARD CONSTRAINT 2: Capability check for critical emergencies
    if (urgency === 'critical') {
      if (v.capability !== 'AMBULANCE_ALS' && v.capability !== 'AMBULANCE_BLS') {
        continue; // Taxis and standard vans prohibited for life-threatening trauma
      }
    }

    const { roadDistanceKm, etaMinutes } = calculateRoadTravelMetrics(v.currentLocation, pickup);

    // Scoring formula
    let score = 100;

    // Capability score
    if (urgency === 'critical') {
      if (v.capability === 'AMBULANCE_ALS') {
        score += 40;
        reasons.push('Advanced Life Support (ALS) with ventilator and trauma kit');
      } else {
        score += 20;
        reasons.push('Basic Life Support (BLS) equipped');
      }
    } else if (preferredType && v.capability === preferredType) {
      score += 25;
      reasons.push(`Matches requested transport type: ${v.capability}`);
    }

    // Distance & ETA penalty (faster arrival scores higher)
    score -= etaMinutes * 3;
    score -= roadDistanceKm * 1.5;

    reasons.push(`Estimated road response: ${etaMinutes} mins (${roadDistanceKm} km away)`);

    candidates.push({
      vehicle: v,
      roadDistanceKm,
      etaMinutes,
      score: Number(score.toFixed(1)),
      reasons
    });
  }

  // Sort descending by score
  return candidates.sort((a, b) => b.score - a.score);
}
