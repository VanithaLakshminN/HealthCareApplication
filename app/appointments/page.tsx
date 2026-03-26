"use client";

import { useState, useEffect, useCallback } from "react";
import { MapPin, Star, Navigation, Phone, ExternalLink, Clock, RefreshCw, AlertCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

type Hospital = {
  id: string;
  name: string;
  address: string;
  rating: number | null;
  totalRatings: number;
  openNow: boolean;
  location: { lat: number; lng: number };
  photo: string | null;
};

type UserLocation = { lat: number; lng: number };

const RADIUS_OPTIONS = [
  { label: "1 km", value: "1000" },
  { label: "3 km", value: "3000" },
  { label: "5 km", value: "5000" },
  { label: "10 km", value: "10000" },
];

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((s) => (
        <Star
          key={s}
          className={`w-3.5 h-3.5 ${s <= Math.round(rating) ? "text-yellow-400 fill-yellow-400" : "text-zinc-600"}`}
        />
      ))}
      <span className="text-sm text-zinc-300 ml-1">{rating.toFixed(1)}</span>
    </div>
  );
}

function getDirectionsUrl(userLoc: UserLocation, hospital: Hospital) {
  return `https://www.google.com/maps/dir/${userLoc.lat},${userLoc.lng}/${hospital.location.lat},${hospital.location.lng}`;
}

function getMapsUrl(hospital: Hospital) {
  return `https://www.google.com/maps/place/?q=place_id:${hospital.id}`;
}

function distanceKm(a: UserLocation, b: { lat: number; lng: number }) {
  const R = 6371;
  const dLat = ((b.lat - a.lat) * Math.PI) / 180;
  const dLng = ((b.lng - a.lng) * Math.PI) / 180;
  const x =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((a.lat * Math.PI) / 180) * Math.cos((b.lat * Math.PI) / 180) * Math.sin(dLng / 2) ** 2;
  return (R * 2 * Math.atan2(Math.sqrt(x), Math.sqrt(1 - x))).toFixed(1);
}

export default function AppointmentsPage() {
  const [userLocation, setUserLocation] = useState<UserLocation | null>(null);
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [loading, setLoading] = useState(false);
  const [locError, setLocError] = useState<string | null>(null);
  const [apiError, setApiError] = useState<string | null>(null);
  const [radius, setRadius] = useState("5000");
  const [sortBy, setSortBy] = useState<"rating" | "distance">("rating");

  const fetchHospitals = useCallback(async (loc: UserLocation, r: string) => {
    setLoading(true);
    setApiError(null);
    try {
      const res = await fetch(`/api/hospitals?lat=${loc.lat}&lng=${loc.lng}&radius=${r}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setHospitals(data.hospitals);
    } catch (e: any) {
      setApiError(e.message || "Failed to fetch hospitals");
    } finally {
      setLoading(false);
    }
  }, []);

  const getLocation = useCallback(() => {
    setLocError(null);
    setHospitals([]);
    if (!navigator.geolocation) {
      setLocError("Geolocation is not supported by your browser.");
      return;
    }
    setLoading(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const loc = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        setUserLocation(loc);
        fetchHospitals(loc, radius);
      },
      (err) => {
        setLoading(false);
        setLocError(
          err.code === 1
            ? "Location access denied. Please allow location permission and try again."
            : "Unable to get your location. Please try again."
        );
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }, [radius, fetchHospitals]);

  // Re-fetch when radius changes and we already have location
  useEffect(() => {
    if (userLocation) fetchHospitals(userLocation, radius);
  }, [radius]);

  const sorted = [...hospitals].sort((a, b) => {
    if (sortBy === "rating") return (b.rating ?? 0) - (a.rating ?? 0);
    if (!userLocation) return 0;
    return (
      parseFloat(distanceKm(userLocation, a.location)) -
      parseFloat(distanceKm(userLocation, b.location))
    );
  });

  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      {/* Header */}
      <div className="bg-zinc-900 border-b border-zinc-800 px-4 py-6">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-2xl font-bold mb-1">Nearby Hospitals</h1>
          <p className="text-zinc-400 text-sm">Find open hospitals near you with ratings and directions</p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">

        {/* Controls */}
        <div className="flex flex-wrap gap-3 items-center">
          <button
            onClick={getLocation}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 rounded-xl text-sm font-medium transition-colors"
          >
            <Navigation className="w-4 h-4" />
            {userLocation ? "Refresh Location" : "Use My Location"}
          </button>

          {/* Radius */}
          <div className="flex items-center gap-1 bg-zinc-800 rounded-xl p-1">
            {RADIUS_OPTIONS.map((r) => (
              <button
                key={r.value}
                onClick={() => setRadius(r.value)}
                className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
                  radius === r.value ? "bg-blue-600 text-white" : "text-zinc-400 hover:text-white"
                }`}
              >
                {r.label}
              </button>
            ))}
          </div>

          {/* Sort */}
          {hospitals.length > 0 && (
            <div className="flex items-center gap-1 bg-zinc-800 rounded-xl p-1 ml-auto">
              <button
                onClick={() => setSortBy("rating")}
                className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
                  sortBy === "rating" ? "bg-blue-600 text-white" : "text-zinc-400 hover:text-white"
                }`}
              >
                Top Rated
              </button>
              <button
                onClick={() => setSortBy("distance")}
                className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
                  sortBy === "distance" ? "bg-blue-600 text-white" : "text-zinc-400 hover:text-white"
                }`}
              >
                Nearest
              </button>
            </div>
          )}
        </div>

        {/* User location badge */}
        {userLocation && (
          <div className="flex items-center gap-2 text-xs text-zinc-400">
            <MapPin className="w-3.5 h-3.5 text-blue-400" />
            Your location: {userLocation.lat.toFixed(4)}, {userLocation.lng.toFixed(4)}
          </div>
        )}

        {/* Errors */}
        {(locError || apiError) && (
          <div className="flex items-start gap-3 p-4 bg-red-950 border border-red-800 rounded-xl text-sm text-red-300">
            <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
            {locError || apiError}
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div className="flex items-center justify-center py-16 gap-3 text-zinc-400">
            <RefreshCw className="w-5 h-5 animate-spin" />
            {userLocation ? "Finding nearby hospitals..." : "Getting your location..."}
          </div>
        )}

        {/* Empty state */}
        {!loading && userLocation && hospitals.length === 0 && !apiError && (
          <div className="text-center py-16 text-zinc-500">
            <MapPin className="w-10 h-10 mx-auto mb-3 opacity-30" />
            <p>No open hospitals found within {parseInt(radius) / 1000} km.</p>
            <p className="text-sm mt-1">Try increasing the search radius.</p>
          </div>
        )}

        {/* Initial state */}
        {!loading && !userLocation && !locError && (
          <div className="text-center py-20 text-zinc-500">
            <Navigation className="w-12 h-12 mx-auto mb-4 opacity-20" />
            <p className="text-lg">Click "Use My Location" to find hospitals near you</p>
            <p className="text-sm mt-2">We'll show only hospitals that are currently open</p>
          </div>
        )}

        {/* Hospital cards */}
        <AnimatePresence>
          {sorted.map((hospital, i) => (
            <motion.div
              key={hospital.id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 hover:border-zinc-600 transition-colors"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  {/* Name + open badge */}
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <h2 className="font-semibold text-lg leading-tight">{hospital.name}</h2>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-green-900 text-green-400 border border-green-800 flex items-center gap-1">
                      <Clock className="w-3 h-3" /> Open Now
                    </span>
                  </div>

                  {/* Address */}
                  <p className="text-sm text-zinc-400 flex items-start gap-1 mb-3">
                    <MapPin className="w-3.5 h-3.5 mt-0.5 shrink-0 text-zinc-500" />
                    {hospital.address}
                  </p>

                  {/* Rating + distance */}
                  <div className="flex items-center gap-4 flex-wrap">
                    {hospital.rating !== null ? (
                      <div className="flex flex-col gap-0.5">
                        <StarRating rating={hospital.rating} />
                        <span className="text-xs text-zinc-500">{hospital.totalRatings.toLocaleString()} reviews</span>
                      </div>
                    ) : (
                      <span className="text-xs text-zinc-500">No ratings yet</span>
                    )}

                    {userLocation && (
                      <span className="text-xs text-zinc-400 flex items-center gap-1">
                        <Navigation className="w-3 h-3" />
                        {distanceKm(userLocation, hospital.location)} km away
                      </span>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-col gap-2 shrink-0">
                  {userLocation && (
                    <a
                      href={getDirectionsUrl(userLocation, hospital)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-500 rounded-lg text-xs font-medium transition-colors"
                    >
                      <Navigation className="w-3.5 h-3.5" />
                      Directions
                    </a>
                  )}
                  <a
                    href={getMapsUrl(hospital)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 rounded-lg text-xs font-medium transition-colors"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    View on Maps
                  </a>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

      </div>
    </div>
  );
}
