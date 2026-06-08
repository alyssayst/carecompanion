/// <reference types="google.maps" />

import { useEffect, useRef, useState } from "react";
import { places, type Place } from "@/data/places";

export interface ResolvedPlace extends Place {
  resolvedLat: number;
  resolvedLng: number;
  photoUrl: string | null;
  googleRating?: number;
  googleTotalRatings?: number;
  openNow?: boolean;
  placeId?: string;
}

// Cache resolved data in memory across renders
// Bump this to force a fresh re-resolve after changing matching logic.
const CACHE_VERSION = 2;
const resolvedCache = new Map<string, ResolvedPlace>();

const DURHAM_CENTER = { lat: 36.0014, lng: -78.9185 };
const DURHAM_RADIUS_METERS = 25_000;
const MAX_ACCEPTED_DISTANCE_METERS = 60_000;

function cacheKey(slug: string) {
  return `${CACHE_VERSION}:${slug}`;
}

function normalizeName(s: string) {
  return s
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function tokenOverlapScore(a: string, b: string) {
  const at = new Set(normalizeName(a).split(" ").filter(Boolean));
  const bt = new Set(normalizeName(b).split(" ").filter(Boolean));
  if (!at.size || !bt.size) return 0;
  let overlap = 0;
  at.forEach((t) => {
    if (bt.has(t)) overlap += 1;
  });
  return overlap / Math.max(at.size, bt.size);
}

function approxDistanceMeters(a: { lat: number; lng: number }, b: { lat: number; lng: number }) {
  // Haversine
  const R = 6371e3;
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const lat1 = toRad(a.lat);
  const lat2 = toRad(b.lat);
  const sinDLat = Math.sin(dLat / 2);
  const sinDLng = Math.sin(dLng / 2);
  const h = sinDLat * sinDLat + Math.cos(lat1) * Math.cos(lat2) * sinDLng * sinDLng;
  return 2 * R * Math.asin(Math.min(1, Math.sqrt(h)));
}

export function useResolvedPlaces(mapRef: React.RefObject<google.maps.Map | null>, mapReady: boolean) {
  const [resolved, setResolved] = useState<ResolvedPlace[]>([]);
  const [loading, setLoading] = useState(true);
  const serviceRef = useRef<google.maps.places.PlacesService | null>(null);
  const geocoderRef = useRef<google.maps.Geocoder | null>(null);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    // Check if all places already cached
    if (places.every((p) => resolvedCache.has(cacheKey(p.slug)))) {
      setResolved(places.map((p) => resolvedCache.get(cacheKey(p.slug))!));
      setLoading(false);
      return;
    }

    serviceRef.current = new google.maps.places.PlacesService(map);
    geocoderRef.current = geocoderRef.current ?? new google.maps.Geocoder();
    let cancelled = false;

    const resolvePlace = (place: Place): Promise<ResolvedPlace> => {
      // Return cached if available
      const ck = cacheKey(place.slug);
      if (resolvedCache.has(ck)) {
        return Promise.resolve(resolvedCache.get(ck)!);
      }

      return new Promise((resolve) => {
        const service = serviceRef.current;
        if (!service) {
          resolve(fallback(place));
          return;
        }

        const searchQueries = [
          // Most constrained first
          `${place.name}, ${place.address}, Durham NC`,
          `${place.name} ${place.address}`,
          `${place.name} Durham NC`,
        ];

        const pickBestCandidate = (results: google.maps.places.PlaceResult[]) => {
          const candidates = results
            .map((r) => {
              const loc = r.geometry?.location;
              const lat = loc?.lat?.();
              const lng = loc?.lng?.();
              if (lat == null || lng == null) return null;
              const dist = approxDistanceMeters(DURHAM_CENTER, { lat, lng });
              const nameScore = tokenOverlapScore(place.name, r.name ?? "");
              // Heavily bias toward Durham + name match
              const distancePenalty = Math.min(1, dist / MAX_ACCEPTED_DISTANCE_METERS);
              const score = nameScore * 0.75 + (1 - distancePenalty) * 0.25;
              return { r, score, dist };
            })
            .filter((x): x is { r: google.maps.places.PlaceResult; score: number; dist: number } => Boolean(x))
            .filter((x) => x.dist <= MAX_ACCEPTED_DISTANCE_METERS)
            .sort((a, b) => b.score - a.score);
          return candidates[0]?.r ?? null;
        };

        const textSearchBestMatch = (query: string): Promise<google.maps.places.PlaceResult | null> =>
          new Promise((res) => {
            const request: google.maps.places.TextSearchRequest = {
              query,
              location: new google.maps.LatLng(DURHAM_CENTER.lat, DURHAM_CENTER.lng),
              radius: DURHAM_RADIUS_METERS,
            };
            service.textSearch(request, (results, status) => {
              if (cancelled) return;
              if (status === google.maps.places.PlacesServiceStatus.OK && results?.length) {
                res(pickBestCandidate(results));
              } else {
                res(null);
              }
            });
          });

        const getDetails = (placeId: string): Promise<google.maps.places.PlaceResult | null> =>
          new Promise((res) => {
            const detailsReq: google.maps.places.PlaceDetailsRequest = {
              placeId,
              fields: ["geometry", "photos", "rating", "user_ratings_total", "opening_hours", "place_id", "name"],
            };
            service.getDetails(detailsReq, (detail, status) => {
              if (cancelled) return;
              if (status === google.maps.places.PlacesServiceStatus.OK && detail) res(detail);
              else res(null);
            });
          });

        const geocodeFallback = (): Promise<{ lat: number; lng: number } | null> =>
          new Promise((res) => {
            const geocoder = geocoderRef.current;
            if (!geocoder || !place.address) return res(null);
            geocoder.geocode(
              {
                address: `${place.address}, Durham, NC`,
                bounds: new google.maps.LatLngBounds(
                  new google.maps.LatLng(35.85, -79.1),
                  new google.maps.LatLng(36.15, -78.75)
                ),
              },
              (geocodeResults, status) => {
                if (cancelled) return;
                if (status === "OK" && geocodeResults?.[0]?.geometry?.location) {
                  const loc = geocodeResults[0].geometry.location;
                  const lat = loc.lat();
                  const lng = loc.lng();
                  const dist = approxDistanceMeters(DURHAM_CENTER, { lat, lng });
                  if (dist <= MAX_ACCEPTED_DISTANCE_METERS) res({ lat, lng });
                  else res(null);
                } else {
                  res(null);
                }
              }
            );
          });

        (async () => {
          try {
            // 1) Durham-biased Text Search → getDetails
            for (const q of searchQueries) {
              const best = await textSearchBestMatch(q);
              if (cancelled) return;
              const pid = best?.place_id;
              if (!pid) continue;
              const detail = await getDetails(pid);
              if (cancelled) return;
              const r = detail ?? best;
              const lat = r.geometry?.location?.lat?.();
              const lng = r.geometry?.location?.lng?.();
              if (lat == null || lng == null) continue;
              const dist = approxDistanceMeters(DURHAM_CENTER, { lat, lng });
              if (dist > MAX_ACCEPTED_DISTANCE_METERS) continue;

              const rp: ResolvedPlace = {
                ...place,
                resolvedLat: lat,
                resolvedLng: lng,
                photoUrl: r.photos?.[0]?.getUrl({ maxWidth: 900, maxHeight: 600 }) ?? null,
                googleRating: r.rating,
                googleTotalRatings: r.user_ratings_total,
                openNow: r.opening_hours?.isOpen?.(),
                placeId: r.place_id ?? pid,
              };
              resolvedCache.set(ck, rp);
              resolve(rp);
              return;
            }

            // 2) Geocode fallback (lat/lng only)
            const geo = await geocodeFallback();
            if (cancelled) return;
            if (geo) {
              const rp: ResolvedPlace = {
                ...place,
                resolvedLat: geo.lat,
                resolvedLng: geo.lng,
                photoUrl: null,
              };
              resolvedCache.set(ck, rp);
              resolve(rp);
              return;
            }

            // 3) Final fallback: original coordinates
            const fb = fallback(place);
            resolvedCache.set(ck, fb);
            resolve(fb);
          } catch {
            const fb = fallback(place);
            resolvedCache.set(ck, fb);
            resolve(fb);
          }
        })();

        return;
      });
    };

    // Resolve in small batches to respect rate limits
    const resolveBatch = async () => {
      const results: ResolvedPlace[] = [];
      const batchSize = 5;

      for (let i = 0; i < places.length; i += batchSize) {
        if (cancelled) return;
        const batch = places.slice(i, i + batchSize);
        const batchResults = await Promise.all(batch.map(resolvePlace));
        results.push(...batchResults);
        // Update state progressively
        setResolved([...results]);
        // Small delay between batches
        if (i + batchSize < places.length) {
          await new Promise((r) => setTimeout(r, 200));
        }
      }

      if (!cancelled) {
        setResolved(results);
        setLoading(false);
      }
    };

    resolveBatch();

    return () => {
      cancelled = true;
    };
  }, [mapReady]);

  return { resolved, loading };
}

function fallback(place: Place): ResolvedPlace {
  return {
    ...place,
    resolvedLat: place.lat,
    resolvedLng: place.lng,
    photoUrl: null,
  };
}

export function getResolvedPlace(slug: string): ResolvedPlace | undefined {
  return resolvedCache.get(cacheKey(slug));
}
