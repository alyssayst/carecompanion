import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Heart, Loader2 } from "lucide-react";
import HarperButton from "@/components/HarperButton";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const Welcome = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) navigate("/home", { replace: true });
    });
  }, [navigate]);

  const handleLogin = async () => {
    if (!email || !password) {
      toast({ title: "Missing fields", description: "Enter your email and password.", variant: "destructive" });
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
    setLoading(false);
    if (error) {
      toast({ title: "Sign in failed", description: error.message, variant: "destructive" });
      return;
    }
    navigate("/home", { replace: true });
  };

  return (
    <div className="mobile-container bg-background min-h-screen flex flex-col">
      <div className="flex-1 flex flex-col items-center justify-center px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.2, 0.8, 0.2, 1] }}
          className="w-full max-w-sm"
        >
          <div className="flex justify-center mb-8">
            <div className="w-16 h-16 rounded-2xl bg-primary flex items-center justify-center">
              <Heart size={28} className="text-primary-foreground" />
            </div>
          </div>

          <h1 className="text-[28px] font-bold text-foreground text-center leading-[1.1] tracking-tight" style={{ textWrap: "balance" }}>
            Welcome to Care Companion
          </h1>
          <p className="text-[16px] text-muted-foreground text-center mt-3 leading-relaxed">
            Helping families feel supported while in Durham
          </p>

          <div className="mt-10 space-y-3">
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              className="w-full h-[48px] rounded-[12px] bg-card px-4 text-[16px] text-foreground placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-primary/20 transition-shadow"
              style={{ boxShadow: "0 0 0 1px rgba(0,0,0,.06)" }}
            />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              onKeyDown={(e) => e.key === "Enter" && handleLogin()}
              className="w-full h-[48px] rounded-[12px] bg-card px-4 text-[16px] text-foreground placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-primary/20 transition-shadow"
              style={{ boxShadow: "0 0 0 1px rgba(0,0,0,.06)" }}
            />
          </div>

          <div className="mt-6 space-y-3">
            <HarperButton onClick={handleLogin} disabled={loading}>
              {loading ? <Loader2 size={18} className="animate-spin mx-auto" /> : "Log In"}
            </HarperButton>
            <HarperButton variant="secondary" onClick={() => navigate("/create-account")}>
              Create Account
            </HarperButton>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Welcome;
