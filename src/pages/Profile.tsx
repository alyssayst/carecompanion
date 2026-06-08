import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Settings, ChevronRight } from "lucide-react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import MobileLayout from "@/components/MobileLayout";
import HarperButton from "@/components/HarperButton";

const savedPlaces = [
  { name: "Monuts", type: "Restaurant" },
  { name: "Duke Gardens", type: "Activity" },
  { name: "Whole Foods", type: "Grocery" },
];

const Profile = () => {
  const navigate = useNavigate();

  return (
    <MobileLayout>
      <div className="px-4 pt-14 pb-4">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-[28px] font-bold text-foreground tracking-tight">Profile</h1>
          <motion.button whileTap={{ scale: 0.95 }} className="w-10 h-10 rounded-full bg-card flex items-center justify-center" style={{ boxShadow: "0 0 0 1px rgba(0,0,0,.06)" }}>
            <Settings size={20} className="text-muted-foreground" />
          </motion.button>
        </div>

        {/* Avatar & info */}
        <div className="flex flex-col items-center mb-8">
          <Avatar className="w-20 h-20 mb-3">
            <AvatarImage src="https://zkvbnihalchtmrcqqofw.supabase.co/storage/v1/object/public/avatars/maria-profile-square.jpg" alt="Maria" />
            <AvatarFallback className="bg-primary/15 text-primary text-[28px] font-bold">M</AvatarFallback>
          </Avatar>
          <h2 className="text-[20px] font-semibold text-foreground">Maria</h2>
          <div className="flex flex-wrap items-center justify-center gap-2 mt-2">
            <span className="text-[13px] text-muted-foreground bg-muted px-3 py-1 rounded-full">Child age 6</span>
            <span className="text-[13px] text-muted-foreground bg-muted px-3 py-1 rounded-full">Outpatient</span>
            <span className="text-[13px] text-muted-foreground bg-muted px-3 py-1 rounded-full">Harper's Home</span>
          </div>
        </div>

        {/* Stats */}
        <div className="flex gap-3 mb-8">
          <div className="flex-1 bg-card rounded-2xl p-4 text-center" style={{ boxShadow: "0 0 0 1px rgba(0,0,0,.04)" }}>
            <p className="text-[24px] font-bold text-foreground">20</p>
            <p className="text-[13px] text-muted-foreground">Connections</p>
          </div>
          <div className="flex-1 bg-card rounded-2xl p-4 text-center" style={{ boxShadow: "0 0 0 1px rgba(0,0,0,.04)" }}>
            <p className="text-[24px] font-bold text-foreground">3</p>
            <p className="text-[13px] text-muted-foreground">Saved Places</p>
          </div>
        </div>

        {/* Saved Places */}
        <section className="mb-6">
          <h3 className="text-[20px] font-semibold text-foreground mb-3">Saved Places</h3>
          <div className="space-y-2">
            {savedPlaces.map((p) => (
              <motion.div
                key={p.name}
                whileTap={{ scale: 0.98 }}
                onClick={() => navigate("/place")}
                className="flex items-center justify-between p-4 bg-card rounded-2xl cursor-pointer"
                style={{ boxShadow: "0 0 0 1px rgba(0,0,0,.04)" }}
              >
                <div>
                  <p className="text-[15px] font-medium text-foreground">{p.name}</p>
                  <p className="text-[13px] text-muted-foreground">{p.type}</p>
                </div>
                <ChevronRight size={18} className="text-muted-foreground" />
              </motion.div>
            ))}
          </div>
        </section>

        {/* Actions */}
        <div className="space-y-3">
          <HarperButton variant="secondary">Edit Profile</HarperButton>
        </div>
      </div>
    </MobileLayout>
  );
};

export default Profile;
