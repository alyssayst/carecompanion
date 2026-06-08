import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Loader2 } from "lucide-react";
import HarperButton from "@/components/HarperButton";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const CreateAccount = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [form, setForm] = useState({ email: "", username: "", password: "", confirm: "", referralCode: "" });
  const [loading, setLoading] = useState(false);
  const [codeError, setCodeError] = useState("");

  const inputClass = "w-full h-[48px] rounded-[12px] bg-card px-4 text-[16px] text-foreground placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-primary/20 transition-shadow";

  const handleSignup = async () => {
    if (!form.email || !form.username || !form.password || !form.referralCode) {
      toast({ title: "Missing fields", description: "Please fill in all fields including the referral code.", variant: "destructive" });
      return;
    }
    if (form.password !== form.confirm) {
      toast({ title: "Passwords don't match", description: "Please make sure your passwords match.", variant: "destructive" });
      return;
    }
    if (form.password.length < 6) {
      toast({ title: "Password too short", description: "Password must be at least 6 characters.", variant: "destructive" });
      return;
    }

    setLoading(true);
    setCodeError("");

    // Validate referral code
    const { data: codeData, error: codeErr } = await supabase
      .from("referral_codes")
      .select("id, code, is_active, used_count, max_uses")
      .eq("code", form.referralCode.toUpperCase().trim())
      .eq("is_active", true)
      .maybeSingle();

    if (codeErr || !codeData) {
      setCodeError("Invalid referral code. Please contact your social worker for a valid code.");
      setLoading(false);
      return;
    }

    if (codeData.max_uses && codeData.used_count >= codeData.max_uses) {
      setCodeError("This referral code has reached its maximum uses.");
      setLoading(false);
      return;
    }

    // Sign up user
    const { error: signupError } = await supabase.auth.signUp({
      email: form.email,
      password: form.password,
      options: {
        data: { username: form.username, referral_code: form.referralCode.toUpperCase().trim() },
        emailRedirectTo: window.location.origin,
      },
    });

    if (signupError) {
      toast({ title: "Signup failed", description: signupError.message, variant: "destructive" });
      setLoading(false);
      return;
    }

    // Increment referral code usage (best effort)
    await supabase
      .from("referral_codes")
      .update({ used_count: codeData.used_count + 1 })
      .eq("id", codeData.id);

    toast({ title: "Account created!", description: "Welcome to Harper's Home." });
    navigate("/needs");
    setLoading(false);
  };

  const fields = [
    { key: "email" as const, type: "email", placeholder: "Email" },
    { key: "username" as const, type: "text", placeholder: "Username" },
    { key: "password" as const, type: "password", placeholder: "Password" },
    { key: "confirm" as const, type: "password", placeholder: "Confirm Password" },
    { key: "referralCode" as const, type: "text", placeholder: "Referral Code (from your social worker)" },
  ];

  return (
    <div className="mobile-container bg-background min-h-screen">
      <div className="px-4 pt-14 pb-8">
        <motion.button whileTap={{ scale: 0.95 }} onClick={() => navigate("/")} className="mb-6">
          <ArrowLeft size={24} className="text-foreground" />
        </motion.button>

        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <h1 className="text-[28px] font-bold text-foreground tracking-tight">Create Account</h1>
          <p className="text-[16px] text-muted-foreground mt-2">Join the Harper's Home community</p>

          <div className="mt-8 space-y-3">
            {fields.map((field) => (
              <div key={field.key}>
                <input
                  type={field.type}
                  placeholder={field.placeholder}
                  value={form[field.key]}
                  onChange={(e) => {
                    setForm({ ...form, [field.key]: e.target.value });
                    if (field.key === "referralCode") setCodeError("");
                  }}
                  className={`${inputClass} ${field.key === "referralCode" && codeError ? "ring-2 ring-destructive/50" : ""}`}
                  style={{ boxShadow: "0 0 0 1px rgba(0,0,0,.06)" }}
                />
                {field.key === "referralCode" && codeError && (
                  <p className="text-[13px] text-destructive mt-1.5 ml-1">{codeError}</p>
                )}
              </div>
            ))}
          </div>

          <p className="text-[12px] text-muted-foreground mt-3 ml-1">
            A referral code is required to ensure safety within our community. Ask your social worker if you don't have one.
          </p>

          <div className="mt-8">
            <HarperButton onClick={handleSignup} disabled={loading}>
              {loading ? <Loader2 size={18} className="animate-spin mx-auto" /> : "Continue"}
            </HarperButton>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default CreateAccount;
