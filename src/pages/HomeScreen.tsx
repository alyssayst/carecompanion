import { useNavigate } from "react-router-dom";
import { useEffect, useState, useMemo } from "react";
import { motion } from "framer-motion";
import { ExternalLink, HandHelping, Filter, MessageCircle } from "lucide-react";
import MobileLayout from "@/components/MobileLayout";
import PlaceCard from "@/components/PlaceCard";
import EventCard from "@/components/EventCard";
import { places } from "@/data/places";
import { supabase } from "@/integrations/supabase/client";
import { NEEDS_OPTIONS, type NeedCategory } from "@/pages/NeedsSelection";

interface ScrapedEvent {
  id: string;
  title: string;
  date_time: string | null;
  location: string | null;
  link: string | null;
}



// Map need categories to place categories
const categoryToPlaceFilter: Record<NeedCategory, string[]> = {
  food: ["Restaurant", "Bakery", "Groceries"],
  activities: ["Activity", "Museum"],
  events: [],
  community: [],
};

type SectionKey = "events" | "community" | "food" | "activities";

const DEFAULT_ORDER: SectionKey[] = ["events", "food", "activities", "community"];

// Map need category to home section key(s)
const NEED_CAT_TO_SECTIONS: Record<NeedCategory, SectionKey[]> = {
  community: ["community"],
  food: ["food"],
  activities: ["activities"],
  events: ["events"],
};

function buildSectionOrder(needs: string[]): SectionKey[] {
  if (needs.length === 0) return DEFAULT_ORDER;

  // Map selected need labels → categories in selection order
  const cats = needs
    .map((label) => NEEDS_OPTIONS.find((o) => o.label === label)?.category)
    .filter(Boolean) as NeedCategory[];

  const order: SectionKey[] = [];
  const add = (s: SectionKey) => { if (!order.includes(s)) order.push(s); };

  // Add sections in the order the user selected their needs
  for (const cat of cats) {
    const sections = NEED_CAT_TO_SECTIONS[cat] || [];
    for (const s of sections) add(s);
  }

  // Append any remaining sections not yet included
  for (const s of DEFAULT_ORDER) add(s);

  return order;
}

function getRecommendedPlaces() {
  return {
    food: places.filter((p) => ["Restaurant", "Bakery", "Groceries"].includes(p.category)),
    activities: places.filter((p) => ["Activity", "Museum"].includes(p.category)),
  };
}

const EVENT_FILTERS = ["All", "Kid-Friendly", "Outdoor", "Wellness", "Arts & Culture", "Food & Drink", "Free"] as const;
type EventFilter = typeof EVENT_FILTERS[number];

const FILTER_KEYWORDS: Record<Exclude<EventFilter, "All">, string[]> = {
  "Kid-Friendly": ["kid", "child", "family", "families", "children", "youth", "toddler", "baby", "storytime", "puppet"],
  "Outdoor": ["outdoor", "park", "hike", "trail", "garden", "walk", "nature", "farm", "picnic", "lake"],
  "Wellness": ["wellness", "yoga", "meditation", "health", "fitness", "mindful", "run", "5k", "self-care"],
  "Arts & Culture": ["art", "museum", "gallery", "theater", "theatre", "music", "concert", "dance", "exhibit", "festival", "craft"],
  "Food & Drink": ["food", "drink", "tasting", "brunch", "dinner", "cook", "beer", "wine", "market", "restaurant"],
  "Free": ["free"],
};

function matchesFilter(event: ScrapedEvent, filter: EventFilter): boolean {
  if (filter === "All") return true;
  const keywords = FILTER_KEYWORDS[filter];
  const text = `${event.title} ${event.location || ""}`.toLowerCase();
  return keywords.some((kw) => text.includes(kw));
}

const HomeScreen = () => {
  const navigate = useNavigate();
  const [liveEvents, setLiveEvents] = useState<ScrapedEvent[]>([]);
  const [eventsLoading, setEventsLoading] = useState(true);
  const [userNeeds, setUserNeeds] = useState<string[]>([]);
  const [displayName, setDisplayName] = useState("Maria");
  const [isHarpersHome, setIsHarpersHome] = useState(true);
  const [eventFilter, setEventFilter] = useState<EventFilter>("All");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [eventsRes, userRes] = await Promise.all([
          supabase.from("cached_events").select("id, title, date_time, location, link").order("scraped_at", { ascending: false }).limit(8),
          supabase.auth.getUser(),
        ]);

        if (eventsRes.data && eventsRes.data.length > 0) setLiveEvents(eventsRes.data);

        if (userRes.data?.user) {
          const { data: profile } = await supabase.from("profiles").select("needs, display_name, staying_at").eq("user_id", userRes.data.user.id).maybeSingle();
          if (profile?.needs) setUserNeeds(profile.needs);
          if (profile?.display_name) setDisplayName(profile.display_name);
          if (profile?.staying_at?.toLowerCase().includes("harper")) setIsHarpersHome(true);
        }
      } catch (err) {
        console.error("Failed to fetch data:", err);
      } finally {
        setEventsLoading(false);
      }
    };
    fetchData();
  }, []);

  
  const sectionOrder = userNeeds.length > 0 ? buildSectionOrder(userNeeds) : DEFAULT_ORDER;
  const { food, activities } = getRecommendedPlaces();

  const renderSection = (key: SectionKey) => {
    switch (key) {
      case "events": {
        const filtered = eventFilter === "All" ? liveEvents : liveEvents.filter((e) => matchesFilter(e, eventFilter));
        return (
          <section key="events" className="mb-8">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-[20px] font-semibold text-foreground">Local Events Upcoming</h2>
              {liveEvents.length > 0 && (
                <span className="text-[11px] font-medium text-primary bg-primary/10 px-2 py-0.5 rounded-full">Live</span>
              )}
            </div>
            {/* Filter chips */}
            <div className="flex gap-2 overflow-x-auto hide-scrollbar -mx-4 px-4 mb-4">
              {EVENT_FILTERS.map((f) => (
                <button
                  key={f}
                  onClick={() => setEventFilter(f)}
                  className={`shrink-0 px-3 py-1.5 rounded-full text-[12px] font-medium transition-colors ${
                    eventFilter === f
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground"
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>
            <div className="flex gap-3 overflow-x-auto hide-scrollbar -mx-4 px-4">
              {filtered.length > 0
                ? filtered.map((event) => (
                    <motion.div
                      key={event.id}
                      whileTap={{ scale: 0.97 }}
                      className="w-[260px] shrink-0 p-4 bg-card rounded-2xl cursor-pointer"
                      style={{ boxShadow: "0 4px 12px -2px rgba(0,0,0,0.04)" }}
                      onClick={() => event.link && window.open(event.link, "_blank")}
                    >
                      <h4 className="text-[15px] font-semibold text-foreground leading-tight line-clamp-2">{event.title}</h4>
                      {event.date_time && <p className="text-[13px] text-muted-foreground mt-1.5">{event.date_time}</p>}
                      <p className="text-[13px] text-primary mt-0.5">{event.location || "Durham, NC"}</p>
                      {event.link && (
                        <div className="flex items-center gap-1 mt-2">
                          <ExternalLink size={12} className="text-muted-foreground" />
                          <span className="text-[11px] text-muted-foreground">View details</span>
                        </div>
                      )}
                    </motion.div>
                  ))
                : eventsLoading ? (
                    <p className="text-[13px] text-muted-foreground">Loading events...</p>
                  ) : (
                    <p className="text-[13px] text-muted-foreground">No events match this filter.</p>
                  )}
            </div>
          </section>
        );
      }

      case "food":
        return (
          <section key="food" className="mb-8">
            <h2 className="text-[20px] font-semibold text-foreground mb-4">Find Food & Essentials</h2>
            <div className="space-y-3">
              {food.slice(0, 4).map((place) => (
                <PlaceCard key={place.slug} slug={place.slug} name={place.name} category={place.category} rating={place.rating} distance={place.distance} image={place.image} priceLevel={place.priceLevel} />
              ))}
            </div>
          </section>
        );

      case "activities":
        return (
          <section key="activities" className="mb-8">
            <h2 className="text-[20px] font-semibold text-foreground mb-4">Things to Do Nearby</h2>
            <div className="space-y-3">
              {activities.slice(0, 4).map((place) => (
                <PlaceCard key={place.slug} slug={place.slug} name={place.name} category={place.category} rating={place.rating} distance={place.distance} image={place.image} priceLevel={place.priceLevel} />
              ))}
            </div>
          </section>
        );

      case "community":
        return (
          <section key="community" className="mb-8">
            <motion.button
              whileTap={{ scale: 0.97 }}
              onClick={() => navigate("/community")}
              className="w-full p-4 bg-card rounded-2xl text-left"
              style={{ boxShadow: "0 4px 12px -2px rgba(0,0,0,0.04)" }}
            >
              <h2 className="text-[20px] font-semibold text-foreground mb-1">Connect with Families</h2>
              <p className="text-[13px] text-muted-foreground">Chat, share rides, and meet other families nearby</p>
            </motion.button>
          </section>
        );

      default:
        return null;
    }
  };

  return (
    <MobileLayout>
      <div className="px-4 pt-14 pb-4">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <div className="flex items-center justify-between mb-6">
            <div>
              <p className="text-[13px] font-medium text-muted-foreground tracking-wide uppercase">
                {(() => { const h = new Date().getHours(); return h < 12 ? "Good morning" : h < 17 ? "Good afternoon" : "Good evening"; })()}
              </p>
              <h1 className="text-[28px] font-bold text-foreground tracking-tight">{displayName}</h1>
            </div>
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate("/messages")}
              className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center relative"
            >
              <MessageCircle size={20} className="text-primary" />
              <span className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full bg-destructive flex items-center justify-center">
                <span className="text-[9px] font-bold text-destructive-foreground">3</span>
              </span>
            </motion.button>
          </div>
        </motion.div>

        {/* Quick Action - only for Harper's Home residents */}
        {isHarpersHome && (
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={() => navigate("/request-service")}
            className="w-full h-[52px] bg-primary text-primary-foreground rounded-2xl flex items-center justify-center gap-2.5 text-[15px] font-semibold mb-8"
          >
            <HandHelping size={20} />
            Request a Service
          </motion.button>
        )}

        {/* Dynamic Sections */}
        {sectionOrder.map((key) => renderSection(key))}
      </div>
    </MobileLayout>
  );
};

export default HomeScreen;
