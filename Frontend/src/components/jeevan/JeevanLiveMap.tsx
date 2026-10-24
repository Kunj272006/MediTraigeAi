import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import type { GeoLocation, Hospital, Vehicle } from '../../types/jeevan';

interface JeevanLiveMapProps {
  userLocation?: GeoLocation;
  destinationLocation?: GeoLocation;
  vehicles?: Vehicle[];
  hospitals?: Hospital[];
  selectedVehicle?: Vehicle;
  assignedHospital?: Hospital;
  routeCoordinates?: [number, number][];
  className?: string;
  zoom?: number;
}

export const JeevanLiveMap: React.FC<JeevanLiveMapProps> = ({
  userLocation,
  destinationLocation,
  vehicles = [],
  hospitals = [],
  selectedVehicle,
  assignedHospital,
  routeCoordinates,
  className = 'h-96 w-full rounded-2xl overflow-hidden shadow-2xl border border-slate-700/50',
  zoom = 13,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const layerGroupRef = useRef<L.LayerGroup | null>(null);

  // Default fallback center: AIIMS New Delhi / National Capital Region
  const defaultCenter: [number, number] = [28.5672, 77.2100];
  const centerLat = userLocation?.lat ?? defaultCenter[0];
  const centerLng = userLocation?.lng ?? defaultCenter[1];

  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        center: [centerLat, centerLng],
        zoom: zoom,
        zoomControl: true,
      });

      // CartoDB Dark Matter / Positron or OSM standard
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors | Jeevan AI GIS',
        maxZoom: 19,
      }).addTo(map);

      layerGroupRef.current = L.layerGroup().addTo(map);
      mapInstanceRef.current = map;
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Update markers, routes and bounds when props change
  useEffect(() => {
    const map = mapInstanceRef.current;
    const layerGroup = layerGroupRef.current;
    if (!map || !layerGroup) return;

    layerGroup.clearLayers();
    const boundsPoints: [number, number][] = [];

    // 1. User / Patient Pickup Location Marker
    if (userLocation && userLocation.lat && userLocation.lng) {
      boundsPoints.push([userLocation.lat, userLocation.lng]);
      const userIcon = L.divIcon({
        className: 'custom-user-icon',
        html: `
          <div class="relative flex items-center justify-center">
            <span class="animate-ping absolute inline-flex h-8 w-8 rounded-full bg-red-400 opacity-75"></span>
            <div class="relative w-7 h-7 bg-red-600 border-2 border-white rounded-full flex items-center justify-center shadow-lg text-white font-bold text-xs">
              SOS
            </div>
          </div>
        `,
        iconSize: [28, 28],
        iconAnchor: [14, 14],
      });

      const userMarker = L.marker([userLocation.lat, userLocation.lng], { icon: userIcon });
      userMarker.bindPopup(`
        <div class="p-2 text-slate-900">
          <strong class="text-red-600 block text-sm font-bold">🚨 PATIENT PICKUP LOCATION</strong>
          <p class="text-xs text-slate-700 mt-1">${userLocation.address || userLocation.landmark || 'GPS Coordinates verified'}</p>
          <span class="text-[10px] text-slate-400 block mt-1">${userLocation.lat.toFixed(4)}, ${userLocation.lng.toFixed(4)}</span>
        </div>
      `);
      layerGroup.addLayer(userMarker);
    }

    // 2. Destination / Hospital Location Marker
    const targetHospital = assignedHospital || hospitals[0];
    if (targetHospital) {
      boundsPoints.push([targetHospital.location.lat, targetHospital.location.lng]);
      const hospIcon = L.divIcon({
        className: 'custom-hosp-icon',
        html: `
          <div class="w-8 h-8 bg-blue-700 border-2 border-white rounded-xl shadow-lg flex items-center justify-center text-white font-black text-sm">
            🏥
          </div>
        `,
        iconSize: [32, 32],
        iconAnchor: [16, 16],
      });

      const hospMarker = L.marker([targetHospital.location.lat, targetHospital.location.lng], { icon: hospIcon });
      hospMarker.bindPopup(`
        <div class="p-2 text-slate-900">
          <strong class="text-blue-700 block text-sm font-bold">${targetHospital.name}</strong>
          <span class="inline-block bg-blue-100 text-blue-800 text-[10px] px-1.5 py-0.5 rounded font-semibold mt-1">Govt Trauma Center</span>
          <p class="text-xs text-slate-600 mt-1">Trauma Bays: <strong>${targetHospital.traumaBaysAvailable}</strong> | Available Beds: <strong>${targetHospital.availableBeds}</strong></p>
          <p class="text-[10px] text-slate-500 mt-1">${targetHospital.phone}</p>
        </div>
      `);
      layerGroup.addLayer(hospMarker);
    }

    // Other nearby hospitals
    hospitals.forEach((hosp) => {
      if (targetHospital && hosp.id === targetHospital.id) return;
      boundsPoints.push([hosp.location.lat, hosp.location.lng]);
      const smallHospIcon = L.divIcon({
        className: 'custom-small-hosp',
        html: `<div class="w-6 h-6 bg-slate-700 border border-white rounded-lg flex items-center justify-center text-xs shadow">🏥</div>`,
        iconSize: [24, 24],
        iconAnchor: [12, 12],
      });
      const m = L.marker([hosp.location.lat, hosp.location.lng], { icon: smallHospIcon });
      m.bindPopup(`<strong class="text-xs">${hosp.name}</strong><br/><span class="text-[10px] text-slate-500">${hosp.availableBeds} beds</span>`);
      layerGroup.addLayer(m);
    });

    // 3. Vehicles Markers (Active, En Route, Available)
    vehicles.forEach((veh) => {
      const isSelected = selectedVehicle?.id === veh.id;
      boundsPoints.push([veh.currentLocation.lat, veh.currentLocation.lng]);

      const isALS = veh.capability === 'ALS';
      const badgeBg = isSelected
        ? 'bg-amber-500 ring-4 ring-amber-300'
        : veh.status === 'AVAILABLE'
        ? 'bg-emerald-600'
        : 'bg-indigo-600';

      const vehIcon = L.divIcon({
        className: 'custom-veh-icon',
        html: `
          <div class="flex flex-col items-center">
            <div class="w-8 h-8 ${badgeBg} border-2 border-white rounded-full flex items-center justify-center text-white shadow-xl text-xs font-bold transition-transform hover:scale-110">
              🚑
            </div>
            <span class="bg-slate-900/90 text-white font-mono text-[9px] px-1 rounded shadow mt-0.5 whitespace-nowrap">
              ${veh.callSign}
            </span>
          </div>
        `,
        iconSize: [36, 46],
        iconAnchor: [18, 23],
      });

      const vehMarker = L.marker([veh.currentLocation.lat, veh.currentLocation.lng], { icon: vehIcon });
      vehMarker.bindPopup(`
        <div class="p-2 text-slate-900 min-w-[180px]">
          <div class="flex justify-between items-center">
            <strong class="text-sm font-bold">${veh.callSign}</strong>
            <span class="text-[10px] font-bold px-1.5 py-0.5 rounded ${isALS ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'}">
              ${veh.capability}
            </span>
          </div>
          <p class="text-xs text-slate-600 mt-1">Driver: <strong>${veh.driverName}</strong></p>
          <p class="text-xs text-slate-600">Contact: <a href="tel:${veh.driverPhone}" class="text-blue-600 underline">${veh.driverPhone}</a></p>
          <div class="mt-2 text-[10px] bg-slate-100 rounded p-1 text-slate-700">
            Status: <span class="font-semibold text-emerald-700">${veh.status}</span>
          </div>
        </div>
      `);
      layerGroup.addLayer(vehMarker);
    });

    // 4. Route Polyline
    if (routeCoordinates && routeCoordinates.length > 1) {
      const polyline = L.polyline(routeCoordinates, {
        color: '#ef4444',
        weight: 5,
        opacity: 0.85,
        dashArray: '10, 8',
      });
      layerGroup.addLayer(polyline);
    } else if (selectedVehicle && userLocation) {
      // Connect ambulance to patient
      const connectionLine = L.polyline(
        [
          [selectedVehicle.currentLocation.lat, selectedVehicle.currentLocation.lng],
          [userLocation.lat, userLocation.lng],
        ],
        {
          color: '#3b82f6',
          weight: 4,
          opacity: 0.8,
          dashArray: '8, 8',
        }
      );
      layerGroup.addLayer(connectionLine);
    }

    // Auto-fit bounds if we have points
    if (boundsPoints.length > 1) {
      map.fitBounds(L.latLngBounds(boundsPoints), { padding: [40, 40], maxZoom: 15 });
    } else if (boundsPoints.length === 1) {
      map.setView(boundsPoints[0], zoom);
    }
  }, [userLocation, destinationLocation, vehicles, hospitals, selectedVehicle, assignedHospital, routeCoordinates, zoom]);

  return (
    <div className="relative group">
      <div ref={mapContainerRef} className={className} style={{ minHeight: '340px' }} />
      <div className="absolute top-3 right-3 bg-slate-900/80 backdrop-blur-md px-3 py-1.5 rounded-lg border border-slate-700 text-white text-xs flex items-center gap-2 pointer-events-none z-[1000]">
        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
        <span className="font-medium">Live Telemetry & Road Routing</span>
      </div>
    </div>
  );
};
