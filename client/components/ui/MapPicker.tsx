"use client";

import { useEffect, useState, useRef } from "react";
import { MapContainer, TileLayer, Marker, useMap, useMapEvents } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { Search } from "lucide-react";
import { Input } from "./input";
import { Button } from "./button";

// Fix for default Leaflet icon paths in Next.js
const DefaultIcon = L.icon({
  iconUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});
L.Marker.prototype.options.icon = DefaultIcon;

interface MapPickerProps {
  initialPosition?: { lat: number; lng: number };
  onLocationSelect: (lat: number, lng: number, addressText: string) => void;
}

// Component to handle map clicks
const MapEvents = ({ setPosition, fetchAddress }: { setPosition: (pos: L.LatLng) => void, fetchAddress: (lat: number, lng: number) => void }) => {
  useMapEvents({
    click(e) {
      setPosition(e.latlng);
      fetchAddress(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
};

// Component to center map when position changes
const MapCenter = ({ position }: { position: L.LatLngExpression | null }) => {
  const map = useMap();
  useEffect(() => {
    if (position) {
      map.flyTo(position, map.getZoom());
    }
  }, [position, map]);
  return null;
};

export default function MapPicker({ initialPosition, onLocationSelect }: MapPickerProps) {
  const defaultCenter = { lat: 28.6139, lng: 77.2090 }; // New Delhi default
  const [position, setPosition] = useState<L.LatLngExpression | null>(initialPosition || defaultCenter);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);

  const fetchAddress = async (lat: number, lng: number) => {
    try {
      const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`);
      const data = await response.json();
      if (data && data.display_name) {
        onLocationSelect(lat, lng, data.display_name);
      }
    } catch (error) {
      console.error("Error fetching address:", error);
    }
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    
    setIsSearching(true);
    try {
      const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}&limit=1`);
      const data = await response.json();
      if (data && data.length > 0) {
        const newLat = parseFloat(data[0].lat);
        const newLng = parseFloat(data[0].lon);
        setPosition({ lat: newLat, lng: newLng });
        onLocationSelect(newLat, newLng, data[0].display_name);
      } else {
        alert("Location not found. Please try a different search term.");
      }
    } catch (error) {
      console.error("Search error:", error);
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <div className="space-y-4">
      <form onSubmit={handleSearch} className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search for a location..."
            className="pl-9"
          />
        </div>
        <Button type="submit" disabled={isSearching}>
          {isSearching ? "Searching..." : "Search"}
        </Button>
      </form>

      <div className="h-[300px] sm:h-[400px] w-full rounded-xl overflow-hidden border border-border/50 shadow-sm relative z-0">
        <MapContainer 
          center={position || defaultCenter} 
          zoom={15} 
          scrollWheelZoom={true} 
          style={{ height: "100%", width: "100%", zIndex: 0 }}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          {position && <Marker position={position} />}
          <MapEvents setPosition={setPosition} fetchAddress={fetchAddress} />
          <MapCenter position={position} />
        </MapContainer>
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-background/90 backdrop-blur-sm px-4 py-2 rounded-full text-sm font-medium shadow-lg pointer-events-none border border-border/50 z-[1000]">
          Click on the map to drop a pin
        </div>
      </div>
    </div>
  );
}
