import { ReactNode } from "react";
import BottomNav from "./BottomNav";

interface MobileLayoutProps {
  children: ReactNode;
  showNav?: boolean;
}

const MobileLayout = ({ children, showNav = true }: MobileLayoutProps) => (
  <div className="mobile-container bg-background">
    <div className={showNav ? "pb-[72px]" : ""}>
      {children}
    </div>
    {showNav && <BottomNav />}
  </div>
);

export default MobileLayout;
