import React, { useState } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet';
import L from 'leaflet';
import { Search, MapPin, Layers, ExternalLink } from 'lucide-react';

import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

function LocationMarker({ lat, lng, onLocationSelect }) {
  const map = useMap();

  useMapEvents({
    click(e) {
      onLocationSelect(e.latlng.lat, e.latlng.lng);
    },
  });

  React.useEffect(() => {
    if (lat && lng) {
      map.flyTo([lat, lng], 17); // Deep zoom for rooftop precision
    }
  }, [lat, lng, map]);

  return lat && lng ? (
    <Marker 
      position={[lat, lng]} 
      draggable={true}
      eventHandlers={{
        dragend(e) {
          const marker = e.target;
          const position = marker.getLatLng();
          onLocationSelect(position.lat, position.lng);
        }
      }}
    />
  ) : null;
}

export default function MapLocationPicker({ lat, lng, onLocationSelect }) {
  const [searchAddress, setSearchAddress] = useState('');
  const [googleMapsLink, setGoogleMapsLink] = useState('');
  const [mapType, setMapType] = useState('satellite'); // 'street' or 'satellite'
  const [searching, setSearching] = useState(false);
  const [searchError, setSearchError] = useState('');

  const currentLat = parseFloat(lat) || 18.5204;
  const currentLng = parseFloat(lng) || 73.8567;

  // 1. Search Address via OpenStreetMap Nominatim
  const handleAddressSearch = async (e) => {
    if (e) e.preventDefault();
    if (!searchAddress.trim()) return;
    
    setSearching(true);
    setSearchError('');
    
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchAddress)}`);
      const data = await res.json();
      setSearching(false);

      if (data && data.length > 0) {
        const foundLat = parseFloat(data[0].lat);
        const foundLng = parseFloat(data[0].lon);
        onLocationSelect(foundLat, foundLng);
      } else {
        setSearchError('Address not found on map. Try searching by landmark or city name.');
      }
    } catch (err) {
      setSearching(false);
      setSearchError('Error searching address.');
    }
  };

  // 2. Extract coordinates from pasted Google Maps link or coordinates string
  const handleGoogleMapsLinkExtract = (e) => {
    const text = e.target.value;
    setGoogleMapsLink(text);
    setSearchError('');

    if (!text.trim()) return;

    // Check pattern @lat,lng or q=lat,lng or direct numbers
    const coordRegex = /@(-?\d+\.\d+),(-?\d+\.\d+)|q=(-?\d+\.\d+),(-?\d+\.\d+)|(-?\d+\.\d+),\s*(-?\d+\.\d+)/;
    const match = text.match(coordRegex);

    if (match) {
      const foundLat = parseFloat(match[1] || match[3] || match[5]);
      const foundLng = parseFloat(match[2] || match[4] || match[6]);
      if (!isNaN(foundLat) && !isNaN(foundLng)) {
        onLocationSelect(foundLat, foundLng);
        return;
      }
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddressSearch();
    }
  };

  return (
    <div className="space-y-3">
      
      {/* GOOGLE MAPS LINK PASTE OR SEARCH BAR */}
      <div className="space-y-2">
        <div>
          <label className="block text-[11px] font-bold text-brand-600 dark:text-brand-400 mb-1">
            🔗 Option A: Paste Google Maps Link or Drop Pin (Easiest & Most Accurate)
          </label>
          <input
            type="text"
            placeholder="Paste Google Maps URL e.g. https://maps.app.goo.gl/..."
            value={googleMapsLink}
            onChange={handleGoogleMapsLinkExtract}
            className="w-full p-2.5 bg-accent-50/50 dark:bg-brand-950 border border-accent-200 dark:border-brand-800 rounded-xl text-xs font-medium text-brand-900 dark:text-brand-50"
          />
        </div>

        <div>
          <label className="block text-[11px] font-bold text-brand-600 dark:text-brand-400 mb-1">
            🔍 Option B: Search Landmark or Street Name
          </label>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <input
                type="text"
                placeholder="Search landmark e.g. MG Road, Bandra West, Mumbai"
                value={searchAddress}
                onChange={(e) => setSearchAddress(e.target.value)}
                onKeyDown={handleKeyDown}
                className="w-full pl-9 pr-3 py-2 bg-white dark:bg-brand-900 border border-brand-200 dark:border-brand-800 rounded-xl text-xs font-medium text-brand-900 dark:text-brand-50"
              />
              <MapPin className="w-4 h-4 text-brand-400 absolute left-3 top-2.5" />
            </div>
            <button
              type="button"
              onClick={handleAddressSearch}
              disabled={searching}
              className="px-4 py-2 bg-accent-500 hover:bg-accent-600 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-sm"
            >
              <Search className="w-3.5 h-3.5" /> {searching ? 'Searching...' : 'Locate'}
            </button>
          </div>
        </div>
      </div>

      {searchError && <p className="text-[11px] text-red-500 font-bold">{searchError}</p>}

      {/* MAP VIEW SWITCHER HEADER */}
      <div className="flex justify-between items-center text-xs">
        <span className="font-bold text-brand-600 dark:text-brand-400 flex items-center gap-1">
          <MapPin className="w-3.5 h-3.5 text-accent-500" /> Click or drag pin to exact rooftop
        </span>

        <button
          type="button"
          onClick={() => setMapType(mapType === 'satellite' ? 'street' : 'satellite')}
          className="px-3 py-1 bg-brand-900 text-white dark:bg-accent-600 rounded-lg text-[11px] font-bold flex items-center gap-1 shadow-sm"
        >
          <Layers className="w-3 h-3" /> {mapType === 'satellite' ? '🗺️ Switch to Street View' : '🛰️ Switch to Satellite View'}
        </button>
      </div>

      {/* INTERACTIVE HIGH-RESOLUTION SATELLITE & STREET MAP */}
      <div className="w-full h-72 rounded-2xl overflow-hidden border shadow-inner relative z-0">
        <MapContainer
          center={[currentLat, currentLng]}
          zoom={17}
          maxZoom={19}
          scrollWheelZoom={true}
          className="w-full h-full"
        >
          {mapType === 'satellite' ? (
            <TileLayer
              attribution='&copy; Esri World Imagery'
              url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
            />
          ) : (
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
          )}
          <LocationMarker 
            lat={currentLat} 
            lng={currentLng} 
            onLocationSelect={onLocationSelect} 
          />
        </MapContainer>
      </div>
    </div>
  );
}
