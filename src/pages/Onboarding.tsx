import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import HarperButton from "@/components/HarperButton";
import PersonalizationOption from "@/components/PersonalizationOption";
import { supabase } from "@/integrations/supabase/client";

const questions = [
  {
    title: "What is your relationship to the child?",
    options: ["Mother", "Father", "Grandparent", "Sibling", "Guardian", "Other"],
    multi: false,
    field: "relationship",
  },
  {
    title: "How old is the child receiving treatment?",
    options: ["0–2", "3–5", "6–10", "11–15", "16+"],
    multi: false,
    field: "child_age",
  },
  {
    title: "Where are you currently staying?",
    options: ["Harper's Home", "Ronald McDonald House", "Hotel", "Airbnb", "Hospital", "Other"],
    multi: false,
    field: "staying_at",
  },
  {
    title: "Is your child receiving inpatient or outpatient care?",
    options: ["Inpatient", "Outpatient"],
    multi: false,
    field: "care_type",
  },
  {
    title: "Who else is traveling or staying with you?",
    options: ["Spouse", "Another child", "Grandparent", "Friend", "Just me"],
    multi: true,
    field: "companions",
  },
];

const Onboarding = () => {
  const navigate = useNavigate();
  const { step } = useParams();
  const stepNum = parseInt(step || "1") - 1;
  const q = questions[stepNum];
  const [selected, setSelected] = useState<string[]>([]);
  const [answers, setAnswers] = useState<Record<string, string | string[]>>({});

  const handleToggle = (opt: string) => {
    if (q.multi) {
      setSelected((prev) => prev.includes(opt) ? prev.filter((s) => s !== opt) : [...prev, opt]);
    } else {
      setSelected([opt]);
    }
  };

  const handleNext = async () => {
    // Save current answer
    const newAnswers = { ...answers, [q.field]: q.multi ? selected : selected[0] };
    setAnswers(newAnswers);
    setSelected([]);

    if (stepNum < 4) {
      navigate(`/onboarding/${stepNum + 2}`);
    } else {
      // Save all answers to profile
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          await supabase.from("profiles").update({
            relationship: newAnswers.relationship as string,
            child_age: newAnswers.child_age as string,
            staying_at: newAnswers.staying_at as string,
            care_type: newAnswers.care_type as string,
            companions: newAnswers.companions as string[],
          }).eq("user_id", user.id);
        }
      } catch (err) {
        console.error("Failed to save profile:", err);
      }
      navigate("/home");
    }
  };

  const handleSkip = () => {
    setSelected([]);
    navigate("/home");
  };

  if (!q) return null;

  return (
    <div className="mobile-container bg-background min-h-screen">
      <div className="px-4 pt-14 pb-8 flex flex-col min-h-screen">
        <div className="flex items-center justify-between mb-2">
          <motion.button whileTap={{ scale: 0.95 }} onClick={() => stepNum > 0 ? navigate(`/onboarding/${stepNum}`) : navigate("/needs")}>
            <ArrowLeft size={24} className="text-foreground" />
          </motion.button>
          <span className="text-[13px] font-medium text-muted-foreground">{stepNum + 1} of 5</span>
        </div>

        {/* Progress bar */}
        <div className="w-full h-1 bg-muted rounded-full mb-8 overflow-hidden">
          <motion.div
            className="h-full bg-primary rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${((stepNum + 1) / 5) * 100}%` }}
            transition={{ duration: 0.4, ease: [0.2, 0.8, 0.2, 1] }}
          />
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={stepNum}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            className="flex-1"
          >
            <h1 className="text-[24px] font-bold text-foreground leading-tight tracking-tight mb-6" style={{ textWrap: "balance" }}>
              {q.title}
            </h1>

            <div className="space-y-2.5">
              {q.options.map((opt) => (
                <PersonalizationOption
                  key={opt}
                  label={opt}
                  selected={selected.includes(opt)}
                  onToggle={() => handleToggle(opt)}
                  checkbox={q.multi}
                />
              ))}
            </div>
          </motion.div>
        </AnimatePresence>

        <div className="mt-auto pt-6 space-y-3">
          <HarperButton onClick={handleNext} className={selected.length === 0 ? "opacity-50" : ""}>
            Next
          </HarperButton>
          <button onClick={handleSkip} className="w-full text-center text-[14px] text-muted-foreground font-medium py-2">
            Skip
          </button>
        </div>
      </div>
    </div>
  );
};

export default Onboarding;
