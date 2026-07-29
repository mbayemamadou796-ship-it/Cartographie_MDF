import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import { Member } from '../../types';
import { Maximize2 } from 'lucide-react';

interface InteractiveMapProps {
  members: Member[];
  selectedMemberId: string | null;
  onSelectMember: (member: Member) => void;
  onOpenDetailsModal: (member: Member) => void;
}

export const InteractiveMap: React.FC<InteractiveMapProps> = ({
  members,
  selectedMemberId,
  onSelectMember,
  onOpenDetailsModal
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const markersRef = useRef<Map<string, L.Marker>>(new Map());

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    // Default center on France
    const map = L.map(mapContainerRef.current, {
      center: [46.603354, 1.888334],
      zoom: 6,
      zoomControl: false,
      attributionControl: false
    });

    // Custom Zoom control at top right
    L.control.zoom({ position: 'topright' }).addTo(map);

    // CartoDB Voyager / Light tiles for fresh, readable map display
    L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
      maxZoom: 19,
      subdomains: 'abcd'
    }).addTo(map);

    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

  // Update Markers when members change
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    // Clear existing markers
    markersRef.current.forEach((marker) => marker.remove());
    markersRef.current.clear();

    if (members.length === 0) return;

    const bounds = L.latLngBounds([]);

    members.forEach((member) => {
      const isSelected = member.id === selectedMemberId;

      // Custom HTML Marker Icon matching Mbok de France leaf green
      const customHtml = `
        <div class="relative flex items-center justify-center transition-all duration-300 transform ${
          isSelected ? 'scale-125 z-50' : 'hover:scale-110'
        }">
          <div class="relative flex items-center justify-center w-10 h-10 rounded-full shadow-lg border-2 ${
            isSelected
              ? 'bg-[#3fb222] border-white text-white ring-4 ring-[#3fb222]/40'
              : 'bg-white border-[#3fb222] text-[#2b7e16] ring-2 ring-[#3fb222]/20 hover:bg-[#3fb222] hover:text-white'
          }">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path>
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path>
            </svg>
          </div>
          <div class="absolute -bottom-1 w-2 h-2 ${isSelected ? 'bg-[#3fb222]' : 'bg-white border-b border-r border-[#3fb222]'} rotate-45"></div>
        </div>
      `;

      const customIcon = L.divIcon({
        html: customHtml,
        className: 'custom-leaflet-marker',
        iconSize: [40, 40],
        iconAnchor: [20, 40],
        popupAnchor: [0, -42]
      });

      const marker = L.marker([member.latitude, member.longitude], { icon: customIcon });

      // Build popup HTML
      const popupHtml = document.createElement('div');
      popupHtml.className = 'p-1 font-sans text-slate-800';
      popupHtml.innerHTML = `
        <div class="flex items-center gap-3 mb-2">
          ${
            member.photo
              ? `<img src="${member.photo}" alt="${member.nom}" class="w-12 h-12 rounded-full object-cover border-2 border-[#3fb222] shadow-sm" />`
              : `<div class="w-12 h-12 rounded-full bg-[#3fb222]/15 text-[#2a6816] flex items-center justify-center font-bold text-base border border-[#3fb222]/30">
                  ${(member.prenom?.[0] || '').toUpperCase()}${(member.nom?.[0] || '').toUpperCase()}
                </div>`
          }
          <div>
            <h4 class="font-bold text-sm text-slate-900 leading-tight">${member.prenom} ${member.nom}</h4>
            <p class="text-xs text-[#2b7e16] font-bold mt-0.5">${member.fonction}</p>
            <p class="text-xs text-slate-500">${member.organisation}</p>
          </div>
        </div>
        
        <div class="text-xs text-slate-700 space-y-1 my-2 bg-emerald-50/80 p-2 rounded-lg border border-emerald-200">
          <div class="flex items-center gap-1.5">
            <span class="font-semibold text-emerald-800">📍 Ville:</span> ${member.ville} (${member.codePostal || ''})
          </div>
          ${
            member.telephone
              ? `<div class="flex items-center gap-1.5"><span class="font-semibold text-emerald-800">📞 Tél:</span> ${member.telephone}</div>`
              : ''
          }
          ${
            member.email
              ? `<div class="flex items-center gap-1.5 truncate"><span class="font-semibold text-emerald-800">✉️ Email:</span> ${member.email}</div>`
              : ''
          }
        </div>

        <button id="btn-popup-details-${member.id}" class="w-full mt-2 inline-flex items-center justify-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-[#2be39d] via-[#48c92a] to-[#8de02d] text-emerald-950 rounded-lg text-xs font-bold hover:brightness-105 transition-all shadow-xs">
          <span>Voir la fiche complète</span>
          <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path></svg>
        </button>
      `;

      marker.bindPopup(popupHtml, { maxWidth: 280, className: 'mdf-map-popup-light' });

      marker.on('click', () => {
        onSelectMember(member);
      });

      marker.on('popupopen', () => {
        const btn = document.getElementById(`btn-popup-details-${member.id}`);
        if (btn) {
          btn.onclick = () => {
            onOpenDetailsModal(member);
          };
        }
      });

      marker.addTo(map);
      markersRef.current.set(member.id, marker);
      bounds.extend([member.latitude, member.longitude]);
    });

    // Auto-fit map bounds if no specific member is selected
    if (!selectedMemberId && bounds.isValid()) {
      map.fitBounds(bounds, { padding: [50, 50], maxZoom: 13 });
    }
  }, [members, selectedMemberId]);

  // Center on selected member
  useEffect(() => {
    if (!selectedMemberId || !mapRef.current) return;

    const selectedMember = members.find((m) => m.id === selectedMemberId);
    if (selectedMember) {
      const map = mapRef.current;
      map.flyTo([selectedMember.latitude, selectedMember.longitude], 12, {
        duration: 1.2
      });

      const marker = markersRef.current.get(selectedMemberId);
      if (marker) {
        setTimeout(() => {
          marker.openPopup();
        }, 800);
      }
    }
  }, [selectedMemberId, members]);

  // Reset View to France
  const handleResetFranceView = () => {
    if (mapRef.current) {
      if (members.length > 0) {
        const bounds = L.latLngBounds(members.map((m) => [m.latitude, m.longitude]));
        mapRef.current.fitBounds(bounds, { padding: [50, 50], maxZoom: 13 });
      } else {
        mapRef.current.setView([46.603354, 1.888334], 6);
      }
    }
  };

  return (
    <div className="relative w-full h-full min-h-[380px] lg:min-h-[440px] rounded-3xl overflow-hidden shadow-sm border border-emerald-200 bg-white">
      <div ref={mapContainerRef} className="w-full h-full z-0 min-h-[380px] lg:min-h-[440px]" />

      {/* Recenter Button */}
      <div className="absolute bottom-4 left-4 z-10">
        <button
          onClick={handleResetFranceView}
          className="inline-flex items-center gap-2 px-3.5 py-2 bg-white/95 backdrop-blur text-slate-700 hover:text-emerald-800 text-xs font-semibold rounded-xl shadow-md border border-emerald-200 hover:border-emerald-400 transition-all active:scale-95"
          title="Recentrer la carte"
        >
          <Maximize2 className="w-3.5 h-3.5 text-emerald-600" />
          <span className="hidden sm:inline">Recentrer sur la France</span>
        </button>
      </div>

      {/* Legend Badge */}
      <div className="absolute top-4 left-4 z-10 bg-white/95 backdrop-blur px-3 py-1.5 rounded-xl shadow-md border border-emerald-200 flex items-center gap-2 text-xs font-semibold text-slate-800">
        <span className="relative flex h-2.5 w-2.5">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-500 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-600"></span>
        </span>
        <span>{members.length} marqueur{members.length > 1 ? 's' : ''} sur la carte</span>
      </div>
    </div>
  );
};
