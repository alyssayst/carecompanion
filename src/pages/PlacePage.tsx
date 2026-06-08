import { useNavigate, useParams } from "react-router-dom";
import { useEffect, useRef, useState, useCallback } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { motion } from "framer-motion";
import { ArrowLeft, Star, Clock, ExternalLink, Bookmark, MapPin, Users, Tag, MessageSquarePlus, ShoppingBag } from "lucide-react";
import doordashLogo from "@/assets/doordash.png";
import grubhubLogo from "@/assets/grubhub-logo.png";
import ubereatsLogo from "@/assets/ubereats-logo.png";
import HarperButton from "@/components/HarperButton";
import ReviewPlaceDialog from "@/components/ReviewPlaceDialogue";
import { getPlaceBySlug } from "@/data/places";
import { getResolvedPlace, type ResolvedPlace } from "@/hooks/useResolvedPlaces";

const PlacePage = () => {
  const navigate = useNavigate();
  const { slug } = useParams<{ slug: string }>();
  const place = getPlaceBySlug(slug || "monuts");
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const [googleData, setGoogleData] = useState<{ rating?: number; totalRatings?: number; openNow?: boolean } | null>(null);
  const mapDivRef = useRef<HTMLDivElement>(null);
  const [saveDialogOpen, setSaveDialogOpen] = useState(false);
  const [reviewDialogOpen, setReviewDialogOpen] = useState(false);

  // Try to get cached resolved data, or fetch via Places API
  useEffect(() => {
    if (!place) return;

    const cached = getResolvedPlace(place.slug);
    if (cached) {
      setPhotoUrl(cached.photoUrl);
      setGoogleData({
        rating: cached.googleRating,
        totalRatings: cached.googleTotalRatings,
        openNow: cached.openNow,
      });
      return;
    }

    // If not cached, create a hidden map div and resolve
    if (!mapDivRef.current) return;

    const map = new google.maps.Map(mapDivRef.current, { center: { lat: 0, lng: 0 }, zoom: 1 });
    const service = new google.maps.places.PlacesService(map);

    service.findPlaceFromQuery(
      {
        query: `${place.name} ${place.address}`,
        fields: ["photos", "rating", "user_ratings_total", "opening_hours"],
      },
      (results, status) => {
        if (status === google.maps.places.PlacesServiceStatus.OK && results?.[0]) {
          const r = results[0];
          setPhotoUrl(r.photos?.[0]?.getUrl({ maxWidth: 800, maxHeight: 500 }) ?? null);
          setGoogleData({
            rating: r.rating,
            totalRatings: r.user_ratings_total,
            openNow: r.opening_hours?.isOpen?.(),
          });
        }
      }
    );
  }, [place]);

  const handleSavePlace = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.success("Place saved!", { description: "Sign in to sync your saved places." });
        return;
      }
      const { error } = await supabase.from("saved_places").upsert(
        { user_id: user.id, place_slug: place!.slug },
        { onConflict: "user_id,place_slug" }
      );
      if (error) throw error;
      toast.success("Place saved!");
    } catch (err) {
      console.error(err);
      toast.error("Couldn't save place.");
    }
  }, [place]);

  if (!place) {
    return (
      <div className="mobile-container bg-background min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Place not found</p>
      </div>
    );
  }

  const displayPhoto = photoUrl || place.image;
  const displayRating = googleData?.rating ?? place.rating;

  return (
    <div className="mobile-container bg-background min-h-screen">
      {/* Hidden div for Places API */}
      <div ref={mapDivRef} className="hidden" />

      {/* Hero */}
      <div className="relative">
        <div className="aspect-[16/9] bg-muted rounded-b-3xl overflow-hidden">
          {displayPhoto ? (
            <img src={displayPhoto} alt={place.name} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
              <MapPin size={40} className="text-primary" />
            </div>
          )}
        </div>
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={() => navigate(-1)}
          className="absolute top-12 left-4 w-10 h-10 rounded-full bg-card/80 backdrop-blur-sm flex items-center justify-center"
          style={{ boxShadow: "0 2px 8px rgba(0,0,0,0.1)" }}
        >
          <ArrowLeft size={20} className="text-foreground" />
        </motion.button>
      </div>

      <div className="px-4 pt-5 pb-8">
        <h1 className="text-[28px] font-bold text-foreground tracking-tight">{place.name}</h1>
        <p className="text-[14px] text-muted-foreground mt-1">{place.description}</p>

        {/* Stats */}
        <div className="flex items-center gap-4 mt-3 flex-wrap">
          <div className="flex items-center gap-1">
            <Star size={16} fill="hsl(var(--harper-yellow))" color="hsl(var(--harper-yellow))" />
            <span className="text-[15px] font-semibold text-foreground">{displayRating}</span>
            {googleData?.totalRatings && (
              <span className="text-[12px] text-muted-foreground">({googleData.totalRatings} reviews)</span>
            )}
          </div>
          <div className="flex items-center gap-1">
            <Clock size={14} className="text-primary" />
            <span className="text-[14px] text-primary font-medium">{place.distance} from Duke Hospital</span>
          </div>
          {place.priceLevel && (
            <span className="text-[14px] font-medium text-muted-foreground">{place.priceLevel}</span>
          )}
          {googleData?.openNow !== undefined && (
            <span className={`text-[13px] font-medium ${googleData.openNow ? "text-green-600" : "text-red-500"}`}>
              {googleData.openNow ? "Open now" : "Closed"}
            </span>
          )}
        </div>
        <div className="flex items-center gap-1 mt-1.5">
          <Users size={14} className="text-muted-foreground" />
          <p className="text-[14px] text-muted-foreground">Recommended by {place.familyCount} families</p>
        </div>

        {/* Tags */}
        {place.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-4">
            {place.tags.map((tag) => (
              <span
                key={tag}
                className="flex items-center gap-1 text-[12px] font-medium text-primary bg-primary/10 px-2.5 py-1 rounded-full"
              >
                <Tag size={10} />
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* Details */}
        <div className="mt-5 p-4 bg-card rounded-2xl space-y-3" style={{ boxShadow: "0 0 0 1px rgba(0,0,0,.04)" }}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[13px] text-muted-foreground">Category</p>
              <p className="text-[15px] font-medium text-foreground">{place.subcategory}</p>
            </div>
            <div>
              <p className="text-[13px] text-muted-foreground">Distance</p>
              <p className="text-[15px] font-medium text-foreground">{place.distance}</p>
            </div>
          </div>
          {place.hours && (
            <div>
              <p className="text-[13px] text-muted-foreground">Hours</p>
              <p className="text-[15px] font-medium text-foreground">{place.hours}</p>
            </div>
          )}
          <div>
            <p className="text-[13px] text-muted-foreground">Address</p>
            <p className="text-[15px] font-medium text-foreground">{place.address}</p>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex gap-3 mt-5">
          <motion.button
            whileTap={{ scale: 0.96 }}
            onClick={() => window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(place.name + " " + place.address)}`, "_blank")}
            className="flex-1 h-[44px] bg-card rounded-[12px] flex items-center justify-center gap-2 text-[14px] font-medium text-foreground"
            style={{ boxShadow: "0 0 0 1px rgba(0,0,0,.06)" }}
          >
            <MapPin size={16} className="text-primary" />
            Get Directions
          </motion.button>
          <motion.button
            whileTap={{ scale: 0.96 }}
            onClick={() => window.open(`https://www.google.com/search?q=${encodeURIComponent(place.name + " Durham NC")}`, "_blank")}
            className="flex-1 h-[44px] bg-card rounded-[12px] flex items-center justify-center gap-2 text-[14px] font-medium text-foreground"
            style={{ boxShadow: "0 0 0 1px rgba(0,0,0,.06)" }}
          >
            <ExternalLink size={16} className="text-primary" />
            More Info
          </motion.button>
        </div>

        {/* Order Delivery - only for restaurants */}
        {place.category === "Restaurant" && (
          <div className="mt-5">
            <h3 className="text-[15px] font-semibold text-foreground mb-3 flex items-center gap-2">
              <ShoppingBag size={16} className="text-primary" />
              Order Delivery
            </h3>
            <div className="flex gap-2">
              {[
                { name: "DoorDash", logo: doordashLogo, url: `https://www.doordash.com/search/store/${encodeURIComponent(place.name + " " + place.address)}/`, bg: "bg-[#FF3008]/8" },
                { name: "UberEats", logo: ubereatsLogo, url: `https://www.ubereats.com/search?q=${encodeURIComponent(place.name + " " + place.address)}`, bg: "bg-[#06C167]/8" },
                { name: "Grubhub", logo: grubhubLogo, url: `https://www.grubhub.com/search?orderMethod=delivery&locationMode=DELIVERY&facetSet=uma498&pageSize=20&hideHat498=true&searchTerm=${encodeURIComponent(place.name + " Durham NC")}`, bg: "bg-[#F63440]/8" },
              ].map((service) => (
                <motion.button
                  key={service.name}
                  whileTap={{ scale: 0.96 }}
                  onClick={() => window.open(service.url, "_blank")}
                  className={`flex-1 h-[44px] rounded-[12px] flex items-center justify-center ${service.bg}`}
                  style={{ boxShadow: "0 0 0 1px rgba(0,0,0,.04)" }}
                >
                  <img src={service.logo} alt={service.name} className="h-5 w-20 object-contain" />
                </motion.button>
              ))}
            </div>
          </div>
        )}
        {place.reviews.length > 0 && (
          <section className="mt-8">
            <h2 className="text-[20px] font-semibold text-foreground mb-1">Family Reviews</h2>
            <p className="text-[13px] text-muted-foreground mb-4">From families staying near Duke Hospital</p>
            <div className="space-y-3">
              {place.reviews.map((review) => (
                <div
                  key={review.name}
                  className="p-4 bg-card rounded-2xl"
                  style={{ boxShadow: "0 0 0 1px rgba(0,0,0,.04)" }}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-8 h-8 rounded-full bg-primary/15 flex items-center justify-center">
                      <span className="text-[12px] font-semibold text-primary">{review.name[0]}</span>
                    </div>
                    <div>
                      <p className="text-[14px] font-semibold text-foreground">{review.name}</p>
                      <p className="text-[12px] text-muted-foreground">{review.relation}</p>
                    </div>
                  </div>
                  <p className="text-[14px] text-foreground/80 leading-relaxed">{review.text}</p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Save & Review */}
        <div className="flex gap-3 mt-8">
          <div className="flex-1">
            <HarperButton onClick={handleSavePlace}>
              <Bookmark size={18} className="mr-2" />
              Save Place
            </HarperButton>
          </div>
          <motion.button
            whileTap={{ scale: 0.96 }}
            onClick={() => setReviewDialogOpen(true)}
            className="h-[48px] px-5 bg-card rounded-[14px] flex items-center justify-center gap-2 text-[14px] font-semibold text-primary"
            style={{ boxShadow: "0 0 0 1px rgba(0,0,0,.06)" }}
          >
            <MessageSquarePlus size={18} />
            Review
          </motion.button>
        </div>

        <ReviewPlaceDialog
          open={reviewDialogOpen}
          onOpenChange={setReviewDialogOpen}
          placeSlug={place.slug}
          placeName={place.name}
        />
      </div>
    </div>
  );
};

export default PlacePage;
