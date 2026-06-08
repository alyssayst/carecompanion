import { motion } from "framer-motion";
import { Check } from "lucide-react";

interface PersonalizationOptionProps {
  label: string;
  selected: boolean;
  onToggle: () => void;
  checkbox?: boolean;
}

const PersonalizationOption = ({ label, selected, onToggle, checkbox }: PersonalizationOptionProps) => (
  <motion.button
    whileTap={{ scale: 0.97 }}
    onClick={onToggle}
    className={`w-full h-[52px] rounded-[14px] px-5 flex items-center justify-between text-[16px] font-medium transition-all duration-200 ${
      selected
        ? "bg-primary text-primary-foreground"
        : "bg-card text-foreground"
    }`}
    style={{ boxShadow: selected ? "none" : "0 0 0 1px rgba(0,0,0,.06)" }}
  >
    <span>{label}</span>
    {selected && (checkbox ? <Check size={18} /> : <Check size={18} />)}
  </motion.button>
);

export default PersonalizationOption;
