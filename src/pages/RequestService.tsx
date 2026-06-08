import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Send, CheckCircle } from "lucide-react";
import MobileLayout from "@/components/MobileLayout";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const CATEGORIES = [
  { value: "meals", label: "Meals & Food", description: "Meal delivery, groceries, dietary needs" },
  { value: "transportation", label: "Transportation", description: "Rides to appointments, errands" },
  { value: "childcare", label: "Childcare", description: "Babysitting, activities for kids" },
  { value: "emotional", label: "Emotional Support", description: "Someone to talk to, support group" },
  { value: "household", label: "Household Help", description: "Cleaning, laundry, errands" },
  { value: "medical", label: "Medical Support", description: "Pharmacy runs, appointment help" },
  { value: "other", label: "Other", description: "Anything else you need" },
];

const URGENCY_OPTIONS = [
  { value: "low", label: "Not urgent", color: "bg-muted text-muted-foreground" },
  { value: "normal", label: "Within a few days", color: "bg-primary/10 text-primary" },
  { value: "high", label: "Urgent – today/tomorrow", color: "bg-destructive/10 text-destructive" },
];

const RequestService = () => {
  const navigate = useNavigate();
  const [category, setCategory] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [urgency, setUrgency] = useState("normal");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async () => {
    if (!category || !title.trim()) {
      toast.error("Please select a category and add a brief title.");
      return;
    }

    setSubmitting(true);
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const userId = sessionData?.session?.user?.id ?? "00000000-0000-0000-0000-000000000000";

      const { error } = await supabase.from("service_requests").insert({
        user_id: userId,
        category,
        title: title.trim(),
        description: description.trim() || null,
        urgency,
      });

      if (error) throw error;

      setSubmitted(true);
      toast.success("Your request has been submitted!");
    } catch (err) {
      console.error("Failed to submit request:", err);
      toast.error("Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <MobileLayout>
        <div className="px-4 pt-14 pb-4 flex flex-col items-center justify-center min-h-[60vh]">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.4 }}
            className="text-center"
          >
            <CheckCircle size={56} className="text-primary mx-auto mb-4" />
            <h1 className="text-[24px] font-bold text-foreground mb-2">Request Submitted</h1>
            <p className="text-[14px] text-muted-foreground mb-8 max-w-[280px]">
              Your housing team has been notified. They'll follow up with you soon.
            </p>
            <motion.button
              whileTap={{ scale: 0.97 }}
              onClick={() => navigate("/home")}
              className="w-full max-w-[260px] h-[48px] bg-primary text-primary-foreground rounded-xl font-medium text-[15px]"
            >
              Back to Home
            </motion.button>
            <motion.button
              whileTap={{ scale: 0.97 }}
              onClick={() => {
                setSubmitted(false);
                setCategory("");
                setTitle("");
                setDescription("");
                setUrgency("normal");
              }}
              className="w-full max-w-[260px] h-[48px] mt-3 text-primary font-medium text-[14px]"
            >
              Submit Another Request
            </motion.button>
          </motion.div>
        </div>
      </MobileLayout>
    );
  }

  return (
    <MobileLayout>
      <div className="px-4 pt-14 pb-8">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={() => navigate("/home")}
            className="w-9 h-9 rounded-full bg-muted flex items-center justify-center"
          >
            <ArrowLeft size={18} className="text-foreground" />
          </motion.button>
          <h1 className="text-[22px] font-bold text-foreground">Request a Service</h1>
        </div>

        <p className="text-[14px] text-muted-foreground mb-6">
          Tell us what you need and your housing team will coordinate to help.
        </p>

        {/* Category Selection */}
        <div className="mb-6">
          <label className="text-[13px] font-semibold text-foreground uppercase tracking-wide mb-3 block">
            What do you need help with?
          </label>
          <div className="space-y-2">
            {CATEGORIES.map((cat) => (
              <motion.button
                key={cat.value}
                whileTap={{ scale: 0.98 }}
                onClick={() => setCategory(cat.value)}
                className={`w-full p-3 rounded-xl text-left transition-all ${
                  category === cat.value
                    ? "bg-primary/10 ring-2 ring-primary"
                    : "bg-card"
                }`}
                style={{ boxShadow: category === cat.value ? undefined : "0 0 0 1px rgba(0,0,0,.06)" }}
              >
                <span className="text-[15px] font-medium text-foreground">{cat.label}</span>
                <p className="text-[12px] text-muted-foreground mt-0.5">{cat.description}</p>
              </motion.button>
            ))}
          </div>
        </div>

        {/* Title */}
        <div className="mb-5">
          <label className="text-[13px] font-semibold text-foreground uppercase tracking-wide mb-2 block">
            Brief description
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g., Need a ride to the pharmacy"
            maxLength={200}
            className="w-full h-[48px] px-4 rounded-xl bg-card text-foreground text-[15px] placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            style={{ boxShadow: "0 0 0 1px rgba(0,0,0,.06)" }}
          />
        </div>

        {/* Details */}
        <div className="mb-5">
          <label className="text-[13px] font-semibold text-foreground uppercase tracking-wide mb-2 block">
            Additional details (optional)
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Any specific times, preferences, or other info that would help..."
            maxLength={1000}
            rows={3}
            className="w-full px-4 py-3 rounded-xl bg-card text-foreground text-[15px] placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary resize-none"
            style={{ boxShadow: "0 0 0 1px rgba(0,0,0,.06)" }}
          />
        </div>

        {/* Urgency */}
        <div className="mb-8">
          <label className="text-[13px] font-semibold text-foreground uppercase tracking-wide mb-3 block">
            How soon do you need this?
          </label>
          <div className="flex gap-2">
            {URGENCY_OPTIONS.map((opt) => (
              <motion.button
                key={opt.value}
                whileTap={{ scale: 0.96 }}
                onClick={() => setUrgency(opt.value)}
                className={`flex-1 py-2.5 px-2 rounded-xl text-[13px] font-medium text-center transition-all ${
                  urgency === opt.value
                    ? `${opt.color} ring-2 ring-primary`
                    : "bg-card text-muted-foreground"
                }`}
                style={{ boxShadow: urgency === opt.value ? undefined : "0 0 0 1px rgba(0,0,0,.06)" }}
              >
                {opt.label}
              </motion.button>
            ))}
          </div>
        </div>

        {/* Submit */}
        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={handleSubmit}
          disabled={submitting || !category || !title.trim()}
          className="w-full h-[52px] bg-primary text-primary-foreground rounded-xl font-semibold text-[16px] flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {submitting ? (
            "Submitting..."
          ) : (
            <>
              <Send size={18} />
              Submit Request
            </>
          )}
        </motion.button>
      </div>
    </MobileLayout>
  );
};

export default RequestService;
