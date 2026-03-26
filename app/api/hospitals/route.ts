// Google Places API — finds nearby hospitals that are currently open
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const lat = searchParams.get("lat");
  const lng = searchParams.get("lng");
  const radius = searchParams.get("radius") || "5000"; // 5km default

  if (!lat || !lng) {
    return new Response(JSON.stringify({ error: "lat and lng are required" }), { status: 400 });
  }

  const key = process.env.GOOGLE_MAPS_API_KEY;
  if (!key) {
    return new Response(JSON.stringify({ error: "Google Maps API key not configured" }), { status: 500 });
  }

  try {
    // Nearby Search — hospitals open now, sorted by rating
    const url = new URL("https://maps.googleapis.com/maps/api/place/nearbysearch/json");
    url.searchParams.set("location", `${lat},${lng}`);
    url.searchParams.set("radius", radius);
    url.searchParams.set("type", "hospital");
    url.searchParams.set("opennow", "true");
    url.searchParams.set("rankby", "prominence");
    url.searchParams.set("key", key);

    const res = await fetch(url.toString());
    const data = await res.json();

    if (data.status !== "OK" && data.status !== "ZERO_RESULTS") {
      console.error("[hospitals] Places API error:", data.status, data.error_message);
      return new Response(
        JSON.stringify({ error: data.error_message || data.status }),
        { status: 500 }
      );
    }

    // Shape the response — only fields we need
    const hospitals = (data.results || []).map((place: any) => ({
      id: place.place_id,
      name: place.name,
      address: place.vicinity,
      rating: place.rating ?? null,
      totalRatings: place.user_ratings_total ?? 0,
      openNow: place.opening_hours?.open_now ?? true,
      location: place.geometry.location, // { lat, lng }
      photo: place.photos?.[0]?.photo_reference ?? null,
    }));

    return new Response(JSON.stringify({ hospitals }), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (error: any) {
    console.error("[hospitals] Error:", error?.message);
    return new Response(
      JSON.stringify({ error: error?.message || "Internal server error" }),
      { status: 500 }
    );
  }
}
