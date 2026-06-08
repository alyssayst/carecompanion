import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Users, ShoppingBag, Palette, CalendarDays } from "lucide-react";
import HarperButton from "@/components/HarperButton";
import { supabase } from "@/integrations/supabase/client";

export const NEEDS_OPTIONS = [
  { icon: Users, label: "Connect with Families", category: "community" },
  { icon: ShoppingBag, label: "Find Food & Essentials", category: "food" },
  { icon: Palette, label: "Things to Do Nearby", category: "activities" },
  { icon: CalendarDays, label: "Upcoming Events", category: "events" },
] as const;

export type NeedCategory = (typeof NEEDS_OPTIONS)[number]["category"];

const NeedsSelection = () => {
  const navigate = useNavigate();
  const [selected, setSelected] = useState<number[]>([]);

  const toggle = (i: number) =>
    setSelected((prev) => prev.includes(i) ? prev.filter((x) => x !== i) : [...prev, i]);

  const handleContinue = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const selectedNeeds = selected.map((i) => NEEDS_OPTIONS[i].label);
        await supabase.from("profiles").update({ needs: selectedNeeds }).eq("user_id", user.id);
      }
    } catch (err) {
      console.error("Failed to save needs:", err);
    }
    navigate("/onboarding/1");
  };

  return (
    <div className="mobile-container bg-background min-h-screen">
      <div className="px-4 pt-14 pb-8 flex flex-col min-h-screen">
        <motion.button whileTap={{ scale: 0.95 }} onClick={() => navigate("/create-account")} className="mb-6">
          <ArrowLeft size={24} className="text-foreground" />
        </motion.button>

        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-[24px] font-bold text-foreground tracking-tight mb-2" style={{ textWrap: "balance" }}>
            What do you need most right now?
          </h1>
          <p className="text-[14px] text-muted-foreground mb-6">Select all that apply</p>

          <div className="grid grid-cols-2 gap-3">
            {NEEDS_OPTIONS.map((need, i) => (
              <motion.button
                key={i}
                whileTap={{ scale: 0.96 }}
                onClick={() => toggle(i)}
                className={`flex flex-col items-center text-center p-5 rounded-2xl transition-all duration-200 ${
                  selected.includes(i)
                    ? "bg-primary text-primary-foreground"
                    : "bg-card text-foreground"
                }`}
                style={{ boxShadow: selected.includes(i) ? "none" : "0 0 0 1px rgba(0,0,0,.06)" }}
              >
                <need.icon size={24} className={selected.includes(i) ? "text-primary-foreground" : "text-primary"} />
                <span className="text-[13px] font-medium mt-3 leading-tight">{need.label}</span>
              </motion.button>
            ))}
          </div>
        </motion.div>

        <div className="mt-auto pt-8">
          <HarperButton onClick={handleContinue}>Continue</HarperButton>
        </div>
      </div>
    </div>
  );
};

export default NeedsSelection;
