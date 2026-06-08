/// <reference types="google.maps" />
import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Utensils, Palette, ShoppingCart, MapPin, Star, Navigation, Users, Search, X } from "lucide-react";
import MobileLayout from "@/components/MobileLayout";
import { type Place } from "@/data/places";
import { useResolvedPlaces, type ResolvedPlace } from "@/hooks/useResolvedPlaces";

const categories = [
  { icon: Utensils, label: "Food", filter: (p: Place) => p.category === "Restaurant" },
  { icon: Palette, label: "Activities", filter: (p: Place) => p.category === "Activity" },
  { icon: ShoppingCart, label: "Groceries", filter: (p: Place) => p.category === "Groceries" },
];

const DURHAM_CENTER = { lat: 36.0014, lng: -78.9185 };

const MapScreen = () => {
  const navigate = useNavigate();
  const mapElementRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<google.maps.Map | null>(null);
  const markersRef = useRef<google.maps.Marker[]>([]);

  const [activeFilter, setActiveFilter] = useState<string | null>(null);
  const [selectedPlace, setSelectedPlace] = useState<ResolvedPlace | null>(null);
  const [mapReady, setMapReady] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchFocused, setSearchFocused] = useState(false);

  // ── Initialize Google Map ──
  useEffect(() => {
    if (!mapElementRef.current || mapRef.current) return;

    const map = new google.maps.Map(mapElementRef.current, {
      center: DURHAM_CENTER,
      zoom: 13,
      disableDefaultUI: true,
      zoomControl: true,
      zoomControlOptions: { position: google.maps.ControlPosition.RIGHT_BOTTOM },
      styles: [
        { featureType: "poi", elementType: "labels", stylers: [{ visibility: "off" }] },
        { featureType: "transit", stylers: [{ visibility: "off" }] },
      ],
    });

    mapRef.current = map;
    map.addListener("click", () => setSelectedPlace(null));
    setMapReady(true);

    return () => {
      mapRef.current = null;
    };
  }, []);

  // Resolve places via Google Places API
  const { resolved, loading } = useResolvedPlaces(mapRef as React.RefObject<google.maps.Map | null>, mapReady);

  // Autocomplete suggestions (top 5 matches)
  const suggestions = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const q = searchQuery.toLowerCase().trim();
    return resolved
      .filter((p) =>
        p.name.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q) ||
        p.subcategory.toLowerCase().includes(q) ||
        p.tags.some((t) => t.toLowerCase().includes(q))
      )
      .slice(0, 5);
  }, [searchQuery, resolved]);

  const filtered = useMemo(() => {
    let results = resolved;
    if (activeFilter) {
      const cat = categories.find((c) => c.label === activeFilter);
      if (cat) results = results.filter(cat.filter);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      results = results.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q) ||
          p.subcategory.toLowerCase().includes(q) ||
          p.tags.some((t) => t.toLowerCase().includes(q))
      );
    }
    return results;
  }, [activeFilter, resolved, searchQuery]);

  // ── Render markers ──
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    markersRef.current.forEach((m) => m.setMap(null));
    markersRef.current = [];

    filtered.forEach((place) => {
      const isSelected = selectedPlace?.slug === place.slug;

      // Category-based pin colors
      const pinColor = place.category === "Restaurant" || place.category === "Bakery"
        ? "#E88D7A"   // Coral – Food
        : place.category === "Groceries"
        ? "#6BAF92"   // Green – Groceries
        : "#F5C451";  // Yellow – Activities / Kid-friendly

      const pinSvg = `
        <svg xmlns="http://www.w3.org/2000/svg" width="32" height="42" viewBox="0 0 32 42">
          <path d="M16 0C7.16 0 0 7.16 0 16c0 12 16 26 16 26s16-14 16-26C32 7.16 24.84 0 16 0z" fill="${pinColor}" stroke="white" stroke-width="2"/>
          <circle cx="16" cy="16" r="6" fill="white"/>
        </svg>
      `;

      const marker = new google.maps.Marker({
        map,
        position: { lat: place.resolvedLat, lng: place.resolvedLng },
        title: place.name,
        icon: {
          url: `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(pinSvg)}`,
          scaledSize: new google.maps.Size(isSelected ? 44 : 32, isSelected ? 56 : 42),
          anchor: new google.maps.Point(isSelected ? 22 : 16, isSelected ? 56 : 42),
        },
        zIndex: isSelected ? 999 : 1,
      });

      marker.addListener("click", () => {
        setSelectedPlace((prev) => (prev?.slug === place.slug ? null : place));
        map.panTo({ lat: place.resolvedLat, lng: place.resolvedLng });
        map.setZoom(Math.max(map.getZoom() || 13, 14));
      });

      markersRef.current.push(marker);
    });
  }, [filtered, selectedPlace]);

  const handleFilterClick = (label: string) => {
    setActiveFilter((prev) => (prev === label ? null : label));
    setSelectedPlace(null);
  };

  return (
    <MobileLayout>
      <div className="relative h-[calc(100dvh-72px)]">
        <div ref={mapElementRef} className="absolute inset-0 z-0" />

        {/* Loading indicator */}
        {loading && (
          <div className="absolute top-14 left-1/2 -translate-x-1/2 z-10 bg-card px-4 py-2 rounded-full shadow-md flex items-center gap-2">
            <span className="w-3 h-3 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            <span className="text-[12px] text-muted-foreground">Loading places...</span>
          </div>
        )}

        {/* Search bar + Category filters */}
        <div className="absolute top-4 left-0 right-0 px-4 z-10 flex flex-col gap-2">
          {/* Search bar */}
          <div className="relative">
            <div
              className="flex items-center bg-card rounded-full h-[40px] px-3 gap-2"
              style={{ boxShadow: "0 2px 8px rgba(0,0,0,0.1)" }}
            >
              <Search size={16} className="text-muted-foreground shrink-0" />
              <input
                type="text"
                placeholder="Search places, cuisines, activities..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => setSearchFocused(true)}
                onBlur={() => setTimeout(() => setSearchFocused(false), 150)}
                className="flex-1 bg-transparent text-[13px] text-foreground placeholder:text-muted-foreground outline-none"
              />
              {searchQuery && (
                <button onClick={() => setSearchQuery("")} className="text-muted-foreground">
                  <X size={14} />
                </button>
              )}
            </div>

            {/* Autocomplete dropdown */}
            <AnimatePresence>
              {searchFocused && searchQuery.trim().length > 0 && suggestions.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  className="absolute top-[44px] left-0 right-0 bg-card rounded-xl overflow-hidden max-h-[220px] overflow-y-auto"
                  style={{ boxShadow: "0 4px 16px rgba(0,0,0,0.12)" }}
                >
                  {suggestions.map((place) => (
                    <button
                      key={place.slug}
                      onMouseDown={() => {
                        setSelectedPlace(place);
                        setSearchQuery(place.name);
                        setSearchFocused(false);
                        const map = mapRef.current;
                        if (map) {
                          map.panTo({ lat: place.resolvedLat, lng: place.resolvedLng });
                          map.setZoom(Math.max(map.getZoom() || 13, 15));
                        }
                      }}
                      className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-muted/60 transition-colors text-left"
                    >
                      {place.photoUrl ? (
                        <img src={place.photoUrl} alt="" className="w-9 h-9 rounded-lg object-cover shrink-0" />
                      ) : (
                        <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                          <MapPin size={14} className="text-primary" />
                        </div>
                      )}
                      <div className="min-w-0 flex-1">
                        <p className="text-[13px] font-medium text-foreground truncate">{place.name}</p>
                        <p className="text-[11px] text-muted-foreground truncate">{place.subcategory}{place.distance && ` · ${place.distance}`}</p>
                      </div>
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Category chips */}
          <div className="flex gap-2 overflow-x-auto hide-scrollbar">
            {categories.map((cat) => (
              <motion.button
                key={cat.label}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleFilterClick(cat.label)}
                className={`flex items-center gap-1.5 h-[36px] px-4 rounded-full shrink-0 text-[13px] font-medium transition-all duration-200 ${
                  activeFilter === cat.label ? "bg-primary text-primary-foreground" : "bg-card text-foreground"
                }`}
                style={{ boxShadow: "0 2px 8px rgba(0,0,0,0.1)" }}
              >
                <cat.icon size={14} />
                {cat.label}
              </motion.button>
            ))}
          </div>
        </div>

        {/* Bottom detail card */}
        <div className="absolute bottom-4 left-4 right-4 z-10">
          <AnimatePresence mode="wait">
            {selectedPlace ? (
              <motion.div
                key={selectedPlace.slug}
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: 20, opacity: 0 }}
                className="bg-card rounded-2xl overflow-hidden"
                style={{ boxShadow: "0 4px 20px rgba(0,0,0,0.12)" }}
              >
                {/* Google photo */}
                {selectedPlace.photoUrl && (
                  <div className="h-[120px] w-full overflow-hidden">
                    <img src={selectedPlace.photoUrl} alt={selectedPlace.name} className="w-full h-full object-cover" />
                  </div>
                )}

                <div className="p-4">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <h3 className="text-[16px] font-semibold text-foreground truncate">{selectedPlace.name}</h3>
                      <p className="text-[12px] text-muted-foreground mt-0.5">
                        {selectedPlace.subcategory}
                        {selectedPlace.priceLevel && ` · ${selectedPlace.priceLevel}`}
                        {selectedPlace.distance && ` · ${selectedPlace.distance}`}
                      </p>
                    </div>
                  </div>

                  {/* Ratings & family count */}
                  <div className="flex items-center gap-4 mt-2">
                    <div className="flex items-center gap-1">
                      <Star size={13} fill="hsl(var(--harper-yellow))" color="hsl(var(--harper-yellow))" />
                      <span className="text-[13px] font-semibold text-foreground">
                        {selectedPlace.googleRating ?? selectedPlace.rating}
                      </span>
                      {selectedPlace.googleTotalRatings && (
                        <span className="text-[11px] text-muted-foreground">({selectedPlace.googleTotalRatings})</span>
                      )}
                    </div>
                    {selectedPlace.openNow !== undefined && (
                      <span className={`text-[12px] font-medium ${selectedPlace.openNow ? "text-green-600" : "text-red-500"}`}>
                        {selectedPlace.openNow ? "Open now" : "Closed"}
                      </span>
                    )}
                    <div className="flex items-center gap-1">
                      <Users size={12} className="text-muted-foreground" />
                      <span className="text-[12px] text-muted-foreground">{selectedPlace.familyCount} families</span>
                    </div>
                  </div>

                  {/* Tags */}
                  {selectedPlace.tags.length > 0 && (
                    <div className="flex gap-1.5 mt-2.5 overflow-x-auto hide-scrollbar">
                      {selectedPlace.tags.slice(0, 3).map((tag) => (
                        <span key={tag} className="text-[10px] font-medium text-primary bg-primary/10 px-2 py-0.5 rounded-full shrink-0">
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Preview review */}
                  {selectedPlace.reviews.length > 0 && (
                    <div className="mt-2.5 p-2.5 bg-muted/50 rounded-xl">
                      <p className="text-[12px] text-foreground/70 leading-relaxed line-clamp-2">
                        "{selectedPlace.reviews[0].text}"
                      </p>
                      <p className="text-[11px] text-muted-foreground mt-1">
                        — {selectedPlace.reviews[0].name}, {selectedPlace.reviews[0].relation}
                      </p>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex gap-2 mt-3">
                    <motion.button
                      whileTap={{ scale: 0.96 }}
                      onClick={() => navigate(`/place/${selectedPlace.slug}`)}
                      className="flex-1 h-[38px] bg-primary text-primary-foreground rounded-xl flex items-center justify-center gap-1.5 text-[13px] font-semibold"
                    >
                      <MapPin size={14} />
                      View Details
                    </motion.button>
                    <motion.button
                      whileTap={{ scale: 0.96 }}
                      onClick={() => {
                        const url = selectedPlace.placeId
                          ? `https://www.google.com/maps/place/?q=place_id:${selectedPlace.placeId}`
                          : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(selectedPlace.name + " " + selectedPlace.address)}`;
                        window.open(url, "_blank");
                      }}
                      className="h-[38px] px-4 bg-muted text-foreground rounded-xl flex items-center justify-center gap-1.5 text-[13px] font-medium"
                    >
                      <Navigation size={14} className="text-primary" />
                      Directions
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="default"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="bg-card rounded-2xl p-4 flex items-center gap-3"
                style={{ boxShadow: "0 4px 20px rgba(0,0,0,0.12)" }}
              >
                <MapPin size={20} className="text-primary shrink-0" />
                <div>
                  <p className="text-[14px] font-semibold text-foreground">Tap a pin to view details</p>
                  <p className="text-[12px] text-muted-foreground">
                    {filtered.length} locations in Durham
                    {activeFilter && ` · Showing ${activeFilter}`}
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </MobileLayout>
  );
};

export default MapScreen;
