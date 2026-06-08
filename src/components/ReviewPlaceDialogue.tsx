import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import HarperButton from "@/components/HarperButton";
import { MessageSquarePlus } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface ReviewPlaceDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  placeSlug: string;
  placeName: string;
}

const priceOptions = [
  { label: "$", value: "$", desc: "Budget-friendly" },
  { label: "$$", value: "$$", desc: "Moderate" },
  { label: "$$$", value: "$$$", desc: "Pricey" },
];

const ReviewPlaceDialog = ({ open, onOpenChange, placeSlug, placeName }: ReviewPlaceDialogProps) => {
  const [notes, setNotes] = useState("");
  const [priceRange, setPriceRange] = useState<string | null>(null);
  const [wouldRecommend, setWouldRecommend] = useState(true);
  const [saving, setSaving] = useState(false);

  const handleSubmit = async () => {
    if (!notes.trim()) {
      toast.error("Please add some notes for other families.");
      return;
    }
    setSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        toast.success("Review noted!", {
          description: "Sign in to share your review with other families.",
        });
        onOpenChange(false);
        setSaving(false);
        return;
      }

      const { error } = await supabase.from("place_reviews").upsert(
        {
          user_id: user.id,
          place_slug: placeSlug,
          notes: notes.trim(),
          price_range: priceRange,
          would_recommend: wouldRecommend,
        },
        { onConflict: "user_id,place_slug" }
      );

      if (error) throw error;
      toast.success("Review submitted!", { description: "Thanks for helping other families." });
      onOpenChange(false);
    } catch (err) {
      console.error(err);
      toast.error("Couldn't submit review. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[360px] rounded-3xl p-6 bg-card border-0" style={{ boxShadow: "0 8px 40px rgba(0,0,0,.12)" }}>
        <DialogHeader>
          <DialogTitle className="text-[20px] font-bold text-foreground text-left">
            Write a Review
          </DialogTitle>
          <p className="text-[13px] text-muted-foreground text-left mt-0.5">{placeName}</p>
        </DialogHeader>

        <div className="space-y-5 mt-3">
          {/* Notes */}
          <div className="space-y-2">
            <Label className="text-[13px] font-semibold text-foreground">Your experience</Label>
            <Textarea
              placeholder="e.g. Great outdoor seating, kids loved the pancakes…"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              maxLength={500}
              className="rounded-xl border-muted bg-background text-[14px] min-h-[80px] resize-none focus-visible:ring-primary"
            />
            <p className="text-[11px] text-muted-foreground text-right">{notes.length}/500</p>
          </div>

          {/* Price Range */}
          <div className="space-y-2">
            <Label className="text-[13px] font-semibold text-foreground">Price range</Label>
            <div className="flex gap-2">
              {priceOptions.map((opt) => (
                <motion.button
                  key={opt.value}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setPriceRange(priceRange === opt.value ? null : opt.value)}
                  className={`flex-1 py-2.5 rounded-xl text-center transition-colors ${
                    priceRange === opt.value
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground"
                  }`}
                >
                  <span className="text-[15px] font-semibold block">{opt.label}</span>
                  <span className="text-[10px] block mt-0.5 opacity-80">{opt.desc}</span>
                </motion.button>
              ))}
            </div>
          </div>

          {/* Would Recommend */}
          <div className="flex items-center justify-between p-3 bg-muted/50 rounded-xl">
            <div>
              <p className="text-[14px] font-medium text-foreground">Recommend to families?</p>
              <p className="text-[12px] text-muted-foreground">Would you suggest this place?</p>
            </div>
            <Switch checked={wouldRecommend} onCheckedChange={setWouldRecommend} />
          </div>

          {/* Submit Button */}
          <HarperButton onClick={handleSubmit} disabled={saving}>
            <MessageSquarePlus size={18} className="mr-2" />
            {saving ? "Submitting…" : "Submit Review"}
          </HarperButton>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ReviewPlaceDialog;
