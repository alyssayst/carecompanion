import { motion } from "framer-motion";
import { ReactNode } from "react";

interface HarperButtonProps {
  children: ReactNode;
  variant?: "primary" | "secondary" | "outline";
  onClick?: () => void;
  className?: string;
  fullWidth?: boolean;
  disabled?: boolean;
}

const HarperButton = ({ children, variant = "primary", onClick, className = "", fullWidth = true, disabled = false }: HarperButtonProps) => {
  const base = "h-[48px] rounded-[12px] font-semibold text-base flex items-center justify-center transition-all duration-200";
  const variants = {
    primary: "bg-primary text-primary-foreground shadow-sm hover:brightness-95",
    secondary: "bg-card text-foreground border border-harper-gray hover:bg-muted",
    outline: "bg-transparent text-primary border border-primary hover:bg-primary/5",
  };

  return (
    <motion.button
      whileTap={{ scale: disabled ? 1 : 0.97 }}
      onClick={disabled ? undefined : onClick}
      disabled={disabled}
      className={`${base} ${variants[variant]} ${fullWidth ? "w-full" : "px-6"} ${disabled ? "opacity-50 cursor-not-allowed" : ""} ${className}`}
    >
      {children}
    </motion.button>
  );
};

export default HarperButton;
