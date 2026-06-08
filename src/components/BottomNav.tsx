import { Home, Users, Map, User } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { motion } from "framer-motion";

const tabs = [
  { icon: Home, label: "Home", path: "/home" },
  { icon: Users, label: "Community", path: "/community" },
  { icon: Map, label: "Map", path: "/map" },
  { icon: User, label: "Profile", path: "/profile" },
];

const BottomNav = () => {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[390px] h-[72px] bg-card/80 backdrop-blur-md z-50"
      style={{ boxShadow: "0 -1px 0 0 rgba(0,0,0,0.05)" }}>
      <div className="flex items-center justify-around h-full px-4 pb-2">
        {tabs.map((tab) => {
          const active = location.pathname === tab.path;
          return (
            <motion.button
              key={tab.path}
              whileTap={{ scale: 0.96 }}
              onClick={() => navigate(tab.path)}
              className={`flex flex-col items-center gap-1 py-2 px-3 rounded-xl transition-colors duration-200 ${
                active ? "text-primary" : "text-muted-foreground"
              }`}
            >
              <tab.icon size={22} strokeWidth={active ? 2.2 : 1.8} />
              <span className="text-[11px] font-medium">{tab.label}</span>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
};

export default BottomNav;
